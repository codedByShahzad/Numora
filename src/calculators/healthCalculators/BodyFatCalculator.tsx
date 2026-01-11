"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Gender = "male" | "female";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const format1 = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 });

function getFatCategory(gender: Gender, bf: number) {
  if (gender === "male") {
    if (bf < 6) return { label: "Essential fat", color: "text-blue-600" };
    if (bf <= 14) return { label: "Athletes", color: "text-emerald-600" };
    if (bf <= 17) return { label: "Fitness", color: "text-emerald-700" };
    if (bf <= 24) return { label: "Average", color: "text-amber-600" };
    return { label: "Obese", color: "text-red-600" };
  } else {
    if (bf < 14) return { label: "Essential fat", color: "text-blue-600" };
    if (bf <= 21) return { label: "Athletes", color: "text-emerald-600" };
    if (bf <= 24) return { label: "Fitness", color: "text-emerald-700" };
    if (bf <= 31) return { label: "Average", color: "text-amber-600" };
    return { label: "Obese", color: "text-red-600" };
  }
}

export default function BodyFatCalculator() {
  const [gender, setGender] = useState<Gender>("male");

  const [height, setHeight] = useState<string>(""); // cm
  const [waist, setWaist] = useState<string>(""); // cm
  const [neck, setNeck] = useState<string>(""); // cm
  const [hip, setHip] = useState<string>(""); // cm (female)

  const [error, setError] = useState<string | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Navy method", "Body measurements", "Fat % estimate", "Male/Female"],
    []
  );

  const reset = () => {
    setGender("male");
    setHeight("");
    setWaist("");
    setNeck("");
    setHip("");
    setError(null);
    setBodyFat(null);
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
      setBodyFat(null);
      setCopied(false);
    };

  const calculate = () => {
    setCopied(false);

    const h = safeNum(height);
    const w = safeNum(waist);
    const n = safeNum(neck);
    const hp = hip.trim() === "" ? NaN : safeNum(hip);

    if (!Number.isFinite(h) || h <= 0) {
      setError("Please enter a valid height (cm).");
      setBodyFat(null);
      return;
    }
    if (!Number.isFinite(w) || w <= 0) {
      setError("Please enter a valid waist measurement (cm).");
      setBodyFat(null);
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      setError("Please enter a valid neck measurement (cm).");
      setBodyFat(null);
      return;
    }
    if (gender === "female" && (!Number.isFinite(hp) || hp <= 0)) {
      setError("Please enter a valid hip measurement (cm) for females.");
      setBodyFat(null);
      return;
    }

    // ✅ Log safety checks
    // Male uses log10(waist - neck) => must be > 0
    if (gender === "male" && w - n <= 0) {
      setError("Waist must be greater than neck (so the formula is valid).");
      setBodyFat(null);
      return;
    }

    // Female uses log10(waist + hip - neck) => must be > 0
    if (gender === "female" && (w + (hp as number) - n) <= 0) {
      setError("Waist + hip must be greater than neck (so the formula is valid).");
      setBodyFat(null);
      return;
    }

    // Clamp inputs to reasonable max (avoid crazy values)
    const H = clamp(h, 50, 300);
    const W = clamp(w, 20, 300);
    const N = clamp(n, 10, 100);
    const HP = gender === "female" ? clamp(hp as number, 20, 300) : 0;

    // Navy method (using cm)
    let result = 0;
    if (gender === "male") {
      result =
        86.010 * Math.log10(W - N) - 70.041 * Math.log10(H) + 36.76;
    } else {
      result =
        163.205 * Math.log10(W + HP - N) - 97.684 * Math.log10(H) - 78.387;
    }

    // clamp result to plausible range
    const bf = clamp(result, 1, 70);
    setError(null);
    setBodyFat(Math.round(bf * 10) / 10);
  };

  const copyResult = async () => {
    if (bodyFat == null) return;
    const cat = getFatCategory(gender, bodyFat).label;
    const text = `Body Fat: ${format1(bodyFat)}% • Category: ${cat} • Method: US Navy`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const cat = bodyFat == null ? null : getFatCategory(gender, bodyFat);

  const canCalculate =
    height.trim() !== "" &&
    waist.trim() !== "" &&
    neck.trim() !== "" &&
    (gender === "male" || hip.trim() !== "");

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
              <Activity className="h-4 w-4 text-[#125FF9]" />
              Health • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Body Fat{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Estimate your body fat percentage using the U.S. Navy method.
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
                {/* Gender pills */}
                <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">Gender</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGender("male");
                        setError(null);
                        setBodyFat(null);
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
                        setBodyFat(null);
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

                  <p className="mt-3 text-xs text-gray-600">
                    Measurements should be in{" "}
                    <span className="font-semibold text-gray-900">centimeters (cm)</span>.
                  </p>
                </div>

                {/* Inputs */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Height (cm)"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(v) => onNumChange(setHeight, { allowDecimal: true })(v)}
                  />
                  <Field
                    label="Waist (cm)"
                    placeholder="e.g. 80"
                    value={waist}
                    onChange={(v) => onNumChange(setWaist, { allowDecimal: true })(v)}
                  />
                  <Field
                    label="Neck (cm)"
                    placeholder="e.g. 38"
                    value={neck}
                    onChange={(v) => onNumChange(setNeck, { allowDecimal: true })(v)}
                  />
                  {gender === "female" ? (
                    <Field
                      label="Hip (cm)"
                      placeholder="e.g. 98"
                      value={hip}
                      onChange={(v) => onNumChange(setHip, { allowDecimal: true })(v)}
                    />
                  ) : (
                    <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-gray-600 shadow-sm">
                      <p className="font-semibold text-gray-900">Hip is not required</p>
                      <p className="mt-1 text-xs text-gray-600">
                        For males, the Navy method uses height, waist, and neck.
                      </p>
                    </div>
                  )}
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
                    Calculate body fat
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
                {bodyFat != null && cat && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Body fat:{" "}
                          <span className={cat.color}>{format1(bodyFat)}%</span>
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          Category:{" "}
                          <span className={`font-semibold ${cat.color}`}>
                            {cat.label}
                          </span>
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Method: U.S. Navy (estimate)
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

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <RangeCard
                        title={gender === "male" ? "Male ranges" : "Female ranges"}
                        rows={
                          gender === "male"
                            ? [
                                ["Essential", "< 6%"],
                                ["Athletes", "6–14%"],
                                ["Fitness", "15–17%"],
                                ["Average", "18–24%"],
                                ["Obese", "25%+"],
                              ]
                            : [
                                ["Essential", "< 14%"],
                                ["Athletes", "14–21%"],
                                ["Fitness", "22–24%"],
                                ["Average", "25–31%"],
                                ["Obese", "32%+"],
                              ]
                        }
                      />
                      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-gray-900">
                          Tips for better accuracy
                        </p>
                        <ul className="mt-2 space-y-2 text-xs text-gray-600">
                          <li>• Measure waist at the navel, relaxed.</li>
                          <li>• Keep tape snug, not compressing skin.</li>
                          <li>• Use consistent units (cm) for all fields.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Body fat percentage is an estimate. For medical advice, consult a professional.
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    What is Body Fat %?
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Body fat percentage is the proportion of fat in your body compared to
                    everything else (muscle, bone, water, organs). The U.S. Navy method
                    estimates body fat using a few simple measurements.
                  </p>
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

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 outline-none"
        />
      </div>
    </div>
  );
}

function RangeCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-2"
          >
            <span className="text-sm font-semibold text-gray-900">{k}</span>
            <span className="text-sm text-gray-600">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
