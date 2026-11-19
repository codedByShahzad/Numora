/**
 * No Tax on Overtime: deduction for qualified overtime compensation
 * (IRC section 225, tax years 2025–2028), following Schedule 1-A Part III.
 *
 * Pure functions only: no React, no DOM. Rules come from
 * src/data/tax/overtime-rules.json so a law change is a data edit.
 */
import rules from "@/data/tax/overtime-rules.json";
import { roundMoney, subMoney, type CalcOutcome, type FieldErrors } from "./money";

export type FilingStatus = "single" | "mfj" | "mfs" | "hoh" | "qss";
export type OvertimeSource = "w2" | "hours" | "totalPay";

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  mfj: "Married filing jointly",
  mfs: "Married filing separately",
  hoh: "Head of household",
  qss: "Qualifying surviving spouse",
};

export type OvertimeYearRule = {
  available: boolean;
  capSingle: number;
  capJoint: number;
  thresholdSingle: number;
  thresholdJoint: number;
  reporting: "transition" | "required";
  reportingNote: string;
};

export type OvertimeRules = typeof rules & {
  years: Record<string, OvertimeYearRule>;
};

const RULES = rules as OvertimeRules;

export const SUPPORTED_TAX_YEARS = Object.keys(RULES.years)
  .map(Number)
  .filter((y) => RULES.years[String(y)].available)
  .sort();

export type OvertimeInput = {
  taxYear: number;
  filingStatus: FilingStatus;
  source: OvertimeSource;
  /** Regular hourly rate (FLSA "regular rate"). */
  hourlyRate?: number | null;
  /** FLSA overtime hours for the year (hours over 40 in each workweek). */
  overtimeHours?: number | null;
  /** Overtime pay multiplier actually paid, e.g. 1.5 or 2. */
  overtimeMultiplier?: number | null;
  /** Total overtime pay (regular part + premium), for the 2025 one-third method. */
  totalOvertimePay?: number | null;
  /** Qualified overtime reported by the employer (W-2 box 12 code TT, or box 14 for 2025). */
  w2Amount?: number | null;
  magi: number | null;
  /** Marginal federal income-tax rate as a decimal (0.22), optional. */
  marginalRate?: number | null;
  flsaNonExempt: boolean;
  hasValidSsn: boolean;
};

export type OvertimeField =
  | "taxYear"
  | "hourlyRate"
  | "overtimeHours"
  | "overtimeMultiplier"
  | "totalOvertimePay"
  | "w2Amount"
  | "magi"
  | "marginalRate";

export type OvertimeResult = {
  taxYear: number;
  eligible: boolean;
  ineligibleReason: string | null;
  /** Total pay for the overtime hours (rate × multiplier × hours), when known. */
  totalOvertimePay: number | null;
  /** 0.5 × regular rate × FLSA hours, when hours are entered. */
  hoursBasedPremium: number | null;
  /** Qualified overtime used for the deduction (Schedule 1-A line 14). */
  qualifiedOvertime: number;
  cap: number;
  threshold: number;
  /** Smaller of qualified overtime and the cap (line 15). */
  amountAfterCap: number;
  magiExcess: number;
  phaseOutSteps: number;
  phaseOutReduction: number;
  deduction: number;
  /** MAGI at which the cap itself would be fully phased out. */
  fullPhaseOutMagi: number;
  marginalRate: number | null;
  estimatedSavings: number | null;
  warnings: string[];
  steps: string[];
  reportingNote: string;
};

const MAX_OT_HOURS = 52 * (168 - 40); // every hour of every week beyond 40
const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usd0 = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function getYearRule(taxYear: number): OvertimeYearRule | null {
  const rule = RULES.years[String(taxYear)];
  return rule && rule.available ? rule : null;
}

