"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

/**
 * Shown when the blog pages can't load posts from Solvix (server down, wrong
 * URL or rejected credentials) and there is no earlier cached version to
 * serve. Details are only logged on the server; visitors see a short message.
 */
export default function BlogError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  // Ask the server again (router.refresh) and re-render this segment.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="relative min-h-[70vh] bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Articles are temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We couldn&apos;t load the blog right now. Please try again in a moment.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-gradient-to-r from-[#008FBE] to-[#125FF9] px-5 py-2 text-sm font-medium text-white hover:shadow-md"
          >
            Try again
          </button>
          <Link href="/" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Go to calculators
          </Link>
        </div>
      </div>
    </div>
  );
}
