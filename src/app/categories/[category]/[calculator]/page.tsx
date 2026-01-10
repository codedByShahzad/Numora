// app/categories/[category]/[calculator]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

// ✅ EXISTING calculators (you already have)
import BMICalculator from "@/calculators/healthCalculators/BmiCalculator";
import BodyFatCalculator from "@/calculators/healthCalculators/BodyFatCalculator";
import CalorieCalculator from "@/calculators/healthCalculators/CalorieCalculator";
import HeartRateCalculator from "@/calculators/healthCalculators/HeartRateCalculator";
import StepsToCaloriesCalculator from "@/calculators/healthCalculators/StepsToCaloriesCalculator";
import WaterIntakeCalculator from "@/calculators/healthCalculators/WaterIntakeCalculator";

import LengthConverterPage from "@/calculators/unitConversionsCalculators/LengthConvertorCalculators";
import SpeedConverterPage from "@/calculators/unitConversionsCalculators/SpeedConvertorCalculator";
import TemperatureConverterPage from "@/calculators/unitConversionsCalculators/TemperatureConvertorCalculator";
import VolumeConverterPage from "@/calculators/unitConversionsCalculators/VolumeConverterCalculator";
import WeightConverterPage from "@/calculators/unitConversionsCalculators/WeightConverterCalculator";
import AreaConverterPage from "@/calculators/unitConversionsCalculators/AreaConverterCalculator";

import SimpleInterestCalculator from "@/calculators/financeCalculator/SimpleInterest";
import CompoundInterestCalculator from "@/calculators/financeCalculator/CompoundInterestCalculator";
import LoanEmiCalculator from "@/calculators/financeCalculator/LoanEmiCalculator";
import MortgageCalculator from "@/calculators/financeCalculator/MortgageCalculator";
import InvestmentReturnCalculator from "@/calculators/financeCalculator/InvestmentReturnCalculator";
import CurrencyConverterPage from "@/calculators/financeCalculator/CurrencyConvertCalculator";

import ScientificCalculator from "@/calculators/MathsandScienceCalulators/ScientificCalculator";
import PhysicsCalculator from "@/calculators/MathsandScienceCalulators/PhysicsCalculator";
import ChemistryCalculator from "@/calculators/MathsandScienceCalulators/ChemistryCalculator";
import AlgebraCalculator from "@/calculators/MathsandScienceCalulators/AlgebraCalculator";
import GeometryCalculator from "@/calculators/MathsandScienceCalulators/GeometryCalculator";

// ⚠️ Your import says financeCalculator for Statistics (looks like a path typo)
import StatisticsCalculator from "@/calculators/financeCalculator/StaticticsCalculator";

import TipCalculator from "@/calculators/EverydayLifeCalculators/TipCalculator";
import AgeCalculator from "@/calculators/EverydayLifeCalculators/AgeCalculator";
import TimeZoneConverter from "@/calculators/EverydayLifeCalculators/TimezoneConverterCalculator";
import DiscountCalculator from "@/calculators/EverydayLifeCalculators/DiscountCalculator";
import GPACalculator from "@/calculators/EverydayLifeCalculators/GpaCalculator";
import DayCalculator from "@/calculators/EverydayLifeCalculators/DayCalculator";

/* ------------------------------ Types ------------------------------ */
interface CalculatorPageProps {
  params: { category: string; calculator: string };
}

/* ------------------------------ Category titles ------------------------------ */
const displayTitleMap: Record<string, string> = {
  health: "Health",
  "unit-conversions": "Unit Conversions",
  finance: "Finance",
  "maths-science": "Math & Science",
  "everyday-life": "Everyday Life",
};

/* ------------------------------ SEO Meta (Expanded) ------------------------------ */
const calculatorsMeta: Record<
  string,
  Record<string, { title: string; description: string }>
