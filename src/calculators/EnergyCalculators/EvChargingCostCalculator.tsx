"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BreakdownRow,
  Card,
  CheckboxField,
  EmptyResult,
  NumberField,
  SelectField,
  StatTile,
  MobileResultBar,
} from "@/components/calculator/Fields";
import { formatMoney, parseNumber, roundTo } from "@/lib/calc/money";
import {
  calculateEvCharging,
  ELECTRICITY_DATA,
  STATE_RATES,
  statePricePerKwh,
  type EfficiencyBasis,
} from "@/lib/calc/evCharging";

const usd = (n: number) => formatMoney(n, "USD");
const cents = (dollars: number) => `${roundTo(dollars * 100, 1).toFixed(1)}¢`;
const fromPct = (s: string) => {
  const v = parseNumber(s);
  return v === null ? null : v / 100;
};

export default function EvChargingCostCalculator() {
  const d = ELECTRICITY_DATA.defaults;
  const [battery, setBattery] = useState("75");
  const [current, setCurrent] = useState("20");
  const [target, setTarget] = useState("80");
  const [efficiency, setEfficiency] = useState(String(d.chargingEfficiency * 100));
  const [state, setState] = useState("");
  const [price, setPrice] = useState(String(roundTo(ELECTRICITY_DATA.usAverageCentsPerKwh / 100, 4)));
  const [miles, setMiles] = useState("1000");
  const [mpk, setMpk] = useState(String(d.milesPerKwh));
  const [basis, setBasis] = useState<EfficiencyBasis>("display");
  const [compareGas, setCompareGas] = useState(true);
  const [mpg, setMpg] = useState(String(d.gasMpg));
  const [gasPrice, setGasPrice] = useState(String(ELECTRICITY_DATA.gasoline.defaultPricePerGallon));

  const pickState = (code: string) => {
    setState(code);
    if (code === "") setPrice(String(roundTo(ELECTRICITY_DATA.usAverageCentsPerKwh / 100, 4)));
    else {
      const p = statePricePerKwh(code);
      if (p !== null) setPrice(String(p));
    }
  };

  const out = calculateEvCharging({
    batteryKwh: parseNumber(battery),
    currentPercent: parseNumber(current),
    targetPercent: parseNumber(target),
    chargingEfficiency: fromPct(efficiency),
    pricePerKwh: parseNumber(price),
    monthlyMiles: parseNumber(miles),
    milesPerKwh: parseNumber(mpk),
    efficiencyBasis: basis,
    compareGas,
    gasMpg: parseNumber(mpg),
    gasPricePerGallon: parseNumber(gasPrice),
  });
  const errors = out.ok ? {} : out.errors;
  const r = out.ok ? out.result : null;
  const stateName = STATE_RATES.find((s) => s.code === state)?.name;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
          <NumberField id="ev-battery" label="Battery capacity" suffix="kWh" value={battery} onChange={setBattery} help="Usable capacity, from your car's specs." error={errors.batteryKwh} />
          <NumberField
            id="ev-eff"
            label="Charging efficiency"
            suffix="%"
            value={efficiency}
            onChange={setEfficiency}
            help="Energy that reaches the battery. 85–90% is typical at home."
            error={errors.chargingEfficiency}
          />
          <NumberField id="ev-current" label="Current charge" suffix="%" value={current} onChange={setCurrent} error={errors.currentPercent} />
          <NumberField id="ev-target" label="Charge to" suffix="%" value={target} onChange={setTarget} error={errors.targetPercent} />

          <SelectField
            id="ev-state"
            label="State (optional)"
            value={state}
            onChange={pickState}
            options={[
              { value: "", label: `U.S. average (${ELECTRICITY_DATA.usAverageCentsPerKwh}¢)` },
              ...STATE_RATES.map((s) => ({ value: s.code, label: `${s.name} (${s.centsPerKwh}¢)` })),
            ]}
            help={`EIA average residential price, ${ELECTRICITY_DATA.dataPeriodLabel}.`}
          />
          <NumberField
            id="ev-price"
            label="Electricity price"
            prefix="$"
            suffix="per kWh"
            value={price}
            onChange={(v) => {
              setPrice(v);
              setState("");
            }}
            help="Best: the rate on your own bill (e.g. 0.16 for 16¢)."
            error={errors.pricePerKwh}
          />

          <NumberField id="ev-miles" label="Miles driven per month" suffix="mi" value={miles} onChange={setMiles} error={errors.monthlyMiles} />
          <NumberField id="ev-mpk" label="Vehicle efficiency" suffix="mi/kWh" value={mpk} onChange={setMpk} error={errors.milesPerKwh} />
          <SelectField
            id="ev-basis"
            label="Where does that efficiency figure come from?"
            value={basis}
            onChange={(v) => setBasis(v as EfficiencyBasis)}
            options={[
              { value: "display", label: "My car's display (battery to wheels)" },
              { value: "epa", label: "EPA label (already includes charging losses)" },
            ]}
            className="sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <CheckboxField id="ev-gas" label="Compare with a gasoline car" checked={compareGas} onChange={setCompareGas} />
          </div>
          {compareGas && (
            <>
              <NumberField id="ev-mpg" label="Gas car fuel economy" suffix="MPG" value={mpg} onChange={setMpg} error={errors.gasMpg} />
              <NumberField
                id="ev-gasprice"
                label="Gas price"
                prefix="$"
                suffix="/gal"
                value={gasPrice}
                onChange={setGasPrice}
                help={ELECTRICITY_DATA.gasoline.label}
                error={errors.gasPricePerGallon}
              />
            </>
          )}
        </form>
      </Card>

      <div className="lg:col-span-2" id="ev-result">
        <div className="scroll-mt-4 lg:sticky lg:top-6">
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Charging cost</h2>
            {!r ? (
              <div className="mt-3">
                <EmptyResult>Fix the highlighted fields to see your charging cost.</EmptyResult>
              </div>
            ) : (
              <div aria-live="polite">
                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{usd(r.sessionCost)}</p>
                <p className="mt-1 text-sm text-gray-600">
                  To charge from {current}% to {target}%{stateName ? ` at ${stateName}'s average rate` : ""}, adding about {r.milesAddedPerSession.toLocaleString("en-US")} miles of range.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatTile label="Per mile" value={cents(r.costPerMile)} sub={`${usd(r.costPer100Miles)} per 100 mi`} />
                  <StatTile label="Per month" value={usd(r.monthlyCost)} sub={`${(parseNumber(miles) ?? 0).toLocaleString("en-US")} mi`} />
                </div>

                <dl className="mt-4">
                  <BreakdownRow label="Energy added to battery" value={`${r.batteryEnergyKwh} kWh`} />
                  <BreakdownRow label="Electricity from the grid" value={`${r.gridEnergyKwh} kWh`} hint={`Includes ${r.lossesKwh} kWh lost while charging`} />
                  <BreakdownRow label="Electricity price" value={`${cents(r.pricePerKwh)}/kWh`} />
                  <BreakdownRow label="Cost per kWh in the battery" value={`${cents(r.costPerKwhStored)}/kWh`} />
                  <BreakdownRow label="Cost of this charge" value={usd(r.sessionCost)} strong />
                  <BreakdownRow label="Weekly" value={usd(r.weeklyCost)} />
                  <BreakdownRow label="Monthly" value={usd(r.monthlyCost)} hint={`${r.monthlyGridKwh} kWh from the grid`} />
                  <BreakdownRow label="Yearly" value={usd(r.annualCost)} strong />
                </dl>

                {r.gas && (
                  <div className="mt-4 rounded-2xl border border-black/10 bg-gray-50/70 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">EV vs gasoline</h3>
                    <dl className="mt-1">
                      <BreakdownRow label="Gas car per mile" value={cents(r.gas.costPerMile)} hint={`${usd(r.gas.costPer100Miles)} per 100 mi`} />
                      <BreakdownRow label="Gas car per month" value={usd(r.gas.monthlyCost)} hint={`${r.gas.gallonsPerMonth} gallons`} />
                      <BreakdownRow label={r.gas.monthlySavings >= 0 ? "EV saves per month" : "EV costs more per month"} value={usd(Math.abs(r.gas.monthlySavings))} />
                      <BreakdownRow label={r.gas.annualSavings >= 0 ? "EV saves per year" : "EV costs more per year"} value={usd(Math.abs(r.gas.annualSavings))} strong />
                    </dl>
                  </div>
                )}

                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  Home charging only; public DC fast charging is usually priced per kWh or per minute at higher rates. Fuel and electricity costs only, not maintenance or insurance. Financing a new EV? Estimate the payment with the{" "}
                  <Link href="/finance/loan-emi-calculator/" className="text-[#125FF9] hover:underline">
                    loan calculator
                  </Link>
                  .
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <MobileResultBar label={"Cost of this charge"} value={r ? usd(r.sessionCost) : null} targetId="ev-result" />
    </div>
  );
}
