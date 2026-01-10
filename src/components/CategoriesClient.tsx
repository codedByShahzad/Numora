"use client";

import React, { useMemo, useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import {
  Heart,
  Scale,
  DollarSign,
  Beaker,
  Clock,
  Search,
  Sparkles,
} from "lucide-react";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

type Cat = {
  id: string;
  title: string;
  description: string;
  icon: any;
  calculators: string[];
  badge?: string;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function CategoriesClient() {
  const categories: Cat[] = [
    {
      id: "health",
      title: "Health",
      description:
        "Calculate BMI, water intake, calories, and other health metrics for a better lifestyle.",
      icon: Heart,
      calculators: ["BMI Calculator", "Water Intake", "Calorie Counter"],
      badge: "Most used",
    },
    {
      id: "unit-conversions",
      title: "Unit Conversions",
      description:
        "Convert between different units of measurement including height, weight, distance, and temperature.",
      icon: Scale,
      calculators: ["Height", "Weight", "Distance", "Temperature"],
      badge: "Essential",
    },
    {
      id: "finance",
      title: "Finance",
      description:
        "Calculate loans, EMI, discounts, and currency conversions for smart financial planning.",
      icon: DollarSign,
      calculators: ["Loan Calculator", "EMI", "Discount", "Currency"],
      badge: "Popular",
    },
    {
      id: "maths-science",
      title: "Maths & Science",
      description:
        "Advanced scientific calculations, physics formulas, and chemistry computations.",
      icon: Beaker,
      calculators: ["Scientific", "Physics", "Chemistry"],
      badge: "Pro",
    },
    {
      id: "everyday-life",
      title: "Everyday Life",
      description:
        "Simple daily calculations including tip calculator, age calculator, and time zones.",
      icon: Clock,
      calculators: ["Tip Calculator", "Age Calculator", "Time Zone"],
      badge: "Quick tools",
    },
  ];

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const inTitle = c.title.toLowerCase().includes(q);
      const inDesc = c.description.toLowerCase().includes(q);
      const inCalcs = c.calculators.some((x) => x.toLowerCase().includes(q));
      return inTitle || inDesc || inCalcs;
    });
  }, [query]);

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft grid */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:56px_56px]" />
        {/* glow blobs */}
        <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 md:px-12 lg:px-20 py-14 sm:py-16 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center items-center">
            <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              Browse calculators by category
            </HoverBorderGradient>
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            Choose your{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              category
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Find the perfect calculator for your need — fast, clean, and
            organized like a modern SaaS experience.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 sm:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((item) => (
              <CategoryCard
                key={item.id}
                id={slugify(item.id)}
                title={item.title}
                description={item.description}
                icon={item.icon}
                calculators={item.calculators}
                badge={item.badge}
              />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="mt-10 text-center">
              <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/70 p-8 shadow-sm backdrop-blur">
                <p className="text-slate-900 font-medium">No matches found</p>
                <p className="mt-2 text-sm text-slate-600">
                  Try a different keyword like{" "}
                  <span className="font-medium">“BMI”</span>,{" "}
                  <span className="font-medium">“EMI”</span> or{" "}
                  <span className="font-medium">“Temperature”</span>.
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
