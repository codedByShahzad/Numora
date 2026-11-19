import type { Metadata } from "next";
import BlogListClient from "../BlogListClient";
import { getAllPosts, toListItem } from "@/lib/solvix";

// Re-check Solvix for new, updated or unpublished posts every 60 seconds.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Guides on Tax, Seller Fees, EV Costs & More",
  description:
    "Practical Numoro guides on US overtime tax, Etsy, TikTok Shop and Stripe fees, EV charging costs and everyday maths, with sources and worked examples.",

  alternates: {
    canonical: "/blog/",
  },

  openGraph: {
    title: "Guides on Tax, Seller Fees, EV Costs & More | Numoro",
    description:
      "Clear explainers, product notes, and practical guides on health, finance, conversions, and everyday calculations.",
    url: "/blog/",
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
    title: "Guides on Tax, Seller Fees, EV Costs & More | Numoro",
    description:
      "Practical guides and clear explainers for calculators and everyday problem solving.",
    images: ["/og.png"],
  },
};


export default async function BlogPage() {
  const posts = await getAllPosts();
  return <BlogListClient posts={posts.map(toListItem)} />;
}
