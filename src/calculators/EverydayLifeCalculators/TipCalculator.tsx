"use client";

import React, { useMemo, useState } from "react";
import {
  Receipt,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Percent,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type TipResult = {
  bill: number;
  tipPercent: number;

  people: number;

  tipTotal: number;
  tipPerPerson: number;

  billPerPerson: number;

  taxPercent?: number;
  taxTotal?: number;
  taxPerPerson?: number;

  total: number;
  totalPerPerson: number;

  summary: string;
};

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

export default function TipCalculator() {
  const currencySymbol = "$";

  const [billAmount, setBillAmount] = useState<string>("");
  const [tipPercentage, setTipPercentage] = useState<string>("15");
  const [people, setPeople] = useState<string>("1");

  const [includeTax, setIncludeTax] = useState(false);
  const [taxPercent, setTaxPercent] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TipResult | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = useMemo(() => [10, 12, 15, 18, 20], []);

  const reset = () => {
    setBillAmount("");
    setTipPercentage("15");
    setPeople("1");
    setIncludeTax(false);
    setTaxPercent("");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  // ✅ prevent minus + allow typing
  const onBillChange = (v: string) => {
    if (!/^\d*\.?\d*$/.test(v)) return;
    if (v.includes("-")) return;
    setBillAmount(v);
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const onTipChange = (v: string) => {
    if (!/^\d*\.?\d*$/.test(v)) return;
    if (v.includes("-")) return;

    const n = v.trim() === "" ? NaN : Number(v);
    if (Number.isFinite(n)) {
      setTipPercentage(String(clamp(n, 0, 100)));
    } else {
      setTipPercentage(v);
    }

    setError(null);
    setResult(null);
    setCopied(false);
  };

  const onPeopleChange = (v: string) => {
    if (!/^\d*$/.test(v)) return;
    if (v.includes("-")) return;

    if (v === "") {
      setPeople("");
    } else {
      const n = Math.floor(Number(v));
      setPeople(String(clamp(n, 1, 9999)));
    }

    setError(null);
    setResult(null);
    setCopied(false);
  };

  const onTaxChange = (v: string) => {
    if (!/^\d*\.?\d*$/.test(v)) return;
    if (v.includes("-")) return;

    const n = v.trim() === "" ? NaN : Number(v);
    if (Number.isFinite(n)) {
      setTaxPercent(String(clamp(n, 0, 100)));
    } else {
      setTaxPercent(v);
    }

    setError(null);
    setResult(null);
    setCopied(false);
  };

  const calculate = () => {
    setCopied(false);

    const billRaw = safeNum(billAmount);
    const tipRaw = safeNum(tipPercentage);
    const peopleRaw = safeNum(people);

    if (!Number.isFinite(billRaw) || billRaw < 0) {
      setError("Please enter a valid bill amount (0 or more).");
      setResult(null);
      return;
    }

    if (!Number.isFinite(tipRaw)) {
      setError("Please enter a valid tip percentage (0–100).");
      setResult(null);
      return;
    }

    if (!Number.isFinite(peopleRaw)) {
      setError("Please enter a valid number of people (1 or more).");
      setResult(null);
      return;
    }

    const bill = clamp(billRaw, 0, Number.MAX_SAFE_INTEGER);
    const tipPercentNum = clamp(tipRaw, 0, 100);
    const peopleNum = clamp(Math.floor(peopleRaw), 1, 9999);

    // ✅ Tip total + tip per person (YOU WANTED THIS)
    const tipTotal = (bill * tipPercentNum) / 100;
    const tipPerPerson = tipTotal / peopleNum;

    // Bill per person
    const billPerPerson = bill / peopleNum;

    // Optional tax split too
    let taxP: number | undefined;
    let taxTotal: number | undefined;
    let taxPerPerson: number | undefined;

    if (includeTax) {
      const taxRaw = safeNum(taxPercent);
      if (!Number.isFinite(taxRaw)) {
        setError("Please enter a valid tax percentage (0–100).");
        setResult(null);
        return;
      }
      taxP = clamp(taxRaw, 0, 100);
      taxTotal = (bill * taxP) / 100;
      taxPerPerson = taxTotal / peopleNum;
    }

    const total = bill + tipTotal + (taxTotal ?? 0);
    const totalPerPerson = tipPerPerson + (taxPerPerson ?? 0);

    const summary = includeTax
      ? `Bill: ${formatMoney(currencySymbol, bill)} • Tip: ${tipPercentNum}% (${formatMoney(
          currencySymbol,
          tipTotal
        )}) • Tax: ${taxP}% (${formatMoney(currencySymbol, taxTotal!)})
         • Total: ${formatMoney(currencySymbol, total)} • People: ${peopleNum}
         • Per person: Bill ${formatMoney(currencySymbol, billPerPerson)} + Tip ${formatMoney(
          currencySymbol,
          tipPerPerson
        )} + Tax ${formatMoney(currencySymbol, taxPerPerson!)} = ${formatMoney(
          currencySymbol,
          totalPerPerson
        )}`
      : `Bill: ${formatMoney(currencySymbol, bill)} • Tip: ${tipPercentNum}% (${formatMoney(
          currencySymbol,
          tipTotal
        )}) • Total: ${formatMoney(currencySymbol, total)} • People: ${peopleNum}
         • Per person: Bill ${formatMoney(currencySymbol, billPerPerson)} + Tip ${formatMoney(
          currencySymbol,
          tipPerPerson
        )} = ${formatMoney(currencySymbol, totalPerPerson)}`;

    setError(null);
    setResult({
      bill,
      tipPercent: tipPercentNum,
      people: peopleNum,
      tipTotal,
      tipPerPerson,
      billPerPerson,
      taxPercent: taxP,
      taxTotal,
      taxPerPerson,
      total,
      totalPerPerson,
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

      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
               <Receipt className="h-4 w-4 text-[#125FF9]" />
              Everyday Life • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tip{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Calculates total tip, then splits tip and bill per person (clean split).
            </p>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Bill */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Bill amount
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Enter total bill before tip (and optionally tax).
                  </p>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <span className="text-sm font-semibold text-gray-700">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={billAmount}
                      onChange={(e) => onBillChange(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900">
                    Tip percentage
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Choose a preset or enter your own (0–100).
                  </p>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <Percent className="h-4 w-4 text-gray-500" />
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      value={tipPercentage}
                      onChange={(e) => onTipChange(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    />
                    <span className="text-sm font-semibold text-gray-700">%</span>
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setTipPercentage(String(p));
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className={[
                          "rounded-xl border border-black/10 bg-white px-2 py-2 text-xs font-semibold shadow-sm hover:bg-gray-50 transition",
                          Number(tipPercentage) === p
                            ? "ring-2 ring-[#125FF9]/30"
                            : "",
                        ].join(" ")}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* People */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900">
                    Split between
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Number of people (minimum 1).
                  </p>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <Users className="h-4 w-4 text-gray-500" />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={people}
                      onChange={(e) => onPeopleChange(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    />
                    <span className="text-xs text-gray-500">people</span>
                  </div>
                </div>

                {/* Optional tax */}
                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Include tax (optional)
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Tax is also split per person.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIncludeTax((v) => !v);
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      className={[
                        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
                        includeTax
                          ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] border-transparent"
                          : "bg-gray-100 border-black/10",
                      ].join(" ")}
                      aria-label="Toggle include tax"
                    >
                      <span
                        className={[
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
                          includeTax ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>

                  {includeTax && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-900">
                        Tax percentage
                      </label>
                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={100}
                          value={taxPercent}
                          onChange={(e) => onTaxChange(e.target.value)}
                          placeholder="e.g. 8.25"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          %
                        </span>
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
                          Tip total: {formatMoney(currencySymbol, result.tipTotal)} {" "} • {" "}Total:{" "}
                          {formatMoney(currencySymbol, result.total)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Per person:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatMoney(currencySymbol, result.totalPerPerson)}
                          </span>{" "}
                          (Tip{" "}
                          {formatMoney(currencySymbol, result.tipTotal)}
                          {includeTax && result.taxPerPerson != null
                            ? ` + Tax ${formatMoney(currencySymbol, result.taxPerPerson)}`
                            : ""}
                          )
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          if (!result) return;
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

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Bill/person</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.billPerPerson)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Tip/person</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.tipPerPerson)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Total/person</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(currencySymbol, result.totalPerPerson)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: Common restaurant tips are 12%–20% depending on service.
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