export function validateOvertime(input: OvertimeInput): FieldErrors<OvertimeField> {
  const e: FieldErrors<OvertimeField> = {};
  if (!getYearRule(input.taxYear)) {
    e.taxYear = `The deduction only applies to tax years ${SUPPORTED_TAX_YEARS[0]}–${
      SUPPORTED_TAX_YEARS[SUPPORTED_TAX_YEARS.length - 1]
    }.`;
  }

  const num = (v: number | null | undefined) => (v === null || v === undefined ? null : v);

  const magi = num(input.magi);
  if (magi === null) e.magi = "Enter your modified adjusted gross income (MAGI).";
  else if (Number.isNaN(magi) || magi < 0) e.magi = "MAGI must be a number of 0 or more.";
  else if (magi > 100_000_000) e.magi = "MAGI looks too large. Check the number.";

  const rate = num(input.hourlyRate);
  const hours = num(input.overtimeHours);
  const mult = num(input.overtimeMultiplier);

  const checkRate = (required: boolean) => {
    if (rate === null) {
      if (required) e.hourlyRate = "Enter your regular hourly rate.";
    } else if (Number.isNaN(rate) || rate <= 0) e.hourlyRate = "Hourly rate must be more than 0.";
    else if (rate > 10_000) e.hourlyRate = "Hourly rate looks too large. Check the number.";
  };
  const checkHours = (required: boolean) => {
    if (hours === null) {
      if (required) e.overtimeHours = "Enter your FLSA overtime hours for the year.";
    } else if (Number.isNaN(hours) || hours < 0) e.overtimeHours = "Overtime hours can't be negative.";
    else if (hours > MAX_OT_HOURS)
      e.overtimeHours = `That is more overtime than a year allows (max ${MAX_OT_HOURS.toLocaleString("en-US")} hours).`;
  };
  const checkMult = (required: boolean) => {
    if (mult === null) {
      if (required) e.overtimeMultiplier = "Enter your overtime rate (for example 1.5).";
    } else if (Number.isNaN(mult) || mult < 1 || mult > 5)
      e.overtimeMultiplier = "Overtime rate must be between 1 and 5 times your regular rate.";
  };

  if (input.source === "hours") {
    checkRate(true);
    checkHours(true);
    checkMult(true);
  } else if (input.source === "totalPay") {
    const total = num(input.totalOvertimePay);
    if (total === null) e.totalOvertimePay = "Enter the total overtime pay shown on your pay records.";
    else if (Number.isNaN(total) || total < 0) e.totalOvertimePay = "Total overtime pay can't be negative.";
    else if (total > 10_000_000) e.totalOvertimePay = "That amount looks too large. Check the number.";
    checkMult(true);
  } else {
    const w2 = num(input.w2Amount);
    if (w2 === null) e.w2Amount = "Enter the qualified overtime amount reported by your employer (enter 0 if none).";
    else if (Number.isNaN(w2) || w2 < 0) e.w2Amount = "The reported amount can't be negative.";
    else if (w2 > 10_000_000) e.w2Amount = "That amount looks too large. Check the number.";
    // Hours are optional here; they're used as a cross-check.
    checkRate(false);
    checkHours(false);
    checkMult(false);
  }

  const mr = num(input.marginalRate);
  if (mr !== null && (Number.isNaN(mr) || mr < 0 || mr > 0.37)) {
    e.marginalRate = "Choose a federal bracket between 10% and 37%.";
  }
  return e;
}

/** Premium share of each overtime dollar that the FLSA requires (max 0.5 of the regular rate). */
function flsaPremiumShare(multiplier: number) {
  return Math.max(0, Math.min(0.5, multiplier - 1));
}

