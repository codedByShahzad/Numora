"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type AgeResult = {
  years: number;
  months: number;
  days: number;
  summary: string;
};

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const todayISO = useMemo(() => {
    // for max attribute (avoid selecting future date)
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const calculateAge = () => {
    setCopied(false);

    if (!birthDate) {
      setError("Please select your birth date.");
      setResult(null);
      return;
    }

    const today = new Date();
    const birth = new Date(birthDate);

    // invalid date guard
    if (Number.isNaN(birth.getTime())) {
      setError("Please select a valid date.");
      setResult(null);
      return;
    }

    // future date guard
    if (birth > today) {
      setError("Birth date cannot be in the future.");
      setResult(null);
      return;
    }

    setError(null);

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const summary = `${years} Years, ${months} Months, ${days} Days`;

    setResult({ years, months, days, summary });
  };

  const handleReset = () => {
    setBirthDate("");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore clipboard errors silently
    }
  };

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* Background (SaaS grid + glow) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-7 sm:py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                <Calendar className="h-4 w-4 text-[#125FF9]" />
                Everyday Life • Calculator
              </HoverBorderGradient>
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Age{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Select your birth date to instantly get your age in{" "}
              <b>years, months, and days</b>.
            </p>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              {/* top accent */}
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Birth date
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    We’ll calculate your exact age as of today.
                  </p>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <input
                      type="date"
                      value={birthDate}
                      max={todayISO}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculateAge}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3
                      text-sm font-semibold text-white
                      bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate Age
                  </button>

                  <button
                    onClick={handleReset}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3
                      text-sm font-semibold text-gray-900
                      border border-black/10 bg-white
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
                  <div className="mt-6">
                    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Your age
                          </p>
                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            {result.summary}
                          </p>
                        </div>

                        <button
                          onClick={copyResult}
                          className="
                            inline-flex items-center justify-center gap-2
                            rounded-full px-4 py-2
                            text-sm font-semibold
                            border border-black/10 bg-white
                            shadow-sm hover:bg-gray-50 transition
                          "
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                          <div className="text-2xl font-semibold text-gray-900">
                            {result.years}
                          </div>
                          <div className="text-xs text-gray-600">Years</div>
                        </div>
                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                          <div className="text-2xl font-semibold text-gray-900">
                            {result.months}
                          </div>
                          <div className="text-xs text-gray-600">Months</div>
                        </div>
                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                          <div className="text-2xl font-semibold text-gray-900">
                            {result.days}
                          </div>
                          <div className="text-xs text-gray-600">Days</div>
                        </div>
                      </div>

                      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                      <p className="mt-4 text-xs text-gray-600">
                        Tip: Use the calculator for official forms, planning
                        milestones, or checking age eligibility.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-gray-500">
              Numoro calculators are designed to be simple, fast, and easy to
              use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
