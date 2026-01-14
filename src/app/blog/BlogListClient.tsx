"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOGS } from "../../lib/blog";
import { CalendarDays, Clock, Folder } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

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

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function BlogListClient() {
  const [query, setQuery] = useState("");

  // ✅ Categories from existing BLOGS (unique)
  const categories = useMemo(() => {
    const set = new Set<string>();
    BLOGS.forEach((b) => set.add(b.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  // ✅ Build searchable text (title + subtitle + category + slug)
  // const searchableBlogs = useMemo(() => {
  //   return BLOGS.map((b) => {
  //     const cat = b.category ?? "";
  //     const haystack = [
  //       b.title,
  //       b.subtitle,
  //       cat,
  //       slugify(cat),
  //       b.slug,
  //       b.publishDate,
  //     ]
  //       .filter(Boolean)
  //       .join(" ")
  //       .toLowerCase();

  //     return { ...b, _search: haystack };
  //   });
  // }, []);

  // ✅ Filter by query:
  // - If query matches a category name -> show those blogs
  // - Otherwise do normal search across title/subtitle/category
const filteredBlogs = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return BLOGS;

  // category match
  const categoryHit = categories.find(
    (c) => c.toLowerCase() === q || slugify(c) === q
  );

  if (categoryHit) {
    return BLOGS.filter(
      (b) => (b.category ?? "").toLowerCase() === categoryHit.toLowerCase()
    );
  }

  // normal search (no _search field)
  return BLOGS.filter((b) => {
    const cat = b.category ?? "";
    const haystack = [
      b.title,
      b.subtitle,
      cat,
      slugify(cat),
      b.slug,
      b.publishDate,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}, [query, categories]);


  // ✅ Aceternity UI placeholders: include categories + common searches
  const placeholders = useMemo(() => {
    const base = [
      "Search posts by title, topic, or category…",
      "Try: “SEO”, “BMI”, “Unit Conversions”…",
      "Type a category like “Finance” or “Health”…",
      "Search by keyword: “calculator”, “guide”, “tips”…",
    ];

    const catSamples = categories.slice(0, 6).map((c) => `Category: ${c}`);
    return [...base, ...catSamples];
  }, [categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="relative min-h-[92vh] px-6 py-16 bg-gray-50 overflow-hidden">
      <GridBackground />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 shadow-sm text-sm text-slate-600">
            <Folder className="w-4 h-4 text-blue-600" />
            Numora Blog
          </div>

          <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            Guides built for <span className="text-blue-600">clarity</span>
          </h1>

          <p className="mt-4 text-slate-600 leading-relaxed">
            Clean explainers and practical posts — designed to match the Numora experience.
          </p>

          {/* ✅ Aceternity UI Search */}
          <div className="mt-8 flex items-center justify-center">
            <div className="w-full max-w-xl">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
              />
            </div>
          </div>

          {/* ✅ Category quick filters */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setQuery("")}
              className={`rounded-full border px-3 py-1 text-xs shadow-sm transition ${
                !query.trim()
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              All
            </button>

            {categories.map((c) => {
              const active =
                query.trim().toLowerCase() === c.toLowerCase() ||
                query.trim().toLowerCase() === slugify(c);

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setQuery(c)}
                  className={`rounded-full border px-3 py-1 text-xs shadow-sm transition ${
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <p className="mt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredBlogs.length}
            </span>{" "}
            post{filteredBlogs.length === 1 ? "" : "s"}
            {query.trim() ? (
              <>
                {" "}
                for{" "}
                <span className="font-semibold text-slate-700">
                  “{query.trim()}”
                </span>
              </>
            ) : null}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white/80 shadow-sm overflow-hidden hover:border-blue-200 hover:bg-blue-50/30 transition"
            >
              <div className="relative h-44">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs bg-white/90 border border-slate-200 text-slate-700">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
                  {post.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {post.subtitle}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {post.publishDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readingTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filteredBlogs.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-600">
              No blogs found for{" "}
              <span className="font-semibold">“{query.trim()}”</span>.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Tip: try a category name (e.g. {categories[0] ?? "Health"}) or a keyword from the title.
            </p>
          </div>
        ) : null}

        <p className="mt-10 text-center text-sm text-slate-500">
          Numora blogs are designed to be simple, fast, and easy to understand.
        </p>
      </div>
    </div>
  );
}
