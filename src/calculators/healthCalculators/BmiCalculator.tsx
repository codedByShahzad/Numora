"use client";

import React, { useMemo, useState } from "react";
import {
  Heart,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "ft-in";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const format1 = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 });

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
  if (bmi < 25) return { label: "Normal weight", color: "text-emerald-600" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-600" };
  return { label: "Obese", color: "text-red-600" };
}

function bmiMarkerPercent(bmi: number) {
  // map BMI range [14..40] to [0..100] for a clean bar.
  const min = 14;
  const max = 40;
  const x = clamp(bmi, min, max);
  return ((x - min) / (max - min)) * 100;
}

export default function BMICalculator() {
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState<string>("");

  // for ft-in mode
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["BMI score", "Weight status", "kg/lb", "cm/ft-in"],
    []
  );

  const reset = () => {
    setWeight("");
    setWeightUnit("kg");
    setHeightUnit("cm");
    setHeightCm("");
    setHeightFt("");
    setHeightIn("");
    setError(null);
    setBmi(null);
    setCopied(false);
  };

  const onNumChange =
    (setter: (v: string) => void, { allowDecimal }: { allowDecimal: boolean }) =>
    (v: string) => {
      const re = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!re.test(v)) return;
      if (v.includes("-")) return;
      setter(v);
      setError(null);
      setBmi(null);
      setCopied(false);
    };

  const calculate = () => {
    setCopied(false);

    const wRaw = safeNum(weight);
    if (!Number.isFinite(wRaw) || wRaw <= 0) {
      setError("Please enter a valid weight (greater than 0).");
      setBmi(null);
      return;
    }

    let weightKg = wRaw;
    if (weightUnit === "lbs") weightKg = wRaw * 0.45359237;

    let heightM = 0;

    if (heightUnit === "cm") {
      const hRaw = safeNum(heightCm);
      if (!Number.isFinite(hRaw) || hRaw <= 0) {
        setError("Please enter a valid height in cm (greater than 0).");
        setBmi(null);
        return;
      }
      heightM = hRaw / 100;
    } else {
      const ftRaw = safeNum(heightFt);
      const inRaw = heightIn.trim() === "" ? 0 : safeNum(heightIn);

      if (!Number.isFinite(ftRaw) || ftRaw <= 0) {
        setError("Please enter a valid height in feet (greater than 0).");
        setBmi(null);
        return;
      }
      if (!Number.isFinite(inRaw) || inRaw < 0) {
        setError("Please enter a valid inches value (0 or more).");
        setBmi(null);
        return;
      }

      const totalIn = ftRaw * 12 + inRaw;
      if (totalIn <= 0) {
        setError("Height must be greater than 0.");
        setBmi(null);
        return;
      }
      heightM = totalIn * 0.0254;
    }

    const bmiValue = weightKg / (heightM * heightM);
    const rounded = Math.round(bmiValue * 10) / 10;

    setError(null);
    setBmi(rounded);
  };

  const copyResult = async () => {
    if (bmi == null) return;
    const cat = bmiCategory(bmi).label;
    const text = `BMI: ${format1(bmi)} • Category: ${cat}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const cat = bmi == null ? null : bmiCategory(bmi);
  const marker = bmi == null ? 0 : bmiMarkerPercent(bmi);

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
              <Heart className="h-4 w-4 text-[#125FF9]" />
              Health • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              BMI{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Check your Body Mass Index and weight category in seconds.
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
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Weight
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Choose kg or lb, then enter your weight.
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={weight}
                          onChange={(e) =>
                            onNumChange(setWeight, { allowDecimal: true })(
                              e.target.value
                            )
                          }
                          placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>

                      <div className="w-28 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm">
                        <select
                          value={weightUnit}
                          onChange={(e) => {
                            setWeightUnit(e.target.value as WeightUnit);
                            setError(null);
                            setBmi(null);
                            setCopied(false);
                          }}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Height
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Use cm or ft/in based on preference.
                    </p>

                    <div className="mt-3">
                      <div className="mb-3 w-full rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm">
                        <select
                          value={heightUnit}
                          onChange={(e) => {
                            setHeightUnit(e.target.value as HeightUnit);
                            setError(null);
                            setBmi(null);
                            setCopied(false);
                          }}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        >
                          <option value="cm">Centimeters (cm)</option>
                          <option value="ft-in">Feet / Inches (ft/in)</option>
                        </select>
                      </div>

                      {heightUnit === "cm" ? (
                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={heightCm}
                            onChange={(e) =>
                              onNumChange(setHeightCm, { allowDecimal: true })(
                                e.target.value
                              )
                            }
                            placeholder="e.g. 175"
                            className="w-full bg-transparent text-sm text-gray-900 outline-none"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={heightFt}
                              onChange={(e) =>
                                onNumChange(setHeightFt, { allowDecimal: false })(
                                  e.target.value
                                )
                              }
                              placeholder="Feet (e.g. 5)"
                              className="w-full bg-transparent text-sm text-gray-900 outline-none"
                            />
                          </div>
                          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={heightIn}
                              onChange={(e) =>
                                onNumChange(setHeightIn, { allowDecimal: false })(
                                  e.target.value
                                )
                              }
                              placeholder="Inches (e.g. 8)"
                              className="w-full bg-transparent text-sm text-gray-900 outline-none"
                            />
                          </div>
                        </div>
                      )}
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
                    Calculate BMI
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
                {bmi != null && cat && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          BMI:{" "}
                          <span className={cat.color}>{format1(bmi)}</span>
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Category:{" "}
                          <span className={`font-semibold ${cat.color}`}>
                            {cat.label}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={copyResult}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* BMI scale bar */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>14</span>
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                        <span>40+</span>
                      </div>

                      <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full border border-black/10 bg-white">
                        <div className="absolute inset-0 flex">
                          <div className="w-[17%] bg-blue-200" />
                          <div className="w-[25%] bg-emerald-200" />
                          <div className="w-[19%] bg-amber-200" />
                          <div className="flex-1 bg-red-200" />
                        </div>

                        <div
                          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-black/20 bg-white shadow-sm"
                          style={{ left: `calc(${marker}% - 10px)` }}
                          title={`BMI ${bmi}`}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-4">
                        <Legend label="Underweight" dot="bg-blue-400" />
                        <Legend label="Normal" dot="bg-emerald-500" />
                        <Legend label="Overweight" dot="bg-amber-500" />
                        <Legend label="Obese" dot="bg-red-500" />
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      BMI is a screening measure and doesn’t directly measure body fat. For health decisions, consult a professional.
                    </p>
                  </div>
                )}

                {/* Info (clean) */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    BMI categories (adults)
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                    <InfoRow label="Underweight" value="Less than 18.5" />
                    <InfoRow label="Normal weight" value="18.5 – 24.9" />
                    <InfoRow label="Overweight" value="25 – 29.9" />
                    <InfoRow label="Obese" value="30 or greater" />
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

function Legend({ label, dot }: { label: string; dot: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className="font-medium">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-2">
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
