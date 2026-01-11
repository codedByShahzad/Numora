"use client";

import React, { useMemo, useState } from "react";
import {
  Scale,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
  ArrowLeftRight,
  ChevronDown,
} from "lucide-react";

const weightUnits = {
  kg: { label: "Kilograms", factor: 1, short: "kg" },
  g: { label: "Grams", factor: 0.001, short: "g" },
  mg: { label: "Milligrams", factor: 0.000001, short: "mg" },
  lb: { label: "Pounds", factor: 0.453592, short: "lb" },
  oz: { label: "Ounces", factor: 0.0283495, short: "oz" },
  ton: { label: "Tons", factor: 1000, short: "t" },
} as const;

type UnitKey = keyof typeof weightUnits;

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n * 1e12) / 1e12;
  const s = r.toString();
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};

export default function WeightConverterPage() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<UnitKey>("kg");
  const [toUnit, setToUnit] = useState<UnitKey>("lb");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    fromValue: number;
    toValue: number;
    from: UnitKey;
    to: UnitKey;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Metric ↔ Imperial", "Accurate conversion", "Quick results", "Copy result"],
    []
  );

  const onChangeValue = (v: string) => {
    const re = /^\d*\.?\d*$/; // no negatives
    if (!re.test(v)) return;
    setValue(v);
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
    setCopied(false);
    setError(null);
  };

  const reset = () => {
    setValue("");
    setFromUnit("kg");
    setToUnit("lb");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const convert = () => {
    setCopied(false);

    const v = safeNum(value);
    if (!Number.isFinite(v)) {
      setError("Please enter a valid number.");
      setResult(null);
      return;
    }
    if (v < 0) {
      setError("Value cannot be negative.");
      setResult(null);
      return;
    }

    const baseKg = v * weightUnits[fromUnit].factor;
    const converted = baseKg / weightUnits[toUnit].factor;

    setError(null);
    setResult({ fromValue: v, toValue: converted, from: fromUnit, to: toUnit });
  };

  const copyResult = async () => {
    if (!result) return;

    const text =
      `${fmt(result.fromValue)} ${weightUnits[result.from].label} (${weightUnits[result.from].short}) = ` +
      `${fmt(result.toValue)} ${weightUnits[result.to].label} (${weightUnits[result.to].short})`;

    try {
      await navigator.clipboard.writeText(text);
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
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
              <Scale className="h-4 w-4 text-[#125FF9]" />
              Unit Conversions • Converter
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Weight{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert between kilograms, grams, pounds, ounces, and more — instantly.
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
                {/* Input */}
                <label className="block text-sm font-semibold text-gray-900">
                  Enter value
                </label>
                <p className="mt-1 text-xs text-gray-600">
                  Decimals supported. Negative values are not allowed.
                </p>

                <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                  <input
                    value={value}
                    onChange={(e) => onChangeValue(e.target.value)}
                    placeholder="e.g. 70"
                    inputMode="decimal"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none"
                  />
                </div>

                {/* Unit pickers */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <UnitSelect
                    label="From"
                    value={fromUnit}
                    onChange={(v) => {
                      setFromUnit(v);
                      setResult(null);
                      setError(null);
                      setCopied(false);
                    }}
                    alignPlaceholder // ✅ keeps header row same height
                  />

                  <UnitSelect
                    label="To"
                    value={toUnit}
                    onChange={(v) => {
                      setToUnit(v);
                      setResult(null);
                      setError(null);
                      setCopied(false);
                    }}
                    alignPlaceholder
                    extra={
                      <button
                        type="button"
                        onClick={swapUnits}
                        className="
                          inline-flex items-center gap-2
                          rounded-full px-3 py-1.5 text-xs font-semibold
                          border border-black/10 bg-white
                          shadow-sm hover:bg-gray-50 transition
                        "
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        Swap
                      </button>
                    }
                  />
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={convert}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Convert
                  </button>

                  <button
                    onClick={reset}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-gray-900 border border-black/10 bg-white
                      shadow-sm hover:bg-gray-50 transition
                    "
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

                        <p className="mt-2 text-sm text-gray-900">
                          <span className="font-semibold">
                            {fmt(result.fromValue)}
                          </span>{" "}
                          {weightUnits[result.from].short}{" "}
                          <span className="text-gray-500">=</span>{" "}
                          <span className="font-semibold text-emerald-700">
                            {fmt(result.toValue)}
                          </span>{" "}
                          {weightUnits[result.to].short}
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          {weightUnits[result.from].label} → {weightUnits[result.to].label}
                        </p>
                      </div>

                      <button
                        onClick={copyResult}
                        className="
                          inline-flex items-center justify-center gap-2
                          rounded-full px-4 py-2 text-sm font-semibold
                          border border-black/10 bg-white
                          shadow-sm hover:bg-gray-50 transition
                        "
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">Quick tips</h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Tip text="1 kg ≈ 2.20462 lb" />
                    <Tip text="1 lb = 16 oz" />
                    <Tip text="1 ton = 1000 kg" />
                    <Tip text="Use g / mg for small weights" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numora converters are designed to be simple, fast, and accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Components --------------------- */

function UnitSelect({
  label,
  value,
  onChange,
  extra,
  alignPlaceholder,
}: {
  label: string;
  value: UnitKey;
  onChange: (v: UnitKey) => void;
  extra?: React.ReactNode;
  alignPlaceholder?: boolean;
}) {
  return (
    <div>
      {/* ✅ lock header row height so both columns align */}
      <div className="flex items-end justify-between min-h-[34px]">
        <label className="block text-sm font-semibold text-gray-900">{label}</label>

        {/* ✅ placeholder keeps From column same height even without extra */}
        {extra ? (
          extra
        ) : alignPlaceholder ? (
          <span className="invisible inline-flex items-center rounded-full px-3 py-1.5 text-xs">
            placeholder
          </span>
        ) : null}
      </div>

      {/* ✅ consistent select height */}
      <div className="mt-2 relative h-[52px] rounded-2xl border border-black/10 bg-white px-4 shadow-sm flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as UnitKey)}
          className="w-full appearance-none bg-transparent pr-10 text-sm text-gray-900 outline-none"
        >
          {Object.entries(weightUnits).map(([key, unit]) => (
            <option key={key} value={key}>
              {unit.label} ({unit.short})
            </option>
          ))}
        </select>

        {/* ✅ perfectly centered chevron */}
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[#125FF9]" />
      <span>{text}</span>
    </div>
  );
}
