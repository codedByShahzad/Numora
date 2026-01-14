// app/categories/page.tsx
import type { Metadata } from "next";
import CategoriesClient from "../../components/CategoriesClient";

export const metadata: Metadata = {
  title: "Calculator Categories for Health, Finance & Conversions | Numora",
  description:
    "Browse all calculator categories on Numora including Health, Finance, Unit Conversions, Math & Science, and Everyday Life tools.",

  alternates: {
    canonical: "/categories",
  },

  openGraph: {
    title: "Calculator Categories | Numora",
    description:
      "Explore all calculator categories on Numora — health, finance, conversions, maths, science, and everyday tools.",
    url: "/categories",
    siteName: "Numora",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Numora – Fast Everyday Calculators",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Calculator Categories | Numora",
    description:
      "Health, finance, conversions, maths, science, and everyday calculators — all in one place.",
    images: ["/og.png"],
  },
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
