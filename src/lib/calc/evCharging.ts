/**
 * EV charging cost calculator. State price presets live in
 * src/data/energy/electricity-prices.json.
 */
import data from "@/data/energy/electricity-prices.json";
import { roundMoney, roundTo, type CalcOutcome, type FieldErrors } from "./money";

export const ELECTRICITY_DATA = data;
export type StateRate = { code: string; name: string; centsPerKwh: number };
export const STATE_RATES: StateRate[] = data.states;

/**
 * "display": miles per kWh taken out of the battery (what most cars show).
 * "epa": EPA label figure, measured from the wall, so charging losses are already in it.
 */
export type EfficiencyBasis = "display" | "epa";

export type EvInput = {
  batteryKwh: number | null;
  currentPercent: number | null;
  targetPercent: number | null;
  /** Charging efficiency as a decimal (0.88). */
  chargingEfficiency: number | null;
  /** Electricity price in dollars per kWh. */
  pricePerKwh: number | null;
  monthlyMiles: number | null;
  milesPerKwh: number | null;
  efficiencyBasis: EfficiencyBasis;
  compareGas: boolean;
  gasMpg?: number | null;
  gasPricePerGallon?: number | null;
};

export type EvField =
  | "batteryKwh"
  | "currentPercent"
  | "targetPercent"
  | "chargingEfficiency"
  | "pricePerKwh"
  | "monthlyMiles"
  | "milesPerKwh"
  | "gasMpg"
  | "gasPricePerGallon";

export type EvResult = {
  batteryEnergyKwh: number;
  gridEnergyKwh: number;
  lossesKwh: number;
  sessionCost: number;
  pricePerKwh: number;
  /** Cost of each kWh that actually ends up in the battery. */
  costPerKwhStored: number;
  milesAddedPerSession: number;
  costPerMile: number;
  costPer100Miles: number;
  monthlyGridKwh: number;
  weeklyCost: number;
  monthlyCost: number;
  annualCost: number;
  gas: null | {
    costPerMile: number;
    costPer100Miles: number;
    monthlyCost: number;
    annualCost: number;
    monthlySavings: number;
    annualSavings: number;
    gallonsPerMonth: number;
  };
};

function range(
  e: FieldErrors<EvField>,
  f: EvField,
  v: number | null | undefined,
  min: number,
  max: number,
  msg: string,
  { minExclusive = false } = {}
) {
  if (v === null || v === undefined || Number.isNaN(v) || v > max || (minExclusive ? v <= min : v < min)) e[f] = msg;
}

export function validateEv(input: EvInput): FieldErrors<EvField> {
  const e: FieldErrors<EvField> = {};
  range(e, "batteryKwh", input.batteryKwh, 1, 300, "Battery capacity must be between 1 and 300 kWh.");
  range(e, "currentPercent", input.currentPercent, 0, 100, "Current charge must be between 0% and 100%.");
  range(e, "targetPercent", input.targetPercent, 0, 100, "Target charge must be between 0% and 100%.");
  if (!e.currentPercent && !e.targetPercent && (input.targetPercent as number) <= (input.currentPercent as number)) {
    e.targetPercent = "Target charge must be higher than the current charge.";
  }
  range(e, "chargingEfficiency", input.chargingEfficiency, 0.5, 1, "Charging efficiency must be between 50% and 100%.");
  range(e, "pricePerKwh", input.pricePerKwh, 0, 2, "Electricity price must be between $0 and $2.00 per kWh.");
  range(e, "monthlyMiles", input.monthlyMiles, 0, 20_000, "Monthly miles must be between 0 and 20,000.");
  range(e, "milesPerKwh", input.milesPerKwh, 0.5, 10, "Efficiency must be between 0.5 and 10 miles per kWh.");
  if (input.compareGas) {
    range(e, "gasMpg", input.gasMpg, 5, 150, "Fuel economy must be between 5 and 150 MPG.");
    range(e, "gasPricePerGallon", input.gasPricePerGallon, 0, 20, "Gas price must be between $0 and $20 per gallon.");
  }
  return e;
}

export function calculateEvCharging(input: EvInput): CalcOutcome<EvResult, EvField> {
  const errors = validateEv(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const cap = input.batteryKwh!;
  const eff = input.chargingEfficiency!;
  const price = input.pricePerKwh!;
  const mpk = input.milesPerKwh!;

  const batteryEnergyKwh = (cap * (input.targetPercent! - input.currentPercent!)) / 100;
  const gridEnergyKwh = batteryEnergyKwh / eff;
  const sessionCost = gridEnergyKwh * price;

  // Grid kWh needed per mile. An EPA (wall-to-wheels) figure already includes losses.
  const gridKwhPerMile = input.efficiencyBasis === "epa" ? 1 / mpk : 1 / (mpk * eff);
  const batteryMilesPerKwh = input.efficiencyBasis === "epa" ? mpk / eff : mpk;
  const costPerMile = price * gridKwhPerMile;
  const monthlyGridKwh = input.monthlyMiles! * gridKwhPerMile;
  const monthlyCost = monthlyGridKwh * price;

  let gas: EvResult["gas"] = null;
  if (input.compareGas) {
    const gasPerMile = input.gasPricePerGallon! / input.gasMpg!;
    const gasMonthly = input.monthlyMiles! * gasPerMile;
    gas = {
      costPerMile: roundTo(gasPerMile, 4),
      costPer100Miles: roundMoney(gasPerMile * 100),
      monthlyCost: roundMoney(gasMonthly),
      annualCost: roundMoney(gasMonthly * 12),
      monthlySavings: roundMoney(gasMonthly - monthlyCost),
      annualSavings: roundMoney((gasMonthly - monthlyCost) * 12),
      gallonsPerMonth: roundTo(input.monthlyMiles! / input.gasMpg!, 2),
    };
  }

  return {
    ok: true,
    result: {
      batteryEnergyKwh: roundTo(batteryEnergyKwh, 2),
      gridEnergyKwh: roundTo(gridEnergyKwh, 2),
      lossesKwh: roundTo(gridEnergyKwh - batteryEnergyKwh, 2),
      sessionCost: roundMoney(sessionCost),
      pricePerKwh: price,
      costPerKwhStored: roundTo(price / eff, 4),
      milesAddedPerSession: roundTo(batteryEnergyKwh * batteryMilesPerKwh, 0),
      costPerMile: roundTo(costPerMile, 4),
      costPer100Miles: roundMoney(costPerMile * 100),
      monthlyGridKwh: roundTo(monthlyGridKwh, 1),
      weeklyCost: roundMoney((monthlyCost * 12) / 52),
      monthlyCost: roundMoney(monthlyCost),
      annualCost: roundMoney(monthlyCost * 12),
      gas,
    },
  };
}

/** State preset in dollars per kWh (EIA publishes cents). */
export function statePricePerKwh(code: string): number | null {
  const s = STATE_RATES.find((r) => r.code === code);
  return s ? roundTo(s.centsPerKwh / 100, 4) : null;
}
