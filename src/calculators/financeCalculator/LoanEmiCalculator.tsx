"use client";

import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Percent,
  CalendarClock,
  Coins,
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
  annualRate: number;
  months: number;

  emi: number;
  totalPayment: number;
  totalInterest: number;

  // nice breakdown
  principalShareMonthly: number;
  interestShareMonthly: number;

  summary: string;
};

export default function LoanEmiCalculator() {
  const currencySymbol = "$";

  const [principal, setPrincipal] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [tenure, setTenure] = useState<string>("");

  // ✅ UX: allow years or months
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Monthly EMI", "Total interest", "Loan planning", "Amortization"],
    []
  );

  const reset = () => {
    setPrincipal("");
    setRate("");
    setTenure("");
    setTenureUnit("years");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const onNumericChange =
    (setter: (v: string) => void, { allowDecimal }: { allowDecimal: boolean }) =>
    (v: string) => {
      const re = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!re.test(v)) return;
      if (v.includes("-")) return; // prevent minus
      setter(v);
      setError(null);
      setResult(null);
      setCopied(false);
    };

  const calculate = () => {
    setCopied(false);

    const Praw = safeNum(principal);
    const Rraw = safeNum(rate);
    const Traw = safeNum(tenure);

    if (!Number.isFinite(Praw) || Praw <= 0) {
      setError("Please enter a valid loan amount (greater than 0).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(Rraw) || Rraw < 0 || Rraw > 1000) {
      setError("Please enter a valid annual interest rate (0 or more).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(Traw) || Traw <= 0) {
      setError("Please enter a valid loan tenure (greater than 0).");
      setResult(null);
      return;
    }

    const P = clamp(Praw, 0, Number.MAX_SAFE_INTEGER);
    const annualRate = clamp(Rraw, 0, 1000);
    const t = clamp(Traw, 0.01, 1000);

    const months =
      tenureUnit === "years"
        ? Math.round(t * 12)
        : Math.round(t); // months

    if (months <= 0) {
      setError("Loan tenure must be at least 1 month.");
      setResult(null);
      return;
    }

    const monthlyRate = annualRate / 12 / 100; // R

    // ✅ EMI formula with edge case for 0% interest
    // If monthlyRate == 0 => EMI = P / months
    let emi = 0;
    if (monthlyRate === 0) {
      emi = P / months;
    } else {
      const pow = Math.pow(1 + monthlyRate, months);
      emi = (P * monthlyRate * pow) / (pow - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    // simple “first-month” split estimate for UI:
    // first month interest = P * monthlyRate
    const firstMonthInterest = P * monthlyRate;
    const firstMonthPrincipal = emi - firstMonthInterest;

    const summary =
      `Loan: ${formatMoney(currencySymbol, P)} • Rate: ${annualRate}% • Tenure: ${months} months • ` +
      `EMI: ${formatMoney(currencySymbol, emi)} • Interest: ${formatMoney(
        currencySymbol,
        totalInterest
      )} • Total: ${formatMoney(currencySymbol, totalPayment)}`;

    setError(null);
    setResult({
      principal: P,
      annualRate,
      months,
      emi,
      totalPayment,
      totalInterest,
      principalShareMonthly: firstMonthPrincipal,
      interestShareMonthly: firstMonthInterest,
      summary,
    });
  };

  const copySummary = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
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
                 <CreditCard className="h-4 w-4 text-[#125FF9]" />
              Finance • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Loan EMI{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Calculate monthly EMI, total interest, and total payment for your loan.
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
                  {/* Loan Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Loan amount
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Total principal amount.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={principal}
                        onChange={(e) =>
                          onNumericChange(setPrincipal, { allowDecimal: true })(e.target.value)
                        }
                        placeholder="e.g. 100000"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Annual interest rate
                    </label>
                    <p className="mt-1 text-xs text-gray-600">APR (%) per year.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <Percent className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rate}
                        onChange={(e) =>
                          onNumericChange(setRate, { allowDecimal: true })(e.target.value)
                        }
                        placeholder="e.g. 12"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Tenure */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Loan tenure
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Choose years or months for easier input.
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <CalendarClock className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tenure}
                          onChange={(e) =>
                            onNumericChange(setTenure, { allowDecimal: true })(e.target.value)
                          }
                          placeholder={tenureUnit === "years" ? "e.g. 5" : "e.g. 60"}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <select
                          value={tenureUnit}
                          onChange={(e) => {
                            setTenureUnit(e.target.value as "years" | "months");
                            setError(null);
                            setResult(null);
                            setCopied(false);
                          }}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        >
                          <option value="years">Years</option>
                          <option value="months">Months</option>
                        </select>
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
                    Calculate EMI
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
                          Monthly EMI: {formatMoney(currencySymbol, result.emi)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Total interest:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatMoney(currencySymbol, result.totalInterest)}
                          </span>{" "}
                          • Total payment:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatMoney(currencySymbol, result.totalPayment)}
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Tenure: {result.months} months • Rate: {result.annualRate}%
                        </p>
                      </div>

                      <button
                        onClick={copySummary}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <div className="mt-5 grid md:grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">EMI</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.emi)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Interest</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalInterest)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalPayment)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      First-month split estimate: principal{" "}
                      {formatMoney(currencySymbol, result.principalShareMonthly)} + interest{" "}
                      {formatMoney(currencySymbol, result.interestShareMonthly)} = EMI
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
