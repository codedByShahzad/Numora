/**
 * TikTok Shop seller profit calculator (forward + reverse).
 * Commission presets live in src/data/ecommerce/tiktok-shop-fees.json.
 */
import fees from "@/data/ecommerce/tiktok-shop-fees.json";
import {
  pct,
  roundMoney,
  smallestCentSatisfying,
  subMoney,
  sumMoney,
  type CalcOutcome,
  type CurrencyCode,
  type FieldErrors,
} from "./money";

export type TikTokPreset = { id: string; label: string; rate: number };
export type TikTokCountry = {
  label: string;
  currency: CurrencyCode;
  feeName: string;
  feeBase: string;
  processingIncluded: boolean;
  presets: TikTokPreset[];
  defaultPreset: string;
  rateNote: string;
  notIncluded: string[];
};
export type TikTokCountryId = keyof typeof fees.countries;

export const TIKTOK_FEES = fees;
export const TIKTOK_COUNTRIES = fees.countries as unknown as Record<TikTokCountryId, TikTokCountry>;
export const TIKTOK_COUNTRY_IDS = Object.keys(fees.countries) as TikTokCountryId[];

export type TikTokInput = {
  country: TikTokCountryId;
  /** Preset id from the config, or "custom". */
  ratePreset: string;
  customRate?: number | null;
  /** Listed selling price for one order (one unit). */
  sellingPrice: number | null;
  /** Seller-funded discount or coupon per order (optional). */
  sellerDiscount?: number | null;
  affiliateEnabled: boolean;
  /** Creator affiliate commission, decimal. */
  affiliateRate?: number | null;
  productCost: number | null;
  /** Shipping or fulfilment cost you pay per order. */
  shippingCost: number | null;
  /** Any other fees per order (Shop Ads, programme fees, packaging…). */
  additionalFees?: number | null;
  /** Number of orders sold. */
  quantity: number | null;
};

export type TikTokField =
  | "sellingPrice"
  | "sellerDiscount"
  | "customRate"
  | "affiliateRate"
  | "productCost"
  | "shippingCost"
  | "additionalFees"
  | "quantity"
  | "targetProfit";

export type TikTokResult = {
  currency: CurrencyCode;
  commissionRate: number;
  /** What the customer pays for the item after seller-funded discounts (excl. tax). */
  customerPayment: number;
  sellerDiscount: number;
  /** Amount the platform commission and affiliate commission are charged on. */
  feeBase: number;
  platformCommission: number;
  affiliateCommission: number;
  additionalFees: number;
  /** Customer payment minus TikTok and affiliate deductions. */
  netPayout: number;
  productCost: number;
  shippingCost: number;
  /** Discount + all fees + product + shipping: price − totalDeductions = profit. */
  totalDeductions: number;
  profitPerOrder: number;
  /** Profit ÷ customer payment. */
  margin: number | null;
  quantity: number;
  totalRevenue: number;
  totalProfit: number;
};

const n = (v: number | null | undefined) => (v === null || v === undefined ? 0 : v);

export function commissionRateFor(input: Pick<TikTokInput, "country" | "ratePreset" | "customRate">): number | null {
  if (input.ratePreset === "custom") return input.customRate ?? null;
  const preset = TIKTOK_COUNTRIES[input.country]?.presets.find((p) => p.id === input.ratePreset);
  return preset ? preset.rate : null;
}

function money(e: FieldErrors<TikTokField>, f: TikTokField, v: number | null | undefined, label: string, required = false) {
  if (v === null || v === undefined) {
    if (required) e[f] = `Enter ${label}.`;
    return;
  }
  const L = label[0].toUpperCase() + label.slice(1);
  if (Number.isNaN(v)) e[f] = `${L} must be a number.`;
  else if (v < 0) e[f] = `${L} can't be negative.`;
  else if (v > 1_000_000) e[f] = `${L} looks too large.`;
}

