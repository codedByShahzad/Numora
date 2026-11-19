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
  calculateTikTok,
  reverseTikTok,
  TIKTOK_COUNTRIES,
  TIKTOK_COUNTRY_IDS,
  TIKTOK_FEES,
  type TikTokCountryId,
  type TikTokInput,
  type TikTokResult,
} from "@/lib/calc/tiktokShop";

type Mode = "forward" | "reverse";

const toRate = (s: string) => {
  const v = parseNumber(s);
  return v === null ? null : v / 100;
};

export default function TikTokShopFeeCalculator() {
  const [mode, setMode] = useState<Mode>("forward");
  const [country, setCountry] = useState<TikTokCountryId>("US");
  const [preset, setPreset] = useState(TIKTOK_COUNTRIES.US.defaultPreset);
  const [customRate, setCustomRate] = useState("8");
  const [price, setPrice] = useState("30");
  const [targetProfit, setTargetProfit] = useState("10");
  const [discount, setDiscount] = useState("0");
  const [affiliateOn, setAffiliateOn] = useState(true);
  const [affiliateRate, setAffiliateRate] = useState("15");
  const [productCost, setProductCost] = useState("8");
  const [shippingCost, setShippingCost] = useState("5");
  const [extraFees, setExtraFees] = useState("0");
  const [quantity, setQuantity] = useState("50");

  const c = TIKTOK_COUNTRIES[country];
  const sym = currencySymbol(c.currency);
  const money = (n: number) => formatMoney(n, c.currency);

  const changeCountry = (id: string) => {
    setCountry(id as TikTokCountryId);
    setPreset(TIKTOK_COUNTRIES[id as TikTokCountryId].defaultPreset);
  };

  const base: Omit<TikTokInput, "sellingPrice"> = {
    country,
    ratePreset: preset,
    customRate: toRate(customRate),
    sellerDiscount: parseNumber(discount),
    affiliateEnabled: affiliateOn,
    affiliateRate: toRate(affiliateRate),
    productCost: parseNumber(productCost),
    shippingCost: parseNumber(shippingCost),
    additionalFees: parseNumber(extraFees),
    quantity: parseNumber(quantity),
  };
  const forward = calculateTikTok({ ...base, sellingPrice: parseNumber(price) });
  const reverse = reverseTikTok(base, parseNumber(targetProfit));
  const active = mode === "forward" ? forward : reverse;
  const errors = active.ok ? {} : active.errors;
  const r: TikTokResult | null = mode === "forward" ? (forward.ok ? forward.result : null) : reverse.ok ? reverse.result.breakdown : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
          <Segmented
            name="tt-mode"
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
            id="tt-country"
            label="Shop country"
            value={country}
            onChange={changeCountry}
            options={TIKTOK_COUNTRY_IDS.map((id) => ({ value: id, label: TIKTOK_COUNTRIES[id].label }))}
          />
          <SelectField
            id="tt-rate"
            label={`${c.feeName} rate`}
            value={preset}
            onChange={setPreset}
            options={[...c.presets.map((p) => ({ value: p.id, label: p.label })), { value: "custom", label: "Custom rate…" }]}
            help="Check your category's rate in Seller Center."
            error={preset !== "custom" ? errors.customRate : undefined}
          />
          {preset === "custom" && (
            <NumberField
              id="tt-custom"
              label={`Custom ${c.feeName.toLowerCase()} rate`}
              suffix="%"
              value={customRate}
              onChange={setCustomRate}
              help="The rate shown for your product in Seller Center."
              error={errors.customRate}
              className="sm:col-span-2"
            />
          )}

          {mode === "forward" ? (
            <NumberField id="tt-price" label="Selling price" prefix={sym} value={price} onChange={setPrice} help="Listed price for one order." error={errors.sellingPrice} />
          ) : (
            <NumberField
              id="tt-target"
              label="Profit you want per order"
              prefix={sym}
              value={targetProfit}
              onChange={setTargetProfit}
              help="After fees, commissions and costs."
              error={errors.targetProfit}
            />
          )}
          <NumberField
            id="tt-discount"
            label="Seller-funded discount"
            prefix={sym}
            value={discount}
            onChange={setDiscount}
            help="Coupons or promotions you pay for, per order."
            error={errors.sellerDiscount}
          />
          <NumberField id="tt-cost" label="Product cost" prefix={sym} value={productCost} onChange={setProductCost} help="What one unit costs you." error={errors.productCost} />
          <NumberField
            id="tt-ship"
            label="Shipping / fulfilment cost"
            prefix={sym}
            value={shippingCost}
            onChange={setShippingCost}
            help="Label, FBT or 3PL cost per order."
            error={errors.shippingCost}
          />

          <div className="sm:col-span-2 space-y-3">
            <CheckboxField
              id="tt-aff-on"
              label="This sale goes through a creator affiliate"
              checked={affiliateOn}
              onChange={setAffiliateOn}
              help="Creator commission is deducted from your settlement."
            />
          </div>
          {affiliateOn && (
            <NumberField id="tt-aff" label="Affiliate commission rate" suffix="%" value={affiliateRate} onChange={setAffiliateRate} error={errors.affiliateRate} />
          )}
          <NumberField
            id="tt-extra"
            label="Other fees per order (optional)"
            prefix={sym}
            value={extraFees}
            onChange={setExtraFees}
            help="Shop Ads, programme fees, packaging."
            error={errors.additionalFees}
          />
          <NumberField id="tt-qty" label="Number of orders" value={quantity} onChange={setQuantity} inputMode="numeric" help="For total profit." error={errors.quantity} />
        </form>
      </Card>

      <div className="lg:col-span-2" id="tt-result">
        <div className="scroll-mt-4 lg:sticky lg:top-6">
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{mode === "forward" ? "Profit per order" : "Price to charge"}</h2>
            {!r ? (
              <div className="mt-3">
                <EmptyResult>Fix the highlighted fields to see your profit.</EmptyResult>
              </div>
            ) : (
              <div aria-live="polite">
                {mode === "reverse" && reverse.ok ? (
                  <>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{money(reverse.result.requiredPrice)}</p>
                    <p className="mt-1 text-sm text-gray-600">Selling price needed to keep {money(r.profitPerOrder)} per order after TikTok&apos;s fee, affiliate commission and your costs.</p>
                  </>
                ) : (
                  <>
                    <p className={`mt-2 text-3xl font-semibold tracking-tight ${r.profitPerOrder < 0 ? "text-red-700" : "text-gray-900"}`}>{money(r.profitPerOrder)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {r.margin !== null ? `${formatPercent(r.margin, 1)} margin. ` : ""}
                      {r.quantity > 1 ? `${money(r.totalProfit)} across ${r.quantity.toLocaleString("en-US")} orders.` : ""}
                    </p>
                  </>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatTile label="Net payout / order" value={money(r.netPayout)} />
                  <StatTile label={`Total profit (${r.quantity.toLocaleString("en-US")})`} value={money(r.totalProfit)} tone={r.totalProfit < 0 ? "bad" : r.totalProfit > 0 ? "good" : "default"} />
                </div>

                <dl className="mt-4">
                  <BreakdownRow label="Customer pays" value={money(r.customerPayment)} hint={r.sellerDiscount > 0 ? `After your ${money(r.sellerDiscount)} discount` : "Excluding tax"} />
                  <BreakdownRow label={`${c.feeName} (${formatPercent(r.commissionRate, 1)})`} value={money(r.platformCommission)} negative hint={c.processingIncluded ? "Includes payment processing" : undefined} />
                  {affiliateOn && <BreakdownRow label="Affiliate commission" value={money(r.affiliateCommission)} negative />}
                  {r.additionalFees > 0 && <BreakdownRow label="Other fees" value={money(r.additionalFees)} negative />}
                  <BreakdownRow label="Net payout" value={money(r.netPayout)} strong />
                  <BreakdownRow label="Product cost" value={money(r.productCost)} negative />
                  <BreakdownRow label="Shipping / fulfilment" value={money(r.shippingCost)} negative />
                  <BreakdownRow label="Profit per order" value={money(r.profitPerOrder)} strong />
                  <BreakdownRow label="Total deductions from price" value={money(r.totalDeductions)} hint="Discount + fees + costs" />
                </dl>

                <details className="mt-3 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-900">Not included in this result</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-gray-700">
                    {c.notIncluded.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </details>
                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  {c.rateNote} Rates checked {TIKTOK_FEES.lastVerified}. Selling on Etsy too? Compare with the{" "}
                  <Link href="/ecommerce-fees/etsy-fee-calculator/" className="text-[#125FF9] hover:underline">
                    Etsy fee calculator
                  </Link>
                  .
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <MobileResultBar label={mode === "forward" ? "Profit per order" : "Price to charge"} value={r ? (mode === "reverse" && reverse.ok ? money(reverse.result.requiredPrice) : money(r.profitPerOrder)) : null} targetId="tt-result" />
    </div>
  );
}
