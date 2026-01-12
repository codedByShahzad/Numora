import Link from "next/link";
import Image from "next/image";
import { BLOGS } from "../../lib/blog";
import { CalendarDays, Clock, Folder, Search } from "lucide-react";

export const metadata = {
  title: "Blogs | Numora",
  description: "Clear explainers, product notes, and practical guides — in Numora style.",
};

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

export default function BlogListPage() {
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

          {/* Search (UI only) */}
          <div className="mt-8 flex items-center justify-center">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/80 shadow-sm px-4 py-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                placeholder="Search posts..."
                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              />
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BLOGS.map((post) => (
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

        <p className="mt-10 text-center text-sm text-slate-500">
          Numora blogs are designed to be simple, fast, and easy to understand.
        </p>
      </div>
    </div>
  );
}
