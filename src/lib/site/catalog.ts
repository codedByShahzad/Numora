/**
 * Single source of truth for categories, calculators, URLs and SEO copy.
 * Data lives in src/data/site/catalog.json (also read by next.config.ts to
 * build the 301 redirects from the old /categories/... URLs).
 */
import data from "@/data/site/catalog.json";

export type CategoryData = {
  slug: string;
  name: string;
  icon: string;
  badge?: string;
  legacy?: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  guide?: [string, string][];
};

export type CalculatorData = {
  id: string;
  category: string;
  slug: string;
  name: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  legacyPaths: string[];
  related: string[];
  keywords: string[];
  kind: "new" | "existing";
};

export const SITE_NAME = "Numoro";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://numoro.net").replace(/\/+$/, "");

export const CATEGORIES = data.categories as CategoryData[];
export const CALCULATORS = data.calculators as CalculatorData[];

/** Categories in display order: the new rule-driven hubs first, then the classics. */
export const CATEGORY_ORDER = CATEGORIES.map((c) => c.slug);

export function getCategory(slug: string): CategoryData | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCalculatorById(id: string): CalculatorData | undefined {
  return CALCULATORS.find((c) => c.id === id);
}

export function getCalculator(category: string, slug: string): CalculatorData | undefined {
  return CALCULATORS.find((c) => c.category === category && c.slug === slug);
}

export function calculatorsIn(category: string): CalculatorData[] {
  return CALCULATORS.filter((c) => c.category === category);
}

export const categoryPath = (slug: string) => `/${slug}/`;
export const calculatorPath = (c: Pick<CalculatorData, "category" | "slug">) => `/${c.category}/${c.slug}/`;

/** Absolute URL with the trailing slash the site uses (`trailingSlash: true`). */
export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const withSlash = p.endsWith("/") || /\.[a-z0-9]+$/i.test(p) ? p : `${p}/`;
  return `${SITE_URL}${withSlash}`;
}

/** 3–6 related calculators: explicit list first, then siblings in the same category. */
export function relatedCalculators(calc: CalculatorData, max = 6): CalculatorData[] {
  const out: CalculatorData[] = [];
  const add = (c?: CalculatorData) => {
    if (c && c.id !== calc.id && !out.some((o) => o.id === c.id)) out.push(c);
  };
  calc.related.forEach((id) => add(getCalculatorById(id)));
  calculatorsIn(calc.category).forEach(add);
  return out.slice(0, max);
}

export const DEFAULT_OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "Numoro – fast, free online calculators" };

/** Social image for a calculator: a dedicated one for the new calculators, the site image otherwise. */
export function ogImageFor(calc: CalculatorData) {
  if (calc.kind === "new") {
    return { url: `/og/${calc.id}.jpg`, width: 1200, height: 630, alt: calc.name };
  }
  return DEFAULT_OG_IMAGE;
}
