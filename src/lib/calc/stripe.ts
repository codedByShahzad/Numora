/**
 * Stripe fee calculator (forward + reverse) with a PayPal comparison.
 * Rates live in src/data/payments/stripe-fees.json and paypal-fees.json.
 */
import stripeFees from "@/data/payments/stripe-fees.json";
import paypalFees from "@/data/payments/paypal-fees.json";
import {
  roundMoney,
  smallestCentSatisfying,
  subMoney,
  type CalcOutcome,
  type CurrencyCode,
  type FieldErrors,
} from "./money";

export type StripeCardType = { label: string; rate: number; fixed: number; cap?: number };
export type StripeMethod = {
  label: string;
  cardTypes: Record<string, StripeCardType>;
  currencyConversionRate: number | null;
  manualEntryRate: number | null;
};
export type StripeCountry = {
  label: string;
  currency: CurrencyCode;
  effectiveFrom: string;
  methods: Record<string, StripeMethod>;
  otherFees: string[];
};
export type StripeCountryId = keyof typeof stripeFees.countries;

export const STRIPE_FEES = stripeFees;
export const PAYPAL_FEES = paypalFees;
export const STRIPE_COUNTRIES = stripeFees.countries as unknown as Record<StripeCountryId, StripeCountry>;
export const STRIPE_COUNTRY_IDS = Object.keys(stripeFees.countries) as StripeCountryId[];

export type StripeInput = {
  country: StripeCountryId;
  method: string;
  cardType: string;
  amount: number | null;
  currencyConversion: boolean;
  manualEntry: boolean;
  /** Use your own negotiated rate instead of the published one. */
  custom?: { enabled: boolean; rate: number | null; fixed: number | null };
};

export type StripeField = "amount" | "customRate" | "customFixed" | "targetNet" | "method";

export type StripeResult = {
  currency: CurrencyCode;
  amount: number;
  /** Domestic card rate applied to the amount. */
  baseFee: number;
  baseRate: number;
  /** Extra percentage for the card type vs a standard domestic card. */
  cardSurcharge: number;
  cardSurchargeRate: number;
  conversionFee: number;
  conversionRate: number;
  manualEntryFee: number;
  manualEntryRate: number;
  fixedFee: number;
  capApplied: boolean;
  totalFee: number;
  net: number;
  effectiveRate: number;
  usedCustom: boolean;
};

export function getMethod(country: StripeCountryId, method: string): StripeMethod | undefined {
  return STRIPE_COUNTRIES[country]?.methods[method];
}

export function validateStripe(input: StripeInput, { reverse = false } = {}): FieldErrors<StripeField> {
  const e: FieldErrors<StripeField> = {};
  const m = getMethod(input.country, input.method);
  if (!m || !m.cardTypes[input.cardType]) e.method = "Choose a payment method and card type.";
  if (!reverse) {
    if (input.amount === null) e.amount = "Enter the transaction amount.";
    else if (Number.isNaN(input.amount) || input.amount <= 0) e.amount = "Amount must be more than 0.";
    else if (input.amount > 1_000_000) e.amount = "Amount looks too large for one payment.";
  }
  if (input.custom?.enabled) {
    const r = input.custom.rate;
    const f = input.custom.fixed;
    if (r === null || Number.isNaN(r) || r < 0 || r >= 0.5) e.customRate = "Custom percentage must be between 0% and 50%.";
    if (f === null || Number.isNaN(f) || f < 0 || f > 100) e.customFixed = "Custom fixed fee must be between 0 and 100.";
  }
  return e;
}

function compute(input: StripeInput, amount: number): StripeResult {
  const country = STRIPE_COUNTRIES[input.country];
  const method = country.methods[input.method];
  const card = method.cardTypes[input.cardType];
  const domestic = method.cardTypes.domestic ?? card;

  const usedCustom = !!input.custom?.enabled;
  const baseRate = usedCustom ? input.custom!.rate! : domestic.rate;
  const cardSurchargeRate = usedCustom ? 0 : Math.max(0, card.rate - domestic.rate);
  const conversionRate = input.currencyConversion && method.currencyConversionRate ? method.currencyConversionRate : 0;
  const manualEntryRate = input.manualEntry && method.manualEntryRate ? method.manualEntryRate : 0;
  const fixed = usedCustom ? input.custom!.fixed! : card.fixed;

  const rawParts = {
    base: amount * baseRate,
    surcharge: amount * cardSurchargeRate,
    conversion: amount * conversionRate,
    manual: amount * manualEntryRate,
  };
  let rawTotal = rawParts.base + rawParts.surcharge + rawParts.conversion + rawParts.manual + fixed;
  let capApplied = false;
  if (!usedCustom && card.cap !== undefined && rawTotal > card.cap) {
    rawTotal = card.cap;
    capApplied = true;
  }

  const totalFee = roundMoney(rawTotal);
  let baseFee: number;
  let cardSurcharge: number;
  let conversionFee: number;
  let manualEntryFee: number;
  let fixedFee: number;
  if (capApplied) {
    baseFee = totalFee;
    cardSurcharge = conversionFee = manualEntryFee = fixedFee = 0;
  } else {
    cardSurcharge = roundMoney(rawParts.surcharge);
    conversionFee = roundMoney(rawParts.conversion);
    manualEntryFee = roundMoney(rawParts.manual);
    fixedFee = roundMoney(fixed);
    // Put any rounding remainder on the base line so the lines add up to the total.
    baseFee = subMoney(totalFee, cardSurcharge, conversionFee, manualEntryFee, fixedFee);
  }
  const net = subMoney(amount, totalFee);
  return {
    currency: country.currency,
    amount: roundMoney(amount),
    baseFee,
    baseRate,
    cardSurcharge,
    cardSurchargeRate,
    conversionFee,
    conversionRate,
    manualEntryFee,
    manualEntryRate,
    fixedFee,
    capApplied,
    totalFee,
    net,
    effectiveRate: amount > 0 ? totalFee / amount : 0,
    usedCustom,
  };
}

