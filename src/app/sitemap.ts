import type { MetadataRoute } from "next";
import { calculatorsData } from "./data";
import { getAllPosts } from "@/lib/solvix";

/**
 * /sitemap.xml — the site's pages plus every published blog post.
 * Blog entries come from Solvix, so new posts are added (and unpublished or
 * deleted ones removed) automatically when the sitemap revalidates.
 * URLs end with "/" because next.config uses `trailingSlash: true`.
 */
export const revalidate = 60;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://numoro.net").replace(/\/+$/, "");

const url = (path: string) => `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["/", "/categories/", "/blog/", "/about/", "/contact/"].map((path) => ({
    url: url(path),
    changeFrequency: path === "/blog/" ? "daily" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const calculators: MetadataRoute.Sitemap = Object.entries(calculatorsData).flatMap(([category, items]) => [
    { url: url(`/categories/${category}`), changeFrequency: "monthly" as const, priority: 0.7 },
    ...items.map((item) => ({
      url: url(`/categories/${category}/${item.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]);

  const posts = await getAllPosts();
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: url(post.canonicalPath ?? `/blog/${post.slug}`),
    lastModified: post.updatedISO ?? post.publishISO,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...pages, ...calculators, ...blogPosts];
}