> = {
  health: {
    bmi: {
      title: "BMI Calculator",
      description: "Calculate Body Mass Index (BMI) and check your fitness level instantly.",
    },
    "water-intake": {
      title: "Water Intake Calculator",
      description: "Find out how much water you should drink daily based on your body and routine.",
    },
    calorie: {
      title: "Calorie Calculator",
      description: "Estimate your daily calorie needs for weight loss, maintenance, or gain.",
    },
    "body-fat": {
      title: "Body Fat Calculator",
      description: "Calculate body fat percentage and track fitness progress over time.",
    },
    "steps-to-calories": {
      title: "Steps to Calories Calculator",
      description: "Convert steps into calories burned based on walking activity and body stats.",
    },
    "heart-rate": {
      title: "Heart Rate Calculator",
      description: "Find your maximum and target heart rate zones for workouts.",
    },

    // ✅ SEO additions (Coming soon until you build)
    bmr: { title: "BMR Calculator", description: "Calculate Basal Metabolic Rate (BMR) to understand daily energy needs." },
    tdee: { title: "TDEE Calculator", description: "Estimate Total Daily Energy Expenditure (TDEE) based on activity level." },
    "ideal-weight": { title: "Ideal Weight Calculator", description: "Find your ideal weight range using popular formulas." },
    "waist-hip-ratio": { title: "Waist-to-Hip Ratio Calculator", description: "Calculate WHR to evaluate body composition and health risk." },
    bsa: { title: "Body Surface Area Calculator", description: "Calculate Body Surface Area (BSA) for medical and fitness use." },
    "lean-body-mass": { title: "Lean Body Mass Calculator", description: "Estimate lean body mass (LBM) based on your body measurements." },
  },

  "unit-conversions": {
    length: { title: "Length Converter", description: "Convert meters, kilometers, miles, feet, inches and more." },
    weight: { title: "Weight Converter", description: "Convert kilograms, pounds, grams, ounces and more." },
    temperature: { title: "Temperature Converter", description: "Convert Celsius, Fahrenheit, and Kelvin easily." },
    speed: { title: "Speed Converter", description: "Convert km/h, mph, m/s, knots and more." },
    area: { title: "Area Converter", description: "Convert square meters, acres, hectares and more." },
    volume: { title: "Volume Converter", description: "Convert liters, milliliters, gallons, cups and more." },

    // ✅ SEO additions (Coming soon)
    time: { title: "Time Converter", description: "Convert seconds, minutes, hours, days, weeks and more." },
    "data-storage": { title: "Data Storage Converter", description: "Convert KB, MB, GB, TB and more." },
    energy: { title: "Energy Converter", description: "Convert joules, calories, kWh and more." },
    pressure: { title: "Pressure Converter", description: "Convert PSI, bar, pascal and more." },
  },

  finance: {
    "simple-interest": { title: "Simple Interest Calculator", description: "Calculate simple interest earned or paid on a principal amount." },
    "compound-interest": { title: "Compound Interest Calculator", description: "See how your money grows with compounding interest over time." },
    "loan-emi": { title: "Loan EMI Calculator", description: "Estimate monthly EMI payments and total interest for your loan." },
    mortgage: { title: "Mortgage Calculator", description: "Calculate monthly mortgage payments and loan cost breakdown." },
    "investment-return": { title: "Investment Return Calculator", description: "Estimate future value and returns for your investments." },
    "currency-converter": { title: "Currency Converter", description: "Convert currencies with exchange rates for quick estimates." },

    // ✅ SEO additions (Coming soon)
    inflation: { title: "Inflation Calculator", description: "Calculate how inflation affects the value of money over time." },
    retirement: { title: "Retirement Calculator", description: "Estimate how much you need to save for retirement." },
    salary: { title: "Salary Calculator", description: "Convert salary to hourly, weekly, monthly and yearly income." },
    cagr: { title: "CAGR Calculator", description: "Calculate Compound Annual Growth Rate (CAGR) for investments." },
    apr: { title: "APR Calculator", description: "Estimate Annual Percentage Rate (APR) on loans or credit." },
    depreciation: { title: "Depreciation Calculator", description: "Calculate asset depreciation using common depreciation methods." },
    "savings-goal": { title: "Savings Goal Calculator", description: "Plan monthly savings required to reach your goal faster." },
  },

  "maths-science": {
    scientific: { title: "Scientific Calculator", description: "Perform advanced scientific and math operations." },
    physics: { title: "Physics Calculator", description: "Solve physics problems including motion, force, and energy." },
    chemistry: { title: "Chemistry Calculator", description: "Calculate molar mass, solution concentration, and more." },
    algebra: { title: "Algebra Calculator", description: "Solve equations, inequalities, and simplify expressions." },
    geometry: { title: "Geometry Calculator", description: "Calculate area, perimeter, and volume of shapes." },
    statistics: { title: "Statistics Calculator", description: "Find mean, median, mode, variance, and standard deviation." },

    // ✅ SEO additions (Coming soon)
    percentage: { title: "Percentage Calculator", description: "Calculate percentage increase, decrease, and percent of a number." },
    fraction: { title: "Fraction Calculator", description: "Add, subtract, multiply, and divide fractions easily." },
    quadratic: { title: "Quadratic Equation Solver", description: "Solve quadratic equations and find roots instantly." },
    prime: { title: "Prime Number Checker", description: "Check whether a number is prime and find factors." },
    log: { title: "Log Calculator", description: "Calculate log base 10, natural log (ln), and custom bases." },
  },

  "everyday-life": {
    tip: { title: "Tip Calculator", description: "Quickly calculate tips and split bills." },
    age: { title: "Age Calculator", description: "Find your age in years, months, and days." },
    "time-zone": { title: "Time Zone Converter", description: "Convert time between different zones worldwide." },
    discount: { title: "Discount Calculator", description: "Calculate discounts and final prices when shopping." },
    gpa: { title: "GPA Calculator", description: "Easily calculate your Grade Point Average." },
    "day-calculator": { title: "Day Calculator", description: "Find the number of days between two dates." },

    // ✅ SEO additions (Coming soon)
    "time-duration": { title: "Time Duration Calculator", description: "Calculate duration between two times with hours and minutes." },
    "split-bill": { title: "Split Bill Calculator", description: "Split a bill among people with tip and tax included." },
    "work-hours": { title: "Work Hours Calculator", description: "Calculate work hours between start and end time including breaks." },
    "due-date": { title: "Due Date Calculator", description: "Estimate due date based on pregnancy weeks and start date." },
  },
};

