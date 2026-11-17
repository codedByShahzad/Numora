import type { Metadata } from "next";
import BlogListClient from "../BlogListClient";
import { getAllPosts, toListItem } from "@/lib/solvix";

// Re-check Solvix for new, updated or unpublished posts every 60 seconds.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Clear explainers, product notes, and practical guides on health, finance, conversions, and everyday calculations — in Numoro style.",

  alternates: {
    canonical: "/blog",
  },

  openGraph: {
    title: "Blog | Numoro",
    description:
      "Clear explainers, product notes, and practical guides on health, finance, conversions, and everyday calculations.",
    url: "/blog",
    siteName: "Numoro",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Numoro Blog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog | Numoro",
    description:
      "Practical guides and clear explainers for calculators and everyday problem solving.",
    images: ["/og.png"],
  },
};


export default async function BlogPage() {
  const posts = await getAllPosts();
  return <BlogListClient posts={posts.map(toListItem)} />;
}