export function calculateOvertimeDeduction(
  input: OvertimeInput
): CalcOutcome<OvertimeResult, OvertimeField> {
  const errors = validateOvertime(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const year = getYearRule(input.taxYear)!;
  const joint = input.filingStatus === "mfj";
  const cap = joint ? year.capJoint : year.capSingle;
  const threshold = joint ? year.thresholdJoint : year.thresholdSingle;
  const warnings: string[] = [];
  const steps: string[] = [];

  const rate = input.hourlyRate ?? null;
  const hours = input.overtimeHours ?? null;
  const mult = input.overtimeMultiplier ?? 1.5;

  // --- Overtime figures --------------------------------------------------
  let totalOvertimePay: number | null = null;
  let hoursBasedPremium: number | null = null;
  if (rate !== null && hours !== null) {
    totalOvertimePay = roundMoney(rate * mult * hours);
    hoursBasedPremium = roundMoney(rate * flsaPremiumShare(mult) * hours);
  }

  if (mult < 1.5 && (input.source === "hours" || input.source === "totalPay")) {
    warnings.push(
      `You entered an overtime rate of ${mult}×. The FLSA requires at least 1.5× for overtime hours, so check your pay records. Only the premium actually paid (up to half your regular rate) is counted.`
    );
  }
  if (mult > 1.5 && input.source !== "w2") {
    warnings.push(
      `Only the FLSA-required half-time premium counts. Pay above 1.5× (you entered ${mult}×) is not qualified overtime.`
    );
  }

  let qualifiedOvertime = 0;
  if (input.source === "hours") {
    qualifiedOvertime = hoursBasedPremium ?? 0;
    steps.push(
      `Qualified overtime premium = ${usd(rate!)} × ${roundMoney(flsaPremiumShare(mult))} × ${hours} FLSA overtime hours = ${usd(qualifiedOvertime)}.`
    );
  } else if (input.source === "totalPay") {
    const total = input.totalOvertimePay!;
    totalOvertimePay = roundMoney(total);
    qualifiedOvertime = roundMoney((total * flsaPremiumShare(mult)) / mult);
    const fraction = mult === 1.5 ? "one-third" : mult === 2 ? "one-quarter" : `${roundMoney(flsaPremiumShare(mult) / mult)} of it`;
    steps.push(
      `Qualified overtime = ${usd(total)} total overtime pay × ${fraction} (paid at ${mult}×) = ${usd(qualifiedOvertime)}.`
    );
    if (year.reporting === "required") {
      warnings.push(
        `For tax year ${input.taxYear}, the one-third method isn't available: only the amount your employer reports (W-2 box 12, code TT) counts. Treat this as a planning estimate.`
      );
    }
  } else {
    qualifiedOvertime = roundMoney(input.w2Amount!);
    steps.push(`Qualified overtime reported by your employer = ${usd(qualifiedOvertime)}.`);
    if (qualifiedOvertime === 0 && year.reporting === "required") {
      warnings.push(
        "No amount is reported. For 2026 onward you can only deduct overtime your employer reports in W-2 box 12 with code TT. If you were paid FLSA overtime, ask your employer for a corrected W-2."
      );
    }
    if (hoursBasedPremium !== null && Math.abs(hoursBasedPremium - qualifiedOvertime) > Math.max(1, qualifiedOvertime * 0.02)) {
      warnings.push(
        `Your reported amount (${usd(qualifiedOvertime)}) differs from the estimate from your rate and hours (${usd(hoursBasedPremium)}). If the reported amount is too high, use the correct lower amount; if it's too low, ask your employer for a corrected W-2.`
      );
    }
  }

  if (year.reporting === "required" && input.source === "hours") {
    warnings.push(
      `For tax year ${input.taxYear}, the deduction is based on the amount your employer reports in W-2 box 12 (code TT). Use this hours-based figure to check that amount.`
    );
  }

  // --- Eligibility ---------------------------------------------------------
  let ineligibleReason: string | null = null;
  if (input.filingStatus === "mfs") {
    ineligibleReason = "Married couples must file a joint return to claim the overtime deduction, so married filing separately gets $0.";
  } else if (!input.flsaNonExempt) {
    ineligibleReason = "Employees who are exempt from FLSA overtime rules can't claim this deduction, even if they are paid for extra hours.";
  } else if (!input.hasValidSsn) {
    ineligibleReason = "You need a Social Security number valid for employment, included on your return, to claim the deduction.";
  }
  const eligible = ineligibleReason === null;

  // --- Cap and phase-out (Schedule 1-A Part III) --------------------------
  const amountAfterCap = Math.min(qualifiedOvertime, cap);
  const magi = input.magi!;
  const magiExcess = Math.max(0, subMoney(magi, threshold));
  const phaseOutSteps = Math.floor(magiExcess / RULES.phaseOut.stepAmount);
  const phaseOutReduction = phaseOutSteps * RULES.phaseOut.reductionPerStep;
  const deduction = eligible ? Math.max(0, subMoney(amountAfterCap, phaseOutReduction)) : 0;
  const fullPhaseOutMagi = threshold + (cap / RULES.phaseOut.reductionPerStep) * RULES.phaseOut.stepAmount;

  steps.push(
    `Capped at ${usd0(cap)}${joint ? " (joint return)" : ""}: the smaller of ${usd(qualifiedOvertime)} and ${usd0(cap)} is ${usd(amountAfterCap)}.`
  );
  if (magiExcess > 0) {
    steps.push(
      `MAGI ${usd(magi)} is ${usd(magiExcess)} over the ${usd0(threshold)} threshold → ${phaseOutSteps} full $1,000 step${phaseOutSteps === 1 ? "" : "s"} × $100 = ${usd0(phaseOutReduction)} reduction.`
    );
  } else {
    steps.push(`MAGI ${usd(magi)} is not above the ${usd0(threshold)} threshold, so there is no phase-out reduction.`);
  }
  if (eligible) {
    steps.push(`Deduction = ${usd(amountAfterCap)} − ${usd0(phaseOutReduction)} = ${usd(deduction)} (never below $0).`);
  } else {
    steps.push(`Deduction = $0 because: ${ineligibleReason}`);
  }

  if (qualifiedOvertime > cap) {
    warnings.push(`Your qualified overtime is above the ${usd0(cap)} cap, so ${usd(qualifiedOvertime - cap)} of it can't be deducted.`);
  }
  if (eligible && amountAfterCap > 0 && deduction === 0) {
    warnings.push("Your income is high enough that the phase-out removes the whole deduction.");
  }
  if (qualifiedOvertime === 0 && input.source !== "w2") {
    warnings.push("With zero qualified overtime there is nothing to deduct.");
  }

  const marginalRate = input.marginalRate ?? null;
  const estimatedSavings = marginalRate === null ? null : roundMoney(deduction * marginalRate);

  return {
    ok: true,
    result: {
      taxYear: input.taxYear,
      eligible,
      ineligibleReason,
      totalOvertimePay,
      hoursBasedPremium,
      qualifiedOvertime,
      cap,
      threshold,
      amountAfterCap,
      magiExcess,
      phaseOutSteps,
      phaseOutReduction,
      deduction,
      fullPhaseOutMagi,
      marginalRate,
      estimatedSavings,
      warnings,
      steps,
      reportingNote: year.reportingNote,
    },
  };
}

export const OVERTIME_RULES = RULES;
