"use client";

/**
 * Client-side calculator loader. Each calculator is its own chunk, so a page
 * downloads only the calculator it shows. `dynamic()` here still renders the
 * calculator on the server, so the form is in the initial HTML.
 * (next/dynamic inside a Server Component does not split client components,
 * which is why this lives in a client module.)
 */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const CALCULATORS: Record<string, ComponentType> = {
  "bmi": dynamic(() => import("@/calculators/healthCalculators/BmiCalculator")),
  "water-intake": dynamic(() => import("@/calculators/healthCalculators/WaterIntakeCalculator")),
  "calorie": dynamic(() => import("@/calculators/healthCalculators/CalorieCalculator")),
  "body-fat": dynamic(() => import("@/calculators/healthCalculators/BodyFatCalculator")),
  "steps-to-calories": dynamic(() => import("@/calculators/healthCalculators/StepsToCaloriesCalculator")),
  "heart-rate": dynamic(() => import("@/calculators/healthCalculators/HeartRateCalculator")),
  "length": dynamic(() => import("@/calculators/unitConversionsCalculators/LengthConvertorCalculators")),
  "weight": dynamic(() => import("@/calculators/unitConversionsCalculators/WeightConverterCalculator")),
  "temperature": dynamic(() => import("@/calculators/unitConversionsCalculators/TemperatureConvertorCalculator")),
  "speed": dynamic(() => import("@/calculators/unitConversionsCalculators/SpeedConvertorCalculator")),
  "area": dynamic(() => import("@/calculators/unitConversionsCalculators/AreaConverterCalculator")),
  "volume": dynamic(() => import("@/calculators/unitConversionsCalculators/VolumeConverterCalculator")),
  "simple-interest": dynamic(() => import("@/calculators/financeCalculator/SimpleInterest")),
  "compound-interest": dynamic(() => import("@/calculators/financeCalculator/CompoundInterestCalculator")),
  "loan-emi": dynamic(() => import("@/calculators/financeCalculator/LoanEmiCalculator")),
  "mortgage": dynamic(() => import("@/calculators/financeCalculator/MortgageCalculator")),
  "investment-return": dynamic(() => import("@/calculators/financeCalculator/InvestmentReturnCalculator")),
  "currency-converter": dynamic(() => import("@/calculators/financeCalculator/CurrencyConvertCalculator")),
  "scientific": dynamic(() => import("@/calculators/MathsandScienceCalulators/ScientificCalculator")),
  "physics": dynamic(() => import("@/calculators/MathsandScienceCalulators/PhysicsCalculator")),
  "chemistry": dynamic(() => import("@/calculators/MathsandScienceCalulators/ChemistryCalculator")),
  "algebra": dynamic(() => import("@/calculators/MathsandScienceCalulators/AlgebraCalculator")),
  "geometry": dynamic(() => import("@/calculators/MathsandScienceCalulators/GeometryCalculator")),
  "tip": dynamic(() => import("@/calculators/EverydayLifeCalculators/TipCalculator")),
  "age": dynamic(() => import("@/calculators/EverydayLifeCalculators/AgeCalculator")),
  "time-zone": dynamic(() => import("@/calculators/EverydayLifeCalculators/TimezoneConverterCalculator")),
  "discount": dynamic(() => import("@/calculators/EverydayLifeCalculators/DiscountCalculator")),
  "gpa": dynamic(() => import("@/calculators/EverydayLifeCalculators/GpaCalculator")),
  "day-calculator": dynamic(() => import("@/calculators/EverydayLifeCalculators/DayCalculator")),
  "no-tax-on-overtime": dynamic(() => import("@/calculators/TaxCalculators/NoTaxOnOvertimeCalculator")),
  "etsy-fees": dynamic(() => import("@/calculators/EcommerceCalculators/EtsyFeeCalculator")),
  "tiktok-shop-fees": dynamic(() => import("@/calculators/EcommerceCalculators/TikTokShopFeeCalculator")),
  "stripe-fees": dynamic(() => import("@/calculators/BusinessCalculators/StripeFeeCalculator")),
  "ev-charging-cost": dynamic(() => import("@/calculators/EnergyCalculators/EvChargingCostCalculator")),
};

export default function CalculatorLoader({ id }: { id: string }) {
  const Calculator = CALCULATORS[id];
  return Calculator ? <Calculator /> : null;
}
