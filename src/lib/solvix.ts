/**
 * Solvix CMS integration (server only).
 *
 * Numoro pulls its published blogs from the Solvix integration API:
 *
 *   GET {SOLVIX_API_URL}/integration/blogs
 *   headers: X-API-Key, X-API-Secret
 *
 * Solvix only returns blogs that are `published` and belong to the website
 * the credentials were generated for, so drafts, archived posts and other
 * websites' posts never reach Numoro. The response is validated below and
 * turned into the `BlogPost` shape the existing blog pages already use.
 *
 * Credentials come from server environment variables only. Never import this
 * file into a "use client" component and never prefix these variables with
 * NEXT_PUBLIC_ (that would copy them into the browser bundle).
 */

import { BLOGS, type BlogBlock, type BlogPost, type BlogSection } from "./blog";

/** How often (seconds) Numoro asks Solvix for changes. */
export const SOLVIX_REVALIDATE_SECONDS = 60;

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

/** One node of the Solvix rich-text document (Tiptap / ProseMirror JSON). */
export type RichNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  text?: string;
  marks?: { type?: string; attrs?: Record<string, unknown> }[];
};

export type RichTocEntry = { id: string; title: string; level: 2 | 3 };

export type RichContent = { nodes: RichNode[]; toc: RichTocEntry[] };

/** A blog as the Numoro pages use it (local or from Solvix). */
export type NumoroPost = BlogPost & {
  source: "solvix" | "local";
  /** ISO date used for sorting (newest first). */
  sortISO: string;
  updatedISO?: string;
  authorName?: string;
  /** Rich-text body for posts written in the Solvix editor. */
  rich?: RichContent;
};

/** The few fields the listing page needs (keeps the client bundle small). */
export type BlogListItem = Pick<
  BlogPost,
  "slug" | "title" | "subtitle" | "heroImage" | "category" | "publishDate" | "readingTime"
>;

export class SolvixError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "SolvixError";
  }
}

/* -------------------------------------------------------------------------- */
/*                               API request                                  */
/* -------------------------------------------------------------------------- */