/* ------------------------------ Component Registry ------------------------------ */
/**
 * ✅ Only map calculators you already built.
 * New SEO calculators will show "Coming Soon" until you add the component.
 */
const calculatorComponents: Record<string, Record<string, React.ComponentType>> = {
  health: {
    bmi: BMICalculator,
    "water-intake": WaterIntakeCalculator,
    calorie: CalorieCalculator,
    "body-fat": BodyFatCalculator,
    "steps-to-calories": StepsToCaloriesCalculator,
    "heart-rate": HeartRateCalculator,
  },
  "unit-conversions": {
    length: LengthConverterPage,
    weight: WeightConverterPage,
    temperature: TemperatureConverterPage,
    speed: SpeedConverterPage,
    area: AreaConverterPage,
    volume: VolumeConverterPage,
  },
  finance: {
    "simple-interest": SimpleInterestCalculator,
    "compound-interest": CompoundInterestCalculator,
    "loan-emi": LoanEmiCalculator,
    mortgage: MortgageCalculator,
    "investment-return": InvestmentReturnCalculator,
    "currency-converter": CurrencyConverterPage,
  },
  "maths-science": {
    scientific: ScientificCalculator,
    physics: PhysicsCalculator,
    chemistry: ChemistryCalculator,
    algebra: AlgebraCalculator,
    geometry: GeometryCalculator,
    statistics: StatisticsCalculator,
  },
  "everyday-life": {
    tip: TipCalculator,
    age: AgeCalculator,
    "time-zone": TimeZoneConverter,
    discount: DiscountCalculator,
    gpa: GPACalculator,
    "day-calculator": DayCalculator,
  },
};

/* ------------------------------ Metadata Generator ------------------------------ */
export async function generateMetadata(
  { params }: CalculatorPageProps
): Promise<Metadata> {
  const { category, calculator } = params;

  const displayCategory = displayTitleMap[category] || "Category";
  const meta =
    calculatorsMeta[category]?.[calculator] || {
      title: "Calculator",
      description: "Use this free calculator on Numora.",
    };

  return {
    title: `${meta.title} | ${displayCategory}`,
    description: meta.description,
  };
}

/* ------------------------------ Page ------------------------------ */
export default function CalculatorPage({ params }: CalculatorPageProps) {
  const { category, calculator } = params;

  const Component = calculatorComponents[category]?.[calculator];

  // ✅ If calculator exists but component not built yet
  if (!Component) {
    const meta =
      calculatorsMeta[category]?.[calculator] || {
        title: "Calculator",
        description: "This calculator will be available soon.",
      };

    return (
      <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {meta.title}
          </h1>
          <p className="mt-3 text-gray-600">{meta.description}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/categories/${category}`}
              className="rounded-full bg-gradient-to-r from-[#008FBE] to-[#125FF9] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition"
            >
              Back to {displayTitleMap[category] ?? "Category"}
            </Link>

            <Link
              href="/categories"
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition"
            >
              Browse all categories
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Status: Coming soon (add the calculator component whenever ready)
          </p>
        </div>
      </div>
    );
  }

  // ✅ Render built calculator
  return (
    <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Component />
      </div>
    </div>
  );
}

/* ------------------------------ Static Params ------------------------------ */
export async function generateStaticParams() {
  const categories = Object.keys(calculatorsMeta);

  return categories.flatMap((category) =>
    Object.keys(calculatorsMeta[category]).map((calculator) => ({
      category,
      calculator,
    }))
  );
}
