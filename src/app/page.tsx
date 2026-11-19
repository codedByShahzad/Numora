import type { Metadata } from "next";
import HomePageClient, { type HomeCalculator, type HomeCategory } from "./HomePageClient";
import { JsonLd } from "@/components/site/SeoBits";
import { CALCULATORS, CATEGORIES, SITE_NAME, SITE_URL, calculatorPath, calculatorsIn } from "@/lib/site/catalog";

const TITLE = "Free Calculators for Tax, Fees, Finance & Health";
const DESCRIPTION =
  "Free calculators for US overtime tax, Etsy, TikTok Shop and Stripe fees, EV charging costs, loans, BMI and unit conversions, with clear breakdowns.";

export const metadata: Metadata = {
  // `absolute` skips the "| Numoro" template so the brand isn't repeated.
  title: { absolute: `${TITLE} | ${SITE_NAME}` },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} – ${TITLE}`,
    description: DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Numoro – fast, free online calculators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – ${TITLE}`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function Page() {
  const categories: HomeCategory[] = CATEGORIES.map((c) => ({
    id: c.slug,
    title: c.name,
    description: c.short,
    iconName: c.icon,
    calculators: calculatorsIn(c.slug).map((x) => x.name.replace(/ (Calculator|Converter)$/, "")),
    badge: c.badge ?? "",
  }));
  const calculators: HomeCalculator[] = CALCULATORS.map((c) => {
    const cat = CATEGORIES.find((k) => k.slug === c.category)!;
    return { name: c.name, categoryId: c.category, categoryTitle: cat.name, href: calculatorPath(c), keywords: [c.short, ...c.keywords] };
  });

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    email: "support@numoro.net",
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  };

  return (
    <>
      <JsonLd data={[organization, website]} />
      <HomePageClient
        categories={categories}
        calculators={calculators}
        featuredIds={["tax", "ecommerce-fees", "business"]}
        totals={{ calculators: CALCULATORS.length, categories: CATEGORIES.length }}
      />
    </>
  );
}
