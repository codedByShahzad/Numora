import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Fast Online Calculators for Health, Finance & Conversions",
  description:
    "Use Numoro’s free calculators for BMI, calories, EMI, interest, and unit conversions. Fast, accurate, and easy to use.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Fast Online Calculators for Health, Finance & Conversions",
    description:
      "Calculate BMI, calories, EMI, interest, and conversions instantly with clean breakdowns and standard formulas.",
    url: "/",
    siteName: "Numoro",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Numoro – Fast Everyday Calculators",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Fast Online Calculators for Health, Finance & Conversions",
    description:
      "Fast, accurate calculators for health, finance, and unit conversions.",
    images: ["/og.png"],
  },
};


export default function Page() {
  return <HomePageClient />;
}
