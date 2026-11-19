import { describe, expect, it } from "vitest";
import { calculateOvertimeDeduction, type OvertimeInput } from "../overtime";

const base: OvertimeInput = {
  taxYear: 2026,
  filingStatus: "single",
  source: "w2",
  w2Amount: 0,
  magi: 90_000,
  marginalRate: 0.22,
  flsaNonExempt: true,
  hasValidSsn: true,
};

function run(over: Partial<OvertimeInput>) {
  const out = calculateOvertimeDeduction({ ...base, ...over });
  if (!out.ok) throw new Error(JSON.stringify(out.errors));
  return out.result;
}

describe("qualified overtime premium", () => {
  it("uses only the half-time premium (research worked example: $40/h × 156 h)", () => {
    const r = run({ taxYear: 2025, source: "hours", hourlyRate: 40, overtimeHours: 156, overtimeMultiplier: 1.5 });
    expect(r.totalOvertimePay).toBe(9360); // 40 × 1.5 × 156
    expect(r.qualifiedOvertime).toBe(3120); // 0.5 × 40 × 156
    expect(r.deduction).toBe(3120);
    expect(r.estimatedSavings).toBe(686.4); // 3120 × 22%
  });

  it("does not count a double-time premium beyond the FLSA half-time", () => {
    const r = run({ taxYear: 2025, source: "hours", hourlyRate: 30, overtimeHours: 100, overtimeMultiplier: 2 });
    expect(r.totalOvertimePay).toBe(6000);
    expect(r.qualifiedOvertime).toBe(1500);
    expect(r.warnings.some((w) => w.includes("half-time"))).toBe(true);
  });

  it("2025 one-third method matches IRS Notice 2025-69 example ($15,000 → $5,000)", () => {
    const r = run({ taxYear: 2025, source: "totalPay", totalOvertimePay: 15_000, overtimeMultiplier: 1.5 });
    expect(r.qualifiedOvertime).toBe(5000);
  });

  it("2025 double-time total uses one-quarter", () => {
    const r = run({ taxYear: 2025, source: "totalPay", totalOvertimePay: 15_000, overtimeMultiplier: 2 });
    expect(r.qualifiedOvertime).toBe(3750);
  });

  it("warns that the one-third method is not valid from 2026", () => {
    const r = run({ taxYear: 2026, source: "totalPay", totalOvertimePay: 15_000, overtimeMultiplier: 1.5 });
    expect(r.warnings.some((w) => w.includes("code TT"))).toBe(true);
  });

  it("flags an overtime rate below 1.5× and counts only the premium paid", () => {
    const r = run({ taxYear: 2025, source: "hours", hourlyRate: 20, overtimeHours: 10, overtimeMultiplier: 1.25 });
    expect(r.qualifiedOvertime).toBe(50); // 0.25 × 20 × 10
    expect(r.warnings.some((w) => w.includes("at least 1.5×"))).toBe(true);
  });
});

describe("cap and MAGI phase-out (Schedule 1-A Part III)", () => {
  it("reduces $100 per full $1,000 over $150,000", () => {
    const r = run({ w2Amount: 5000, magi: 170_000 });
    expect(r.phaseOutSteps).toBe(20);
    expect(r.phaseOutReduction).toBe(2000);
    expect(r.deduction).toBe(3000);
  });

  it("drops a partial $1,000", () => {
    expect(run({ w2Amount: 5000, magi: 150_999.99 }).phaseOutReduction).toBe(0);
    expect(run({ w2Amount: 5000, magi: 151_000 }).phaseOutReduction).toBe(100);
    expect(run({ w2Amount: 5000, magi: 150_000 }).phaseOutReduction).toBe(0);
  });

  it("applies the cap before the reduction", () => {
    const r = run({ w2Amount: 20_000, magi: 200_000 });
    expect(r.amountAfterCap).toBe(12_500);
    expect(r.phaseOutReduction).toBe(5000);
    expect(r.deduction).toBe(7500);
  });

  it("subtracts the reduction from the capped overtime, not from the cap", () => {
    // min(5000, 12500) − 5000 = 0 (a cap-minus-reduction formula would wrongly give 5000)
    expect(run({ w2Amount: 5000, magi: 200_000 }).deduction).toBe(0);
  });

  it("uses $25,000 / $300,000 for married filing jointly", () => {
    const r = run({ filingStatus: "mfj", w2Amount: 30_000, magi: 350_500 });
    expect(r.cap).toBe(25_000);
    expect(r.threshold).toBe(300_000);
    expect(r.phaseOutReduction).toBe(5000);
    expect(r.deduction).toBe(20_000);
    expect(r.fullPhaseOutMagi).toBe(550_000);
  });

  it("uses single amounts for head of household and qualifying surviving spouse", () => {
    expect(run({ filingStatus: "hoh", w2Amount: 3000, magi: 160_000 }).deduction).toBe(2000);
    const q = run({ filingStatus: "qss", w2Amount: 20_000, magi: 100_000 });
    expect(q.cap).toBe(12_500);
    expect(q.deduction).toBe(12_500);
  });

  it("is fully phased out at $275,000 for a single filer at the cap", () => {
    const r = run({ w2Amount: 12_500, magi: 275_000 });
    expect(r.deduction).toBe(0);
    expect(r.fullPhaseOutMagi).toBe(275_000);
  });
});

