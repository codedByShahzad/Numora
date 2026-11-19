"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BreakdownRow,
  Card,
  CheckboxField,
  EmptyResult,
  NumberField,
  Segmented,
  SelectField,
  StatTile,
  MobileResultBar,
} from "@/components/calculator/Fields";
import { currencySymbol, formatMoney, formatPercent, parseNumber } from "@/lib/calc/money";
import {
  calculateEtsy,
  ETSY_FEES,
  ETSY_MARKET_IDS,
  ETSY_MARKETS,
  reverseEtsy,
  type EtsyInput,
  type EtsyMarketId,
  type EtsyResult,
  type OffsiteAds,
} from "@/lib/calc/etsy";

type Mode = "forward" | "reverse";

const pctString = (rate: number) => String(Math.round(rate * 10000) / 100);

export default function EtsyFeeCalculator() {
  const [mode, setMode] = useState<Mode>("forward");
  const [market, setMarket] = useState<EtsyMarketId>("US");
  const [itemPrice, setItemPrice] = useState("25");
  const [targetProfit, setTargetProfit] = useState("20");
  const [quantity, setQuantity] = useState("1");
  const [shippingCharged, setShippingCharged] = useState("5");
  const [itemCost, setItemCost] = useState("8");
  const [shippingCost, setShippingCost] = useState("4.50");
  const [otherCosts, setOtherCosts] = useState("0");
  const [offsiteAds, setOffsiteAds] = useState<OffsiteAds>("none");
  const [giftWrap, setGiftWrap] = useState("");
  const [salesTax, setSalesTax] = useState("");
  const [conversion, setConversion] = useState(false);
  const [vatPct, setVatPct] = useState(pctString(ETSY_MARKETS.US.vatOnFeesDefault));
  const [fx, setFx] = useState(String(ETSY_MARKETS.US.usdToLocal));

  const m = ETSY_MARKETS[market];
  const sym = currencySymbol(m.currency);
  const money = (n: number) => formatMoney(n, m.currency);

  const changeMarket = (id: string) => {
    const next = ETSY_MARKETS[id as EtsyMarketId];
    setMarket(id as EtsyMarketId);
    setVatPct(pctString(next.vatOnFeesDefault));
    setFx(String(next.usdToLocal));
  };

  const base: Omit<EtsyInput, "itemPrice"> = {
    market,
    quantity: parseNumber(quantity),
    shippingCharged: parseNumber(shippingCharged),
    giftWrap: parseNumber(giftWrap),
    salesTax: parseNumber(salesTax),
    itemCost: parseNumber(itemCost),
    shippingCost: parseNumber(shippingCost),
    otherCosts: parseNumber(otherCosts),
    offsiteAds,
    currencyConversion: conversion,
    vatOnFeesRate: (() => {
      const v = parseNumber(vatPct);
      return v === null ? null : v / 100;
    })(),
    usdToLocal: parseNumber(fx),
  };
  // Both calculations are cheap (the reverse search is ~30 forward passes), so they run on every render.
  const forward = calculateEtsy({ ...base, itemPrice: parseNumber(itemPrice) });
  const reverse = reverseEtsy(base, parseNumber(targetProfit));

  const active = mode === "forward" ? forward : reverse;
  const errors = active.ok ? {} : active.errors;
  const result: EtsyResult | null = mode === "forward" ? (forward.ok ? forward.result : null) : reverse.ok ? reverse.result.breakdown : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
          <Segmented
            name="etsy-mode"
            legend="What do you want to know?"
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            options={[
              { value: "forward", label: "Fees & profit" },
              { value: "reverse", label: "Price for a target profit" },
            ]}
            className="sm:col-span-2"
          />
          <SelectField
            id="etsy-market"
            label="Your bank account country"
            value={market}
            onChange={changeMarket}
            options={ETSY_MARKET_IDS.map((id) => ({ value: id, label: ETSY_MARKETS[id].label }))}
            help="Payment processing and regulatory fees depend on it."
            className="sm:col-span-2"
          />

          {mode === "forward" ? (
            <NumberField id="etsy-price" label="Item price" prefix={sym} value={itemPrice} onChange={setItemPrice} help="Price of one item." error={errors.itemPrice} />
          ) : (
            <NumberField
              id="etsy-target"
              label="Profit you want per order"
              prefix={sym}
              value={targetProfit}
              onChange={setTargetProfit}
              help="After all Etsy fees and your costs."
              error={errors.targetProfit}
            />
          )}
          <NumberField id="etsy-qty" label="Quantity in the order" value={quantity} onChange={setQuantity} inputMode="numeric" error={errors.quantity} />
          <NumberField
            id="etsy-ship-charged"
            label="Shipping charged to buyer"
            prefix={sym}
            value={shippingCharged}
            onChange={setShippingCharged}
            help="Enter 0 for free shipping."
            error={errors.shippingCharged}
          />
          <NumberField id="etsy-cost" label="Cost to make or buy (per item)" prefix={sym} value={itemCost} onChange={setItemCost} error={errors.itemCost} />
          <NumberField
            id="etsy-ship-cost"
            label="Your actual shipping cost"
            prefix={sym}
            value={shippingCost}
            onChange={setShippingCost}
            help="Label and postage for the order."
            error={errors.shippingCost}
          />
          <NumberField
            id="etsy-other"
            label="Other costs (optional)"
            prefix={sym}
            value={otherCosts}
            onChange={setOtherCosts}
            help="Packaging, inserts, etc. per order."
            error={errors.otherCosts}
          />

          <Segmented
            name="etsy-ads"
            legend="Sale came from an Offsite Ad?"
            value={offsiteAds}
            onChange={(v) => setOffsiteAds(v as OffsiteAds)}
            options={[
              { value: "none", label: "No" },
              { value: "standard", label: "Yes – 15%" },
              { value: "discounted", label: "Yes – 12%" },
            ]}
            className="sm:col-span-2"
          />

          <details className="sm:col-span-2 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900">More options: gift wrap, sales tax, VAT, currency</summary>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="etsy-gift" label="Gift wrap / personalisation charged" prefix={sym} value={giftWrap} onChange={setGiftWrap} placeholder="0" error={errors.giftWrap} />
              <NumberField
                id="etsy-tax"
                label="Sales tax Etsy collects"
                prefix={sym}
                value={salesTax}
                onChange={setSalesTax}
                placeholder="0"
                help="Adds to the processing-fee base only."
                error={errors.salesTax}
              />
              <NumberField
                id="etsy-vat"
                label="VAT / GST on Etsy fees"
                suffix="%"
                value={vatPct}
                onChange={setVatPct}
                help="Set 0 if you've given Etsy a VAT ID or none applies."
                error={errors.vatOnFeesRate}
              />
              {m.currency !== "USD" && (
                <NumberField
                  id="etsy-fx"
                  label={`${m.currency} per 1 USD`}
                  value={fx}
                  onChange={setFx}
                  help="Etsy bills the listing fee and the Offsite Ads cap in USD."
                  error={errors.usdToLocal}
                />
              )}
              <div className="sm:col-span-2">
                <CheckboxField
                  id="etsy-conv"
                  label="My listing currency is different from my bank currency (2.5% conversion fee)"
                  checked={conversion}
                  onChange={setConversion}
                />
              </div>
            </div>
          </details>
        </form>
      </Card>

      <div className="lg:col-span-2" id="etsy-result">
        <div className="scroll-mt-4 lg:sticky lg:top-6">
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{mode === "forward" ? "Your profit" : "Price to charge"}</h2>
            {!result ? (
              <div className="mt-3">
                <EmptyResult>Fix the highlighted fields to see your fees.</EmptyResult>
              </div>
            ) : (
              <div aria-live="polite">
                {mode === "reverse" && reverse.ok ? (
                  <>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{money(reverse.result.requiredItemPrice)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Item price{result.itemsSubtotal !== reverse.result.requiredItemPrice ? " (per item)" : ""} needed to keep {money(result.profit)} profit on this order after Etsy fees and your costs.
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`mt-2 text-3xl font-semibold tracking-tight ${result.profit < 0 ? "text-red-700" : "text-gray-900"}`}>{money(result.profit)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Profit on this order{result.margin !== null ? `, a ${formatPercent(result.margin, 1)} margin` : ""}. Etsy takes {money(result.totalFees)}
                      {result.feePercent !== null ? ` (${formatPercent(result.feePercent, 1)} of the order)` : ""}.
                    </p>
                  </>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatTile label="Etsy fees" value={money(result.totalFees)} sub={result.feePercent !== null ? `${formatPercent(result.feePercent, 1)} of order` : undefined} />
                  <StatTile label="Payout from Etsy" value={money(result.netPayout)} />
                </div>

                <dl className="mt-4">
                  <BreakdownRow label="Order total" value={money(result.orderTotal)} hint="Items + shipping + gift wrap" />
                  <BreakdownRow label="Listing fee" value={money(result.listingFee)} negative hint={`$${ETSY_FEES.global.listingFeeUSD.toFixed(2)} USD per item sold`} />
                  <BreakdownRow label="Transaction fee" value={money(result.transactionFee)} negative hint="6.5% of items + shipping + gift wrap" />
                  <BreakdownRow
                    label="Payment processing"
                    value={money(result.processingFee)}
                    negative
                    hint={`${formatPercent(m.processingRate, 0)} + ${money(m.processingFixed)} per order`}
                  />
                  {result.regulatoryFee > 0 && <BreakdownRow label="Regulatory Operating fee" value={money(result.regulatoryFee)} negative hint={`${formatPercent(m.regulatoryRate)} in ${m.label}`} />}
                  {offsiteAds !== "none" && (
                    <BreakdownRow label="Offsite Ads fee" value={money(result.offsiteAdsFee)} negative hint={result.offsiteAdsCapped ? "Capped at $100 USD per order" : `${offsiteAds === "standard" ? "15%" : "12%"} of order total`} />
                  )}
                  {result.currencyConversionFee > 0 && <BreakdownRow label="Currency conversion" value={money(result.currencyConversionFee)} negative hint="2.5% of order total" />}
                  {result.vatOnFees > 0 && <BreakdownRow label="VAT on fees" value={money(result.vatOnFees)} negative />}
                  <BreakdownRow label="Total Etsy fees" value={money(result.totalFees)} strong />
                  <BreakdownRow label="Product cost" value={money(result.productCost)} negative />
                  <BreakdownRow label="Your shipping cost" value={money(result.shippingCost)} negative />
                  {result.otherCosts > 0 && <BreakdownRow label="Other costs" value={money(result.otherCosts)} negative />}
                  <BreakdownRow label="Profit" value={money(result.profit)} strong />
                </dl>
                {base.quantity && base.quantity > 1 ? (
                  <p className="mt-2 text-xs text-gray-600">Profit per item: {money(result.profitPerItem)}</p>
                ) : null}
                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  {m.fxNote} Estimates use Etsy&apos;s published rates (checked {ETSY_FEES.lastVerified}); compare with your Payment account. Also selling elsewhere? Try the{" "}
                  <Link href="/ecommerce-fees/tiktok-shop-fee-calculator/" className="text-[#125FF9] hover:underline">
                    TikTok Shop fee calculator
                  </Link>{" "}
                  or the{" "}
                  <Link href="/business/stripe-fee-calculator/" className="text-[#125FF9] hover:underline">
                    Stripe fee calculator
                  </Link>
                  .
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <MobileResultBar label={mode === "forward" ? "Profit" : "Price to charge"} value={result ? (mode === "reverse" && reverse.ok ? money(reverse.result.requiredItemPrice) : money(result.profit)) : null} targetId="etsy-result" />
    </div>
  );
}
