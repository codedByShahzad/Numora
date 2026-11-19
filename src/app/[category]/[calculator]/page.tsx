import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import {
  CALCULATORS,
  SITE_NAME,
  absoluteUrl,
  calculatorPath,
  categoryPath,
  getCalculator,
  getCategory,
  ogImageFor,
  relatedCalculators,
} from "@/lib/site/catalog";
import { CALCULATOR_CONTENT } from "@/lib/site/registry";
import CalculatorLoader from "@/components/calculator/CalculatorLoader";
import { Breadcrumbs, JsonLd, RelatedCalculators, breadcrumbJsonLd, type Crumb } from "@/components/site/SeoBits";
import { Bullets, ContentSection, FaqList, Notice, SourcesList, Steps } from "@/components/site/ContentBlocks";
import { BLOGS } from "@/lib/blog";

type Params = { category: string; calculator: string };
type Props = { params: Promise<Params> };

// Only the calculators in the catalog exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return CALCULATORS.map((c) => ({ category: c.category, calculator: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, calculator } = await params;
  const calc = getCalculator(category, calculator);
  if (!calc) return { title: "Calculator not found", robots: { index: false, follow: true } };

  const path = calculatorPath(calc);
  const image = ogImageFor(calc);
  return {
    title: calc.metaTitle,
    description: calc.metaDescription,
    keywords: calc.keywords.length ? calc.keywords : undefined,
    alternates: { canonical: path },
    openGraph: {
      title: `${calc.metaTitle} | ${SITE_NAME}`,
      description: calc.metaDescription,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${calc.metaTitle} | ${SITE_NAME}`,
      description: calc.metaDescription,
      images: [image.url],
    },
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

export default async function CalculatorPage({ params }: Props) {
  const { category, calculator } = await params;
  const calc = getCalculator(category, calculator);
  const cat = getCategory(category);
  if (!calc || !cat) notFound();

  const content = CALCULATOR_CONTENT[calc.id];
  const related = relatedCalculators(calc);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: cat.name, path: categoryPath(cat.slug) },
    { name: calc.name, path: calculatorPath(calc) },
  ];

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: calc.name,
    url: absoluteUrl(calculatorPath(calc)),
    description: calc.metaDescription,
    applicationCategory: calc.category === "health" ? "HealthApplication" : calc.category === "maths-science" ? "EducationalApplication" : "FinanceApplication",
    operatingSystem: "Any (runs in a web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    ...(content ? { dateModified: content.lastReviewed } : {}),
  };

  /* ---------- Existing calculators: the component renders its own H1 ---------- */
  if (!content) {
    return (
      <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
        <JsonLd data={[webApp, breadcrumbJsonLd(crumbs)]} />
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-6">
          <CalculatorLoader id={calc.id} />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <RelatedCalculators items={related} title={`More ${cat.name.toLowerCase()} calculators`} />
          <p className="mt-8 text-sm text-gray-600">
            Browse all{" "}
            <Link href={categoryPath(cat.slug)} className="font-medium text-[#125FF9] hover:underline">
              {cat.name} calculators
            </Link>{" "}
            or{" "}
            <Link href="/categories/" className="font-medium text-[#125FF9] hover:underline">
              every category
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Full template: server-rendered content around the calculator ---------- */
  const posts = BLOGS.filter((b) => content.articles.includes(b.slug));
  const reviewed = formatDate(content.lastReviewed);

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
      <JsonLd data={[webApp, breadcrumbJsonLd(crumbs)]} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 lg:pb-16">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mt-4 max-w-3xl">
          <span className="hidden items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm sm:inline-flex">
            {cat.name} • Calculator
          </span>
          <h1 className="mt-1 text-3xl sm:mt-3 font-semibold tracking-tight sm:text-4xl">
            {calc.name.replace(/ Calculator$/, "")}{" "}
            <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">Calculator</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{content.lead}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarCheck aria-hidden className="h-3.5 w-3.5" />
            Rules and rates last reviewed {reviewed}
          </p>
        </header>

        <section aria-label={calc.name} className="mt-6">
          <CalculatorLoader id={calc.id} />
        </section>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <article className="space-y-10 lg:col-span-8">
            <ContentSection id="how-to-use" title={`How to use the ${calc.name.toLowerCase()}`}>
              <Steps items={content.howTo} />
            </ContentSection>
            <ContentSection id="formula" title="Formula">
              {content.formula}
            </ContentSection>
            <ContentSection id="worked-example" title="Worked example">
              {content.example}
            </ContentSection>
            <ContentSection id="how-it-works" title="How the calculation works">
              {content.explanation}
            </ContentSection>
            <ContentSection id="assumptions" title="Assumptions and limitations">
              <Bullets items={content.assumptions} />
              {content.disclaimer ? <Notice tone="warn">{content.disclaimer}</Notice> : null}
            </ContentSection>
            <ContentSection id="faq" title="Frequently asked questions">
              <FaqList items={content.faqs} />
            </ContentSection>
            <ContentSection id="sources" title="Sources and review">
              <SourcesList items={content.sources} />
              <p className="text-xs text-gray-500">
                Last reviewed {reviewed} by the Numoro team. Fee schedules and tax rules change; if you spot an outdated rate, please{" "}
                <Link href="/contact/" className="text-[#125FF9] hover:underline">
                  let us know
                </Link>
                .
              </p>
            </ContentSection>
          </article>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-black/10 bg-white/85 p-5 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold text-gray-900">On this page</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {[
                  ["how-to-use", "How to use"],
                  ["formula", "Formula"],
                  ["worked-example", "Worked example"],
                  ["how-it-works", "How the calculation works"],
                  ["assumptions", "Assumptions and limitations"],
                  ["faq", "FAQ"],
                  ["sources", "Sources and review"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-gray-600 hover:text-[#125FF9]">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              {posts.length > 0 && (
                <>
                  <h2 className="mt-6 text-sm font-semibold text-gray-900">Guides</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {posts.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/blog/${p.slug}/`} className="group inline-flex items-start gap-1 text-[#125FF9] hover:underline">
                          {p.title}
                          <ArrowUpRight aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-6 text-sm text-gray-600">
                Part of{" "}
                <Link href={categoryPath(cat.slug)} className="font-medium text-[#125FF9] hover:underline">
                  {cat.name} calculators
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>

        <RelatedCalculators items={related} />
      </div>
    </div>
  );
}
