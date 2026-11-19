import type { MetadataRoute } from "next";
import { CALCULATORS, CATEGORIES, absoluteUrl, calculatorPath, categoryPath } from "@/lib/site/catalog";
import { getAllPosts, type NumoroPost } from "@/lib/solvix";
import { BLOGS } from "@/lib/blog";

/**
 * /sitemap.xml — every indexable page: home, hubs, calculators, blog.
 * Blog entries come from Solvix plus the local posts in src/lib/blogPosts.ts.
 * If Solvix is unreachable the sitemap still renders, with the local posts,
 * so Search Console never gets an error for it.
 * URLs end with "/" because next.config uses `trailingSlash: true`.
 */
export const revalidate = 3600;

// Date the page content or the rules behind it last changed meaningfully.
const CONTENT_UPDATED = "2026-11-19";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1, lastModified: CONTENT_UPDATED },
    { url: absoluteUrl("/categories/"), changeFrequency: "monthly", priority: 0.6, lastModified: CONTENT_UPDATED },
    { url: absoluteUrl("/blog/"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/about/"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact/"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const hubs: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: absoluteUrl(categoryPath(c.slug)),
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: CONTENT_UPDATED,
  }));

  const calculators: MetadataRoute.Sitemap = CALCULATORS.map((c) => ({
    url: absoluteUrl(calculatorPath(c)),
    changeFrequency: c.kind === "new" ? "weekly" : "monthly",
    priority: c.kind === "new" ? 0.9 : 0.7,
    ...(c.kind === "new" ? { lastModified: CONTENT_UPDATED } : {}),
  }));

  let posts: Pick<NumoroPost, "slug" | "canonicalPath" | "updatedISO" | "publishISO">[];
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error("[sitemap] Solvix unavailable, listing local posts only:", (error as Error).message);
    posts = BLOGS;
  }
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(post.canonicalPath ?? `/blog/${post.slug}`),
    lastModified: post.updatedISO ?? post.publishISO,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...pages, ...hubs, ...calculators, ...blogPosts];
}
