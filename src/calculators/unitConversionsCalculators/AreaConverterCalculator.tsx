"use client";

import React, { useMemo, useState } from "react";
import {
  Scale,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const areaUnits = {
  sqm: { label: "Square Meters", factor: 1 },
  sqkm: { label: "Square Kilometers", factor: 1_000_000 },
  sqcm: { label: "Square Centimeters", factor: 0.0001 },
  sqmm: { label: "Square Millimeters", factor: 0.000001 },
  ha: { label: "Hectares", factor: 10_000 },
  acre: { label: "Acres", factor: 4046.86 },
  sqmi: { label: "Square Miles", factor: 2_589_988.11 },
  sqyd: { label: "Square Yards", factor: 0.836127 },
  sqft: { label: "Square Feet", factor: 0.092903 },
  sqin: { label: "Square Inches", factor: 0.00064516 },
} as const;

type AreaUnitKey = keyof typeof areaUnits;

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const formatNumber = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  // clean but precise
  if (Math.abs(n) >= 1_000_000) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
  // small values
  return n.toLocaleString(undefined, { maximumFractionDigits: 10 });
};

export default function AreaConverterPage() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<AreaUnitKey>("sqm");
  const [toUnit, setToUnit] = useState<AreaUnitKey>("sqft");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Square meters", "Acres", "Square feet", "Hectares", "Instant convert"],
    []
  );

  const onValueChange = (v: string) => {
    // prevent negative + allow decimals
    const re = /^\d*\.?\d*$/;
    if (!re.test(v)) return;
    setValue(v);
    setError(null);
    setResult("");
    setCopied(false);
  };

  const compute = () => {
    setCopied(false);
    const n = safeNum(value);

    if (!Number.isFinite(n)) {
      setError("Please enter a valid area value.");
      setResult("");
      return;
    }
    if (n < 0) {
      setError("Area cannot be negative.");
      setResult("");
      return;
    }

    const sqMeters = n * areaUnits[fromUnit].factor;
    const converted = sqMeters / areaUnits[toUnit].factor;

    setError(null);
    setResult(
      `Convert Area\n` +
        `From: ${formatNumber(n)} ${areaUnits[fromUnit].label}\n` +
        `To: ${formatNumber(converted)} ${areaUnits[toUnit].label}`
    );
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setError(null);
    setResult("");
    setCopied(false);
  };

  const reset = () => {
    setValue("");
    setFromUnit("sqm");
    setToUnit("sqft");
    setError(null);
    setResult("");
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canConvert = value.trim() !== "";

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* SaaS background (same system as Physics) */}
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
                 <Scale className="h-4 w-4 text-[#125FF9]" />
              Unit Conversions • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Area{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert between square meters, acres, square feet, hectares, and more — with clean formatting.
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
                {/* Inputs */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Value
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Enter the area you want to convert (no negatives).
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        placeholder="e.g. 120"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  {/* Swap + quick preview */}
                  <div className="rounded-3xl border border-black/10 bg-white/60 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quick preview
                      </p>

                      <button
                        type="button"
                        onClick={swap}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        Swap
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">From</span>
                        <span className="font-semibold text-gray-900">
                          {areaUnits[fromUnit].label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">To</span>
                        <span className="font-semibold text-gray-900">
                          {areaUnits[toUnit].label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-3 text-xs text-gray-600">
                      Tip: Use Swap to reverse conversion quickly.
                    </p>
                  </div>

                  {/* From */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      From
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Select input unit.
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <select
                        value={fromUnit}
                        onChange={(e) => {
                          setFromUnit(e.target.value as AreaUnitKey);
                          setError(null);
                          setResult("");
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {Object.entries(areaUnits).map(([key, unit]) => (
                          <option key={key} value={key}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* To */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      To
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Select output unit.
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <select
                        value={toUnit}
                        onChange={(e) => {
                          setToUnit(e.target.value as AreaUnitKey);
                          setError(null);
                          setResult("");
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {Object.entries(areaUnits).map(([key, unit]) => (
                          <option key={key} value={key}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={compute}
                    disabled={!canConvert}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                      disabled:opacity-50 disabled:cursor-not-allowed
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
                        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                          {result}
                        </pre>
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

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Conversions are based on square meters (m²) as the base unit.
                    </p>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick tips
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="1 hectare = 10,000 m²" />
                    <Bullet text="1 acre ≈ 4,046.86 m²" />
                    <Bullet text="1 sq ft ≈ 0.092903 m²" />
                    <Bullet text="Use Swap to reverse instantly" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numora converters are designed to be simple, fast, and easy to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[#125FF9]" />
      <span>{text}</span>
    </div>
  );
}
