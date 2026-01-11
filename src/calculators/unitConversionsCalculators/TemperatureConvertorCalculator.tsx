"use client";

import React, { useMemo, useState } from "react";
import {
  Thermometer,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const temperatureUnits = {
  c: { label: "Celsius (°C)" },
  f: { label: "Fahrenheit (°F)" },
  k: { label: "Kelvin (K)" },
} as const;

type UnitKey = keyof typeof temperatureUnits;

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const formatNumber = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 1e8) / 1e8;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

const convertTemperature = (val: number, from: UnitKey, to: UnitKey): number => {
  if (from === to) return val;

  // Convert to Celsius first
  let celsius: number;
  if (from === "c") celsius = val;
  else if (from === "f") celsius = (val - 32) * (5 / 9);
  else celsius = val - 273.15;

  // Convert from Celsius
  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
};

export default function TemperatureConverterPage() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<UnitKey>("c");
  const [toUnit, setToUnit] = useState<UnitKey>("f");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Celsius", "Fahrenheit", "Kelvin", "Instant convert"],
    []
  );

  const onValueChange = (v: string) => {
    const re = /^-?\d*\.?\d*$/;
    if (!re.test(v)) return;
    setValue(v);
    setError(null);
    setResult("");
    setCopied(false);
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
    setFromUnit("c");
    setToUnit("f");
    setError(null);
    setResult("");
    setCopied(false);
  };

  const compute = () => {
    setCopied(false);

    const n = safeNum(value);
    if (!Number.isFinite(n)) {
      setError("Please enter a valid temperature.");
      setResult("");
      return;
    }

    // Physical constraints
    if (fromUnit === "k" && n < 0) {
      setError("Kelvin cannot be negative.");
      setResult("");
      return;
    }

    const converted = convertTemperature(n, fromUnit, toUnit);

    if (toUnit === "k" && converted < 0) {
      setError("Resulting temperature is below absolute zero.");
      setResult("");
      return;
    }

    setError(null);
    setResult(
      `Convert Temperature\n` +
        `From: ${formatNumber(n)} ${temperatureUnits[fromUnit].label}\n` +
        `To: ${formatNumber(converted)} ${temperatureUnits[toUnit].label}`
    );
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
                <Thermometer className="h-4 w-4 text-[#125FF9]" />
              Unit Conversions • Calculator
              </HoverBorderGradient>
            </div>


            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Temperature{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert between Celsius, Fahrenheit, and Kelvin with physical accuracy.
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
                      Negative values allowed (except Kelvin).
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        placeholder="e.g. -40"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  {/* Swap */}
                  <div className="rounded-3xl border border-black/10 bg-white/60 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quick preview
                      </p>

                      <button
                        onClick={swap}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        Swap
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From</span>
                        <span className="font-semibold">
                          {temperatureUnits[fromUnit].label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To</span>
                        <span className="font-semibold">
                          {temperatureUnits[toUnit].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* From */}
                  <UnitSelect label="From" value={fromUnit} onChange={setFromUnit} />

                  {/* To */}
                  <UnitSelect label="To" value={toUnit} onChange={setToUnit} />
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={compute}
                    disabled={!canConvert}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9] shadow-sm hover:shadow-md hover:brightness-105 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Convert
                  </button>

                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold border border-black/10 bg-white hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Result */}
                {result && (
  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      {/* Result Text */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Result
        </p>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
          {result}
        </pre>
      </div>

      {/* Copy Button */}
      <button
        onClick={copyResult}
        className="
          inline-flex items-center gap-2
          rounded-full px-4 py-2 text-sm font-semibold
          border border-black/10 bg-white
          shadow-sm hover:bg-gray-50 transition
          self-start
        "
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  </div>
)}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnitSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: UnitKey;
  onChange: (v: UnitKey) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as UnitKey)}
          className="w-full bg-transparent outline-none text-sm"
        >
          {Object.entries(temperatureUnits).map(([key, unit]) => (
            <option key={key} value={key}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
