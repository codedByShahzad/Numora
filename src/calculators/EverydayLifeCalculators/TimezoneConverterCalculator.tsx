"use client";

import React, { useMemo, useState } from "react";
import {
  Globe,
  Copy,
  RotateCcw,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

/**
 * ✅ More popular time zones (SEO-friendly / user-friendly)
 * Note: Some labels mention common names (EST/EDT) but actual DST handled by the browser.
 */
const timeZones = [
  // Global
  { label: "UTC", value: "UTC" },

  // North America
  { label: "New York (ET)", value: "America/New_York" },
  { label: "Chicago (CT)", value: "America/Chicago" },
  { label: "Denver (MT)", value: "America/Denver" },
  { label: "Los Angeles (PT)", value: "America/Los_Angeles" },
  { label: "Toronto (ET)", value: "America/Toronto" },
  { label: "Vancouver (PT)", value: "America/Vancouver" },

  // Europe
  { label: "London (UK)", value: "Europe/London" },
  { label: "Paris (FR)", value: "Europe/Paris" },
  { label: "Berlin (DE)", value: "Europe/Berlin" },
  { label: "Rome (IT)", value: "Europe/Rome" },
  { label: "Madrid (ES)", value: "Europe/Madrid" },
  { label: "Amsterdam (NL)", value: "Europe/Amsterdam" },

  // Middle East / Africa
  { label: "Dubai (UAE)", value: "Asia/Dubai" },
  { label: "Riyadh (KSA)", value: "Asia/Riyadh" },
  { label: "Cairo (EG)", value: "Africa/Cairo" },
  { label: "Johannesburg (ZA)", value: "Africa/Johannesburg" },

  // South Asia
  { label: "Karachi (PK)", value: "Asia/Karachi" },
  { label: "Delhi (IN)", value: "Asia/Kolkata" },
  { label: "Dhaka (BD)", value: "Asia/Dhaka" },

  // East / SE Asia
  { label: "Singapore (SG)", value: "Asia/Singapore" },
  { label: "Hong Kong (HK)", value: "Asia/Hong_Kong" },
  { label: "Beijing (CN)", value: "Asia/Shanghai" },
  { label: "Tokyo (JP)", value: "Asia/Tokyo" },
  { label: "Seoul (KR)", value: "Asia/Seoul" },
  { label: "Bangkok (TH)", value: "Asia/Bangkok" },

  // Oceania
  { label: "Sydney (AU)", value: "Australia/Sydney" },
  { label: "Melbourne (AU)", value: "Australia/Melbourne" },
  { label: "Auckland (NZ)", value: "Pacific/Auckland" },
];

type Result = {
  fromLabel: string;
  toLabel: string;
  fromTime24: string;
  toTime24: string;
  fromTime12: string;
  toTime12: string;
  dateLine: string;
  summary: string;
};

function findLabel(tz: string) {
  return timeZones.find((x) => x.value === tz)?.label ?? tz;
}

/**
 * Convert "HH:mm" interpreted in fromZone into toZone.
 * Uses a no-lib correction approach with Intl.formatToParts.
 */
function convertTimeZones({
  inputTime,
  fromZone,
  toZone,
}: {
  inputTime: string;
  fromZone: string;
  toZone: string;
}) {
  const [hhStr, mmStr] = inputTime.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) throw new Error("Invalid time");

  // Today's date in FROM zone (YYYY-MM-DD)
  const todayInFrom = new Intl.DateTimeFormat("en-CA", {
    timeZone: fromZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [y, m, d] = todayInFrom.split("-").map(Number);

  const approx = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));

  const parts = (date: Date, zone: string) => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const p = fmt.formatToParts(date);
    const get = (type: string) => p.find((x) => x.type === type)?.value ?? "";
    return {
      year: Number(get("year")),
      month: Number(get("month")),
      day: Number(get("day")),
      hour: Number(get("hour")),
      minute: Number(get("minute")),
    };
  };

  const shown = parts(approx, fromZone);

  const desiredMinutes = hh * 60 + mm;
  const shownMinutes = shown.hour * 60 + shown.minute;

  const desiredDate = new Date(Date.UTC(y, m - 1, d));
  const shownDate = new Date(Date.UTC(shown.year, shown.month - 1, shown.day));
  const dayDiff = Math.round(
    (desiredDate.getTime() - shownDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let delta = desiredMinutes - shownMinutes + dayDiff * 24 * 60;
  const corrected = new Date(approx.getTime() + delta * 60 * 1000);

  const formatTime24 = (date: Date, zone: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

  const formatTime12 = (date: Date, zone: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);

  const formatDateLine = (date: Date, zone: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);

  return {
    fromTime24: formatTime24(corrected, fromZone),
    toTime24: formatTime24(corrected, toZone),
    fromTime12: formatTime12(corrected, fromZone),
    toTime12: formatTime12(corrected, toZone),
    dateLine: `${formatDateLine(corrected, fromZone)} → ${formatDateLine(
      corrected,
      toZone
    )}`,
  };
}

export default function TimeZoneConverter() {
  const [inputTime, setInputTime] = useState("");
  const [fromZone, setFromZone] = useState("UTC");
  const [toZone, setToZone] = useState("Asia/Karachi");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["AM/PM", "24-hour", "Meetings", "World time"],
    []
  );

  const handleConvert = () => {
    setCopied(false);

    if (!inputTime) {
      setError("Please enter a time.");
      setResult(null);
      return;
    }

    try {
      const { fromTime24, toTime24, fromTime12, toTime12, dateLine } =
        convertTimeZones({
          inputTime,
          fromZone,
          toZone,
        });

      const fromLabel = findLabel(fromZone);
      const toLabel = findLabel(toZone);

      const summary = `${fromTime12} (${fromTime24}) in ${fromLabel} = ${toTime12} (${toTime24}) in ${toLabel}`;

      setError(null);
      setResult({
        fromLabel,
        toLabel,
        fromTime24,
        toTime24,
        fromTime12,
        toTime12,
        dateLine,
        summary,
      });
    } catch {
      setError("Invalid time or time zone.");
      setResult(null);
    }
  };

  const swapZones = () => {
    setCopied(false);
    setError(null);
    setResult(null);
    setFromZone(toZone);
    setToZone(fromZone);
  };

  const reset = () => {
    setInputTime("");
    setFromZone("UTC");
    setToZone("UTC");
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

      <div className="mx-auto max-w-5xl px-4 py-7 sm:py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
             <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <Globe className="h-4 w-4 text-[#125FF9]" />
              Everyday Life • Converter
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Time Zone{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert time between popular cities — now with AM/PM + 24-hour format.
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
                {/* Time input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Time
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Enter time in the selected “From” zone.
                  </p>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <input
                      type="time"
                      value={inputTime}
                      onChange={(e) => {
                        setInputTime(e.target.value);
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* From / To */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      From
                    </label>
                    <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <select
                        value={fromZone}
                        onChange={(e) => {
                          setFromZone(e.target.value);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {timeZones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      To
                    </label>
                    <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                      <select
                        value={toZone}
                        onChange={(e) => {
                          setToZone(e.target.value);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {timeZones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Swap */}
                <button
                  onClick={swapZones}
                  className="
                    mt-4 inline-flex w-full items-center justify-center gap-2
                    rounded-2xl px-5 py-3
                    text-sm font-semibold text-gray-900
                    border border-black/10 bg-white
                    shadow-sm hover:bg-gray-50 transition
                  "
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Swap time zones
                </button>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleConvert}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3
                      text-sm font-semibold text-white
                      bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Convert
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
                          {result.fromTime12}{" "}
                          <span className="text-gray-500 font-medium">
                            ({result.fromTime24})
                          </span>{" "}
                          <span className="text-gray-600 font-medium">
                            in {result.fromLabel}
                          </span>
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {result.toTime12}{" "}
                          <span className="text-gray-500 font-medium">
                            ({result.toTime24})
                          </span>{" "}
                          <span className="text-gray-600 font-medium">
                            in {result.toLabel}
                          </span>
                        </p>

                        <p className="mt-2 text-sm text-gray-600">{result.dateLine}</p>
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

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: Cities may shift due to daylight saving time — your browser handles it automatically.
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