export function validateTikTok(input: TikTokInput, { reverse = false } = {}): FieldErrors<TikTokField> {
  const e: FieldErrors<TikTokField> = {};
  if (!reverse) money(e, "sellingPrice", input.sellingPrice, "the selling price", true);
  money(e, "sellerDiscount", input.sellerDiscount, "the discount");
  money(e, "productCost", input.productCost, "the product cost");
  money(e, "shippingCost", input.shippingCost, "the shipping cost");
  money(e, "additionalFees", input.additionalFees, "additional fees");
  if (!reverse && input.sellingPrice != null && input.sellerDiscount != null && input.sellerDiscount > input.sellingPrice)
    e.sellerDiscount = "The discount can't be larger than the selling price.";

  const rate = commissionRateFor(input);
  if (input.ratePreset === "custom") {
    if (rate === null || Number.isNaN(rate) || rate < 0 || rate > 0.5) e.customRate = "Commission rate must be between 0% and 50%.";
  } else if (rate === null) e.customRate = "Choose a commission rate.";

  if (input.affiliateEnabled) {
    const a = input.affiliateRate;
    if (a === null || a === undefined || Number.isNaN(a) || a < 0 || a > 0.8)
      e.affiliateRate = "Affiliate commission must be between 0% and 80%.";
  }
  if (input.quantity === null) e.quantity = "Enter the number of orders.";
  else if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 1_000_000)
    e.quantity = "Orders must be a whole number from 1 to 1,000,000.";
  return e;
}

function compute(input: TikTokInput): TikTokResult {
  const c = TIKTOK_COUNTRIES[input.country];
  const commissionRate = commissionRateFor(input) ?? 0;
  const price = n(input.sellingPrice);
  const sellerDiscount = Math.min(n(input.sellerDiscount), price);
  const customerPayment = subMoney(price, sellerDiscount);
  // TikTok-funded discounts are added back by TikTok and seller-funded ones
  // reduce the base, so the base is the price after the seller's discount.
  const feeBase = customerPayment;
  const platformCommission = pct(feeBase, commissionRate);
  const affiliateCommission = input.affiliateEnabled ? pct(feeBase, n(input.affiliateRate)) : 0;
  const additionalFees = roundMoney(n(input.additionalFees));
  const netPayout = subMoney(customerPayment, platformCommission, affiliateCommission, additionalFees);
  const productCost = roundMoney(n(input.productCost));
  const shippingCost = roundMoney(n(input.shippingCost));
  const profitPerOrder = subMoney(netPayout, productCost, shippingCost);
  const totalDeductions = sumMoney(sellerDiscount, platformCommission, affiliateCommission, additionalFees, productCost, shippingCost);
  const quantity = input.quantity ?? 1;
  return {
    currency: c.currency,
    commissionRate,
    customerPayment,
    sellerDiscount,
    feeBase,
    platformCommission,
    affiliateCommission,
    additionalFees,
    netPayout,
    productCost,
    shippingCost,
    totalDeductions,
    profitPerOrder,
    margin: customerPayment > 0 ? profitPerOrder / customerPayment : null,
    quantity,
    totalRevenue: roundMoney(customerPayment * quantity),
    totalProfit: roundMoney(profitPerOrder * quantity),
  };
}

export function calculateTikTok(input: TikTokInput): CalcOutcome<TikTokResult, TikTokField> {
  const errors = validateTikTok(input);
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, result: compute(input) };
}

export type TikTokReverseResult = { requiredPrice: number; breakdown: TikTokResult };

/** Lowest listed price (to the cent) that earns at least `targetProfit` per order. */
export function reverseTikTok(
  input: Omit<TikTokInput, "sellingPrice">,
  targetProfit: number | null
): CalcOutcome<TikTokReverseResult, TikTokField> {
  const errors = validateTikTok({ ...input, sellingPrice: 0 }, { reverse: true });
  if (targetProfit === null || Number.isNaN(targetProfit)) errors.targetProfit = "Enter the profit you want per order.";
  else if (targetProfit < 0) errors.targetProfit = "Target profit can't be negative.";
  else if (targetProfit > 1_000_000) errors.targetProfit = "Target profit looks too large.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const rate = commissionRateFor(input) ?? 0;
  const aff = input.affiliateEnabled ? n(input.affiliateRate) : 0;
  if (rate + aff >= 1) return { ok: false, errors: { targetProfit: "Commission and affiliate rates add up to 100% or more, so no price can reach a profit." } };

  const price = smallestCentSatisfying(
    (p) => compute({ ...input, sellingPrice: p }).profitPerOrder >= targetProfit!,
    0,
    1_000_000
  );
  if (price === null) return { ok: false, errors: { targetProfit: "That profit can't be reached with these costs." } };
  return { ok: true, result: { requiredPrice: price, breakdown: compute({ ...input, sellingPrice: price }) } };
}
