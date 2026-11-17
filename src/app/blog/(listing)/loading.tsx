/**
 * Loading skeleton for /blog — shown immediately while the posts are fetched
 * from Solvix, then replaced by BlogListClient. Mirrors its layout (header,
 * search, category chips, card grid) so the swap doesn't jump.
 *
 * It lives in the (listing) route group (the URL is still /blog) so it does
 * not wrap /blog/[slug]: a loading boundary above the article page would make
 * unpublished or deleted posts answer "200" instead of a real 404.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-slate-200/70 ${className}`} />;
}

export default function BlogLoading() {
  return (
    <div
      className="relative min-h-[92vh] px-4 md:px-6 py-8 md:py-16 bg-gray-50 overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading articles…</span>

      <div aria-hidden="true" className="max-w-7xl mx-auto motion-safe:animate-pulse">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="h-[30px] w-32 rounded-full border border-slate-200 bg-white/70" />
          <Bar className="mt-6 h-10 md:h-12 w-[min(100%,28rem)] rounded-xl" />
          <Bar className="mt-4 h-4 w-[min(100%,26rem)]" />
          <div className="mt-8 h-12 w-full max-w-xl rounded-full border border-slate-200 bg-white/80" />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["w-10", "w-16", "w-20", "w-14"].map((w, i) => (
              <div key={i} className={`h-6 ${w} rounded-full border border-slate-200 bg-white/70`} />
            ))}
          </div>
          <Bar className="mt-4 h-4 w-32" />
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm overflow-hidden">
              <div className="h-44 bg-slate-200/70" />
              <div className="p-5">
                <Bar className="h-4 w-full" />
                <Bar className="mt-2 h-4 w-2/3" />
                <Bar className="mt-4 h-3 w-full" />
                <Bar className="mt-2 h-3 w-5/6" />
                <Bar className="mt-5 h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