async function fetchSolvixBlogs(): Promise<unknown[]> {
  const apiUrl = process.env.SOLVIX_API_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.SOLVIX_API_KEY?.trim();
  const apiSecret = process.env.SOLVIX_API_SECRET?.trim();

  if (!apiUrl || !apiKey || !apiSecret) {
    throw new SolvixError(
      "Solvix is not configured: set SOLVIX_API_URL, SOLVIX_API_KEY and SOLVIX_API_SECRET."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/integration/blogs`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
        "X-API-Secret": apiSecret,
      },
      next: { revalidate: SOLVIX_REVALIDATE_SECONDS, tags: ["solvix-blogs"] },
    });
  } catch (error) {
    // Network problem (server down, wrong URL…). Logged without credentials.
    const cause = (error as { cause?: { code?: string } })?.cause?.code;
    throw new SolvixError(`Could not reach Solvix at ${apiUrl}${cause ? ` (${cause})` : ""}.`);
  }

  if (response.status === 401 || response.status === 403) {
    throw new SolvixError(
      "Solvix rejected the API credentials. Check SOLVIX_API_KEY / SOLVIX_API_SECRET, or regenerate them for Numoro in the Solvix dashboard.",
      response.status
    );
  }

  if (!response.ok) {
    throw new SolvixError(`Solvix responded with HTTP ${response.status}.`, response.status);
  }

  const body: unknown = await response.json().catch(() => null);
  const data = (body as { data?: unknown } | null)?.data;

  if (!body || typeof body !== "object" || !Array.isArray(data)) {
    throw new SolvixError("Solvix returned an unexpected response.");
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*                         Validation & conversion                            */
/* -------------------------------------------------------------------------- */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toISO(value: unknown): string | undefined {
  if (typeof value !== "string" && !(value instanceof Date)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** "October 15, 2025" — the same format the existing Numoro posts use. */
function formatDate(iso?: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function isRichNode(value: unknown): value is RichNode {
  return isRecord(value) && typeof value.type === "string";
}

export function richChildren(node: RichNode): RichNode[] {
  return Array.isArray(node.content) ? node.content.filter(isRichNode) : [];
}

/** Visible text of a node (same rule Solvix uses to build the TOC). */
export function richText(node: RichNode): string {
  if (node.type === "text") return typeof node.text === "string" ? node.text : "";
  if (node.type === "hardBreak") return " ";
  return richChildren(node).map(richText).join(node.type === "doc" ? " " : "");
}

/** The editor document + TOC, or undefined for posts that only have `sections`. */
function toRichContent(raw: Record<string, unknown>): RichContent | undefined {
  const doc = raw.contentJson;
  if (!isRecord(doc) || doc.type !== "doc" || !Array.isArray(doc.content)) return undefined;

  const nodes = doc.content.filter(isRichNode);
  if (!nodes.length) return undefined;

  const toc: RichTocEntry[] = Array.isArray(raw.toc)
    ? raw.toc
        .filter(isRecord)
        .filter((e) => str(e.id) && str(e.title))
        .map((e) => ({ id: str(e.id), title: str(e.title), level: e.level === 3 ? 3 : 2 }))
    : [];

  return { nodes, toc };
}

/** Legacy Solvix `sections` (paragraph / list blocks) → Numoro sections. */
function toSections(raw: Record<string, unknown>): BlogSection[] {
  if (!Array.isArray(raw.sections)) return [];

  return raw.sections.filter(isRecord).map((section, index) => {
    const blocks = Array.isArray(section.blocks) ? section.blocks.filter(isRecord) : [];

    const content = blocks
      .map((block): BlogBlock | null => {
        if (block.type === "list" && Array.isArray(block.items)) {
          const items = block.items.map(str).filter(Boolean);
          return items.length ? { type: "ul", items } : null;
        }
        const text = str(block.text);
        return text ? { type: "p", text } : null;
      })
      .filter((block): block is BlogBlock => block !== null);

    return {
      id: str(section.id) || `section-${index + 1}`,
      title: str(section.title),
      content,
    };
  });
}

function estimateReadingTime(words: number) {
  return `${Math.max(1, Math.round(words / 200))} min`;
}

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Only https/http URLs and site paths are used as images. */
function imageUrl(value: unknown): string {
  const v = str(value);
  return /^(https?:\/\/[^\s"'<>]+|\/(?!\/)[^\s"'<>]*)$/i.test(v) ? v : "";
}

function toNumoroPost(raw: unknown): NumoroPost | null {
  if (!isRecord(raw)) return null;

  const slug = str(raw.slug).toLowerCase();
  const title = str(raw.title);

  // Defence in depth: Solvix already filters, but never show anything that
  // is not explicitly published or has no usable slug/title.
  if (raw.status !== "published" || !SLUG_RE.test(slug) || !title) return null;

  const rich = toRichContent(raw);
  const sections = toSections(raw);

  const publishISO = toISO(raw.publishDate) ?? toISO(raw.createdAt);
  const updatedISO = toISO(raw.updatedAt);

  const words = rich
    ? countWords(rich.nodes.map(richText).join(" "))
    : countWords(
        sections
          .flatMap((s) => [s.title, ...s.content.map((b) => ("items" in b ? b.items.join(" ") : b.text))])
          .join(" ")
      );

  const heroImage = imageUrl(raw.heroImage) || imageUrl(raw.ogImage) || "/og.png";
  const author = isRecord(raw.author) ? str(raw.author.name) : "";
  const canonical = str(raw.canonicalPath);

  return {
    source: "solvix",
    slug,
    title,
    subtitle: str(raw.subtitle),
    heroImage,
    category: str(raw.category) || "General",
    publishDate: formatDate(publishISO),
    publishISO,
    sortISO: publishISO ?? updatedISO ?? new Date(0).toISOString(),
    updatedISO,
    readingTime: str(raw.readingTime) || estimateReadingTime(words),
    guideLabel: "This guide",
    guideValue: "",
    sections,
    rich,
    relatedSlugs: Array.isArray(raw.relatedSlugs) ? raw.relatedSlugs.map(str).filter(Boolean) : [],
    authorName: author || undefined,
    seoTitle: str(raw.seoTitle) || undefined,
    seoDescription: str(raw.seoDescription) || undefined,
    keywords: Array.isArray(raw.keywords) ? raw.keywords.map(str).filter(Boolean) : undefined,
    ogImage: imageUrl(raw.ogImage) || undefined,
    // Numoro serves posts under /blog/<slug>; ignore paths for other sites.
    canonicalPath: canonical.startsWith("/blog/") ? canonical : `/blog/${slug}`,
  };
}

function fromLocal(post: BlogPost): NumoroPost {
  const iso = post.publishISO ?? toISO(post.publishDate);
  return { ...post, source: "local", sortISO: iso ?? new Date(0).toISOString() };
}

/* -------------------------------------------------------------------------- */
/*                               Public API                                   */
/* -------------------------------------------------------------------------- */

/**
 * All blogs shown on Numoro, newest first: everything published in Solvix,
 * plus the posts that are still hard-coded in src/lib/blog.ts (a Solvix post
 * with the same slug replaces the local one).
 *
 * Throws a SolvixError if Solvix can't be reached or rejects the credentials.
 * Pages let that bubble up: with ISR, Next.js then keeps serving the last
 * good version, and only a page that was never generated shows the error UI.
 */
export async function getAllPosts(): Promise<NumoroPost[]> {
  const raw = await fetchSolvixBlogs();

  const fromSolvix: NumoroPost[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const post = toNumoroPost(item);
    if (!post || seen.has(post.slug)) continue;
    seen.add(post.slug);
    fromSolvix.push(post);
  }

  const local = BLOGS.filter((post) => !seen.has(post.slug)).map(fromLocal);

  return [...fromSolvix, ...local].sort((a, b) => b.sortISO.localeCompare(a.sortISO));
}

export async function getPostBySlug(slug: string): Promise<NumoroPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export function toListItem(post: NumoroPost): BlogListItem {
  return {
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    heroImage: post.heroImage,
    category: post.category,
    publishDate: post.publishDate,
    readingTime: post.readingTime,
  };
}
