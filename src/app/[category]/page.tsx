import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  CATEGORIES,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  calculatorPath,
  calculatorsIn,
  categoryPath,
  getCalculatorById,
  getCategory,
} from "@/lib/site/catalog";
import { iconForCategory } from "@/lib/site/icons";
import { Breadcrumbs, CalculatorCard, JsonLd, breadcrumbJsonLd } from "@/components/site/SeoBits";
import { getPostsForCalculators } from "@/lib/blog";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

/** Where a user journey genuinely crosses between hubs (research doc, section 8). */
const CROSS_LINKS: Record<string, string[]> = {
  tax: ["business", "finance"],
  "ecommerce-fees": ["business"],
  business: ["ecommerce-fees", "tax"],
  energy: ["finance"],
  finance: ["tax", "business"],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Category not found", robots: { index: false, follow: true } };
  const path = categoryPath(cat.slug);
  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: `${cat.metaTitle} | ${SITE_NAME}`,
      description: cat.metaDescription,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: `${cat.metaTitle} | ${SITE_NAME}`, description: cat.metaDescription, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function CategoryHub({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const calcs = calculatorsIn(cat.slug);
  const posts = getPostsForCalculators(calcs.map((c) => c.id));
  const Icon = iconForCategory(cat.icon);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: cat.name, path: categoryPath(cat.slug) },
  ];
  const cross = (CROSS_LINKS[cat.slug] ?? []).map(getCategory).filter(Boolean);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.name} calculators`,
    description: cat.metaDescription,
    url: absoluteUrl(categoryPath(cat.slug)),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: calcs.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(calculatorPath(c)), name: c.name })),
    },
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAFF] text-gray-900">
      <JsonLd data={[itemList, breadcrumbJsonLd(crumbs)]} />
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-6">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mt-6 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
            <Icon aria-hidden className="h-4 w-4 text-[#125FF9]" />
            {calcs.length} {calcs.length === 1 ? "calculator" : "calculators"}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {cat.name}{" "}
            <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">calculators</span>
          </h1>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-gray-700 sm:text-base">
            {cat.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </header>

        <section aria-labelledby="calculators-heading" className="mt-10">
          <h2 id="calculators-heading" className="text-xl font-semibold tracking-tight">
            Calculators
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calcs.map((c) => (
              <CalculatorCard key={c.id} calc={c} />
            ))}
          </div>
        </section>

        {cat.guide && cat.guide.length > 0 && (
          <section aria-labelledby="which-heading" className="mt-12 max-w-3xl">
            <h2 id="which-heading" className="text-xl font-semibold tracking-tight">
              Which calculator do I need?
            </h2>
            <ul className="mt-4 space-y-2">
              {cat.guide.map(([situation, id]) => {
                const c = getCalculatorById(id);
                if (!c) return null;
                return (
                  <li key={situation} className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/85 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-700">{situation}</span>
                    <Link href={calculatorPath(c)} className="inline-flex items-center gap-1 text-sm font-semibold text-[#125FF9] hover:underline">
                      {c.name} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {posts.length > 0 && (
          <section aria-labelledby="guides-heading" className="mt-12">
            <h2 id="guides-heading" className="text-xl font-semibold tracking-tight">
              Guides
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="group rounded-2xl border border-black/10 bg-white/85 p-4 transition hover:border-[#125FF9]/30 hover:bg-white"
                >
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#125FF9]">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.subtitle}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {cross.length > 0 && (
          <section aria-labelledby="also-heading" className="mt-12">
            <h2 id="also-heading" className="text-xl font-semibold tracking-tight">
              Related categories
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {cross.map((c) => (
                <Link
                  key={c!.slug}
                  href={categoryPath(c!.slug)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:text-[#125FF9]"
                >
                  {c!.name}
                </Link>
              ))}
              <Link href="/categories/" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:text-[#125FF9]">
                All categories
              </Link>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
