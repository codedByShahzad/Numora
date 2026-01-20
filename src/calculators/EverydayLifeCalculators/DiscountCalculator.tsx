"use client";

import React, { useMemo, useState } from "react";
import { Tag, Copy, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type DiscountResult = {
  original: number;
  discountPercent: number;
  discountAmount: number;
  final: number;
  taxPercent?: number;
  finalWithTax?: number;
  summary: string;
};

export default function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  // optional tax (nice UX)
  const [includeTax, setIncludeTax] = useState(false);
  const [taxPercent, setTaxPercent] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [copied, setCopied] = useState(false);

  const currencySymbol = "$"; // you can make this dynamic later

  const isValidNumber = (v: string) => v !== "" && !Number.isNaN(Number(v));

  const formatMoney = (n: number) =>
    `${currencySymbol}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const calculate = () => {
    setCopied(false);

    if (!isValidNumber(originalPrice) || Number(originalPrice) <= 0) {
      setError("Please enter a valid original price (greater than 0).");
      setResult(null);
      return;
    }

    if (!isValidNumber(discountPercent) || Number(discountPercent) < 0) {
      setError("Please enter a valid discount percentage (0 or more).");
      setResult(null);
      return;
    }

    const price = Number(originalPrice);
    const discount = Number(discountPercent);

    if (discount > 100) {
      setError("Discount percentage cannot be greater than 100%.");
      setResult(null);
      return;
    }

    if (includeTax) {
      if (!isValidNumber(taxPercent) || Number(taxPercent) < 0) {
        setError("Please enter a valid tax percentage (0 or more).");
        setResult(null);
        return;
      }
    }

    setError(null);

    const discountAmount = (price * discount) / 100;
    const final = price - discountAmount;

    let finalWithTax: number | undefined;
    let taxP: number | undefined;

    if (includeTax) {
      taxP = Number(taxPercent);
      finalWithTax = final + (final * taxP) / 100;
    }

    const summary = includeTax
      ? `Original: ${formatMoney(price)} • Discount: ${discount}% (${formatMoney(
          discountAmount
        )}) • Final: ${formatMoney(final)} • With tax: ${formatMoney(finalWithTax!)}`
      : `Original: ${formatMoney(price)} • Discount: ${discount}% (${formatMoney(
          discountAmount
        )}) • Final: ${formatMoney(final)}`;

    setResult({
      original: price,
      discountPercent: discount,
      discountAmount,
      final,
      taxPercent: taxP,
      finalWithTax,
      summary,
    });
  };

  const reset = () => {
    setOriginalPrice("");
    setDiscountPercent("");
    setIncludeTax(false);
    setTaxPercent("");
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const copySummary = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const chips = useMemo(
    () => ["Final Price", "You Save", "Percent Off", "Shopping"],
    []
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

      <div className="mx-auto max-w-5xl ">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <Tag className="h-4 w-4 text-[#125FF9]" />
              Everyday Life • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Discount{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Enter the original price and discount percentage to get your final price instantly.
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
              {/* top accent */}
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Inputs */}
                <div className="grid gap-5">
                  {/* Original Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Original price
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Enter the price before any discount is applied.
                    </p>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <span className="text-sm font-semibold text-gray-700">
                        {currencySymbol}
                      </span>
                      <input
                        inputMode="decimal"
                        type="number"
                        value={originalPrice}
                        onChange={(e) => {
                          setOriginalPrice(e.target.value);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        placeholder="e.g. 199.99"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Discount Percent */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Discount percentage
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      Use a value between 0 and 100.
                    </p>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                      <input
                        inputMode="decimal"
                        type="number"
                        value={discountPercent}
                        onChange={(e) => {
                          setDiscountPercent(e.target.value);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        placeholder="e.g. 20"
                        className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Optional Tax */}
                  <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Include tax (optional)
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Useful if you want the final price after tax.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIncludeTax((v) => !v);
                          setError(null);
                          setResult(null);
                          setCopied(false);
                        }}
                        className={[
                          "relative inline-flex h-7 w-12 items-center rounded-full border transition",
                          includeTax
                            ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] border-transparent"
                            : "bg-gray-100 border-black/10",
                        ].join(" ")}
                        aria-label="Toggle include tax"
                      >
                        <span
                          className={[
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
                            includeTax ? "translate-x-6" : "translate-x-1",
                          ].join(" ")}
                        />
                      </button>
                    </div>

                    {includeTax && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-900">
                          Tax percentage
                        </label>
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                          <input
                            inputMode="decimal"
                            type="number"
                            value={taxPercent}
                            onChange={(e) => {
                              setTaxPercent(e.target.value);
                              setError(null);
                              setResult(null);
                              setCopied(false);
                            }}
                            placeholder="e.g. 8.25"
                            className="w-full bg-transparent text-sm text-gray-900 outline-none"
                          />
                          <span className="text-sm font-semibold text-gray-700">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculate}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3
                      text-sm font-semibold text-white
                      bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate
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
                          You save {formatMoney(result.discountAmount)} ({result.discountPercent}%)
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Final price:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatMoney(result.final)}
                          </span>
                          {includeTax && result.finalWithTax != null ? (
                            <>
                              {" "}
                              • With tax:{" "}
                              <span className="font-semibold text-gray-900">
                                {formatMoney(result.finalWithTax)}
                              </span>
                            </>
                          ) : null}
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

                    <div className="mt-5 grid md:grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Original</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(result.original)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">You save</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(result.discountAmount)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
                        <div className="text-xs text-gray-600">Final</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatMoney(result.final)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: Use this for shopping discounts, sale prices, coupons, and checkout planning.
                    </p>
                  </div>
                )}
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
