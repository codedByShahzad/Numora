"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function TocClient({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState<string>(sections?.[0]?.id ?? "");
  const navRef = useRef<HTMLElement | null>(null);

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // update hash without jump
    if (history.replaceState) history.replaceState(null, "", `#${id}`);
    else window.location.hash = id;

    setActiveId(id);
  };

  useEffect(() => {
    if (!ids.length) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        const nextId = (visible[0]?.target as HTMLElement | undefined)?.id;
        if (nextId) setActiveId(nextId);
      },
      {
        root: null,
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0.08, 0.15, 0.25, 0.35, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  // ✅ DO NOT auto-scroll TOC while user scrolls the page (THIS WAS CAUSING THE BUG)
  // If you want this behavior only on desktop, I can add a safe version.

  return (
    <nav
      ref={navRef}
      className="mt-3 space-y-2 max-h-[48vh] overflow-auto pr-1 overscroll-contain"
    >
      {sections.map((s) => {
        const isActive = s.id === activeId;

        return (
          <button
            key={s.id}
            data-toc-id={s.id}
            type="button"
            onClick={() => scrollToId(s.id)}
            className={[
              "w-full text-left group flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm transition",
              isActive
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-white/60 text-slate-700 hover:border-blue-200 hover:bg-blue-50",
            ].join(" ")}
            aria-current={isActive ? "true" : undefined}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className={[
                  "h-5 w-[3px] rounded-full transition",
                  isActive ? "bg-blue-600" : "bg-slate-200 group-hover:bg-blue-300",
                ].join(" ")}
              />
              <span className="line-clamp-1">{s.title}</span>
            </span>

            <span
              className={[
                "transition",
                isActive
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-blue-600",
              ].join(" ")}
            >
              →
            </span>
          </button>
        );
      })}
    </nav>
  );
}
