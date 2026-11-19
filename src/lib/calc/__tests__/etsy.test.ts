import { describe, expect, it } from "vitest";
import { calculateEtsy, reverseEtsy, type EtsyInput } from "../etsy";

const us: EtsyInput = {
  market: "US",
  itemPrice: 25,
  quantity: 1,
  shippingCharged: 5,
  itemCost: 8,
  shippingCost: 4.5,
  offsiteAds: "none",
  currencyConversion: false,
  vatOnFeesRate: 0,
  usdToLocal: 1,
};

function run(over: Partial<EtsyInput>) {
  const out = calculateEtsy({ ...us, ...over });
  if (!out.ok) throw new Error(JSON.stringify(out.errors));
  return out.result;
}

describe("Etsy US fees", () => {
  it("calculates each fee on the right base", () => {
    const r = run({});
    expect(r.orderTotal).toBe(30);
    expect(r.listingFee).toBe(0.2);
    expect(r.transactionFee).toBe(1.95); // 6.5% × 30
    expect(r.processingFee).toBe(1.15); // 3% × 30 + 0.25
    expect(r.regulatoryFee).toBe(0);
    expect(r.totalFees).toBe(3.3);
    expect(r.netPayout).toBe(26.7);
    expect(r.totalExpenses).toBe(15.8);
    expect(r.profit).toBe(14.2);
    expect(r.margin).toBeCloseTo(14.2 / 30, 10);
    expect(r.feePercent).toBeCloseTo(0.11, 10);
  });

  it("adds the 15% Offsite Ads fee", () => {
    const r = run({ offsiteAds: "standard" });
    expect(r.offsiteAdsFee).toBe(4.5);
    expect(r.profit).toBe(9.7);
  });

  it("uses 12% for the discounted Offsite Ads rate", () => {
    expect(run({ offsiteAds: "discounted" }).offsiteAdsFee).toBe(3.6);
  });

  it("caps the Offsite Ads fee at $100", () => {
    const r = run({ itemPrice: 1000, shippingCharged: 0, offsiteAds: "standard" });
    expect(r.offsiteAdsFee).toBe(100);
    expect(r.offsiteAdsCapped).toBe(true);
  });

  it("includes sales tax only in the processing-fee base", () => {
    const r = run({ itemPrice: 50, shippingCharged: 0, salesTax: 4 });
    expect(r.transactionFee).toBe(3.25);
    expect(r.processingFee).toBe(1.87); // 3% × 54 + 0.25
    expect(r.orderTotal).toBe(50);
  });

  it("adds the 2.5% currency conversion fee", () => {
    expect(run({ currencyConversion: true }).currencyConversionFee).toBe(0.75);
  });

  it("charges a listing fee per unit and multiplies cost by quantity", () => {
    const r = run({ quantity: 3, shippingCharged: 6 });
    expect(r.itemsSubtotal).toBe(75);
    expect(r.listingFee).toBe(0.6);
    expect(r.productCost).toBe(24);
  });

  it("handles a $0 item without NaN", () => {
    const r = run({ itemPrice: 0, shippingCharged: 0, itemCost: 0, shippingCost: 0 });
    expect(r.orderTotal).toBe(0);
    expect(r.profit).toBe(-0.45); // listing 0.20 + processing fixed 0.25
    expect(r.margin).toBeNull();
  });
});

describe("Etsy UK fees", () => {
  it("applies UK processing, the 0.48% Regulatory Operating fee and 20% VAT on fees", () => {
    const out = calculateEtsy({
      market: "GB",
      itemPrice: 20,
      quantity: 2,
      shippingCharged: 3.5,
      itemCost: 5,
      shippingCost: 3,
      offsiteAds: "none",
      currencyConversion: false,
      vatOnFeesRate: 0.2,
      usdToLocal: 0.72,
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const r = out.result;
    expect(r.currency).toBe("GBP");
    expect(r.orderTotal).toBe(43.5);
    expect(r.listingFee).toBe(0.29); // $0.20 × 0.72 × 2 = 0.288
    expect(r.transactionFee).toBe(2.83); // 2.8275
    expect(r.processingFee).toBe(1.94); // 4% × 43.5 + 0.20
    expect(r.regulatoryFee).toBe(0.21); // 0.2088
    expect(r.feesBeforeVat).toBe(5.27);
    expect(r.vatOnFees).toBe(1.05);
    expect(r.totalFees).toBe(6.32);
    expect(r.profit).toBe(24.18);
  });

  it("France applies its own regulatory rate", () => {
    const out = calculateEtsy({ ...us, market: "FR", itemPrice: 100, shippingCharged: 0, vatOnFeesRate: 0, usdToLocal: 0.89 });
    expect(out.ok && out.result.regulatoryFee).toBe(1.14);
    expect(out.ok && out.result.processingFee).toBe(4.3); // 4% + €0.30
  });
});

describe("Etsy reverse pricing", () => {
  it("finds the price for a $20 profit (hand-checked: $36.41)", () => {
    const out = reverseEtsy({ ...us, shippingCharged: 0 }, 20);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.requiredItemPrice).toBe(36.41);
    expect(out.result.breakdown.profit).toBe(20);
    // one cent less falls short
    expect(calculateEtsy({ ...us, shippingCharged: 0, itemPrice: 36.4 }).ok && run({ shippingCharged: 0, itemPrice: 36.4 }).profit).toBe(19.99);
  });

  it("works with Offsite Ads and VAT on fees", () => {
    const out = reverseEtsy({ ...us, market: "GB", offsiteAds: "standard", vatOnFeesRate: 0.2, usdToLocal: 0.72 }, 15);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.result.breakdown.profit).toBeGreaterThanOrEqual(15);
  });

  it("validates the target", () => {
    const out = reverseEtsy(us, -5);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errors.targetProfit).toBeTruthy();
  });
});

describe("Etsy validation", () => {
  it("rejects missing price, negative costs and fractional quantity", () => {
    const out = calculateEtsy({ ...us, itemPrice: null, itemCost: -1, quantity: 1.5 });
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.errors.itemPrice).toBeTruthy();
      expect(out.errors.itemCost).toBeTruthy();
      expect(out.errors.quantity).toBeTruthy();
    }
  });
  it("treats blank optional fields as zero", () => {
    const r = run({ shippingCharged: null, shippingCost: null, itemCost: null });
    expect(r.orderTotal).toBe(25);
  });
});
