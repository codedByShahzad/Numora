"use client";

import React, { useMemo, useState } from "react";
import {
  Footprints,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type WeightUnit = "kg" | "lbs";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export default function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");

  const [calories, setCalories] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Daily steps", "Weight-based", "Quick estimate", "Calories burned"],
    []
  );

  // ✅ only allow numbers (and decimals where needed)
  const onNumChange =
    (setter: (v: string) => void, allowDecimal: boolean) => (v: string) => {
      const re = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!re.test(v)) return;
      if (v.includes("-")) return;
      setter(v);
      setError(null);
      setCalories(null);
      setCopied(false);
    };

  const reset = () => {
    setSteps("");
    setWeight("");
    setUnit("kg");
    setCalories(null);
    setError(null);
    setCopied(false);
  };

  const calculate = () => {
    setCopied(false);

    const s = safeNum(steps);
    let w = safeNum(weight);

    if (!Number.isFinite(s) || s <= 0) {
      setError("Please enter a valid number of steps (greater than 0).");
      setCalories(null);
      return;
    }

    if (!Number.isFinite(w) || w <= 0) {
      setError("Please enter a valid weight (greater than 0).");
      setCalories(null);
      return;
    }

    // convert lbs → kg
    if (unit === "lbs") w *= 0.45359237;

    // clamp (avoid unrealistic extremes)
    const S = clamp(s, 100, 200000);
    const W = clamp(w, 30, 200);

    // ✅ Formula: calories ≈ steps × (0.57 × weightKg) / 1000
    const result = (S * (0.57 * W)) / 1000;

    setCalories(Math.round(result));
    setError(null);
  };

  const copyResult = async () => {
    if (calories == null) return;
    const text = `${calories} kcal burned from ${steps} steps (weight: ${weight} ${unit})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canCalculate = steps.trim() !== "" && weight.trim() !== "";

  // visual bar: compare to strong walking day (~800 kcal)
  const barPercent =
    calories == null ? 0 : Math.min((calories / 800) * 100, 100);

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
               <Footprints className="h-4 w-4 text-[#125FF9]" />
              Health • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Steps to{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calories
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Estimate calories burned from your step count using a weight-based model.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
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
                  <Input
                    label="Steps"
                    hint="Your daily step count"
                    value={steps}
                    onChange={(v) => onNumChange(setSteps, false)(v)}
                    placeholder="e.g. 10000"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Weight
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Choose kg or lbs.</p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          value={weight}
                          onChange={(e) =>
                            onNumChange(setWeight, true)(e.target.value)
                          }
                          placeholder={`e.g. ${unit === "kg" ? "70" : "154"}`}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                          inputMode="decimal"
                        />
                      </div>

                      <div className="relative w-24 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm">
                        <select
                          value={unit}
                          onChange={(e) => {
                            setUnit(e.target.value as WeightUnit);
                            setError(null);
                            setCalories(null);
                            setCopied(false);
                          }}
                          className="w-full appearance-none bg-transparent text-sm text-gray-900 outline-none pr-6"
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculate}
                    disabled={!canCalculate}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate calories
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
                {calories !== null && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Calories burned:{" "}
                          <span className="text-emerald-700">{calories}</span>{" "}
                          kcal
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          From{" "}
                          <span className="font-semibold text-gray-900">
                            {steps}
                          </span>{" "}
                          steps • Weight{" "}
                          <span className="font-semibold text-gray-900">
                            {weight} {unit}
                          </span>
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

                    {/* Visual bar */}
                    <div className="mt-5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Visual estimate relative to a strong walking day (~800 kcal)
                      </p>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      This is an estimate. Calories burned depend on pace, terrain, stride length, and fitness level.
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    How this estimate works
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    A common approximation links steps to energy burn using body
                    weight. This calculator uses a weight-based factor to provide a
                    quick estimate for daily walking.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="More steps = more calories" />
                    <Bullet text="Higher weight burns more" />
                    <Bullet text="Fast pace increases burn" />
                    <Bullet text="Use for daily tracking" />
                  </div>
                </div>
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

function Input({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      <p className="mt-1 text-xs text-gray-600">{hint}</p>

      <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)} // ✅ FIXED
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 outline-none"
          inputMode="numeric"
        />
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