describe("eligibility", () => {
  it("gives $0 to married filing separately", () => {
    const r = run({ filingStatus: "mfs", w2Amount: 4000 });
    expect(r.eligible).toBe(false);
    expect(r.deduction).toBe(0);
    expect(r.estimatedSavings).toBe(0);
  });
  it("gives $0 to FLSA-exempt employees", () => {
    const r = run({ flsaNonExempt: false, w2Amount: 4000 });
    expect(r.eligible).toBe(false);
    expect(r.deduction).toBe(0);
  });
  it("requires a valid SSN", () => {
    expect(run({ hasValidSsn: false, w2Amount: 4000 }).deduction).toBe(0);
  });
  it("handles zero overtime", () => {
    const r = run({ taxYear: 2025, source: "hours", hourlyRate: 25, overtimeHours: 0, overtimeMultiplier: 1.5 });
    expect(r.deduction).toBe(0);
    expect(r.warnings.some((w) => w.includes("zero qualified overtime"))).toBe(true);
  });
  it("warns when a 2026 W-2 shows no code TT amount", () => {
    expect(run({ w2Amount: 0 }).warnings.some((w) => w.includes("corrected W-2"))).toBe(true);
  });
  it("warns when the W-2 amount and the hours estimate disagree", () => {
    const r = run({ w2Amount: 5000, hourlyRate: 40, overtimeHours: 100, overtimeMultiplier: 1.5 });
    expect(r.hoursBasedPremium).toBe(2000);
    expect(r.deduction).toBe(5000);
    expect(r.warnings.some((w) => w.includes("differs"))).toBe(true);
  });
  it("leaves savings empty when no bracket is chosen", () => {
    expect(run({ w2Amount: 1000, marginalRate: null }).estimatedSavings).toBeNull();
  });
});

describe("validation", () => {
  it("rejects tax years outside 2025–2028", () => {
    for (const taxYear of [2024, 2029]) {
      const out = calculateOvertimeDeduction({ ...base, taxYear });
      expect(out.ok).toBe(false);
      if (!out.ok) expect(out.errors.taxYear).toBeTruthy();
    }
  });
  it("accepts every year 2025–2028", () => {
    for (const taxYear of [2025, 2026, 2027, 2028]) expect(calculateOvertimeDeduction({ ...base, taxYear }).ok).toBe(true);
  });
  it("requires MAGI and valid hours", () => {
    const out = calculateOvertimeDeduction({ ...base, magi: null, source: "hours", hourlyRate: 20, overtimeHours: -5, overtimeMultiplier: 1.5 });
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.errors.magi).toBeTruthy();
      expect(out.errors.overtimeHours).toBeTruthy();
    }
  });
  it("rejects NaN input and impossible hours", () => {
    const out = calculateOvertimeDeduction({ ...base, source: "hours", hourlyRate: NaN, overtimeHours: 10_000, overtimeMultiplier: 1.5 });
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.errors.hourlyRate).toBeTruthy();
      expect(out.errors.overtimeHours).toBeTruthy();
    }
  });
});
