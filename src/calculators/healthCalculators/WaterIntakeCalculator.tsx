"use client";

import React, { useMemo, useState } from "react";
import {
  Droplets,
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

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(""); // minutes/day
  const [unit, setUnit] = useState<WeightUnit>("kg");

  const [result, setResult] = useState<{
    liters: number;
    glasses: number;
    bottles: number;
    baseLiters: number;
    extraLiters: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Weight-based", "Activity adjusted", "Liters/day", "Easy to follow"],
    []
  );

  const onNumChange =
    (setter: (v: string) => void, allowDecimal: boolean) => (v: string) => {
      const re = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!re.test(v)) return;
      if (v.includes("-")) return;
      setter(v);
      setError(null);
      setResult(null);
      setCopied(false);
    };

  const reset = () => {
    setWeight("");
    setActivity("");
    setUnit("kg");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const calculate = () => {
    setCopied(false);

    let w = safeNum(weight);
    const a = activity.trim() === "" ? 0 : safeNum(activity);

    if (!Number.isFinite(w) || w <= 0) {
      setError("Please enter a valid weight (greater than 0).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(a) || a < 0) {
      setError("Please enter a valid activity time (0 or more).");
      setResult(null);
      return;
    }

    // lbs → kg
    if (unit === "lbs") w *= 0.45359237;

    // clamp for sanity
    const W = clamp(w, 30, 200);
    const A = clamp(a, 0, 600); // 0–10 hours/day

    // Base intake: 33 ml per kg => 0.033 L/kg
    const baseLiters = W * 0.033;

    // Extra: +0.35 L per 30 min activity
    const extraLiters = (A / 30) * 0.35;

    const liters = +(baseLiters + extraLiters).toFixed(2);

    const glasses = Math.ceil((liters * 1000) / 250); // 250ml glass
    const bottles = Math.ceil((liters * 1000) / 500); // 500ml bottle

    setError(null);
    setResult({
      liters,
      glasses,
      bottles,
      baseLiters: +baseLiters.toFixed(2),
      extraLiters: +extraLiters.toFixed(2),
    });
  };

  const copyResult = async () => {
    if (!result) return;
    const text =
      `Recommended water intake: ${result.liters} L/day • ` +
      `${result.glasses} glasses (250ml) • ${result.bottles} bottles (500ml)`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canCalculate = weight.trim() !== "";

  // visual bar: show relative to 2–5L range (common)
  const barPercent = result
    ? Math.min(((result.liters - 1.5) / (5.0 - 1.5)) * 100, 100)
    : 0;

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
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
             
            </span>

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                <Droplets className="h-4 w-4 text-[#125FF9]" />
              Health • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Water Intake{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Estimate daily water intake based on your weight and activity.
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

          {/* Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Inputs */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Weight
                    </label>
                    <p className="mt-1 text-xs text-gray-600">Choose kg or lbs.</p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          value={weight}
                          onChange={(e) => onNumChange(setWeight, true)(e.target.value)}
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
                            setResult(null);
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

                  {/* Activity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Activity (minutes/day)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Optional — enter 0 if none.
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        value={activity}
                        onChange={(e) => onNumChange(setActivity, false)(e.target.value)}
                        placeholder="e.g. 60"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        inputMode="numeric"
                      />
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
                    Calculate intake
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
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Recommended:{" "}
                          <span className="text-emerald-700">{result.liters}</span>{" "}
                          L/day
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          ≈ {result.glasses} glasses (250ml) • {result.bottles} bottles (500ml)
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
                          className="h-full rounded-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]"
                          style={{ width: `${clamp(barPercent, 0, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Low</span>
                        <span>Typical</span>
                        <span>High</span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <MiniCard
                        label="Base (weight)"
                        value={`${result.baseLiters} L/day`}
                        hint="33 ml per kg"
                      />
                      <MiniCard
                        label="Extra (activity)"
                        value={`${result.extraLiters} L/day`}
                        hint="+0.35L per 30 min"
                      />
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      This is an estimate. Weather, sweat, and diet can affect your hydration needs.
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    How water intake is calculated
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    A common guideline is around <span className="font-semibold text-gray-900">33 ml per kg</span> of body
                    weight, plus extra water for physical activity.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="Base: 0.033L per kg" />
                    <Bullet text="Activity: +0.35L / 30 min" />
                    <Bullet text="Drink steadily through the day" />
                    <Bullet text="Increase during heat/exercise" />
                  </div>
                </div>
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

function MiniCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{hint}</div>
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
