"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Zones = {
  maxHR: number;
  restingHR: number;
  moderate: { min: number; max: number };
  vigorous: { min: number; max: number };
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export default function HeartRateCalculator() {
  const [age, setAge] = useState<string>("");
  const [resting, setResting] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<Zones | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Max HR", "Target zones", "Karvonen method", "Workout intensity"],
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
      setZones(null);
      setCopied(false);
    };

  const reset = () => {
    setAge("");
    setResting("");
    setError(null);
    setZones(null);
    setCopied(false);
  };

  const calculate = () => {
    setCopied(false);

    const a = safeNum(age);
    const rRaw = resting.trim() === "" ? 70 : safeNum(resting);

    if (!Number.isFinite(a) || a <= 0) {
      setError("Please enter a valid age (greater than 0).");
      setZones(null);
      return;
    }
    if (!Number.isFinite(rRaw) || rRaw <= 0) {
      setError("Please enter a valid resting heart rate (greater than 0).");
      setZones(null);
      return;
    }

    const A = clamp(a, 5, 120);
    const R = clamp(rRaw, 30, 140);

    const maxHR = Math.round(220 - A);

    // Karvonen (Heart Rate Reserve)
    // Zone = ((MHR - RHR) * intensity) + RHR
    const moderateMin = Math.round((maxHR - R) * 0.5 + R);
    const moderateMax = Math.round((maxHR - R) * 0.7 + R);
    const vigorousMin = Math.round((maxHR - R) * 0.7 + R);
    const vigorousMax = Math.round((maxHR - R) * 0.85 + R);

    setError(null);
    setZones({
      maxHR,
      restingHR: R,
      moderate: { min: moderateMin, max: moderateMax },
      vigorous: { min: vigorousMin, max: vigorousMax },
    });
  };

  const copyResult = async () => {
    if (!zones) return;

    const text =
      `Max HR: ${zones.maxHR} bpm • Resting: ${zones.restingHR} bpm • ` +
      `Moderate: ${zones.moderate.min}-${zones.moderate.max} bpm • ` +
      `Vigorous: ${zones.vigorous.min}-${zones.vigorous.max} bpm`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const canCalculate = age.trim() !== "";

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
              Heart Rate{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Zones
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Get your target heart rate zones for safer and more effective workouts.
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
                        placeholder="e.g. 30"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Resting Heart Rate (optional)
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Default: 70 bpm
                    </p>

                    <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={resting}
                        onChange={(e) =>
                          onNumChange(setResting, { allowDecimal: false })(e.target.value)
                        }
                        placeholder="e.g. 65"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
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
                    Calculate zones
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
                {zones && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Max HR:{" "}
                          <span className="text-emerald-700">
                            {zones.maxHR}
                          </span>{" "}
                          bpm
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Resting HR:{" "}
                          <span className="font-semibold text-gray-900">
                            {zones.restingHR}
                          </span>{" "}
                          bpm
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

                    {/* Visual zone bars */}
                    <div className="mt-5 space-y-4">
                      <ZoneBar
                        label="Moderate intensity"
                        range={`${zones.moderate.min}–${zones.moderate.max} bpm`}
                        minPct={50}
                        maxPct={70}
                        gradient="from-emerald-500 to-green-500"
                      />
                      <ZoneBar
                        label="Vigorous intensity"
                        range={`${zones.vigorous.min}–${zones.vigorous.max} bpm`}
                        minPct={70}
                        maxPct={85}
                        gradient="from-red-500 to-rose-600"
                      />
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Uses the Karvonen method: ((Max HR − Resting HR) × intensity) + Resting HR.
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Understanding Heart Rate Zones
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Heart rate zones help guide safe and effective workouts. Moderate
                    intensity is great for endurance and fat burning, while vigorous
                    intensity improves cardio performance.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="Moderate: 50%–70% effort" />
                    <Bullet text="Vigorous: 70%–85% effort" />
                    <Bullet text="Uses resting HR for accuracy" />
                    <Bullet text="Adjust based on fitness" />
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

function ZoneBar({
  label,
  range,
  minPct,
  maxPct,
  gradient,
}: {
  label: string;
  range: string;
  minPct: number;
  maxPct: number;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-600">{range}</div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          style={{
            marginLeft: `${minPct}%`,
            width: `${maxPct - minPct}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <span>{minPct}%</span>
        <span>{maxPct}%</span>
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