export function calculateStripe(input: StripeInput): CalcOutcome<StripeResult, StripeField> {
  const errors = validateStripe(input);
  if (Object.keys(errors).length) return { ok: false, errors };
  const result = compute(input, input.amount!);
  if (result.net <= 0) return { ok: false, errors: { amount: "Stripe's fees would use up the whole amount. Enter a larger amount." } };
  return { ok: true, result };
}

export type StripeReverseResult = {
  requiredCharge: number;
  /** (net + fixed) / (1 − percentage), before rounding up to the cent. */
  formulaCharge: number;
  totalPercentage: number;
  breakdown: StripeResult;
};

/** Amount to charge so that you receive at least `targetNet` after Stripe fees. */
export function reverseStripe(input: StripeInput, targetNet: number | null): CalcOutcome<StripeReverseResult, StripeField> {
  const errors = validateStripe(input, { reverse: true });
  if (targetNet === null || Number.isNaN(targetNet)) errors.targetNet = "Enter the amount you want to receive.";
  else if (targetNet <= 0) errors.targetNet = "The amount you want to receive must be more than 0.";
  else if (targetNet > 1_000_000) errors.targetNet = "Amount looks too large for one payment.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const probe = compute(input, 100);
  const totalPercentage = probe.baseRate + probe.cardSurchargeRate + probe.conversionRate + probe.manualEntryRate;
  const fixed = probe.capApplied ? 0 : probe.fixedFee;
  const formulaCharge = (targetNet! + fixed) / (1 - totalPercentage);

  const charge = smallestCentSatisfying((a) => compute(input, a).net >= targetNet!, targetNet!, Math.max(targetNet! * 2 + 100, formulaCharge + 100));
  if (charge === null) return { ok: false, errors: { targetNet: "Couldn't find a charge amount for that target." } };
  return {
    ok: true,
    result: { requiredCharge: charge, formulaCharge, totalPercentage, breakdown: compute(input, charge) },
  };
}

/* ------------------------------ PayPal ------------------------------ */

export type PaypalProduct = { label: string; rate: number; fixed: number };
export type PaypalCountry = {
  label: string;
  currency: CurrencyCode;
  effectiveFrom: string;
  products: Record<string, PaypalProduct>;
  internationalRate: number;
  internationalNote: string;
};
const PAYPAL = paypalFees.countries as unknown as Record<string, PaypalCountry>;

export type PaypalQuote = { product: string; label: string; rate: number; fixed: number; fee: number; net: number; effectiveRate: number };

/** PayPal fee for the same amount (no currency conversion spread). */
export function paypalQuotes(country: StripeCountryId, amount: number, international: boolean): PaypalQuote[] {
  const c = PAYPAL[country];
  if (!c || !(amount > 0)) return [];
  return Object.entries(c.products).map(([id, p]) => {
    const rate = p.rate + (international ? c.internationalRate : 0);
    const fee = roundMoney(amount * rate + p.fixed);
    return { product: id, label: p.label, rate, fixed: p.fixed, fee, net: subMoney(amount, fee), effectiveRate: fee / amount };
  });
}

export function paypalCountry(country: StripeCountryId): PaypalCountry | undefined {
  return PAYPAL[country];
}

/** Fee for every card type of the chosen method, for the comparison table. */
export function compareCardTypes(input: StripeInput): { cardType: string; label: string; result: StripeResult }[] {
  const method = getMethod(input.country, input.method);
  if (!method || !(input.amount && input.amount > 0)) return [];
  return Object.entries(method.cardTypes).map(([id, ct]) => ({
    cardType: id,
    label: ct.label,
    result: compute({ ...input, cardType: id, custom: undefined }, input.amount!),
  }));
}
