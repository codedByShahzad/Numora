"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sigma,
} from "lucide-react";

type Stats = {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: string; // "No mode" or "x, y"
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const format = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 6 });

function parseNumbers(input: string): number[] {
  // supports commas, spaces, new lines, semicolons
  // also handles multiple separators like "1, 2  3\n4"
  const parts = input
    .trim()
    .split(/[\s,;\n\t]+/g)
    .filter(Boolean);

  const nums = parts
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n));

  return nums;
}

function computeStats(nums: number[], useSample: boolean): Stats {
  const sorted = [...nums].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const min = sorted[0];
  const max = sorted[count - 1];
  const range = max - min;

  // mode
  const freq = new Map<number, number>();
  for (const n of sorted) freq.set(n, (freq.get(n) ?? 0) + 1);
  const maxFreq = Math.max(...Array.from(freq.values()));

  // If maxFreq == 1, every value appears once => no mode
  let mode = "No mode";
  if (maxFreq > 1) {
    mode = Array.from(freq.entries())
      .filter(([, f]) => f === maxFreq)
      .map(([n]) => n)
      .join(", ");
  }

  // variance/std dev
  const denom = useSample ? count - 1 : count; // sample uses (n-1)
  const variance =
    denom > 0
      ? sorted.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / denom
      : 0;

  const stdDev = Math.sqrt(variance);

  return {
    count,
    sum,
    mean,
    median,
    mode,
    min,
    max,
    range,
    variance,
    stdDev,
  };
}

export default function StatisticsCalculator() {
  const [input, setInput] = useState("");
  const [useSample, setUseSample] = useState(false); // default population

  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Mean", "Median", "Mode", "Std Dev", "Variance"],
    []
  );

  const reset = () => {
    setInput("");
    setError(null);
    setStats(null);
    setCopied(false);
    setUseSample(false);
  };

  const calculateAll = () => {
    setCopied(false);

    const nums = parseNumbers(input);
    if (nums.length === 0) {
      setError("Please enter valid numbers (comma, space, or new-line separated).");
      setStats(null);
      return;
    }

    setError(null);
    setStats(computeStats(nums, useSample));
  };

  const quick = (type: "mean" | "median" | "mode" | "std") => {
    setCopied(false);

    const nums = parseNumbers(input);
    if (nums.length === 0) {
      setError("Please enter valid numbers first.");
      setStats(null);
      return;
    }

    const s = computeStats(nums, useSample);
    setError(null);

    // still show full panel but the user intended a quick calc
    setStats(s);

    // optional: could scroll to result / highlight — keep simple
  };

  const copySummary = async () => {
    if (!stats) return;

    const summary = `Count=${stats.count}, Sum=${format(stats.sum)}, Mean=${format(
      stats.mean
    )}, Median=${format(stats.median)}, Mode=${stats.mode}, Min=${format(
      stats.min
    )}, Max=${format(stats.max)}, Range=${format(stats.range)}, Variance=${format(
      stats.variance
    )}, StdDev=${format(stats.stdDev)} (${useSample ? "Sample" : "Population"})`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

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
              <BarChart3 className="h-4 w-4 text-[#125FF9]" />
              Maths & Science • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Statistics{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Paste your numbers and instantly calculate common descriptive statistics.
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
                {/* Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Numbers
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Separate values with commas, spaces, or new lines. Example:{" "}
                    <span className="font-semibold text-gray-900">10, 12 15</span>
                  </p>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <textarea
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setError(null);
                        setStats(null);
                        setCopied(false);
                      }}
                      rows={4}
                      placeholder="e.g. 12, 15, 15, 18, 20"
                      className="w-full resize-none bg-transparent text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* Population/Sample toggle */}
                <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white">
                        <Sigma className="h-4 w-4 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Variance & Std Dev type
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Choose Population (N) or Sample (N−1).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUseSample((v) => !v);
                        setError(null);
                        setStats(null);
                        setCopied(false);
                      }}
                      className={[
                        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
                        useSample
                          ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] border-transparent"
                          : "bg-gray-100 border-black/10",
                      ].join(" ")}
                      aria-label="Toggle sample mode"
                    >
                      <span
                        className={[
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
                          useSample ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-gray-600">
                    Currently:{" "}
                    <span className="font-semibold text-gray-900">
                      {useSample ? "Sample (N−1)" : "Population (N)"}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculateAll}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3
                      text-sm font-semibold text-white
                      bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate all
                  </button>

                  <button
                    onClick={reset}
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

                {/* Quick buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Mean", key: "mean" as const },
                    { label: "Median", key: "median" as const },
                    { label: "Mode", key: "mode" as const },
                    { label: "Std Dev", key: "std" as const },
                  ].map((b) => (
                    <button
                      key={b.label}
                      onClick={() => quick(b.key)}
                      className="
                        rounded-2xl border border-black/10 bg-white
                        px-4 py-2 text-sm font-semibold text-gray-900
                        shadow-sm hover:bg-gray-50 transition
                      "
                    >
                      {b.label}
                    </button>
                  ))}
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
                {stats && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {useSample ? "Sample (N−1)" : "Population (N)"} variance/std dev
                        </p>
                      </div>

                      <button
                        onClick={copySummary}
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

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <StatCard label="Count" value={stats.count} />
                      <StatCard label="Sum" value={format(stats.sum)} />
                      <StatCard label="Mean" value={format(stats.mean)} />
                      <StatCard label="Median" value={format(stats.median)} />
                      <StatCard label="Mode" value={stats.mode} />
                      <StatCard label="Std Dev" value={format(stats.stdDev)} />
                      <StatCard label="Variance" value={format(stats.variance)} />
                      <StatCard label="Min" value={format(stats.min)} />
                      <StatCard label="Max" value={format(stats.max)} />
                      <StatCard label="Range" value={format(stats.range)} />
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: For sample data, use Sample (N−1). For an entire population, use Population (N).
                    </p>
                  </div>
                )}
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

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}
