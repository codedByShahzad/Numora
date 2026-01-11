"use client";

import React, { useMemo, useState } from "react";
import {
  Beaker,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
  ArrowLeftRight,
  ChevronDown,
} from "lucide-react";

const volumeUnits = {
  ml: { label: "Milliliters", factor: 0.001, short: "mL" },
  l: { label: "Liters", factor: 1, short: "L" },
  cu_m: { label: "Cubic Meters", factor: 1000, short: "m³" },
  cu_cm: { label: "Cubic Centimeters", factor: 0.001, short: "cm³" },
  cu_mm: { label: "Cubic Millimeters", factor: 0.000001, short: "mm³" },
  cu_in: { label: "Cubic Inches", factor: 0.0163871, short: "in³" },
  cu_ft: { label: "Cubic Feet", factor: 28.3168, short: "ft³" },
  cu_yd: { label: "Cubic Yards", factor: 764.555, short: "yd³" },
  gal: { label: "US Gallons", factor: 3.78541, short: "gal" },
  qt: { label: "US Quarts", factor: 0.946353, short: "qt" },
  pt: { label: "US Pints", factor: 0.473176, short: "pt" },
  cup: { label: "US Cups", factor: 0.24, short: "cup" },
  tbsp: { label: "Tablespoons", factor: 0.0147868, short: "tbsp" },
  tsp: { label: "Teaspoons", factor: 0.00492892, short: "tsp" },
} as const;

type VolumeUnitKey = keyof typeof volumeUnits;

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 1e10) / 1e10;
  const s = rounded.toString();
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
};

export default function VolumeConverterPage() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<VolumeUnitKey>("l");
  const [toUnit, setToUnit] = useState<VolumeUnitKey>("ml");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    fromValue: number;
    toValue: number;
    from: VolumeUnitKey;
    to: VolumeUnitKey;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Liters ↔ Milliliters", "Cubic units", "Kitchen measures", "Fast convert"],
    []
  );

  const onNumChange = (v: string) => {
    const re = /^\d*\.?\d*$/; // decimals allowed, no negatives
    if (!re.test(v)) return;
    setValue(v);
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const reset = () => {
    setValue("");
    setFromUnit("l");
    setToUnit("ml");
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

    const liters = v * volumeUnits[fromUnit].factor;
    const converted = liters / volumeUnits[toUnit].factor;

    setError(null);
    setResult({ fromValue: v, toValue: converted, from: fromUnit, to: toUnit });
  };

  const copyResult = async () => {
    if (!result) return;

    const text = `${fmt(result.fromValue)} ${volumeUnits[result.from].label} (${volumeUnits[result.from].short}) = ${fmt(
      result.toValue
    )} ${volumeUnits[result.to].label} (${volumeUnits[result.to].short})`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canConvert = value.trim() !== "";

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
              <Beaker className="h-4 w-4 text-[#125FF9]" />
              Unit Conversions • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Volume{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert liters, milliliters, gallons, cubic units, and kitchen measures in one click.
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
                {/* Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900">Enter value</label>
                  <p className="mt-1 text-xs text-gray-600">
                    Decimals supported (e.g. 2.5). No negative values.
                  </p>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => onNumChange(e.target.value)}
                      placeholder="e.g. 1.5"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* From/To + Swap (inline like SaaS tools) */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">From</label>
                    <p className="mt-1 text-xs text-gray-600">Input unit.</p>

                    <div className="mt-3 relative rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <select
                        value={fromUnit}
                        onChange={(e) => {
                          setFromUnit(e.target.value as VolumeUnitKey);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full appearance-none bg-transparent pr-8 text-sm text-gray-900 outline-none"
                      >
                        {Object.entries(volumeUnits).map(([key, unit]) => (
                          <option key={key} value={key}>
                            {unit.label} ({unit.short})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900">To</label>
                        <p className="mt-1 text-xs text-gray-600">Output unit.</p>
                      </div>

                      {/* Swap as small button near selectors (clean + consistent) */}
                      <button
                        type="button"
                        onClick={swapUnits}
                        className="
                          inline-flex items-center gap-2
                          rounded-full border border-black/10 bg-white px-3 py-2
                          text-xs font-semibold text-gray-900
                          shadow-sm hover:bg-gray-50 transition
                        "
                        title="Swap units"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        Swap
                      </button>
                    </div>

                    <div className="mt-3 relative rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <select
                        value={toUnit}
                        onChange={(e) => {
                          setToUnit(e.target.value as VolumeUnitKey);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full appearance-none bg-transparent pr-8 text-sm text-gray-900 outline-none"
                      >
                        {Object.entries(volumeUnits).map(([key, unit]) => (
                          <option key={key} value={key}>
                            {unit.label} ({unit.short})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Actions (Convert + Reset SAME ROW like Physics) */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={convert}
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
                    type="button"
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>

                        <p className="mt-2 text-sm text-gray-900">
                          <span className="font-semibold">{fmt(result.fromValue)}</span>{" "}
                          {volumeUnits[result.from].label}{" "}
                          <span className="text-gray-500">({volumeUnits[result.from].short})</span>{" "}
                          ={" "}
                          <span className="font-semibold text-emerald-700">
                            {fmt(result.toValue)}
                          </span>{" "}
                          {volumeUnits[result.to].label}{" "}
                          <span className="text-gray-500">({volumeUnits[result.to].short})</span>
                        </p>

                        <p className="mt-2 text-xs text-gray-600">
                          Calculated via a common base unit (liters) for accuracy.
                        </p>
                      </div>

                      {/* Copy on RIGHT (like your request) */}
                      <button
                        onClick={copyResult}
                        className="
                          inline-flex items-center justify-center gap-2
                          rounded-full px-4 py-2 text-sm font-semibold
                          border border-black/10 bg-white
                          shadow-sm hover:bg-gray-50 transition
                          self-start
                        "
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: Swap units to reverse the conversion instantly.
                    </p>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">Quick tips</h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="1 L = 1,000 mL" />
                    <Bullet text="1 gal ≈ 3.785 L" />
                    <Bullet text="1 m³ = 1,000 L" />
                    <Bullet text="Kitchen units included" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numora converters are designed to be simple, fast, and clear.
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
