// app/categories/[category]/page.tsx
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import {
  Heart,
  Droplets,
  Scale,
  Activity,
  Footprints,
  HeartPulse,
  Ruler,
  Weight,
  Thermometer,
  Gauge,
  Square,
  Box,
  DollarSign,
  Percent,
  PiggyBank,
  Landmark,
  CreditCard,
  TrendingUp,
  FunctionSquare,
  Shapes,
  BarChart,
  Clock,
  Calendar,
  Globe,
  BookOpen,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import type { Metadata } from "next";
import Link from "next/link";

/* --------------------------- Display Title Map --------------------------- */
const displayTitleMap: Record<string, string> = {
  health: "Health",
  "unit-conversions": "Unit Conversions",
  finance: "Finance",
  "maths-science": "Maths & Science",
  "everyday-life": "Everyday Life",
};

/* ------------------------------ Metadata ------------------------------ */
interface CategoryPageProps {
  params: { category: string };
}

export async function generateMetadata(
  { params }: CategoryPageProps
): Promise<Metadata> {
  const displayTitle = displayTitleMap[params.category] || "Category";

  const title = `${displayTitle} Calculators | Numoro`;
  const description = `Explore ${displayTitle.toLowerCase()} calculators on Numoro. Fast results, clear breakdowns, and reliable formulas.`;

  return {
    title,
    description,

    alternates: {
      canonical: `/categories/${params.category}`,
    },

    openGraph: {
      title,
      description,
      url: `/categories/${params.category}`,
      siteName: "Numoro",
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Numoro – Fast Everyday Calculators",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

/* ------------------------------ Types ------------------------------ */
interface CalculatorItem {
  title: string;
  description: string;
  icon: typeof Heart;
  id: string;
}

/* ------------------------------ Data ------------------------------ */
const calculatorsData: Record<string, CalculatorItem[]> = {
  health: [
    { title: "BMI Calculator", description: "Calculate your Body Mass Index.", icon: Heart, id: "bmi" },
    { title: "Water Intake Calculator", description: "Find out how much water you should drink daily.", icon: Droplets, id: "water-intake" },
    { title: "Calorie Calculator", description: "Estimate your daily calorie needs.", icon: Scale, id: "calorie" },
    { title: "Body Fat Calculator", description: "Estimate your body fat percentage.", icon: Activity, id: "body-fat" },
    { title: "Steps to Calories Calculator", description: "Find out how many calories you burn.", icon: Footprints, id: "steps-to-calories" },
    { title: "Heart Rate Calculator", description: "Calculate your maximum heart rate.", icon: HeartPulse, id: "heart-rate" },
  ],
  "unit-conversions": [
    { title: "Length Converter", description: "Convert between meters, kilometers, miles, feet, and more.", icon: Ruler, id: "length" },
    { title: "Weight Converter", description: "Convert between kilograms, pounds, grams, ounces, and more.", icon: Weight, id: "weight" },
    { title: "Temperature Converter", description: "Convert between Celsius, Fahrenheit, and Kelvin.", icon: Thermometer, id: "temperature" },
    { title: "Speed Converter", description: "Convert between km/h, mph, m/s, and knots.", icon: Gauge, id: "speed" },
    { title: "Area Converter", description: "Convert between square meters, acres, hectares, and more.", icon: Square, id: "area" },
    { title: "Volume Converter", description: "Convert between liters, milliliters, gallons, and more.", icon: Box, id: "volume" },
  ],
  finance: [
    { title: "Simple Interest Calculator", description: "Calculate interest earned or paid on a principal amount.", icon: Percent, id: "simple-interest" },
    { title: "Compound Interest Calculator", description: "Find out how your money grows with compounding interest.", icon: PiggyBank, id: "compound-interest" },
    { title: "Loan EMI Calculator", description: "Estimate monthly payments for loans.", icon: CreditCard, id: "loan-emi" },
    { title: "Mortgage Calculator", description: "Calculate monthly mortgage payments.", icon: Landmark, id: "mortgage" },
    { title: "Investment Return Calculator", description: "Estimate future value of investments.", icon: TrendingUp, id: "investment-return" },
    { title: "Currency Converter", description: "Convert between currencies using exchange rates.", icon: DollarSign, id: "currency-converter" },
  ],
  "maths-science": [
    { title: "Scientific Calculator", description: "Perform advanced math operations.", icon: FunctionSquare, id: "scientific" },
    { title: "Physics Calculator", description: "Solve physics problems like motion, force, energy.", icon: Gauge, id: "physics" },
    { title: "Chemistry Calculator", description: "Compute molar mass, solution concentration, etc.", icon: Activity, id: "chemistry" },
    { title: "Algebra Calculator", description: "Solve equations, inequalities, and simplify expressions.", icon: FunctionSquare, id: "algebra" },
    { title: "Geometry Calculator", description: "Calculate area, perimeter, and volume of shapes.", icon: Shapes, id: "geometry" },
    { title: "Statistics Calculator", description: "Compute mean, median, mode, and standard deviation.", icon: BarChart, id: "statistics" },
  ],
  "everyday-life": [
    { title: "Tip Calculator", description: "Calculate tips and split bills easily.", icon: Clock, id: "tip" },
    { title: "Age Calculator", description: "Find out your age in years, months, and days.", icon: Calendar, id: "age" },
    { title: "Time Zone Converter", description: "Convert time between different time zones.", icon: Globe, id: "time-zone" },
    { title: "Discount Calculator", description: "Calculate discounts and final prices.", icon: Percent, id: "discount" },
    { title: "GPA Calculator", description: "Calculate your Grade Point Average for school or college.", icon: BookOpen, id: "gpa" },
    { title: "Day Calculator", description: "Find the number of days between two dates.", icon: CalendarDays, id: "day-calculator" },
  ],
};

/* ------------------------------ Helpers ------------------------------ */
function getChips(category: string, title: string): string[] {
  const t = title.toLowerCase();
  const chips: string[] = [];

  if (category === "health") {
    if (t.includes("bmi")) chips.push("BMI", "Weight", "Height", "Health");
    if (t.includes("water")) chips.push("Hydration", "Daily", "Water", "Goal");
    if (t.includes("calorie")) chips.push("Calories", "BMR", "TDEE", "Goal");
    if (t.includes("body fat")) chips.push("% estimate", "Fitness", "Body fat", "Measure");
    if (t.includes("steps")) chips.push("Walking", "Steps", "Calories", "Activity");
    if (t.includes("heart rate")) chips.push("Max HR", "Zones", "Pulse", "Workout");
  }

  if (category === "finance") {
    if (t.includes("mortgage")) chips.push("Home loan", "Installment", "Monthly", "Rate");
    if (t.includes("emi") || t.includes("loan")) chips.push("Monthly payment", "Breakdown", "Interest", "Tenure");
    if (t.includes("compound")) chips.push("Growth", "Future value", "Investment", "Rate");
    if (t.includes("simple interest")) chips.push("Principal", "Rate", "Time", "Interest");
    if (t.includes("currency")) chips.push("Rates", "Forex", "USD", "EUR");
    if (t.includes("investment")) chips.push("ROI", "Forecast", "Returns", "Future");
  }

  if (category === "unit-conversions") {
    if (t.includes("temperature")) chips.push("C ↔ F", "Kelvin", "Convert", "Quick");
    if (t.includes("length")) chips.push("m ↔ ft", "km ↔ mi", "inch", "cm");
    if (t.includes("weight")) chips.push("kg ↔ lb", "g ↔ oz", "Convert", "Quick");
    if (t.includes("speed")) chips.push("km/h ↔ mph", "m/s", "Knots", "Convert");
    if (t.includes("area")) chips.push("sq ft ↔ sq m", "acre", "hectare", "Convert");
    if (t.includes("volume")) chips.push("L ↔ gal", "ml ↔ L", "cups", "Convert");
  }

  if (category === "maths-science") {
    if (t.includes("scientific")) chips.push("sin/cos", "log", "pi", "Power");
    if (t.includes("physics")) chips.push("Force", "Energy", "Velocity", "Motion");
    if (t.includes("chemistry")) chips.push("Molar mass", "Concentration", "Solution", "Moles");
    if (t.includes("algebra")) chips.push("Equations", "Simplify", "Solve", "Variables");
    if (t.includes("geometry")) chips.push("Area", "Volume", "Perimeter", "Shapes");
    if (t.includes("statistics")) chips.push("Mean", "Median", "Std dev", "Variance");
  }

  if (category === "everyday-life") {
    if (t.includes("tip")) chips.push("Split bill", "Percent", "Restaurant", "Quick");
    if (t.includes("age")) chips.push("DOB", "Years", "Months", "Days");
    if (t.includes("time zone")) chips.push("UTC", "Convert", "World", "Time");
    if (t.includes("discount")) chips.push("Final price", "% off", "Sale", "Savings");
    if (t.includes("gpa")) chips.push("Grades", "Semester", "Points", "Score");
    if (t.includes("day")) chips.push("Date diff", "Days", "Calendar", "Count");
  }

  if (chips.length === 0) chips.push("Fast", "Accurate", "Simple");

  return chips.slice(0, 6);
}

/* ------------------------------ Page ------------------------------ */
export default function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category;
  const displayTitle = displayTitleMap[category] || category;
  const calculators = calculatorsData[category] || [];

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
     {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft grid */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:56px_56px]" />
        {/* glow blobs */}
        <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />
      </div>


      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16 md:py-20">
        {/* header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center items-center">
            <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <span className="flex gap-2">
                <Sparkles className="h-4 w-4 text-[#125FF9]" />
                Browse {displayTitle.toLowerCase()} calculators
              </span>
            </HoverBorderGradient>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {displayTitle}{" "}
            <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
              calculators
            </span>
          </h1>

          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Select a tool below — fast results, clean UI, and easy-to-understand outputs.
          </p>
        </div>

        {/* cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            const chips = getChips(category, calc.title);

            return (
              <div key={calc.id} className="group relative">
                <div className="pointer-events-none absolute -inset-0.5 rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-100 bg-gradient-to-r from-[#008FBE]/25 via-[#125FF9]/20 to-[#008FBE]/20" />

                <div
                  className="
                    relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl
                    border border-black/10 bg-white/75
                    shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)]
                    backdrop-blur-xl transition
                    hover:-translate-y-1 hover:bg-white/95
                  "
                >
                  <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

                  <div className="relative flex flex-1 flex-col p-7">
                    {/* top */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#008FBE]/20 to-[#125FF9]/20 blur-md opacity-70" />
                        <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                          <Icon className="h-7 w-7 text-gray-900" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-2xl font-semibold text-gray-900">
                          {calc.title}
                        </h3>
                        <p className="mt-2 text-base text-gray-600 leading-relaxed">
                          {calc.description}
                        </p>
                      </div>
                    </div>

                    {/* POPULAR FOR */}
                    <div className="mt-8">
                      <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                        Popular calculators
                      </p>

                      {/* ✅ Equal width pills */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {chips.map((c) => (
                          <span
                            key={c}
                            className="
                              w-full text-center truncate
                              rounded-full border border-black/10 bg-white
                              px-5 py-2 text-sm text-gray-700
                              shadow-sm
                            "
                            title={c}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* footer */}
                    <div className="mt-auto pt-10">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="text-base text-gray-800">
                          <span className="font-semibold text-gray-900">Instant</span>{" "}
                          results
                        </div>

                        <Link
                          href={`/categories/${category}/${calc.id}`}
                          className="
                            inline-flex items-center gap-2
                            rounded-full px-4 py-2
                            text-sm font-semibold text-white
                            bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                            shadow-[0_16px_40px_-18px_rgba(18,95,249,0.55)]
                            hover:shadow-[0_18px_46px_-18px_rgba(18,95,249,0.60)]
                            hover:brightness-105 transition
                            whitespace-nowrap
                          "
                        >
                          Open calculator <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="h-10 bg-transparent" />
                </div>
              </div>
            );
          })}
        </div>

        {calculators.length === 0 && (
          <div className="mt-14 flex justify-center">
            <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-gray-900">Coming soon</p>
              <p className="mt-2 text-sm text-gray-600">
                Calculators for this category will be added shortly.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* --------------------------- Static Params --------------------------- */
export async function generateStaticParams() {
  return Object.keys(calculatorsData).map((category) => ({ category }));
}
