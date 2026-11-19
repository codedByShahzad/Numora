import { describe, expect, it } from "vitest";
import { calculateTikTok, reverseTikTok, type TikTokInput } from "../tiktokShop";

const us: TikTokInput = {
  country: "US",
  ratePreset: "standard",
  sellingPrice: 30,
  sellerDiscount: 0,
  affiliateEnabled: true,
  affiliateRate: 0.15,
  productCost: 8,
  shippingCost: 5,
  additionalFees: 0,
  quantity: 50,
};

function run(over: Partial<TikTokInput>) {
  const out = calculateTikTok({ ...us, ...over });
  if (!out.ok) throw new Error(JSON.stringify(out.errors));
  return out.result;
}

describe("TikTok Shop US", () => {
  it("6% referral + 15% affiliate", () => {
    const r = run({});
    expect(r.platformCommission).toBe(1.8);
    expect(r.affiliateCommission).toBe(4.5);
    expect(r.netPayout).toBe(23.7);
    expect(r.profitPerOrder).toBe(10.7);
    expect(r.margin).toBeCloseTo(10.7 / 30, 10);
    expect(r.totalProfit).toBe(535);
    expect(r.totalRevenue).toBe(1500);
    expect(30 - r.totalDeductions).toBeCloseTo(r.profitPerOrder, 10);
  });

  it("affiliate toggle off", () => {
    const r = run({ affiliateEnabled: false });
    expect(r.affiliateCommission).toBe(0);
    expect(r.profitPerOrder).toBe(15.2);
  });

  it("5% and custom 8% rates", () => {
    expect(run({ ratePreset: "reduced" }).platformCommission).toBe(1.5);
    expect(run({ ratePreset: "custom", customRate: 0.08 }).platformCommission).toBe(2.4);
  });

  it("seller discount lowers the fee base", () => {
    const r = run({ sellerDiscount: 5, affiliateEnabled: false });
    expect(r.feeBase).toBe(25);
    expect(r.platformCommission).toBe(1.5);
  });

  it("additional fees reduce payout", () => {
    expect(run({ additionalFees: 1.25 }).netPayout).toBe(22.45);
  });

  it("can report a loss", () => {
    expect(run({ sellingPrice: 10 }).profitPerOrder).toBeLessThan(0);
  });
});

describe("TikTok Shop UK", () => {
  it("9% commission (VAT included)", () => {
    const out = calculateTikTok({
      ...us,
      country: "GB",
      ratePreset: "standard",
      sellingPrice: 20,
      sellerDiscount: 2,
      affiliateEnabled: false,
      productCost: 6,
      shippingCost: 3,
      quantity: 1,
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.currency).toBe("GBP");
    expect(out.result.platformCommission).toBe(1.62);
    expect(out.result.profitPerOrder).toBe(7.38);
  });
});

describe("TikTok Shop reverse", () => {
  it("price for a $10 profit (23 / 0.79 = 29.114 → $29.12)", () => {
    const out = reverseTikTok(us, 10);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.requiredPrice).toBe(29.12);
    expect(out.result.breakdown.profitPerOrder).toBe(10);
    expect(run({ sellingPrice: 29.11 }).profitPerOrder).toBe(9.99);
  });
  it("rejects rates of 100% or more", () => {
    const out = reverseTikTok({ ...us, ratePreset: "custom", customRate: 0.5, affiliateRate: 0.6 }, 10);
    expect(out.ok).toBe(false);
  });
});

describe("validation", () => {
  it("rejects bad inputs", () => {
    const out = calculateTikTok({ ...us, sellingPrice: null, quantity: 0, affiliateRate: 0.95, productCost: -2 });
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.errors.sellingPrice).toBeTruthy();
      expect(out.errors.quantity).toBeTruthy();
      expect(out.errors.affiliateRate).toBeTruthy();
      expect(out.errors.productCost).toBeTruthy();
    }
  });
  it("rejects a discount larger than the price", () => {
    const out = calculateTikTok({ ...us, sellerDiscount: 40 });
    expect(out.ok).toBe(false);
  });
  it("rejects an unknown preset", () => {
    expect(calculateTikTok({ ...us, ratePreset: "nope" }).ok).toBe(false);
  });
});
