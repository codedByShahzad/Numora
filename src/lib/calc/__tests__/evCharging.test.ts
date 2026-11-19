import { describe, expect, it } from "vitest";
import { calculateEvCharging, statePricePerKwh, STATE_RATES, type EvInput } from "../evCharging";
import data from "@/data/energy/electricity-prices.json";

const base: EvInput = {
  batteryKwh: 75,
  currentPercent: 20,
  targetPercent: 80,
  chargingEfficiency: 0.9,
  pricePerKwh: 0.15,
  monthlyMiles: 1000,
  milesPerKwh: 3.5,
  efficiencyBasis: "display",
  compareGas: true,
  gasMpg: 30,
  gasPricePerGallon: 3.99,
};

function run(over: Partial<EvInput>) {
  const out = calculateEvCharging({ ...base, ...over });
  if (!out.ok) throw new Error(JSON.stringify(out.errors));
  return out.result;
}

describe("charging session", () => {
  it("75 kWh from 20% to 80% at 90% efficiency and $0.15/kWh", () => {
    const r = run({});
    expect(r.batteryEnergyKwh).toBe(45);
    expect(r.gridEnergyKwh).toBe(50);
    expect(r.lossesKwh).toBe(5);
    expect(r.sessionCost).toBe(7.5);
    expect(r.costPerKwhStored).toBeCloseTo(0.1667, 4);
    expect(r.milesAddedPerSession).toBe(158); // 45 × 3.5 = 157.5
  });

  it("monthly, weekly and annual costs", () => {
    const r = run({});
    expect(r.costPerMile).toBeCloseTo(0.0476, 4); // 0.15 / (3.5 × 0.9)
    expect(r.costPer100Miles).toBe(4.76);
    expect(r.monthlyGridKwh).toBe(317.5);
    expect(r.monthlyCost).toBe(47.62);
    expect(r.annualCost).toBe(571.43);
    expect(r.weeklyCost).toBe(10.99);
  });

  it("an EPA (wall-to-wheels) figure is not divided by efficiency again", () => {
    expect(run({ efficiencyBasis: "epa" }).costPerMile).toBeCloseTo(0.0429, 4);
  });

  it("gas comparison", () => {
    const g = run({}).gas!;
    expect(g.costPerMile).toBeCloseTo(0.133, 4);
    expect(g.monthlyCost).toBe(133);
    expect(g.monthlySavings).toBe(85.38);
    expect(g.annualSavings).toBe(1024.57);
  });

  it("no gas block when comparison is off; zero miles works", () => {
    const r = run({ compareGas: false, monthlyMiles: 0 });
    expect(r.gas).toBeNull();
    expect(r.monthlyCost).toBe(0);
  });

  it("0% to 100% at 100% efficiency", () => {
    const r = run({ currentPercent: 0, targetPercent: 100, chargingEfficiency: 1 });
    expect(r.gridEnergyKwh).toBe(75);
    expect(r.sessionCost).toBe(11.25);
  });
});

describe("validation", () => {
  it("rejects a target at or below the current charge", () => {
    const out = calculateEvCharging({ ...base, currentPercent: 80, targetPercent: 80 });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errors.targetPercent).toBeTruthy();
  });
  it("rejects impossible percentages and efficiencies", () => {
    const out = calculateEvCharging({ ...base, currentPercent: -5, targetPercent: 120, chargingEfficiency: 0.3, batteryKwh: 0 });
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.errors.currentPercent).toBeTruthy();
      expect(out.errors.targetPercent).toBeTruthy();
      expect(out.errors.chargingEfficiency).toBeTruthy();
      expect(out.errors.batteryKwh).toBeTruthy();
    }
  });
  it("requires gas inputs only when comparing", () => {
    expect(calculateEvCharging({ ...base, compareGas: false, gasMpg: null }).ok).toBe(true);
    expect(calculateEvCharging({ ...base, compareGas: true, gasMpg: null }).ok).toBe(false);
  });
  it("rejects empty price", () => {
    expect(calculateEvCharging({ ...base, pricePerKwh: null }).ok).toBe(false);
  });
});

describe("state data", () => {
  it("has 50 states + DC with plausible prices", () => {
    expect(STATE_RATES).toHaveLength(51);
    for (const s of STATE_RATES) {
      expect(s.centsPerKwh).toBeGreaterThan(5);
      expect(s.centsPerKwh).toBeLessThan(60);
    }
    expect(data.dataPeriod).toBe("2026-08");
  });
  it("converts cents to dollars", () => {
    expect(statePricePerKwh("CA")).toBe(0.2975);
    expect(statePricePerKwh("XX")).toBeNull();
  });
});
