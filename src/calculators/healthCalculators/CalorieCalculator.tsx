"use client";

import React, { useMemo, useState } from "react";
import {
  Flame,
  ChevronDown,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Gender = "male" | "female";
type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "ft-in";

type ActivityKey = "1.2" | "1.375" | "1.55" | "1.725" | "1.9";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const formatInt = (n: number) => Math.round(n).toLocaleString();

export default function CalorieCalculator() {
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");

  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityKey>("1.2");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    bmr: number;
    tdee: number;
    cut: number;
    mildCut: number;
    bulk: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["BMR", "TDEE", "Cut / Maintain / Bulk", "Mifflin–St Jeor"],
    []
  );

  const activityMeta: Record<
    ActivityKey,
    { label: string; detail: string; factor: number }
  > = useMemo(
    () => ({
      "1.2": {
        label: "Sedentary",
        detail: "Little or no exercise",
        factor: 1.2,
      },
      "1.375": {
        label: "Lightly active",
        detail: "Light exercise 1–3 days/week",
        factor: 1.375,
      },
      "1.55": {
        label: "Moderately active",
        detail: "Moderate exercise 3–5 days/week",
        factor: 1.55,
      },
      "1.725": {
        label: "Very active",
        detail: "Hard exercise 6–7 days/week",
        factor: 1.725,
      },
      "1.9": {
        label: "Super active",
        detail: "Very hard exercise / physical job",
        factor: 1.9,
      },
    }),
    []
  );

  const onNumChange =
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

  const reset = () => {
    setWeight("");
    setWeightUnit("kg");

    setHeightUnit("cm");
    setHeightCm("");
    setHeightFt("");
    setHeightIn("");

    setAge("");
    setGender("male");
    setActivity("1.2");

    setError(null);
    setResult(null);
    setCopied(false);
  };

  const getHeightInCm = () => {
    if (heightUnit === "cm") return safeNum(heightCm);
    const ft = safeNum(heightFt);
    const inch = heightIn.trim() === "" ? 0 : safeNum(heightIn);
    if (!Number.isFinite(ft) || ft <= 0) return NaN;
    if (!Number.isFinite(inch) || inch < 0) return NaN;
    const totalIn = ft * 12 + inch;
    return totalIn * 2.54;
  };

  const calculate = () => {
    setCopied(false);

    const wRaw = safeNum(weight);
    const aRaw = safeNum(age);
    const hCm = getHeightInCm();

    if (!Number.isFinite(wRaw) || wRaw <= 0) {
      setError("Please enter a valid weight (greater than 0).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(hCm) || hCm <= 0) {
      setError("Please enter a valid height (cm or ft/in).");
      setResult(null);
      return;
    }
    if (!Number.isFinite(aRaw) || aRaw <= 0) {
      setError("Please enter a valid age (greater than 0).");
      setResult(null);
      return;
    }

    let wKg = wRaw;
    if (weightUnit === "lbs") wKg = wRaw * 0.45359237;

    // clamp to reasonable ranges
    const W = clamp(wKg, 10, 400);
    const H = clamp(hCm, 80, 250);
    const A = clamp(aRaw, 5, 120);

    // Mifflin–St Jeor BMR
    const bmr =
      gender === "male"
        ? 10 * W + 6.25 * H - 5 * A + 5
        : 10 * W + 6.25 * H - 5 * A - 161;

    const factor = activityMeta[activity].factor;
    const tdee = bmr * factor;

    // Targets (simple & common):
    // - Mild cut: -250
    // - Cut: -500
    // - Bulk: +250
    const mildCut = Math.max(1200, tdee - 250);
    const cut = Math.max(1200, tdee - 500);
    const bulk = tdee + 250;

    setError(null);
    setResult({ bmr, tdee, cut, mildCut, bulk });
  };

  const copyResult = async () => {
    if (!result) return;

    const text =
      `BMR: ${formatInt(result.bmr)} kcal/day • ` +
      `TDEE (maintenance): ${formatInt(result.tdee)} kcal/day • ` +
      `Mild cut: ${formatInt(result.mildCut)} • Cut: ${formatInt(
        result.cut
      )} • Bulk: ${formatInt(result.bulk)}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canCalculate =
    weight.trim() !== "" &&
    age.trim() !== "" &&
    (heightUnit === "cm"
      ? heightCm.trim() !== ""
      : heightFt.trim() !== "");

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
              <Flame className="h-4 w-4 text-[#125FF9]" />
              Health • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Calorie{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Estimate daily calories for maintenance (TDEE), plus cut and bulk targets.
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
                    <p className="mt-1 text-xs text-gray-600">Choose kg or lb.</p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={weight}
                          onChange={(e) =>
                            onNumChange(setWeight, { allowDecimal: true })(e.target.value)
                          }
                          placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>

                      <div className="relative w-28 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm">
                        <select
                          value={weightUnit}
                          onChange={(e) => {
                            setWeightUnit(e.target.value as WeightUnit);
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

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Height
                    </label>
                    <p className="mt-1 text-xs text-gray-600">cm or ft/in.</p>

                    <div className="mt-3">
                      <div className="relative w-full rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm mb-3">
                        <select
                          value={heightUnit}
                          onChange={(e) => {
                            setHeightUnit(e.target.value as HeightUnit);
                            setError(null);
                            setResult(null);
                            setCopied(false);
                          }}
                          className="w-full appearance-none bg-transparent text-sm text-gray-900 outline-none pr-6"
                        >
                          <option value="cm">Centimeters (cm)</option>
                          <option value="ft-in">Feet / Inches (ft/in)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>

                      {heightUnit === "cm" ? (
                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={heightCm}
                            onChange={(e) =>
                              onNumChange(setHeightCm, { allowDecimal: true })(e.target.value)
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
                                onNumChange(setHeightFt, { allowDecimal: false })(e.target.value)
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
                                onNumChange(setHeightIn, { allowDecimal: false })(e.target.value)
                              }
                              placeholder="Inches (e.g. 8)"
                              className="w-full bg-transparent text-sm text-gray-900 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Age
                    </label>
                    <p className="mt-1 text-xs text-gray-600">In years.</p>
                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={age}
                        onChange={(e) =>
                          onNumChange(setAge, { allowDecimal: false })(e.target.value)
                        }
                        placeholder="e.g. 28"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Gender
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Used for BMR calculation.
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setGender("male");
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className={[
                          "rounded-2xl px-4 py-3 text-sm font-semibold border transition",
                          gender === "male"
                            ? "border-transparent text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]"
                            : "border-black/10 bg-white text-gray-900 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Male
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGender("female");
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className={[
                          "rounded-2xl px-4 py-3 text-sm font-semibold border transition",
                          gender === "female"
                            ? "border-transparent text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]"
                            : "border-black/10 bg-white text-gray-900 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Activity level
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Affects your daily maintenance calories (TDEE).
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <select
                        value={activity}
                        onChange={(e) => {
                          setActivity(e.target.value as ActivityKey);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {Object.keys(activityMeta).map((k) => {
                          const key = k as ActivityKey;
                          const item = activityMeta[key];
                          return (
                            <option key={key} value={key}>
                              {item.label} — {item.detail}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Selected:{" "}
                      <span className="font-semibold text-gray-900">
                        {activityMeta[activity].label}
                      </span>{" "}
                      (×{activityMeta[activity].factor})
                    </p>
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
                {result && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Maintenance (TDEE):{" "}
                          <span className="text-emerald-700">
                            {formatInt(result.tdee)}
                          </span>{" "}
                          kcal/day
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          BMR:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatInt(result.bmr)}
                          </span>{" "}
                          kcal/day
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

                    {/* targets */}
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Card label="Cut (−500)" value={`${formatInt(result.cut)} kcal`} sub="Faster fat loss" />
                      <Card label="Mild cut (−250)" value={`${formatInt(result.mildCut)} kcal`} sub="Easier to sustain" />
                      <Card label="Lean bulk (+250)" value={`${formatInt(result.bulk)} kcal`} sub="Muscle gain support" />
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Uses the Mifflin–St Jeor equation to estimate BMR, then multiplies by an activity factor for TDEE.
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    How this works
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    This calculator estimates your Basal Metabolic Rate (BMR) using{" "}
                    <span className="font-semibold text-gray-900">
                      Mifflin–St Jeor
                    </span>{" "}
                    and calculates your Total Daily Energy Expenditure (TDEE) using an
                    activity multiplier. TDEE is the number of calories needed to
                    maintain your current weight.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="To lose weight: eat below TDEE" />
                    <Bullet text="To gain weight: eat above TDEE" />
                    <Bullet text="To maintain: eat near TDEE" />
                    <Bullet text="Adjust based on progress" />
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

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{sub}</div>
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
