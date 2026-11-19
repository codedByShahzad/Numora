import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { absoluteUrl, calculatorPath, type CalculatorData } from "@/lib/site/catalog";
import { iconForCalculator } from "@/lib/site/icons";

/** Renders a JSON-LD block. `<` is escaped so the data can't close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-gray-600 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-medium text-gray-900">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="hover:text-[#125FF9] hover:underline">
                    {c.name}
                  </Link>
                  <ChevronRight aria-hidden className="h-3.5 w-3.5 text-gray-400" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function CalculatorCard({ calc, headingLevel = "h3" }: { calc: CalculatorData; headingLevel?: "h2" | "h3" }) {
  const Icon = iconForCalculator(calc.id);
  const H = headingLevel;
  return (
    <Link
      href={calculatorPath(calc)}
      className="group flex h-full items-start gap-3 rounded-2xl border border-black/10 bg-white/85 p-4 shadow-[0_12px_32px_-24px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:border-[#125FF9]/30 hover:bg-white"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/10 bg-white">
        <Icon aria-hidden className="h-5 w-5 text-gray-900" />
      </span>
      <span className="min-w-0 flex-1">
        <H className="flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:text-[#125FF9]">
          {calc.name}
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
        </H>
        <span className="mt-1 block text-sm leading-snug text-gray-600">{calc.short}</span>
      </span>
    </Link>
  );
}

export function RelatedCalculators({ items, title = "Related calculators" }: { items: CalculatorData[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="related-calculators" className="mt-12">
      <h2 id="related-calculators" className="text-xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <CalculatorCard key={c.id} calc={c} />
        ))}
      </div>
    </section>
  );
}
