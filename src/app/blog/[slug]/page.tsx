import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Folder, ArrowUpRight } from "lucide-react";
import { BLOGS, getBlogBySlug } from "../../../lib/blog";
import type { BlogBlock, BlogSection } from "../../../lib/blog";

import TocClient from "./TocClient";

// ✅ REQUIRED when using `output: "export"` with dynamic routes
export function generateStaticParams() {
  return BLOGS.map((b) => ({ slug: b.slug }));
}
export const dynamicParams = false;

/** ✅ Change this to your real domain */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://numorrra.netlify.app";


function toISODateSafe(dateStr?: string) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** ✅ Dynamic metadata per blog post */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  // Not found
  if (!blog) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Blog Not Found",
      description:
        "Simple, accurate, and clean blogs by Numoro — calculators, finance, health, and productivity.",
      alternates: { canonical: "/blog" },
      robots: { index: false, follow: false },
      openGraph: {
        title: "Blog Not Found",
        description:
          "Simple, accurate, and clean blogs by Numoro — calculators, finance, health, and productivity.",
        url: "/blog",
        siteName: "Numoro",
        type: "website",
        images: [
          { url: "/og.png", width: 1200, height: 630, alt: "Numoro" },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Blog Not Found",
        description:
          "Simple, accurate, and clean blogs by Numoro — calculators, finance, health, and productivity.",
        images: ["/og.png"],
      },
    };
  }

  const title = blog.seoTitle ?? blog.title;
  const description = blog.seoDescription ?? blog.subtitle;

  // ✅ keep canonical as PATH (like your other pages)
  const canonicalPath = blog.canonicalPath ?? `/blog/${blog.slug}`;

  // ✅ allow absolute or relative hero image
  const image = blog.ogImage ?? blog.heroImage;

  const publishedTime =
    blog.publishISO ?? toISODateSafe(blog.publishDate) ?? undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: blog.keywords ?? [
      "Numoro",
      "blog",
      blog.category,
      "calculators",
      "finance",
      "health",
    ],
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },

    openGraph: {
      type: "article",
      siteName: "Numoro",
      url: canonicalPath,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function GridBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-l from-blue-100/80 via-blue-50/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
    </div>
  );
}

function SectionRenderer({ section }: { section: BlogSection }) {

  return (
    <section id={section.id} className="scroll-mt-28">
      <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
        {section.title}
      </h2>

      <div className="mt-4 space-y-4">
        {section.content.map((block: BlogBlock, idx: number) => {
          if (block.type === "p") {
            return (
              <p key={idx} className="text-slate-600 leading-relaxed">
                {block.text}
              </p>
            );
          }

          if (block.type === "h3") {
            return (
              <h3
                key={idx}
                className="text-base md:text-lg font-semibold text-slate-900"
              >
                {block.text}
              </h3>
            );
          }

          if (block.type === "ul") {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-2 text-slate-600">
                {block.items.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            );
          }

          if (block.type === "quote") {
            return (
              <div
                key={idx}
                className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-slate-700"
              >
                <p className="leading-relaxed">{block.text}</p>
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const blog = getBlogBySlug(slug);
  if (!blog) return notFound();

  // ✅ RELATED POSTS BY CATEGORY (Option B) — UI unchanged
  // - same category
  // - exclude current blog
  // - newest first
  // - max 6
  const related = BLOGS.filter(
    (b) => b.category === blog.category && b.slug !== blog.slug
  )
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    )
    .slice(0, 6);

  return (
    <div className="relative min-h-[92vh] bg-gray-50">
      <GridBackground />

      <div className="max-w-[100rem] mx-auto px-2 md:px-6 py-4 md:py-10 scroll-smooth">
        {/* HERO */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white/70 shadow-sm">
          {/* ✅ a little taller */}
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src={blog.heroImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />

            {/* ✅ stronger bottom gradient ONLY where text lies (works for any image) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* soft overall tint */}
              <div className="absolute inset-0 bg-black/10" />

              {/* main readability gradient (bottom focused) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

              {/* extra bottom “band” so title never disappears on bright/complex images */}
              <div className="absolute left-0 right-0 bottom-0 h-[58%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* subtle blur behind the bottom area */}
              <div className="absolute left-0 right-0 bottom-0 h-[46%] backdrop-blur-[2px]" />
            </div>

            {/* content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs text-slate-700">
                <Folder className="w-4 h-4 text-blue-600" />
                {blog.category}
              </div>

              {/* ✅ tiny text shadow helps on every image */}
              <h1
                className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight text-white"
                style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
              >
                {blog.title}
              </h1>

              <p
                className="mt-2 text-white/85 max-w-3xl leading-relaxed"
                style={{ textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}
              >
                {blog.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT + SIDEBAR */}
        <section className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm p-6 md:p-8">
                <div className="space-y-10">
                  {blog.sections.map((s) => (
  <SectionRenderer key={s.id} section={s} />
))}

                </div>
              </div>
            </div>

            {/* RIGHT */}
            <aside className="lg:col-span-4 self-start lg:sticky lg:top-24">
              <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900">
                  Post details
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Publish date
                    </span>
                    <span className="text-slate-700 font-medium">
                      {blog.publishDate}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 inline-flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Category
                    </span>
                    <span className="text-slate-700 font-medium">
                      {blog.category}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 inline-flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Reading time
                    </span>
                    <span className="text-slate-700 font-medium">
                      {blog.readingTime}
                    </span>
                  </div>
                </div>

                <div className="mt-6 h-px bg-slate-200/70" />

                <h3 className="mt-6 text-sm font-semibold text-slate-900">
                  Table of contents
                </h3>

                <TocClient
                  sections={blog.sections.map((s) => ({
                    id: s.id,
                    title: s.title,
                  }))}
                />

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-sm text-slate-700">
                    Numoro blogs follow the same promise:
                    <span className="font-semibold"> simple, accurate, clean.</span>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

       {/* RELATED POSTS */}
{related.length > 0 && (
  <section className="mt-10">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">Related posts</h3>
      <Link
  href="/blog"
  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#008FBE] to-[#125FF9] px-4 py-2 text-sm font-medium text-white  hover:shadow-md"
>
  <span>View all</span>
  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
</Link>

    </div>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {related.map((p) => (
        <Link
          key={p.slug}
          href={`/blog/${p.slug}`}
          className="group rounded-3xl border border-slate-200 bg-white/80 shadow-sm overflow-hidden hover:border-blue-200 hover:bg-blue-50/30 transition"
        >
          <div className="relative h-40">
            <Image src={p.heroImage} alt={p.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs bg-white/90 border border-slate-200 text-slate-700">
                {p.category}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h4 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
              {p.title}
            </h4>
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {p.subtitle}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                {p.publishDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {p.readingTime}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
)}


        <p className="mt-10 text-center text-sm text-slate-500">
          Numoro blogs are designed to be simple, fast, and easy to understand.
        </p>
      </div>
    </div>
  );
}
