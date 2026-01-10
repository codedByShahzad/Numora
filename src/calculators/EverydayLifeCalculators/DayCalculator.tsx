"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Tab = "day" | "diff";

type Result =
  | { kind: "day"; dateISO: string; dayName: string; summary: string }
  | {
      kind: "diff";
      fromISO: string;
      toISO: string;
      days: number;
      weeks: number;
      monthsApprox: number;
      summary: string;
    };

function formatISOToReadable(iso: string) {
  // ISO => readable (Jan 10, 2026)
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function DayCalculator() {
  const [tab, setTab] = useState<Tab>("day");

  // Day of week
  const [selectedDate, setSelectedDate] = useState("");

  // Date difference
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const todayISO = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const resetAll = () => {
    setSelectedDate("");
    setDate1("");
    setDate2("");
    setError(null);
    setResult(null);
    setCopied(false);
    setTab("day");
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const handleDayOfWeek = () => {
    setCopied(false);

    if (!selectedDate) {
      setError("Please select a date.");
      setResult(null);
      return;
    }

    const d = new Date(selectedDate);
    if (Number.isNaN(d.getTime())) {
      setError("Please select a valid date.");
      setResult(null);
      return;
    }

    setError(null);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const summary = `${formatISOToReadable(selectedDate)} is a ${dayName}.`;

    setResult({ kind: "day", dateISO: selectedDate, dayName, summary });
  };

  const handleDateDifference = () => {
    setCopied(false);

    if (!date1 || !date2) {
      setError("Please select both dates.");
      setResult(null);
      return;
    }

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
      setError("Please select valid dates.");
      setResult(null);
      return;
    }

    setError(null);

    // diff in days (absolute)
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // helpful breakdown
    const weeks = Math.floor(days / 7);
    const monthsApprox = Math.floor(days / 30.44); // average month length

    const summary = `The difference between ${formatISOToReadable(date1)} and ${formatISOToReadable(
      date2
    )} is ${days} day(s).`;

    setResult({
      kind: "diff",
      fromISO: date1,
      toISO: date2,
      days,
      weeks,
      monthsApprox,
      summary,
    });
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
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
              <CalendarDays className="h-4 w-4 text-[#125FF9]" />
              Everyday Life • Calculator
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Day{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Find the <b>day of the week</b> for any date, or calculate the <b>difference</b>{" "}
              between two dates.
            </p>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              {/* top accent */}
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Tabs */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
                    <button
                      onClick={() => {
                        setTab("day");
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      className={[
                        "rounded-xl px-4 py-2 text-sm font-semibold transition",
                        tab === "day"
                          ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      Day of Week
                    </button>
                    <button
                      onClick={() => {
                        setTab("diff");
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      className={[
                        "rounded-xl px-4 py-2 text-sm font-semibold transition",
                        tab === "diff"
                          ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      Date Difference
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-7">
                  {tab === "day" ? (
                    <>
                      <label className="block text-sm font-semibold text-gray-900">
                        Select a date
                      </label>
                      <p className="mt-1 text-xs text-gray-600">
                        We’ll return the weekday for the selected date.
                      </p>

                      <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          type="date"
                          value={selectedDate}
                          max={todayISO}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setError(null);
                            setResult(null);
                            setCopied(false);
                          }}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>

                      <button
                        onClick={handleDayOfWeek}
                        className="
                          mt-5 inline-flex w-full items-center justify-center gap-2
                          rounded-2xl px-5 py-3
                          text-sm font-semibold text-white
                          bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                          shadow-sm hover:shadow-md hover:brightness-105 transition
                        "
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Find Day
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900">
                            Date 1
                          </label>
                          <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                            <input
                              type="date"
                              value={date1}
                              onChange={(e) => {
                                setDate1(e.target.value);
                                setError(null);
                                setResult(null);
                                setCopied(false);
                              }}
                              className="w-full bg-transparent text-sm text-gray-900 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900">
                            Date 2
                          </label>
                          <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                            <input
                              type="date"
                              value={date2}
                              onChange={(e) => {
                                setDate2(e.target.value);
                                setError(null);
                                setResult(null);
                                setCopied(false);
                              }}
                              className="w-full bg-transparent text-sm text-gray-900 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDateDifference}
                        className="
                          mt-5 inline-flex w-full items-center justify-center gap-2
                          rounded-2xl px-5 py-3
                          text-sm font-semibold text-white
                          bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                          shadow-sm hover:shadow-md hover:brightness-105 transition
                        "
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Calculate Difference
                      </button>
                    </>
                  )}

                  {/* Reset */}
                  <button
                    onClick={resetAll}
                    className="
                      mt-3 inline-flex w-full items-center justify-center gap-2
                      rounded-2xl px-5 py-3
                      text-sm font-semibold text-gray-900
                      border border-black/10 bg-white
                      shadow-sm hover:bg-gray-50 transition
                    "
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>

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

                      {result.kind === "diff" && (
                        <>
                          <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                              <div className="text-2xl font-semibold text-gray-900">
                                {result.days}
                              </div>
                              <div className="text-xs text-gray-600">Days</div>
                            </div>
                            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                              <div className="text-2xl font-semibold text-gray-900">
                                {result.weeks}
                              </div>
                              <div className="text-xs text-gray-600">Weeks</div>
                            </div>
                            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                              <div className="text-2xl font-semibold text-gray-900">
                                {result.monthsApprox}
                              </div>
                              <div className="text-xs text-gray-600">Months (≈)</div>
                            </div>
                          </div>

                          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                          <p className="mt-4 text-xs text-gray-600">
                            Notes: “Months” is an approximation (average month length). Days count is exact.
                          </p>
                        </>
                      )}
                    </div>
                  )}
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
