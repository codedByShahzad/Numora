"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Scale,
  DollarSign,
  Beaker,
  Clock,
  Sparkles,
  ArrowUpRight,
  Hash,
} from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

type Cat = {
  id: string;
  title: string;
  description: string;
  icon: any;
  calculators: string[];
  count: number;
  badge: string;
};

type CalcItem = {
  name: string;
  categoryId: string;
  categoryTitle: string;
  href: string;
  keywords: string[];
  searchText: string; // precomputed searchable string
};

const HomePage = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [openResults, setOpenResults] = useState(false);

  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo<Cat[]>(
    () => [
      {
        id: "health",
        title: "Health",
        description:
          "Track BMI, calorie needs, hydration, and heart-rate zones with clear insights.",
        icon: Heart,
        calculators: [
          "BMI",
          "Calorie",
          "Water Intake",
          "Body Fat",
          "Heart Rate",
          "Steps to Calories",
        ],
        count: 12,
        badge: "Most used",
      },
      {
        id: "unit-conversions",
        title: "Unit Conversions",
        description:
          "Fast, accurate conversions for length, weight, temperature, speed, and more.",
        icon: Scale,
        calculators: [
          "Length",
          "Weight",
          "Temperature",
          "Speed",
          "Area",
          "Volume",
        ],
        count: 25,
        badge: "Instant",
      },
      {
        id: "finance",
        title: "Finance",
        description:
          "EMI, loans, interest, investments, and currency tools for smarter planning.",
        icon: DollarSign,
        calculators: [
          "Loan EMI",
          "Compound Interest",
          "Mortgage",
          "Discount",
          "Currency",
        ],
        count: 18,
        badge: "High traffic",
      },
      {
        id: "maths-science",
        title: "Maths & Science",
        description:
          "Scientific, algebra, geometry, statistics—built for speed and accuracy.",
        icon: Beaker,
        calculators: [
          "Scientific",
          "Algebra",
          "Geometry",
          "Statistics",
          "Physics",
        ],
        count: 30,
        badge: "Power tools",
      },
      {
        id: "everyday-life",
        title: "Everyday Life",
        description:
          "Daily calculators like age, date-diff, tips, and time-zone conversions.",
        icon: Clock,
        calculators: ["Age", "Date Difference", "Tip", "Timezone", "Discount"],
        count: 15,
        badge: "Daily",
      },
    ],
    []
  );

  const featured = categories.slice(0, 3);

  /**
   * ✅ OPTIONAL: Search aliases / keywords for better results
   * Add more anytime.
   */
  const CALC_ALIASES: Record<string, string[]> = useMemo(
    () => ({
      BMI: ["body mass index", "bmi calculator", "weight height bmi"],
      Calorie: ["calories", "calorie intake", "tdee", "bmr", "calorie needs"],
      "Water Intake": ["hydration", "water per day", "drink water"],
      "Body Fat": ["body fat percentage", "fat percent", "bf%"],
      "Heart Rate": ["hr zones", "target heart rate", "pulse"],
      "Steps to Calories": ["steps calories", "walk calories", "pedometer"],

      Length: ["meter to feet", "feet to meter", "inch to cm", "cm to inch"],
      Weight: ["kg to lbs", "lbs to kg", "pounds to kilograms"],
      Temperature: [
        "celsius to fahrenheit",
        "fahrenheit to celsius",
        "c to f",
        "f to c",
      ],
      Speed: ["kmh to mph", "mph to kmh"],
      Area: ["sq ft to sq m", "square feet", "square meter"],
      Volume: ["liters to gallons", "ml to liters", "cups to ml"],

      "Loan EMI": ["emi", "installment", "loan payment", "monthly payment"],
      "Compound Interest": [
        "interest",
        "investment growth",
        "compound",
        "future value",
      ],
      Mortgage: ["home loan", "house loan", "mortgage payment"],
      Discount: ["sale price", "percentage off", "price reduction"],
      Currency: ["exchange rate", "forex", "usd to pkr", "eur to usd"],

      Scientific: ["scientific calculator", "sin cos tan", "log", "ln"],
      Algebra: ["equations", "solve x", "linear algebra"],
      Geometry: ["triangle", "circle", "area perimeter"],
      Statistics: ["mean median mode", "standard deviation", "variance"],
      Physics: ["force", "velocity", "acceleration", "energy"],

      Age: ["age calculator", "date of birth", "dob"],
      "Date Difference": ["days between", "date diff", "time between dates"],
      Tip: ["tip calculator", "restaurant tip", "gratuity"],
      Timezone: ["time zone", "world clock", "utc converter"],
    }),
    []
  );

  // ✅ Flatten calculators for search results (FIXED ROUTE + keywords)
  const allCalculators = useMemo<CalcItem[]>(() => {
    return categories.flatMap((cat) =>
      cat.calculators.map((name) => {
        const aliases = CALC_ALIASES[name] ?? [];

        // ✅ FIXED: search now uses /categories/{id}/{calculator}
        const href = `/categories/${cat.id}/${slugify(name)}`;

        const keywords = [
          name,
          ...aliases,
          cat.title,
          cat.id,
          href,
          // optional category broad keywords:
          cat.title === "Unit Conversions" ? "convert conversion converter" : "",
          cat.title === "Finance" ? "loan interest emi" : "",
          cat.title === "Health" ? "fitness bmi calories" : "",
          cat.title === "Everyday Life" ? "daily utility" : "",
          cat.title === "Maths & Science" ? "math science formula" : "",
        ].filter(Boolean);

        const searchText = keywords.join(" ").toLowerCase();

        return {
          name,
          categoryId: cat.id,
          categoryTitle: cat.title,
          href,
          keywords,
          searchText,
        };
      })
    );
  }, [categories, CALC_ALIASES]);

  const calculatorResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allCalculators
      .filter((c) => c.searchText.includes(q))
      .slice(0, 8);
  }, [allCalculators, query]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const inTitle = c.title.toLowerCase().includes(q);
      const inDesc = c.description.toLowerCase().includes(q);
      const inCalcs = c.calculators.some((x) => {
        const aliases = CALC_ALIASES[x] ?? [];
        const big = `${x} ${aliases.join(" ")}`.toLowerCase();
        return big.includes(q);
      });
      return inTitle || inDesc || inCalcs;
    });
  }, [categories, query, CALC_ALIASES]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target as Node)) {
        setOpenResults(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const onSelectCalculator = (href: string) => {
    setOpenResults(false);
    setQuery("");
    router.push(href);
  };

  const placeholders = useMemo(
    () => [
      "Search calculators: BMI, Loan EMI, Temperature…",
      "Try “Compound Interest” to estimate growth",
      "Convert “Celsius to Fahrenheit” instantly",
      "Calculate “Body Fat %” in seconds",
      "Find “Age” or “Date Difference” quickly",
    ],
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpenResults(true);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (calculatorResults[0]) onSelectCalculator(calculatorResults[0].href);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF]">
      {/* Hero */}
      <section className="relative overflow-hidden h-[80vh]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#008FBE]/15 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-[#125FF9]/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:pt-20">
          <div className="flex flex-col items-center text-center">
            <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              Universal Calculator ready to calculate
            </HoverBorderGradient>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Calculate anything in seconds <br className="hidden sm:block" />
              with{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Numora
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              A modern calculator suite for health, finance, conversions, science
              and daily utilities—built to be simple, accurate, and actually useful.
            </p>

            {/* Search */}
            <div ref={searchWrapRef} className="mt-8 w-full max-w-2xl text-left">
              <div className="relative w-full">
                <div
                  onFocusCapture={() => setOpenResults(true)}
                  className="w-full"
                >
                  <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                  />
                </div>

                {openResults && query.trim() && (
                  <div
                    className="
                      absolute top-full inset-x-0 mt-3 z-50
                      overflow-hidden rounded-2xl
                      border border-black/10 bg-white/90
                      shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]
                      backdrop-blur-xl
                    "
                  >
                    {calculatorResults.length > 0 ? (
                      <div className="max-h-60 overflow-auto px-2 pb-2">
                        {calculatorResults.map((r) => (
                          <button
                            key={r.href}
                            onClick={() => onSelectCalculator(r.href)}
                            className="
                              group flex w-full items-center justify-between
                              rounded-xl px-3 py-3 text-left
                              hover:bg-gray-50
                            "
                          >
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-[#125FF9]">
                                {r.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {r.categoryTitle} •{" "}
                                <span className="text-gray-500">{r.href}</span>
                              </div>
                            </div>

                            <div className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-semibold text-gray-700 group-hover:text-[#125FF9]">
                              Open <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-sm text-gray-600">
                        No calculators found for{" "}
                        <span className="font-semibold">“{query}”</span>.
                        <div className="mt-2 text-xs text-gray-500">
                          Try: BMI, Loan EMI, Temperature, Compound Interest…
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Trust chips */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {["No sign-up required", "Mobile friendly", "Accurate formulas", "Fast results"].map(
                  (t) => (
                    <span key={t}>
                      <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                        <Sparkles className="h-4 w-4 text-[#125FF9]" />
                        {t}
                      </HoverBorderGradient>
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Calculators",
                  value: "80+",
                  sub: "Ready-to-use calculators",
                  icon: <Sparkles className="h-5 w-5" />,
                },
                {
                  label: "Categories",
                  value: "10+",
                  sub: "Health, finance, science",
                  icon: <Hash className="h-5 w-5" />,
                },
                {
                  label: "Avg. time",
                  value: "2s",
                  sub: "Fast result delivery",
                  icon: <ArrowUpRight className="h-5 w-5" />,
                  highlight: true,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="
                    relative overflow-hidden rounded-3xl
                    border border-black/10 bg-white/70
                    p-5 text-left shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]
                    backdrop-blur-xl transition hover:bg-white/90
                  "
                >
                  <div className="pointer-events-none absolute -top-10 right-0 h-24 w-24 rounded-full bg-[#125FF9]/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-[#008FBE]/10 blur-2xl" />

                  <div className="flex items-start justify-between">
                    <div
                      className="
                        inline-flex h-11 w-11 items-center justify-center
                        rounded-2xl border border-black/10 bg-white/80
                        text-gray-800 shadow-sm
                      "
                    >
                      {s.icon}
                    </div>

                    {s.highlight && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Fast results
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-end gap-2">
                      <div className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                        {s.value}
                      </div>

                      {s.label === "Avg. time" && (
                        <span className="mb-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                          avg
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {s.label}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{s.sub}</div>
                  </div>

                  <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-10 flex flex-col items-center text-center">
          <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              Handpicked Calculators
            </HoverBorderGradient>

          <h2 className="text-2xl mt-4 font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Featured Categories
          </h2>

          <p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
            Start with the most popular calculators trusted by thousands of users for
            quick, accurate results.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item, index) => {
            const badgeConfig = [
              { text: "Most Used", pill: "bg-emerald-600 text-white", dot: "bg-emerald-200" },
              { text: "Instant Results", pill: "bg-blue-600 text-white", dot: "bg-blue-200" },
              { text: "High Traffic", pill: "bg-purple-600 text-white", dot: "bg-purple-200" },
            ][index];

            return (
              <Link
                key={item.id}
                href={`/categories/${item.id}`}
                className="
                  group relative isolate block overflow-hidden rounded-3xl
                  border border-black/10 bg-white/70
                  shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]
                  backdrop-blur-xl transition
                  hover:-translate-y-1 hover:bg-white/90
                  focus:outline-none focus:ring-2 focus:ring-[#125FF9]/40
                "
              >
                <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />

                <div className="absolute right-4 top-4 z-50">
                  <span
                    className={`
                      inline-flex items-center gap-2 rounded-full
                      px-3 py-1 text-xs font-semibold
                      shadow-md ring-1 ring-black/10
                      ${badgeConfig.pill}
                    `}
                  >
                    <span className={`h-2 w-2 rounded-full ${badgeConfig.dot}`} />
                    {badgeConfig.text}
                  </span>
                </div>

                <div className="relative z-10">
                  <CategoryCard
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    calculators={[
                      `${item.calculators[0]} • ${item.calculators[1]} • ${item.calculators[2]}`,
                      `${item.count}+ calculators`,
                    ]}
                    id={item.id}
                  />
                </div>

                <div className="absolute inset-x-6 bottom-4 z-10 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Categories */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-20">
        <div className="mb-10 flex flex-col items-center text-center">
         <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              Brows Everything
            </HoverBorderGradient>

          <h2 className="text-2xl font-semibold mt-4 tracking-tight text-gray-900 sm:text-3xl">
            All Categories
          </h2>

          <p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
            Explore the complete collection of calculators—organized by category for
            faster, easier discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((item) => (
            <Link
              key={item.id}
              href={`/categories/${item.id}`}
              className="
                group relative isolate block overflow-hidden rounded-3xl
                border border-black/10 bg-white/70
                shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]
                backdrop-blur-xl transition
                hover:-translate-y-1 hover:bg-white/90
                focus:outline-none focus:ring-2 focus:ring-[#125FF9]/40
              "
            >
              <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />

              <div className="relative z-10">
                <CategoryCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  calculators={[
                    `${item.calculators.slice(0, 3).join(" • ")}`,
                    `${item.count}+ calculators`,
                  ]}
                  id={item.id}
                />
              </div>

              <div className="absolute inset-x-6 bottom-4 z-10 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
