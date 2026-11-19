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
  calculateStripe,
  compareCardTypes,
  paypalCountry,
  paypalQuotes,
  reverseStripe,
  STRIPE_COUNTRIES,
  STRIPE_COUNTRY_IDS,
  STRIPE_FEES,
  type StripeCountryId,
  type StripeInput,
  type StripeResult,
} from "@/lib/calc/stripe";

type Mode = "forward" | "reverse";

export default function StripeFeeCalculator() {
  const [mode, setMode] = useState<Mode>("forward");
  const [country, setCountry] = useState<StripeCountryId>("US");
  const [method, setMethod] = useState("card_online");
  const [cardType, setCardType] = useState("domestic");
  const [amount, setAmount] = useState("100");
  const [targetNet, setTargetNet] = useState("100");
  const [conversion, setConversion] = useState(false);
  const [manual, setManual] = useState(false);
  const [customOn, setCustomOn] = useState(false);
  const [customRate, setCustomRate] = useState("2.5");
  const [customFixed, setCustomFixed] = useState("0.30");

  const c = STRIPE_COUNTRIES[country];
  const m = c.methods[method] ?? c.methods.card_online;
  const sym = currencySymbol(c.currency);
  const money = (n: number) => formatMoney(n, c.currency);

  const changeCountry = (id: string) => {
    setCountry(id as StripeCountryId);
    setMethod("card_online");
    setCardType("domestic");
  };
  const changeMethod = (id: string) => {
    setMethod(id);
    setCardType("domestic");
  };

  const input: StripeInput = {
    country,
    method,
    cardType,
    amount: parseNumber(amount),
    currencyConversion: conversion && m.currencyConversionRate !== null,
    manualEntry: manual && m.manualEntryRate !== null,
    custom: customOn
      ? {
          enabled: true,
          rate: (() => {
            const v = parseNumber(customRate);
            return v === null ? null : v / 100;
          })(),
          fixed: parseNumber(customFixed),
        }
      : undefined,
  };

  const forward = calculateStripe(input);
  const reverse = reverseStripe(input, parseNumber(targetNet));
  const active = mode === "forward" ? forward : reverse;
  const errors = active.ok ? {} : active.errors;
  const r: StripeResult | null = mode === "forward" ? (forward.ok ? forward.result : null) : reverse.ok ? reverse.result.breakdown : null;

  const charged = r?.amount ?? 0;
  const international = cardType !== "domestic";
  const pp = r ? paypalQuotes(country, charged, international) : [];
  const ppCountry = paypalCountry(country);
  const comparison = r ? compareCardTypes({ ...input, amount: charged }) : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
          <Segmented
            name="stripe-mode"
            legend="What do you want to know?"
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            options={[
              { value: "forward", label: "Fee on a payment" },
              { value: "reverse", label: "What to charge" },
            ]}
            className="sm:col-span-2"
          />

          {mode === "forward" ? (
            <NumberField id="stripe-amount" label="Payment amount" prefix={sym} value={amount} onChange={setAmount} error={errors.amount} className="sm:col-span-2" />
          ) : (
            <NumberField
              id="stripe-net"
              label="Amount you want to receive"
              prefix={sym}
              value={targetNet}
              onChange={setTargetNet}
              help="After Stripe's fees."
              error={errors.targetNet}
              className="sm:col-span-2"
            />
          )}

          <SelectField
            id="stripe-country"
            label="Stripe account country"
            value={country}
            onChange={changeCountry}
            options={STRIPE_COUNTRY_IDS.map((id) => ({ value: id, label: STRIPE_COUNTRIES[id].label }))}
            help="Other countries: use a custom rate below."
          />
          <SelectField
            id="stripe-method"
            label="Payment method"
            value={method}
            onChange={changeMethod}
            options={Object.entries(c.methods).map(([id, mm]) => ({ value: id, label: mm.label }))}
            error={errors.method}
          />
          <SelectField
            id="stripe-card"
            label={method === "ach_debit" ? "Account type" : "Card type"}
            value={cardType}
            onChange={setCardType}
            options={Object.entries(m.cardTypes).map(([id, ct]) => ({ value: id, label: `${ct.label} – ${formatPercent(ct.rate, 2)}${ct.fixed ? ` + ${money(ct.fixed)}` : ""}` }))}
            className="sm:col-span-2"
          />

          <div className="space-y-3 sm:col-span-2">
            {m.currencyConversionRate !== null && (
              <CheckboxField
                id="stripe-conv"
                label={`Currency conversion needed (+${formatPercent(m.currencyConversionRate, 0)})`}
                checked={conversion}
                onChange={setConversion}
                help="The customer pays in a different currency from your payout currency."
              />
            )}
            {m.manualEntryRate !== null && (
              <CheckboxField
                id="stripe-manual"
                label={`Card details typed in manually (+${formatPercent(m.manualEntryRate, 1)})`}
                checked={manual}
                onChange={setManual}
                help="For example through the Dashboard or a virtual terminal."
              />
            )}
            <CheckboxField
              id="stripe-custom"
              label="Use my own rate (custom or negotiated pricing)"
              checked={customOn}
              onChange={setCustomOn}
              help="Replaces the published card rate and card-type surcharge."
            />
          </div>
          {customOn && (
            <>
              <NumberField id="stripe-custom-rate" label="Custom percentage" suffix="%" value={customRate} onChange={setCustomRate} error={errors.customRate} />
              <NumberField id="stripe-custom-fixed" label="Custom fixed fee" prefix={sym} value={customFixed} onChange={setCustomFixed} error={errors.customFixed} />
            </>
          )}
        </form>
      </Card>

      <div className="lg:col-span-2" id="stripe-result">
        <div className="scroll-mt-4 lg:sticky lg:top-6">
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{mode === "forward" ? "Stripe fee" : "Charge your customer"}</h2>
            {!r ? (
              <div className="mt-3">
                <EmptyResult>Fix the highlighted fields to see the fee.</EmptyResult>
              </div>
            ) : (
              <div aria-live="polite">
                {mode === "reverse" && reverse.ok ? (
                  <>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{money(reverse.result.requiredCharge)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Charge this to receive {money(r.net)} after a {money(r.totalFee)} fee.
                      {!r.capApplied && ` Formula: (${money(parseNumber(targetNet) ?? 0)} + ${money(r.fixedFee)}) ÷ (1 − ${formatPercent(reverse.result.totalPercentage, 2)}), then checked against Stripe's rounding to the cent.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{money(r.totalFee)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      You receive {money(r.net)} from a {money(r.amount)} payment, an effective rate of {formatPercent(r.effectiveRate, 2)}.
                    </p>
                  </>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatTile label="Net received" value={money(r.net)} />
                  <StatTile label="Effective rate" value={formatPercent(r.effectiveRate, 2)} />
                </div>

                <dl className="mt-4">
                  <BreakdownRow label="Payment amount" value={money(r.amount)} />
                  {r.capApplied ? (
                    <BreakdownRow label="Processing fee (capped)" value={money(r.totalFee)} negative hint="Fee cap reached" />
                  ) : (
                    <>
                      <BreakdownRow label="Base processing fee" value={money(r.baseFee)} negative hint={`${formatPercent(r.baseRate, 2)} of the amount`} />
                      {r.cardSurchargeRate > 0 && (
                        <BreakdownRow
                          label={country === "US" ? "International card surcharge" : "Card-type surcharge"}
                          value={money(r.cardSurcharge)}
                          negative
                          hint={`+${formatPercent(r.cardSurchargeRate, 2)}`}
                        />
                      )}
                      {r.conversionRate > 0 && <BreakdownRow label="Currency conversion" value={money(r.conversionFee)} negative hint={`+${formatPercent(r.conversionRate, 0)}`} />}
                      {r.manualEntryRate > 0 && <BreakdownRow label="Manual entry" value={money(r.manualEntryFee)} negative hint={`+${formatPercent(r.manualEntryRate, 1)}`} />}
                      <BreakdownRow label="Fixed fee" value={money(r.fixedFee)} negative />
                    </>
                  )}
                  <BreakdownRow label="Total Stripe fees" value={money(r.totalFee)} strong />
                  <BreakdownRow label="You receive" value={money(r.net)} strong />
                </dl>

                {comparison.length > 1 && !customOn && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-900">Same payment, other card types</h3>
                    <table className="mt-2 w-full text-left text-xs">
                      <thead className="text-gray-500">
                        <tr>
                          <th scope="col" className="py-1 font-medium">Card</th>
                          <th scope="col" className="py-1 text-right font-medium">Fee</th>
                          <th scope="col" className="py-1 text-right font-medium">You get</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.map((row) => (
                          <tr key={row.cardType} className={`border-t border-black/5 ${row.cardType === cardType ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                            <td className="py-1.5">{row.label}</td>
                            <td className="py-1.5 text-right tabular-nums">{money(row.result.totalFee)}</td>
                            <td className="py-1.5 text-right tabular-nums">{money(row.result.net)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {pp.length > 0 && ppCountry && (
                  <div className="mt-4 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">Stripe vs PayPal on {money(charged)}</h3>
                    <dl className="mt-1">
                      <BreakdownRow label="Stripe" value={money(r.totalFee)} hint={`You get ${money(r.net)}`} />
                      {pp.map((q) => (
                        <BreakdownRow key={q.product} label={`PayPal – ${q.label}`} value={money(q.fee)} hint={`${formatPercent(q.rate, 2)} + ${money(q.fixed)} · you get ${money(q.net)}`} />
                      ))}
                    </dl>
                    <p className="mt-1 text-xs text-gray-500">
                      {international ? `${ppCountry.internationalNote} ` : ""}PayPal&apos;s currency conversion spread is not included.
                    </p>
                  </div>
                )}

                <details className="mt-3 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-900">Fees not included</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-gray-700">
                    {c.otherFees.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </details>
                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  Standard published pricing for {c.label}, last checked {STRIPE_FEES.lastVerified}. Your Dashboard shows the exact fee on each payment. Selling on a marketplace? See the{" "}
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
      <MobileResultBar label={mode === "forward" ? "Stripe fee" : "Charge"} value={r ? (mode === "reverse" && reverse.ok ? money(reverse.result.requiredCharge) : money(r.totalFee)) : null} targetId="stripe-result" />
    </div>
  );
}
