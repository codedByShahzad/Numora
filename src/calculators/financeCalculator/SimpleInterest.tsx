"use client";

import React, { useMemo, useState } from "react";
import {
  BadgePercent,
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

type TimeUnit = "years" | "months" | "days";

type Result = {
  principal: number;
  rate: number; // annual %
  timeYears: number; // normalized
  timeInput: number;
  timeUnit: TimeUnit;

  interest: number;
  totalAmount: number;

  summary: string;
};

export default function SimpleInterestCalculator() {
  const currencySymbol = "$";

  const [principal, setPrincipal] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("years");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(() => ["Interest", "Total amount", "Finance basics"], []);

  const reset = () => {
    setPrincipal("");
    setRate("");
    setTime("");
    setTimeUnit("years");
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

  const normalizeToYears = (t: number, unit: TimeUnit) => {
    if (unit === "years") return t;
    if (unit === "months") return t / 12;
    return t / 365; // days
  };

  const calculate = () => {
    setCopied(false);

    const Praw = safeNum(principal);
    const Rraw = safeNum(rate);
    const Traw = safeNum(time);

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
      setError("Please enter a valid time (greater than 0).");
      setResult(null);
      return;
    }

    const P = clamp(Praw, 0, Number.MAX_SAFE_INTEGER);
    const R = clamp(Rraw, 0, 1000); // annual %
    const Tinput = clamp(Traw, 0.0001, 100000);

    const Tyears = normalizeToYears(Tinput, timeUnit);

    // Simple Interest = (P * R * T) / 100  where R is annual % and T is in years
    const interest = (P * R * Tyears) / 100;
    const totalAmount = P + interest;

    const summary =
      `Principal: ${formatMoney(currencySymbol, P)} • Rate: ${R}%/year • ` +
      `Time: ${Tinput} ${timeUnit} • Interest: ${formatMoney(
        currencySymbol,
        interest
      )} • Total: ${formatMoney(currencySymbol, totalAmount)}`;

    setError(null);
    setResult({
      principal: P,
      rate: R,
      timeYears: Tyears,
      timeInput: Tinput,
      timeUnit,
      interest,
      totalAmount,
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

      <div className="mx-auto max-w-5xl px-4 py-7 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                  <BadgePercent className="h-4 w-4 text-[#125FF9]" />
              Finance • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple Interest{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Calculate interest earned or paid on a principal amount.
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
                    <p className="mt-1 text-xs text-gray-600">Starting amount.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={principal}
                        onChange={(e) =>
                          onNumericChange(setPrincipal, { allowDecimal: true })(e.target.value)
                        }
                        placeholder="e.g. 5000"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Interest rate (annual)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">APR in percent (%).</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <Percent className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rate}
                        onChange={(e) =>
                          onNumericChange(setRate, { allowDecimal: true })(e.target.value)
                        }
                        placeholder="e.g. 10"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Time
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Choose a unit (years / months / days).
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                        <CalendarClock className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={time}
                          onChange={(e) =>
                            onNumericChange(setTime, { allowDecimal: true })(e.target.value)
                          }
                          placeholder="e.g. 2"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                        <select
                          value={timeUnit}
                          onChange={(e) => {
                            setTimeUnit(e.target.value as TimeUnit);
                            setError(null);
                            setResult(null);
                            setCopied(false);
                          }}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        >
                          <option value="years">Years</option>
                          <option value="months">Months</option>
                          <option value="days">Days</option>
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
                          Interest: {formatMoney(currencySymbol, result.interest)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Total amount:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatMoney(currencySymbol, result.totalAmount)}
                          </span>{" "}
                          • Principal: {formatMoney(currencySymbol, result.principal)}
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

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Principal</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.principal)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Interest</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.interest)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Formula: SI = (P × R × T) / 100, where T is in years.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numora calculators are designed to be simple, fast, and easy to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
