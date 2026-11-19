// app/categories/page.tsx
import type { Metadata } from "next";
import CategoriesClient, { type CategoryListItem } from "../../components/CategoriesClient";
import { JsonLd, breadcrumbJsonLd } from "@/components/site/SeoBits";
import { CATEGORIES, calculatorsIn } from "@/lib/site/catalog";

const TITLE = "All Calculator Categories";
const DESCRIPTION =
  "Browse every Numoro calculator category: Tax & Pay, E-commerce Fees, Business & Freelance, Energy & EV, Health, Finance, Conversions, Maths and more.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/categories/" },
  openGraph: {
    title: `${TITLE} | Numoro`,
    description: DESCRIPTION,
    url: "/categories/",
    siteName: "Numoro",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Numoro – fast, free online calculators" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Numoro`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function CategoriesPage() {
  const items: CategoryListItem[] = CATEGORIES.map((c) => ({
    id: c.slug,
    title: c.name,
    description: c.short,
    iconName: c.icon,
    calculators: calculatorsIn(c.slug).map((x) => x.name.replace(/ (Calculator|Converter)$/, "")),
    badge: c.badge,
  }));
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories/" },
        ])}
      />
      <CategoriesClient items={items} />
    </>
  );
}
