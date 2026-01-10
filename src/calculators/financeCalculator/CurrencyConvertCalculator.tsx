"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Coins,
} from "lucide-react";

type Currency = "USD" | "EUR" | "GBP" | "INR" | "PKR" | "JPY" | "AUD" | "CAD";

type RateMap = Record<Currency, number>;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export default function CurrencyConverterPage() {
  // ✅ Sample static rates (relative to USD)
  const rates: RateMap = useMemo(
    () => ({
      USD: 1,
      EUR: 0.92,
      GBP: 0.78,
      INR: 83.2,
      PKR: 283.74,
      JPY: 147,
      AUD: 1.55,
      CAD: 1.37,
    }),
    []
  );

  const currencyMeta: Record<
    Currency,
    { name: string; symbol: string; example: string }
  > = useMemo(
    () => ({
      USD: { name: "US Dollar", symbol: "$", example: "e.g. 100" },
      EUR: { name: "Euro", symbol: "€", example: "e.g. 100" },
      GBP: { name: "British Pound", symbol: "£", example: "e.g. 100" },
      INR: { name: "Indian Rupee", symbol: "₹", example: "e.g. 5000" },
      PKR: { name: "Pakistani Rupee", symbol: "Rs", example: "e.g. 25000" },
      JPY: { name: "Japanese Yen", symbol: "¥", example: "e.g. 10000" },
      AUD: { name: "Australian Dollar", symbol: "A$", example: "e.g. 150" },
      CAD: { name: "Canadian Dollar", symbol: "C$", example: "e.g. 150" },
    }),
    []
  );

  const currencies = useMemo(
    () => Object.keys(rates) as Currency[],
    [rates]
  );

  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");
  const [toCurrency, setToCurrency] = useState<Currency>("EUR");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    converted: number;
    summary: string;
    rateLine: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const formatConverted = (n: number, currency: Currency) => {
    // JPY often displayed without decimals; but we keep 2 for consistency.
    // You can special-case if you want.
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatInput = (v: number) =>
    v.toLocaleString(undefined, { maximumFractionDigits: 6 });

  const getRateFromTo = (from: Currency, to: Currency) => {
    // Since rates are relative to USD:
    // 1 FROM in USD = 1 / rates[from]
    // 1 USD to TO = rates[to]
    // So 1 FROM to TO = (1 / rates[from]) * rates[to]
    return (1 / rates[from]) * rates[to];
  };

  const swap = () => {
    setCopied(false);
    setError(null);
    setResult(null);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const reset = () => {
    setAmount("");
    setFromCurrency("USD");
    setToCurrency("EUR");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const convert = () => {
    setCopied(false);

    const amtRaw = safeNum(amount);
    if (!Number.isFinite(amtRaw) || amtRaw < 0) {
      setError("Please enter a valid amount (0 or more).");
      setResult(null);
      return;
    }

    const amt = clamp(amtRaw, 0, Number.MAX_SAFE_INTEGER);

    const usdValue = amt / rates[fromCurrency]; // convert to USD
    const converted = usdValue * rates[toCurrency]; // convert USD to target

    const rate = getRateFromTo(fromCurrency, toCurrency);
    const rateLine = `1 ${fromCurrency} = ${formatInput(rate)} ${toCurrency}`;

    const summary = `${formatInput(amt)} ${fromCurrency} = ${formatConverted(
      converted,
      toCurrency
    )} ${toCurrency}`;

    setError(null);
    setResult({ converted, summary, rateLine });
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const fromMeta = currencyMeta[fromCurrency];
  const toMeta = currencyMeta[toCurrency];

  const liveRate = useMemo(
    () => getRateFromTo(fromCurrency, toCurrency),
    [fromCurrency, toCurrency, rates]
  );

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
              <Coins className="h-4 w-4 text-[#125FF9]" />
              Finance • Converter
            </span>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Currency{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Convert between popular currencies using sample rates (static).
            </p>

            <p className="mt-3 text-xs text-gray-500">
              Live preview:{" "}
              <span className="font-semibold text-gray-900">
                1 {fromCurrency}
              </span>{" "}
              ={" "}
              <span className="font-semibold text-gray-900">
                {formatInput(liveRate)} {toCurrency}
              </span>
            </p>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Amount
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Enter an amount in {fromCurrency} ({fromMeta.name}).
                  </p>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                    <span className="text-sm font-semibold text-gray-700">
                      {fromMeta.symbol}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!/^\d*\.?\d*$/.test(v)) return;
                        if (v.includes("-")) return;
                        setAmount(v);
                        setError(null);
                        setResult(null);
                        setCopied(false);
                      }}
                      placeholder={fromMeta.example}
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
                    <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <select
                        value={fromCurrency}
                        onChange={(e) => {
                          setFromCurrency(e.target.value as Currency);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c}>
                            {c} — {currencyMeta[c].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      To
                    </label>
                    <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <select
                        value={toCurrency}
                        onChange={(e) => {
                          setToCurrency(e.target.value as Currency);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c}>
                            {c} — {currencyMeta[c].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Swap */}
                <button
                  onClick={swap}
                  className="
                    mt-4 inline-flex w-full items-center justify-center gap-2
                    rounded-2xl px-5 py-3
                    text-sm font-semibold text-gray-900
                    border border-black/10 bg-white
                    shadow-sm hover:bg-gray-50 transition
                  "
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Swap currencies
                </button>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={convert}
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
                          {toMeta.symbol}{" "}
                          {formatConverted(result.converted, toCurrency)}{" "}
                          <span className="text-gray-500 font-medium">
                            ({toCurrency})
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {result.rateLine}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Note: Rates here are sample (static). For live rates, connect an exchange-rate API.
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
