import type { Metadata } from "next";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Clear explainers, product notes, and practical guides on health, finance, conversions, and everyday calculations — in Numora style.",

  alternates: {
    canonical: "/blog",
  },

  openGraph: {
    title: "Blog | Numora",
    description:
      "Clear explainers, product notes, and practical guides on health, finance, conversions, and everyday calculations.",
    url: "/blog",
    siteName: "Numora",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Numora Blog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog | Numora",
    description:
      "Practical guides and clear explainers for calculators and everyday problem solving.",
    images: ["/og.png"],
  },
};


export default function BlogPage() {
  return <BlogListClient />;
}
