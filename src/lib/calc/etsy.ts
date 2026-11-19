/**
 * Etsy seller fee and profit calculator (forward and reverse).
 * Fee rates live in src/data/ecommerce/etsy-fees.json.
 */
import fees from "@/data/ecommerce/etsy-fees.json";
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

export type EtsyMarket = {
  label: string;
  currency: CurrencyCode;
  processingRate: number;
  processingFixed: number;
  regulatoryRate: number;
  vatOnFeesDefault: number;
  usdToLocal: number;
  fxNote: string;
};

export type EtsyMarketId = keyof typeof fees.markets;
export const ETSY_FEES = fees;
export const ETSY_MARKETS = fees.markets as Record<EtsyMarketId, EtsyMarket>;
export const ETSY_MARKET_IDS = Object.keys(fees.markets) as EtsyMarketId[];

export type OffsiteAds = "none" | "standard" | "discounted";

export type EtsyInput = {
  market: EtsyMarketId;
  /** Price of one item, in the market currency. */
  itemPrice: number | null;
  quantity: number | null;
  /** Shipping charged to the buyer for the order. */
  shippingCharged: number | null;
  /** Gift wrap / personalisation charged to the buyer (optional). */
  giftWrap?: number | null;
  /** Sales tax Etsy collects from the buyer (optional; only affects processing fee). */
  salesTax?: number | null;
  /** Your cost to make or buy one item. */
  itemCost: number | null;
  /** What you pay to ship the order. */
  shippingCost: number | null;
  /** Packaging, materials, etc. for the order (optional). */
  otherCosts?: number | null;
  offsiteAds: OffsiteAds;
  /** Listing currency differs from your payment account currency. */
  currencyConversion: boolean;
  /** VAT/GST rate Etsy adds to your seller fees, decimal (0.2). */
  vatOnFeesRate: number | null;
  /** Local currency units per 1 USD, for the USD-billed listing fee and ads cap. */
  usdToLocal: number | null;
};

export type EtsyField =
  | "itemPrice"
  | "quantity"
  | "shippingCharged"
  | "giftWrap"
  | "salesTax"
  | "itemCost"
  | "shippingCost"
  | "otherCosts"
  | "vatOnFeesRate"
  | "usdToLocal"
  | "targetProfit";

export type EtsyResult = {
  currency: CurrencyCode;
  itemsSubtotal: number;
  /** Item price × quantity + shipping + gift wrap: the base for most fees. */
  orderTotal: number;
  listingFee: number;
  transactionFee: number;
  processingFee: number;
  regulatoryFee: number;
  offsiteAdsFee: number;
  offsiteAdsCapped: boolean;
  currencyConversionFee: number;
  feesBeforeVat: number;
  vatOnFees: number;
  totalFees: number;
  /** Order total minus all Etsy fees (what reaches your payment account). */
  netPayout: number;
  productCost: number;
  shippingCost: number;
  otherCosts: number;
  totalExpenses: number;
  profit: number;
  /** Profit ÷ order total. */
  margin: number | null;
  /** Total fees ÷ order total. */
  feePercent: number | null;
  profitPerItem: number;
};

const n = (v: number | null | undefined) => (v === null || v === undefined ? 0 : v);

function checkMoney(
  e: FieldErrors<EtsyField>,
  field: EtsyField,
  value: number | null | undefined,
  { required, label }: { required: boolean; label: string }
) {
  if (value === null || value === undefined) {
    if (required) e[field] = `Enter ${label}.`;
    return;
  }
  if (Number.isNaN(value)) e[field] = `${label[0].toUpperCase()}${label.slice(1)} must be a number.`;
  else if (value < 0) e[field] = `${label[0].toUpperCase()}${label.slice(1)} can't be negative.`;
  else if (value > 1_000_000) e[field] = `${label[0].toUpperCase()}${label.slice(1)} looks too large.`;
}

export function validateEtsy(input: EtsyInput, { reverse = false } = {}): FieldErrors<EtsyField> {
  const e: FieldErrors<EtsyField> = {};
  if (!reverse) checkMoney(e, "itemPrice", input.itemPrice, { required: true, label: "the item price" });
  if (input.quantity === null || input.quantity === undefined) e.quantity = "Enter a quantity.";
  else if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 10_000)
    e.quantity = "Quantity must be a whole number from 1 to 10,000.";
  checkMoney(e, "shippingCharged", input.shippingCharged, { required: false, label: "shipping charged" });
  checkMoney(e, "giftWrap", input.giftWrap, { required: false, label: "gift wrap charge" });
  checkMoney(e, "salesTax", input.salesTax, { required: false, label: "sales tax" });
  checkMoney(e, "itemCost", input.itemCost, { required: false, label: "the item cost" });
  checkMoney(e, "shippingCost", input.shippingCost, { required: false, label: "your shipping cost" });
  checkMoney(e, "otherCosts", input.otherCosts, { required: false, label: "other costs" });
  if (input.vatOnFeesRate === null || Number.isNaN(input.vatOnFeesRate) || input.vatOnFeesRate < 0 || input.vatOnFeesRate > 0.3)
    e.vatOnFeesRate = "VAT on fees must be between 0% and 30%.";
  if (input.usdToLocal === null || Number.isNaN(input.usdToLocal) || input.usdToLocal <= 0 || input.usdToLocal > 100_000)
    e.usdToLocal = "Enter a positive exchange rate.";
  if (!ETSY_MARKETS[input.market]) e.itemPrice = "Choose a supported country.";
  return e;
}

