"use client";

import React, { useMemo, useState } from "react";
import {
  PiggyBank,
  Percent,
  CalendarClock,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const formatMoney = (currencySymbol: string, n: number) =>
  `${currencySymbol}${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type Result = {
  principal: number;
  rate: number;
  years: number;
  n: number;
  contributionMonthly: number;
  annualIncrease: number;

  totalAmount: number;
  interestEarned: number;
  contributedTotal: number;

  summary: string;
  label: string;
};

const freqOptions = [
  { label: "Yearly", value: 1 },
  { label: "Half-Yearly", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

function freqLabel(n: number) {
  return freqOptions.find((x) => x.value === n)?.label ?? `${n}/year`;
}

/**
 * Compound interest with optional monthly contributions.
 * - Principal grows with compound rate.
 * - Contributions added monthly. Optionally increase annually by %.
 * This is a practical/SEO-friendly version.
 */
function computeCompound({
  principal,
  ratePercent,
  years,
  n,
  monthlyContribution,
  annualIncreasePercent,
}: {
  principal: number;
  ratePercent: number;
  years: number;
  n: number;
  monthlyContribution: number;
  annualIncreasePercent: number;
}) {
  const r = ratePercent / 100;

  // Base compound on principal
  const A_principal = principal * Math.pow(1 + r / n, n * years);

  // If no contributions, return simple
  if (monthlyContribution <= 0) {
    const totalAmount = A_principal;
    const interestEarned = totalAmount - principal;
    const contributedTotal = principal;
    return { totalAmount, interestEarned, contributedTotal };
  }

  // Contributions: simulate monthly deposits (simple + accurate enough for UI)
  const totalMonths = Math.round(years * 12);
  let balance = principal;
  let contributed = principal;

  // Convert annual nominal rate to effective monthly growth using compounding frequency
  // Approach: compute effective annual rate from compounding frequency, then convert to monthly.
  const effectiveAnnual = Math.pow(1 + r / n, n) - 1;
  const monthlyGrowth = Math.pow(1 + effectiveAnnual, 1 / 12) - 1;

  let currentMonthly = monthlyContribution;

  for (let m = 1; m <= totalMonths; m++) {
    // apply monthly growth
    balance *= 1 + monthlyGrowth;

    // deposit monthly contribution
    balance += currentMonthly;
    contributed += currentMonthly;

    // every 12 months, increase monthly contribution
    if (annualIncreasePercent > 0 && m % 12 === 0) {
      currentMonthly *= 1 + annualIncreasePercent / 100;
    }
  }

  const totalAmount = balance;
  const interestEarned = totalAmount - contributed;

  return { totalAmount, interestEarned, contributedTotal: contributed };
}

export default function CompoundInterestCalculator() {
  const currencySymbol = "$";

  const [principal, setPrincipal] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("1");

  // ✅ SaaS add-on fields (optional but very useful)
  const [monthlyContribution, setMonthlyContribution] = useState<string>(""); // optional
  const [annualIncrease, setAnnualIncrease] = useState<string>(""); // optional

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Growth", "Investments", "Savings", "Compounding"],
    []
  );

  const reset = () => {
    setPrincipal("");
    setRate("");
    setTime("");
    setFrequency("1");
    setMonthlyContribution("");
    setAnnualIncrease("");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const onNumericChange =
    (setter: (v: string) => void, { allowDecimal }: { allowDecimal: boolean }) =>
    (v: string) => {
      const re = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!re.test(v)) return;
      if (v.includes("-")) return;
      setter(v);
      setError(null);
      setResult(null);
      setCopied(false);
    };

  const calculate = () => {
    setCopied(false);

    const Praw = safeNum(principal);
    const Rraw = safeNum(rate);
    const Traw = safeNum(time);
    const Nraw = safeNum(frequency);

    if (!Number.isFinite(Praw) || Praw < 0) {
      setError("Please enter a valid principal amount (0 or more).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(Rraw) || Rraw < 0 || Rraw > 1000) {
      setError("Please enter a valid interest rate (0 or more).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(Traw) || Traw <= 0) {
      setError("Please enter a valid time in years (greater than 0).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(Nraw) || Nraw <= 0) {
      setError("Please choose a valid compounding frequency.");
      setResult(null);
      return;
    }

    const P = clamp(Praw, 0, Number.MAX_SAFE_INTEGER);
    const R = clamp(Rraw, 0, 1000);
    const T = clamp(Traw, 0.01, 1000);
    const N = clamp(Math.floor(Nraw), 1, 365);

    const mcRaw = monthlyContribution.trim() === "" ? 0 : safeNum(monthlyContribution);
    const aiRaw = annualIncrease.trim() === "" ? 0 : safeNum(annualIncrease);

    if (!Number.isFinite(mcRaw) || mcRaw < 0) {
      setError("Monthly contribution must be 0 or more.");
      setResult(null);
      return;
    }
    if (!Number.isFinite(aiRaw) || aiRaw < 0 || aiRaw > 200) {
      setError("Annual increase must be between 0 and 200.");
      setResult(null);
      return;
    }

    const contributionMonthly = clamp(mcRaw, 0, Number.MAX_SAFE_INTEGER);
    const annualIncreasePct = clamp(aiRaw, 0, 200);

    const { totalAmount, interestEarned, contributedTotal } = computeCompound({
      principal: P,
      ratePercent: R,
      years: T,
      n: N,
      monthlyContribution: contributionMonthly,
      annualIncreasePercent: annualIncreasePct,
    });

    const label = `${freqLabel(N)} compounding`;

    const summary =
      `Principal: ${formatMoney(currencySymbol, P)} • Rate: ${R}% • Time: ${T} years • ` +
      `Frequency: ${label}` +
      (contributionMonthly > 0
        ? ` • Monthly: ${formatMoney(currencySymbol, contributionMonthly)}${
            annualIncreasePct > 0 ? ` (↑ ${annualIncreasePct}%/yr)` : ""
          }`
        : "") +
      ` • Total: ${formatMoney(currencySymbol, totalAmount)} • Interest: ${formatMoney(
        currencySymbol,
        interestEarned
      )}`;

    setError(null);
    setResult({
      principal: P,
      rate: R,
      years: T,
      n: N,
      contributionMonthly,
      annualIncrease: annualIncreasePct,
      totalAmount,
      interestEarned,
      contributedTotal,
      summary,
      label,
    });
  };

  

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* SaaS background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl ">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
              <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
               <PiggyBank className="h-4 w-4 text-[#125FF9]" />
              Finance • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Compound Interest{" "} 
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Estimate growth over time with compounding — plus optional monthly contributions.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Principal */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Principal
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Initial amount you start with.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={principal}
                        onChange={(e) => onNumericChange(setPrincipal, { allowDecimal: true })(e.target.value)}
                        placeholder="e.g. 10000"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Interest rate
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Annual rate (APR) in %.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <Percent className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rate}
                        onChange={(e) => onNumericChange(setRate, { allowDecimal: true })(e.target.value)}
                        placeholder="e.g. 7.5"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Time (years)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">How long you invest for.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <CalendarClock className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={time}
                        onChange={(e) => onNumericChange(setTime, { allowDecimal: true })(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-xs text-gray-500">years</span>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Compounding
                    </label>
                    <p className="mt-1 text-xs text-gray-600">How often interest is added.</p>
                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <select
                        value={frequency}
                        onChange={(e) => {
                          setFrequency(e.target.value);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {freqOptions.map((f) => (
                          <option key={f.value} value={String(f.value)}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional extras */}
                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">
                    Optional additions (recommended)
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Add monthly contributions to get a more realistic estimate.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Monthly contribution
                      </label>
                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <span className="text-sm font-semibold text-gray-700">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={monthlyContribution}
                          onChange={(e) =>
                            onNumericChange(setMonthlyContribution, { allowDecimal: true })(e.target.value)
                          }
                          placeholder="e.g. 200"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Annual increase
                      </label>
                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <Percent className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={annualIncrease}
                          onChange={(e) =>
                            onNumericChange(setAnnualIncrease, { allowDecimal: true })(e.target.value)
                          }
                          placeholder="e.g. 5"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                        <span className="text-sm font-semibold text-gray-700">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculate}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9] shadow-sm hover:shadow-md hover:brightness-105 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate
                  </button>

                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-900 border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Total amount: {formatMoney(currencySymbol, result.totalAmount)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Interest earned:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatMoney(currencySymbol, result.interestEarned)}
                          </span>{" "}
                          • {result.label}
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(result.summary);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                          } catch {}
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <div className="mt-5 grid md:grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Principal</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.principal)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Contributed</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.contributedTotal)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Interest</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.interestEarned)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: Small monthly contributions can significantly increase long-term growth.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numoro calculators are designed to be simple, fast, and easy to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
