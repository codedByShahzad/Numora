import { describe, expect, it } from "vitest";
import { sumMoney } from "../money";
import { calculateStripe, compareCardTypes, paypalQuotes, reverseStripe, type StripeInput } from "../stripe";

const us: StripeInput = {
  country: "US",
  method: "card_online",
  cardType: "domestic",
  amount: 100,
  currencyConversion: false,
  manualEntry: false,
};

function run(over: Partial<StripeInput>) {
  const out = calculateStripe({ ...us, ...over });
  if (!out.ok) throw new Error(JSON.stringify(out.errors));
  return out.result;
}

describe("Stripe US", () => {
  it("domestic card: 2.9% + 30¢", () => {
    const r = run({});
    expect(r.totalFee).toBe(3.2);
    expect(r.net).toBe(96.8);
    expect(r.effectiveRate).toBeCloseTo(0.032, 10);
    expect(sumMoney(r.baseFee, r.fixedFee)).toBe(3.2);
  });

  it("international card with currency conversion: 5.4% + 30¢", () => {
    const r = run({ cardType: "international", currencyConversion: true });
    expect(r.baseFee).toBe(2.9);
    expect(r.cardSurcharge).toBe(1.5);
    expect(r.conversionFee).toBe(1);
    expect(r.totalFee).toBe(5.7);
    expect(r.net).toBe(94.3);
  });

  it("manually entered card adds 0.5%", () => {
    expect(run({ manualEntry: true }).totalFee).toBe(3.7);
  });

  it("Terminal in-person: 2.7% + 5¢ and no manual-entry surcharge", () => {
    const r = run({ method: "card_in_person", manualEntry: true });
    expect(r.totalFee).toBe(2.75);
    expect(r.manualEntryFee).toBe(0);
  });

  it("ACH Direct Debit: 0.8% capped at $5", () => {
    expect(run({ method: "ach_debit", amount: 100 }).totalFee).toBe(0.8);
    const big = run({ method: "ach_debit", amount: 1000, currencyConversion: true });
    expect(big.totalFee).toBe(5);
    expect(big.capApplied).toBe(true);
  });

  it("rounds the total fee to the cent and keeps the lines adding up", () => {
    const r = run({ amount: 10.05, cardType: "international" });
    // 10.05 × 4.4% + 0.30 = 0.7422
    expect(r.totalFee).toBe(0.74);
    expect(Math.round((r.baseFee + r.cardSurcharge + r.fixedFee) * 100) / 100).toBe(0.74);
  });

  it("supports a custom negotiated rate", () => {
    const r = run({ amount: 200, cardType: "international", custom: { enabled: true, rate: 0.025, fixed: 0.1 } });
    expect(r.totalFee).toBe(5.1);
    expect(r.cardSurcharge).toBe(0);
    expect(r.usedCustom).toBe(true);
  });
});

describe("Stripe UK", () => {
  const uk: Partial<StripeInput> = { country: "GB", method: "card_online" };
  it("standard UK card: 1.5% + 20p", () => {
    expect(run({ ...uk, cardType: "domestic", amount: 100 }).totalFee).toBe(1.7);
    expect(run({ ...uk, cardType: "domestic", amount: 50 }).totalFee).toBe(0.95);
  });
  it("premium, EEA and international cards", () => {
    expect(run({ ...uk, cardType: "premium" }).totalFee).toBe(3);
    expect(run({ ...uk, cardType: "eea" }).totalFee).toBe(2.7);
    const intl = run({ ...uk, cardType: "international", currencyConversion: true });
    expect(intl.totalFee).toBe(5.35); // 3.15% + 2% + 20p
    expect(intl.currency).toBe("GBP");
  });
  it("comparison table lists all UK card types", () => {
    const rows = compareCardTypes({ ...us, ...uk, cardType: "domestic" } as StripeInput);
    expect(rows.map((r) => r.cardType)).toEqual(["domestic", "premium", "eea", "international"]);
  });
});

describe("Stripe reverse", () => {
  it("charge needed to receive $100 (formula 100.30 / 0.971 = 103.2956 → $103.30)", () => {
    const out = reverseStripe(us, 100);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.formulaCharge).toBeCloseTo(103.2956, 4);
    expect(out.result.requiredCharge).toBe(103.3);
    expect(out.result.breakdown.net).toBe(100);
    expect(run({ amount: 103.29 }).net).toBe(99.99);
  });
  it("works with stacked surcharges and in the UK", () => {
    const a = reverseStripe({ ...us, cardType: "international", currencyConversion: true, manualEntry: true }, 500);
    expect(a.ok && a.result.breakdown.net).toBeGreaterThanOrEqual(500);
    const b = reverseStripe({ ...us, country: "GB", cardType: "domestic" }, 100);
    expect(b.ok && b.result.requiredCharge).toBe(101.73); // (100 + 0.20) / 0.985 = 101.7259
  });
  it("handles the ACH cap", () => {
    const out = reverseStripe({ ...us, method: "ach_debit" }, 2000);
    expect(out.ok && out.result.requiredCharge).toBe(2005);
  });
  it("validates the target", () => {
    const out = reverseStripe(us, 0);
    expect(out.ok).toBe(false);
  });
});

describe("validation", () => {
  it("rejects empty, zero and too-small amounts", () => {
    expect(calculateStripe({ ...us, amount: null }).ok).toBe(false);
    expect(calculateStripe({ ...us, amount: 0 }).ok).toBe(false);
    expect(calculateStripe({ ...us, amount: 0.2 }).ok).toBe(false); // fee > amount
  });
  it("rejects an unknown method or card type", () => {
    expect(calculateStripe({ ...us, method: "ach_debit", cardType: "international" }).ok).toBe(false);
  });
  it("rejects an invalid custom rate", () => {
    const out = calculateStripe({ ...us, custom: { enabled: true, rate: 0.9, fixed: 0.3 } });
    expect(out.ok).toBe(false);
  });
});

describe("PayPal comparison", () => {
  it("US checkout 3.49% + $0.49, card 2.99% + $0.49, international +1.5%", () => {
    const dom = paypalQuotes("US", 100, false);
    expect(dom.find((q) => q.product === "checkout")!.fee).toBe(3.98);
    expect(dom.find((q) => q.product === "card")!.fee).toBe(3.48);
    expect(paypalQuotes("US", 100, true).find((q) => q.product === "checkout")!.fee).toBe(5.48);
  });
  it("UK 2.9% + £0.30", () => {
    expect(paypalQuotes("GB", 100, false)[0].fee).toBe(3.2);
  });
});