/** Forward calculation without validation (inputs already checked). */
function compute(input: EtsyInput): EtsyResult {
  const m = ETSY_MARKETS[input.market];
  const g = fees.global;
  const qty = input.quantity ?? 1;
  const fx = input.usdToLocal ?? m.usdToLocal;

  const itemsSubtotal = roundMoney(n(input.itemPrice) * qty);
  const orderTotal = sumMoney(itemsSubtotal, n(input.shippingCharged), n(input.giftWrap));

  const listingFee = roundMoney(g.listingFeeUSD * fx * qty);
  const transactionFee = pct(orderTotal, g.transactionFeeRate);
  const processingFee = sumMoney(pct(sumMoney(orderTotal, n(input.salesTax)), m.processingRate), m.processingFixed);
  const regulatoryFee = pct(orderTotal, m.regulatoryRate);

  const adsRate = g.offsiteAdsRates[input.offsiteAds];
  const adsUncapped = pct(orderTotal, adsRate);
  const adsCap = roundMoney(g.offsiteAdsCapUSD * fx);
  const offsiteAdsCapped = adsUncapped > adsCap;
  const offsiteAdsFee = offsiteAdsCapped ? adsCap : adsUncapped;

  const currencyConversionFee = input.currencyConversion ? pct(orderTotal, g.currencyConversionRate) : 0;

  const feesBeforeVat = sumMoney(listingFee, transactionFee, processingFee, regulatoryFee, offsiteAdsFee, currencyConversionFee);
  const vatOnFees = pct(feesBeforeVat, n(input.vatOnFeesRate));
  const totalFees = sumMoney(feesBeforeVat, vatOnFees);
  const netPayout = subMoney(orderTotal, totalFees);

  const productCost = roundMoney(n(input.itemCost) * qty);
  const shippingCost = roundMoney(n(input.shippingCost));
  const otherCosts = roundMoney(n(input.otherCosts));
  const totalExpenses = sumMoney(totalFees, productCost, shippingCost, otherCosts);
  const profit = subMoney(orderTotal, totalExpenses);

  return {
    currency: m.currency,
    itemsSubtotal,
    orderTotal,
    listingFee,
    transactionFee,
    processingFee,
    regulatoryFee,
    offsiteAdsFee,
    offsiteAdsCapped,
    currencyConversionFee,
    feesBeforeVat,
    vatOnFees,
    totalFees,
    netPayout,
    productCost,
    shippingCost,
    otherCosts,
    totalExpenses,
    profit,
    margin: orderTotal > 0 ? profit / orderTotal : null,
    feePercent: orderTotal > 0 ? totalFees / orderTotal : null,
    profitPerItem: roundMoney(profit / qty),
  };
}

export function calculateEtsy(input: EtsyInput): CalcOutcome<EtsyResult, EtsyField> {
  const errors = validateEtsy(input);
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, result: compute(input) };
}

export type EtsyReverseResult = {
  /** Item price (per unit) needed to reach the target profit for the order. */
  requiredItemPrice: number;
  breakdown: EtsyResult;
};

/**
 * Reverse mode: the lowest item price (to the cent) whose order profit is at
 * least `targetProfit`, checked with the exact forward calculation.
 */
export function reverseEtsy(
  input: Omit<EtsyInput, "itemPrice">,
  targetProfit: number | null
): CalcOutcome<EtsyReverseResult, EtsyField> {
  const errors = validateEtsy({ ...input, itemPrice: 0 }, { reverse: true });
  if (targetProfit === null || Number.isNaN(targetProfit)) errors.targetProfit = "Enter the profit you want per order.";
  else if (targetProfit < 0) errors.targetProfit = "Target profit can't be negative.";
  else if (targetProfit > 1_000_000) errors.targetProfit = "Target profit looks too large.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const price = smallestCentSatisfying(
    (p) => compute({ ...input, itemPrice: p }).profit >= targetProfit!,
    0,
    1_000_000
  );
  if (price === null) {
    return { ok: false, errors: { targetProfit: "That profit can't be reached with these costs." } };
  }
  return { ok: true, result: { requiredItemPrice: price, breakdown: compute({ ...input, itemPrice: price }) } };
}
