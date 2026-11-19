/**
 * Local (in-repo) blog posts supporting the calculator clusters.
 * They're merged with Solvix posts by src/lib/solvix.ts (a Solvix post with the
 * same slug replaces the local one). Inline links use [text](/path) and
 * **bold** markers, rendered by src/app/blog/[slug]/page.tsx.
 */
import type { BlogPost } from "./blog";

const PUBLISHED = "November 19, 2026";
const PUBLISHED_ISO = "2026-11-19T00:00:00.000Z";

const base = {
  publishDate: PUBLISHED,
  publishISO: PUBLISHED_ISO,
  guideLabel: "Reviewed",
  guideValue: PUBLISHED,
};

export const LOCAL_POSTS: BlogPost[] = [

];
