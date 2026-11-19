"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BreakdownRow,
  Card,
  CheckboxField,
  EmptyResult,
  NumberField,
  Segmented,
  SelectField,
  StatTile,
  MobileResultBar,
  Warnings,
} from "@/components/calculator/Fields";
import { formatMoney, formatPercent, parseNumber } from "@/lib/calc/money";
import {
  calculateOvertimeDeduction,
  FILING_STATUS_LABELS,
  OVERTIME_RULES,
  SUPPORTED_TAX_YEARS,
  type FilingStatus,
  type OvertimeSource,
} from "@/lib/calc/overtime";

const usd = (n: number) => formatMoney(n, "USD");

export default function NoTaxOnOvertimeCalculator() {
  const [taxYear, setTaxYear] = useState("2026");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [source, setSource] = useState<OvertimeSource>("hours");
  const [hourlyRate, setHourlyRate] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("156");
  const [multiplier, setMultiplier] = useState("1.5");
  const [totalPay, setTotalPay] = useState("9360");
  const [w2Amount, setW2Amount] = useState("3120");
  const [magi, setMagi] = useState("85000");
  const [marginal, setMarginal] = useState("0.22");
  const [nonExempt, setNonExempt] = useState(true);
  const [validSsn, setValidSsn] = useState(true);

  const outcome = useMemo(
    () =>
      calculateOvertimeDeduction({
        taxYear: Number(taxYear),
        filingStatus,
        source,
        hourlyRate: parseNumber(hourlyRate),
        overtimeHours: parseNumber(overtimeHours),
        overtimeMultiplier: parseNumber(multiplier),
        totalOvertimePay: parseNumber(totalPay),
        w2Amount: parseNumber(w2Amount),
        magi: parseNumber(magi),
        marginalRate: marginal === "" ? null : Number(marginal),
        flsaNonExempt: nonExempt,
        hasValidSsn: validSsn,
      }),
    [taxYear, filingStatus, source, hourlyRate, overtimeHours, multiplier, totalPay, w2Amount, magi, marginal, nonExempt, validSsn]
  );

  const errors = outcome.ok ? {} : outcome.errors;
  const r = outcome.ok ? outcome.result : null;
  const yearRequiresW2 = Number(taxYear) >= 2026;

  const sourceOptions = [
    { value: "hours", label: "Rate × hours" },
    { value: "w2", label: yearRequiresW2 ? "W-2 code TT" : "Reported amount" },
    { value: "totalPay", label: "Total OT pay" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
          <SelectField
            id="ot-year"
            label="Tax year"
            value={taxYear}
            onChange={setTaxYear}
            options={SUPPORTED_TAX_YEARS.map((y) => ({ value: String(y), label: String(y) }))}
            help="The deduction applies to tax years 2025 through 2028."
            error={errors.taxYear}
          />
          <SelectField
            id="ot-status"
            label="Filing status"
            value={filingStatus}
            onChange={(v) => setFilingStatus(v as FilingStatus)}
            options={(Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((k) => ({ value: k, label: FILING_STATUS_LABELS[k] }))}
          />

          <Segmented
            name="ot-source"
            legend="How do you know your overtime?"
            value={source}
            onChange={(v) => setSource(v as OvertimeSource)}
            options={sourceOptions}
            className="sm:col-span-2"
          />

          {source === "hours" && (
            <>
              <NumberField
                id="ot-rate"
                label="Regular hourly rate"
                prefix="$"
                value={hourlyRate}
                onChange={setHourlyRate}
                help="Your FLSA regular rate, before overtime."
                error={errors.hourlyRate}
              />
              <NumberField
                id="ot-hours"
                label="FLSA overtime hours (year)"
                suffix="hours"
                value={overtimeHours}
                onChange={setOvertimeHours}
                help="Hours over 40 in each workweek, added up for the year."
                error={errors.overtimeHours}
              />
              <NumberField
                id="ot-mult"
                label="Overtime rate paid"
                suffix="× regular"
                value={multiplier}
                onChange={setMultiplier}
                help="Usually 1.5 (time-and-a-half). Only the 0.5 premium counts."
                error={errors.overtimeMultiplier}
              />
            </>
          )}

          {source === "totalPay" && (
            <>
              <NumberField
                id="ot-total"
                label="Total overtime pay (year)"
                prefix="$"
                value={totalPay}
                onChange={setTotalPay}
                help="Regular pay plus premium for overtime hours, from your pay stubs."
                error={errors.totalOvertimePay}
              />
              <NumberField
                id="ot-mult2"
                label="Overtime rate paid"
                suffix="× regular"
                value={multiplier}
                onChange={setMultiplier}
                help="1.5 → one-third of the total qualifies; 2 → one-quarter."
                error={errors.overtimeMultiplier}
              />
            </>
          )}

          {source === "w2" && (
            <>
              <NumberField
                id="ot-w2"
                label={yearRequiresW2 ? "W-2 box 12, code TT" : "Reported qualified overtime"}
                prefix="$"
                value={w2Amount}
                onChange={setW2Amount}
                help={
                  yearRequiresW2
                    ? "Qualified overtime your employer reports. Add amounts from all W-2s and 1099s."
                    : "For 2025, the premium shown on your pay statement or W-2 box 14, if your employer provided one."
                }
                error={errors.w2Amount}
              />
              <details className="sm:col-span-2 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">Optional: check the amount against your hours</summary>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <NumberField id="ot-rate-x" label="Hourly rate" prefix="$" value={hourlyRate} onChange={setHourlyRate} error={errors.hourlyRate} />
                  <NumberField id="ot-hours-x" label="FLSA OT hours" value={overtimeHours} onChange={setOvertimeHours} error={errors.overtimeHours} />
                  <NumberField id="ot-mult-x" label="OT rate" suffix="×" value={multiplier} onChange={setMultiplier} error={errors.overtimeMultiplier} />
                </div>
              </details>
            </>
          )}

          <NumberField
            id="ot-magi"
            label="Modified AGI (MAGI)"
            prefix="$"
            value={magi}
            onChange={setMagi}
            help="Usually your adjusted gross income (Form 1040, line 11)."
            error={errors.magi}
          />
          <SelectField
            id="ot-bracket"
            label="Federal tax bracket (optional)"
            value={marginal}
            onChange={setMarginal}
            options={[
              { value: "", label: "Not sure – skip savings" },
              ...OVERTIME_RULES.marginalRates.map((m) => ({ value: String(m), label: `${Math.round(m * 100)}%` })),
            ]}
            help="Used to estimate the federal income tax you save."
            error={errors.marginalRate}
          />

          <div className="space-y-3 sm:col-span-2">
            <CheckboxField
              id="ot-nonexempt"
              label="I'm paid overtime under the FLSA (non-exempt)"
              checked={nonExempt}
              onChange={setNonExempt}
              help="Most salaried managers and professionals are exempt and can't claim this deduction."
            />
            <CheckboxField id="ot-ssn" label="I have a Social Security number valid for work" checked={validSsn} onChange={setValidSsn} />
          </div>
        </form>
      </Card>

      <div className="lg:col-span-2" id="ot-result">
        <div className="scroll-mt-4 lg:sticky lg:top-6">
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your estimate</h2>
            {!r ? (
              <div className="mt-3">
                <EmptyResult>Fix the highlighted fields to see your deduction.</EmptyResult>
              </div>
            ) : (
              <div aria-live="polite">
                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{usd(r.deduction)}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {r.eligible
                    ? r.estimatedSavings !== null
                      ? `Estimated deduction for ${r.taxYear}. At a ${formatPercent(r.marginalRate!, 0)} bracket that saves about ${usd(r.estimatedSavings)} in federal income tax.`
                      : `Estimated deduction for ${r.taxYear}. Pick a bracket to estimate the tax saved.`
                    : r.ineligibleReason}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatTile label="Qualified premium" value={usd(r.qualifiedOvertime)} />
                  <StatTile label="Tax saved (est.)" value={r.estimatedSavings === null ? "—" : usd(r.estimatedSavings)} tone={r.estimatedSavings ? "good" : "default"} />
                </div>

                <dl className="mt-4">
                  {r.totalOvertimePay !== null && <BreakdownRow label="Total overtime pay" value={usd(r.totalOvertimePay)} hint="Regular pay + premium for OT hours (not all deductible)" />}
                  <BreakdownRow label="Qualified overtime premium" value={usd(r.qualifiedOvertime)} />
                  <BreakdownRow label="Deduction limit" value={usd(r.cap)} hint={filingStatus === "mfj" ? "Joint return" : "Per return"} />
                  <BreakdownRow label="After limit" value={usd(r.amountAfterCap)} />
                  <BreakdownRow label="MAGI over threshold" value={usd(r.magiExcess)} hint={`Threshold ${usd(r.threshold)}`} />
                  <BreakdownRow label="Phase-out reduction" value={usd(r.phaseOutReduction)} negative hint="$100 per full $1,000 over" />
                  <BreakdownRow label="Eligible deduction" value={usd(r.deduction)} strong />
                </dl>

                <details className="mt-3 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-900">How this was calculated</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-gray-700">
                    {r.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-gray-600">{r.reportingNote}</p>
                </details>

                <Warnings items={r.warnings} />

                <p className="mt-4 text-xs leading-relaxed text-gray-500">
                  Estimate only, not tax advice. The deduction lowers federal income tax, not Social Security or Medicare tax, and state rules vary. Planning to save the refund? See how it could grow with the{" "}
                  <Link href="/finance/compound-interest-calculator/" className="text-[#125FF9] hover:underline">
                    compound interest calculator
                  </Link>
                  .
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <MobileResultBar label={"Deduction"} value={r ? usd(r.deduction) : null} targetId="ot-result" />
    </div>
  );
}
