"use client";

import React, { useMemo, useState } from "react";
import {
  Gauge,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";

const speedUnits = {
  mps: { label: "Meters/second" },
  kph: { label: "Kilometers/hour" },
  mph: { label: "Miles/hour" },
  kn: { label: "Knots" },
} as const;

type UnitKey = keyof typeof speedUnits;

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const formatNumber = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 10 });
};

const convertSpeed = (val: number, from: UnitKey, to: UnitKey): number => {
  if (from === to) return val;

  // Convert input -> meters/second
  let mps: number;
  switch (from) {
    case "mps":
      mps = val;
      break;
    case "kph":
      mps = val / 3.6;
      break;
    case "mph":
      mps = val * 0.44704;
      break;
    case "kn":
      mps = val * 0.514444;
      break;
    default:
      mps = val;
  }

  // Convert meters/second -> target
  switch (to) {
    case "mps":
      return mps;
    case "kph":
      return mps * 3.6;
    case "mph":
      return mps / 0.44704;
    case "kn":
      return mps / 0.514444;
    default:
      return val;
  }
};

export default function SpeedConverterPage() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<UnitKey>("mps");
  const [toUnit, setToUnit] = useState<UnitKey>("kph");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["m/s", "km/h", "mph", "knots", "Instant convert"],
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

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setError(null);
    setResult("");
    setCopied(false);
  };

  const reset = () => {
    setValue("");
    setFromUnit("mps");
    setToUnit("kph");
    setError(null);
    setResult("");
    setCopied(false);
  };

  const compute = () => {
    setCopied(false);

    const n = safeNum(value);
    if (!Number.isFinite(n)) {
      setError("Please enter a valid speed value.");
      setResult("");
      return;
    }
    if (n < 0) {
      setError("Speed cannot be negative.");
      setResult("");
      return;
    }

    const converted = convertSpeed(n, fromUnit, toUnit);

    setError(null);
    setResult(
      `Convert Speed\n` +
        `From: ${formatNumber(n)} ${speedUnits[fromUnit].label}\n` +
        `To: ${formatNumber(converted)} ${speedUnits[toUnit].label}`
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

      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
              <Gauge className="h-4 w-4 text-[#125FF9]" />
              Unit Conversions • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Speed{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert between m/s, km/h, mph, and knots — clean formatting and reliable conversions.
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
                      Enter the speed you want to convert (no negatives).
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        placeholder="e.g. 27.5"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  {/* Swap + preview */}
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
                          {speedUnits[fromUnit].label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">To</span>
                        <span className="font-semibold text-gray-900">
                          {speedUnits[toUnit].label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-3 text-xs text-gray-600">
                      Tip: Swap reverses the conversion instantly.
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
                          setFromUnit(e.target.value as UnitKey);
                          setError(null);
                          setResult("");
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {Object.entries(speedUnits).map(([key, unit]) => (
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
                          setToUnit(e.target.value as UnitKey);
                          setError(null);
                          setResult("");
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {Object.entries(speedUnits).map(([key, unit]) => (
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
                      Conversions are based on meters/second (m/s) as the base unit.
                    </p>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick tips
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="1 m/s = 3.6 km/h" />
                    <Bullet text="1 mph ≈ 0.44704 m/s" />
                    <Bullet text="1 knot ≈ 0.514444 m/s" />
                    <Bullet text="Swap reverses instantly" />
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
