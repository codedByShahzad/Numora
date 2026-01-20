"use client";

import React, { useMemo, useState } from "react";
import {
  Home,
  Percent,
  CalendarClock,
  Coins,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
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
  homePrice: number;
  downPayment: number;
  loanAmount: number;

  annualRate: number;
  years: number;
  months: number;

  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;

  totalMonthly: number;

  totalPayment: number;
  totalInterest: number;

  summary: string;
};

export default function MortgageCalculator() {
  const currencySymbol = "$";

  // ✅ More realistic mortgage inputs
  const [homePrice, setHomePrice] = useState<string>("");
  const [downPaymentAmount, setDownPaymentAmount] = useState<string>("");
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>("");

  const [rate, setRate] = useState<string>("");
  const [years, setYears] = useState<string>("");

  // Optional monthly add-ons (annual inputs)
  const [propertyTaxYearly, setPropertyTaxYearly] = useState<string>("");
  const [insuranceYearly, setInsuranceYearly] = useState<string>("");

  // PMI (optional)
  const [includePMI, setIncludePMI] = useState<boolean>(true);
  const [pmiRateYearly, setPmiRateYearly] = useState<string>("0.5"); // typical: 0.3%–1.5%

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Monthly payment", "P&I + taxes", "Down payment", "PMI option"],
    []
  );

  const reset = () => {
    setHomePrice("");
    setDownPaymentAmount("");
    setDownPaymentPercent("");
    setRate("");
    setYears("");
    setPropertyTaxYearly("");
    setInsuranceYearly("");
    setIncludePMI(true);
    setPmiRateYearly("0.5");
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

  // Keep DP amount and % in sync (optional but great UX)
  const syncDownPaymentFromAmount = (hp: number, dp: number) => {
    if (hp <= 0) return;
    const pct = (dp / hp) * 100;
    setDownPaymentPercent(pct.toFixed(2));
  };

  const syncDownPaymentFromPercent = (hp: number, pct: number) => {
    if (hp <= 0) return;
    const dp = (hp * pct) / 100;
    setDownPaymentAmount(dp.toFixed(2));
  };

  const calculate = () => {
    setCopied(false);

    const hpRaw = safeNum(homePrice);
    const dpAmtRaw = downPaymentAmount.trim() === "" ? NaN : safeNum(downPaymentAmount);
    const dpPctRaw = downPaymentPercent.trim() === "" ? NaN : safeNum(downPaymentPercent);

    const rateRaw = safeNum(rate);
    const yearsRaw = safeNum(years);

    const taxYRaw = propertyTaxYearly.trim() === "" ? 0 : safeNum(propertyTaxYearly);
    const insYRaw = insuranceYearly.trim() === "" ? 0 : safeNum(insuranceYearly);

    const pmiRaw = safeNum(pmiRateYearly);

    if (!Number.isFinite(hpRaw) || hpRaw <= 0) {
      setError("Please enter a valid home price (greater than 0).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(rateRaw) || rateRaw < 0 || rateRaw > 1000) {
      setError("Please enter a valid interest rate (0 or more).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(yearsRaw) || yearsRaw <= 0) {
      setError("Please enter a valid loan term in years (greater than 0).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(taxYRaw) || taxYRaw < 0) {
      setError("Property tax must be 0 or more.");
      setResult(null);
      return;
    }
    if (!Number.isFinite(insYRaw) || insYRaw < 0) {
      setError("Insurance must be 0 or more.");
      setResult(null);
      return;
    }
    if (!Number.isFinite(pmiRaw) || pmiRaw < 0 || pmiRaw > 10) {
      setError("PMI rate must be between 0 and 10 (% yearly).");
      setResult(null);
      return;
    }

    const hp = clamp(hpRaw, 0, Number.MAX_SAFE_INTEGER);
    const annualRate = clamp(rateRaw, 0, 1000);
    const termYears = clamp(yearsRaw, 0.01, 100);

    // Determine down payment: prefer amount if provided; else use percent
    let dp = 0;
    if (Number.isFinite(dpAmtRaw)) {
      dp = clamp(dpAmtRaw, 0, hp);
    } else if (Number.isFinite(dpPctRaw)) {
      dp = clamp((hp * clamp(dpPctRaw, 0, 100)) / 100, 0, hp);
    } else {
      dp = 0; // default: 0 down
    }

    const loanAmount = hp - dp;

    const months = Math.round(termYears * 12);
    const monthlyRate = annualRate / 12 / 100;

    // ✅ Principal & Interest (P&I)
    let monthlyPI = 0;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / months;
    } else {
      const pow = Math.pow(1 + monthlyRate, months);
      monthlyPI = (loanAmount * monthlyRate * pow) / (pow - 1);
    }

    // Monthly add-ons
    const monthlyTax = taxYRaw / 12;
    const monthlyInsurance = insYRaw / 12;

    // PMI: typically applies if down payment < 20%
    const dpPct = hp > 0 ? (dp / hp) * 100 : 0;
    const needsPMI = includePMI && dpPct < 20;

    const monthlyPMI = needsPMI ? (loanAmount * (pmiRaw / 100)) / 12 : 0;

    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;

    const totalPayment = totalMonthly * months; // includes taxes/insurance/PMI
    // interest should be calculated only on PI portion:
    const totalPI = monthlyPI * months;
    const totalInterest = totalPI - loanAmount;

    const summary =
      `Home: ${formatMoney(currencySymbol, hp)} • Down: ${formatMoney(
        currencySymbol,
        dp
      )} (${dpPct.toFixed(2)}%) • Loan: ${formatMoney(currencySymbol, loanAmount)} • ` +
      `Rate: ${annualRate}% • Term: ${months} months • Monthly: ${formatMoney(
        currencySymbol,
        totalMonthly
      )} (P&I ${formatMoney(currencySymbol, monthlyPI)} + Tax ${formatMoney(
        currencySymbol,
        monthlyTax
      )} + Ins ${formatMoney(currencySymbol, monthlyInsurance)}${
        needsPMI ? ` + PMI ${formatMoney(currencySymbol, monthlyPMI)}` : ""
      })`;

    setError(null);
    setResult({
      homePrice: hp,
      downPayment: dp,
      loanAmount,
      annualRate,
      years: termYears,
      months,
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      monthlyPMI,
      totalMonthly,
      totalPayment,
      totalInterest,
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

      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                 <Home className="h-4 w-4 text-[#125FF9]" />
              Finance • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Mortgage{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Estimate monthly mortgage payment (P&I + taxes + insurance + PMI).
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
                  {/* Home Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Home price
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Property purchase price.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={homePrice}
                        onChange={(e) => {
                          const v = e.target.value;
                          onNumericChange(setHomePrice, { allowDecimal: true })(v);
                        }}
                        onBlur={() => {
                          const hp = safeNum(homePrice);
                          const dp = safeNum(downPaymentAmount);
                          if (Number.isFinite(hp) && Number.isFinite(dp)) syncDownPaymentFromAmount(hp, dp);
                        }}
                        placeholder="e.g. 300000"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Down Payment Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Down payment (amount)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Optional — enter amount or percent.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={downPaymentAmount}
                        onChange={(e) => onNumericChange(setDownPaymentAmount, { allowDecimal: true })(e.target.value)}
                        onBlur={() => {
                          const hp = safeNum(homePrice);
                          const dp = safeNum(downPaymentAmount);
                          if (Number.isFinite(hp) && Number.isFinite(dp)) syncDownPaymentFromAmount(hp, dp);
                        }}
                        placeholder="e.g. 60000"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Down Payment Percent */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Down payment (percent)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Example: 20 for 20%.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <Percent className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={downPaymentPercent}
                        onChange={(e) => onNumericChange(setDownPaymentPercent, { allowDecimal: true })(e.target.value)}
                        onBlur={() => {
                          const hp = safeNum(homePrice);
                          const pct = safeNum(downPaymentPercent);
                          if (Number.isFinite(hp) && Number.isFinite(pct)) syncDownPaymentFromPercent(hp, clamp(pct, 0, 100));
                        }}
                        placeholder="e.g. 20"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Interest rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Interest rate
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Annual rate (APR) in %.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <Percent className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rate}
                        onChange={(e) => onNumericChange(setRate, { allowDecimal: true })(e.target.value)}
                        placeholder="e.g. 6.5"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Loan term */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Loan term
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Duration in years.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <CalendarClock className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={years}
                        onChange={(e) => onNumericChange(setYears, { allowDecimal: true })(e.target.value)}
                        placeholder="e.g. 30"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-xs text-gray-500">years</span>
                    </div>
                  </div>

                  {/* Property tax yearly */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Property tax (yearly)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Optional.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={propertyTaxYearly}
                        onChange={(e) =>
                          onNumericChange(setPropertyTaxYearly, { allowDecimal: true })(e.target.value)
                        }
                        placeholder="e.g. 3600"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Insurance yearly */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Home insurance (yearly)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Optional.</p>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <span className="text-sm font-semibold text-gray-700">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={insuranceYearly}
                        onChange={(e) =>
                          onNumericChange(setInsuranceYearly, { allowDecimal: true })(e.target.value)
                        }
                        placeholder="e.g. 1200"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* PMI toggle */}
                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">PMI (optional)</p>
                      <p className="mt-1 text-xs text-gray-600">
                        Typically applied if down payment is less than 20%.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIncludePMI((v) => !v);
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      className={[
                        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
                        includePMI
                          ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] border-transparent"
                          : "bg-gray-100 border-black/10",
                      ].join(" ")}
                      aria-label="Toggle PMI"
                    >
                      <span
                        className={[
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
                          includePMI ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>

                  {includePMI && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-900">
                        PMI rate (yearly %)
                      </label>
                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                        <ShieldCheck className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={pmiRateYearly}
                          onChange={(e) =>
                            onNumericChange(setPmiRateYearly, { allowDecimal: true })(e.target.value)
                          }
                          placeholder="e.g. 0.5"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                        <span className="text-sm font-semibold text-gray-700">%</span>
                      </div>
                    </div>
                  )}
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
                          Total monthly payment: {formatMoney(currencySymbol, result.totalMonthly)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          P&I: {formatMoney(currencySymbol, result.monthlyPI)} • Tax:{" "}
                          {formatMoney(currencySymbol, result.monthlyTax)} • Insurance:{" "}
                          {formatMoney(currencySymbol, result.monthlyInsurance)}
                          {result.monthlyPMI > 0
                            ? ` • PMI: ${formatMoney(currencySymbol, result.monthlyPMI)}`
                            : ""}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Loan amount: {formatMoney(currencySymbol, result.loanAmount)} • Term:{" "}
                          {result.months} months
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
                        <div className="text-xs text-gray-600">Monthly total</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalMonthly)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Total interest (P&I)</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalInterest)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Total cost (incl. extras)</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalPayment)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Note: Taxes/insurance vary by location. This estimate helps compare scenarios.
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
