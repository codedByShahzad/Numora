"use client";

import React, { useMemo, useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import type { LucideIcon } from "lucide-react";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { iconForCategory } from "@/lib/site/icons";

export type CategoryListItem = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  calculators: string[];
  badge?: string;
};

type Cat = CategoryListItem & { icon: LucideIcon };

export default function CategoriesClient({ items }: { items: CategoryListItem[] }) {
  const categories: Cat[] = useMemo(() => items.map((c) => ({ ...c, icon: iconForCategory(c.iconName) })), [items]);

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
  }, [query, categories]);

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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
            Every Numoro calculator, grouped by topic — from US tax and seller
            fees to health, finance, conversions and everyday math.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 sm:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((item) => (
              <CategoryCard
                key={item.id}
                id={item.id}
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
