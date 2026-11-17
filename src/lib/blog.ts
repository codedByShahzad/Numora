

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export type BlogSection = {
  id: string; // used for TOC + anchors
  title: string;
  content: BlogBlock[];
};

export type BlogPost = {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string; // online image URL
  category: string;
  publishDate: string; // human readable (e.g. "October 15, 2025")
  readingTime: string;
  guideLabel: string; // instead of author
  guideValue: string;
  sections: BlogSection[];
  relatedSlugs: string[];

  // ✅ SEO (optional but recommended)
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  ogImage?: string; // if you want different OG image than heroImage
  publishISO?: string; // ISO date for OG / schema (e.g. "2025-10-15T00:00:00.000Z")
  canonicalPath?: string; // e.g. "/blog/ai-in-healthcare"
};

export const BLOGS: BlogPost[] = [




];

export function getBlogBySlug(slug: string) {
  return BLOGS.find((b) => b.slug === slug) || null;
}

export function getRelatedBlogs(slugs: string[]) {
  const set = new Set(slugs);
  return BLOGS.filter((b) => set.has(b.slug));
}

