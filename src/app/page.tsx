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
  ShieldCheck,
  Zap,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

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
  searchText: string;
};

export default function HomePage() {
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
        calculators: ["Length", "Weight", "Temperature", "Speed", "Area", "Volume"],
        count: 25,
        badge: "Instant",
      },
      {
        id: "finance",
        title: "Finance",
        description:
          "EMI, loans, interest, investments, and currency tools for smarter planning.",
        icon: DollarSign,
        calculators: ["Loan EMI", "Compound Interest", "Mortgage", "Discount", "Currency"],
        count: 18,
        badge: "High traffic",
      },
      {
        id: "maths-science",
        title: "Maths & Science",
        description:
          "Scientific, algebra, geometry, statistics—built for speed and accuracy.",
        icon: Beaker,
        calculators: ["Scientific", "Algebra", "Geometry", "Statistics", "Physics"],
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
      Temperature: ["celsius to fahrenheit", "fahrenheit to celsius", "c to f", "f to c"],
      Speed: ["kmh to mph", "mph to kmh"],
      Area: ["sq ft to sq m", "square feet", "square meter"],
      Volume: ["liters to gallons", "ml to liters", "cups to ml"],

      "Loan EMI": ["emi", "installment", "loan payment", "monthly payment"],
      "Compound Interest": ["interest", "investment growth", "compound", "future value"],
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

  const allCalculators = useMemo<CalcItem[]>(() => {
    return categories.flatMap((cat) =>
      cat.calculators.map((name) => {
        const aliases = CALC_ALIASES[name] ?? [];
        const href = `/categories/${cat.id}/${slugify(name)}`;

        const keywords = [
          name,
          ...aliases,
          cat.title,
          cat.id,
          href,
          cat.title === "Unit Conversions" ? "convert conversion converter" : "",
          cat.title === "Finance" ? "loan interest emi" : "",
          cat.title === "Health" ? "fitness bmi calories" : "",
          cat.title === "Everyday Life" ? "daily utility" : "",
          cat.title === "Maths & Science" ? "math science formula" : "",
        ].filter(Boolean);

        return {
          name,
          categoryId: cat.id,
          categoryTitle: cat.title,
          href,
          keywords,
          searchText: keywords.join(" ").toLowerCase(),
        };
      })
    );
  }, [categories, CALC_ALIASES]);

  const calculatorResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allCalculators.filter((c) => c.searchText.includes(q)).slice(0, 8);
  }, [allCalculators, query]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const inTitle = c.title.toLowerCase().includes(q);
      const inDesc = c.description.toLowerCase().includes(q);
      const inCalcs = c.calculators.some((x) => {
        const aliases = CALC_ALIASES[x] ?? [];
        return `${x} ${aliases.join(" ")}`.toLowerCase().includes(q);
      });
      return inTitle || inDesc || inCalcs;
    });
  }, [categories, query, CALC_ALIASES]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target as Node)) setOpenResults(false);
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
    setQuery(e.target.value);
    setOpenResults(true);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (calculatorResults[0]) onSelectCalculator(calculatorResults[0].href);
  };

  const ClickableCard = ({
    href,
    className,
    children,
  }: {
    href: string;
    className: string;
    children: React.ReactNode;
  }) => (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(href);
      }}
      className={className}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Hero background with SOFT grid pattern */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />

          {/* soft grid */}
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />

          {/* glows */}
          <div className="absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
          <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />

          {/* subtle noise */}
          <div
            className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-10 sm:pt-20 sm:pb-14">
          {/* CENTERED HERO CONTENT */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center items-center">
            <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#125FF9]" />
              Fast answers for everyday calculations
            </HoverBorderGradient>

            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Calculate anything in{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                seconds
              </span>
            </h1>

            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              From BMI and calories to EMI and conversions — Numora gives you quick
              results with clean breakdowns and standard formulas.
            </p>

            {/* Search (centered) */}
            <div ref={searchWrapRef} className="mt-7 w-full text-left">
              <div className="relative">
                <div onFocusCapture={() => setOpenResults(true)} className="w-full">
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
                      border border-black/10 bg-white/92
                      shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)]
                      backdrop-blur-xl
                    "
                  >
                    {calculatorResults.length > 0 ? (
                      <div className="max-h-72 overflow-auto p-2">
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

              {/* Trust chips centered */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {[
                  { t: "Standard formulas", i: Calculator },
                  { t: "Instant conversions", i: Zap },
                  { t: "No sign-up needed", i: ShieldCheck },
                ].map(({ t, i: I }) => (
                  <span key={t}>
                    <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                      <I className="h-4 w-4 text-[#125FF9]" />
                      {t}
                    </HoverBorderGradient>
                  </span>
                ))}
              </div>
            </div>

            {/* social proof centered */}
            <div className="mt-10">
              <p className="text-xs font-medium text-gray-500">
                Common calculators people use daily
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {["BMI", "Loan EMI", "C → F", "Age", "Tip", "Currency"].map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-gray-700 shadow-sm"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== METRICS SECTION ===== */}
      <section className="mx-auto mt-10 w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/60 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-[#125FF9]/10 blur-3xl" />
            <div className="absolute -bottom-24 left-0 h-60 w-60 rounded-full bg-[#008FBE]/10 blur-3xl" />
          </div>

          <div className="relative">
            {/* CENTERED HEADER */}
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#125FF9]" />
                  Built for everyday math
                </HoverBorderGradient>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Fast results with clear breakdowns
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Whether you’re converting units, planning finances, or checking health metrics —
                  get accurate answers without clutter.
                </p>
              </div>

              <button
                onClick={() => router.push("/categories")}
                className="
                  inline-flex items-center gap-2 rounded-full
                  bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                  px-5 py-2.5 text-sm font-semibold text-white
                  shadow-sm hover:shadow-md hover:brightness-105 transition
                  whitespace-nowrap
                "
              >
                Explore categories <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>


            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Calculators",
                  value: "80+",
                  sub: "Everyday + advanced tools",
                  hint: "Health • Finance • Conversions",
                  icon: <Sparkles className="h-5 w-5" />,
                },
                {
                  label: "Categories",
                  value: "10+",
                  sub: "Easy to browse",
                  hint: "Find what you need fast",
                  icon: <Hash className="h-5 w-5" />,
                },
                {
                  label: "Avg. open time",
                  value: "2s",
                  sub: "Quick results",
                  hint: "Optimized for speed",
                  icon: <ArrowUpRight className="h-5 w-5" />,
                  highlight: true,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="
                    relative overflow-hidden rounded-3xl
                    border border-black/10 bg-white/80
                    p-6 shadow-[0_12px_32px_-22px_rgba(0,0,0,0.45)]
                    backdrop-blur-xl transition hover:bg-white/95
                  "
                >
                  <div className="flex items-start justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-gray-800 shadow-sm">
                      {s.icon}
                    </div>

                    {s.highlight ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Fast results
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <div className="text-4xl font-semibold tracking-tight text-gray-900">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {s.label}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{s.sub}</div>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#125FF9]" />
                      {s.hint}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { title: "Conversions that feel instant", desc: "Length, weight, temperature, speed & more." },
                { title: "Finance with clarity", desc: "EMI, interest and discounts with simple breakdowns." },
                { title: "Health metrics made simple", desc: "BMI, calories, hydration and heart-rate zones." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-black/10 bg-white/70 px-4 py-4 text-center backdrop-blur"
                >
                  <div className="text-sm font-semibold text-gray-900">{f.title}</div>
                  <div className="mt-1 text-sm text-gray-600">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-10 text-center">
            <div className="flex justify-center items-center">
          <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
            Handpicked
          </HoverBorderGradient>
</div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Featured categories
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
            Start with the most used calculators across health, finance, and conversions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <ClickableCard
              key={item.id}
              href={`/categories/${item.id}`}
              className="
                group relative isolate block overflow-hidden rounded-3xl
                border border-black/10 bg-white/70
                shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]
                backdrop-blur-xl transition
                hover:-translate-y-1 hover:bg-white/90
                focus:outline-none focus:ring-2 focus:ring-[#125FF9]/40
                cursor-pointer
              "
            >
              <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />

              <div className="absolute right-4 top-4 z-10">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-black/10 bg-white/80 text-gray-800">
                  <span className="h-2 w-2 rounded-full bg-[#125FF9]" />
                  {item.badge}
                </span>
              </div>

              <div className="relative z-10 p-1">
                <CategoryCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  calculators={item.calculators}
                  id={item.id}
                  // countText={`${item.count}+`}
                />
              </div>
            </ClickableCard>
          ))}
        </div>
      </section>

      {/* ===== ALL CATEGORIES ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-10 text-center">
           <div className="flex justify-center items-center">
          <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
            Browse everything
          </HoverBorderGradient>
</div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            All categories
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
            Explore calculators by category — health, finance, science, conversions, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((item) => (
            <ClickableCard
              key={item.id}
              href={`/categories/${item.id}`}
              className="
                group relative isolate block overflow-hidden rounded-3xl
                border border-black/10 bg-white/70
                shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]
                backdrop-blur-xl transition
                hover:-translate-y-1 hover:bg-white/90
                focus:outline-none focus:ring-2 focus:ring-[#125FF9]/40
                cursor-pointer
              "
            >
              <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />

              <div className="absolute right-4 top-4 z-10">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-black/10 bg-white/80 text-gray-800">
                  <span className="h-2 w-2 rounded-full bg-[#008FBE]" />
                  {item.count}+ tools
                </span>
              </div>

              <div className="relative z-10 p-1">
                <CategoryCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  calculators={item.calculators}
                  id={item.id}
                  // countText={`${item.count}+`}
                />
              </div>
            </ClickableCard>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-[#125FF9]/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-[#008FBE]/12 blur-3xl" />

          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                Find the calculator you need — instantly
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Browse categories or search directly from the homepage.
              </p>
            </div>

            <button
              onClick={() => router.push("/categories")}
              className="
                inline-flex items-center justify-center gap-2
                rounded-full px-6 py-3 text-sm font-semibold text-white
                bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                shadow-sm hover:shadow-md hover:brightness-105 transition
                whitespace-nowrap
              "
            >
              Explore categories <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
