"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

type FAQItem = { q: string; a: string };

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // optional: first open by default

  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={it.q}
            className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                  <HelpCircle className="h-5 w-5 text-[#125FF9]" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{it.q}</span>
              </div>

              <span
                className={[
                  "grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white text-gray-900 shadow-sm",
                  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                <ChevronDown className="h-5 w-5" />
              </span>
            </button>

            {/* ✅ Smooth open/close */}
            <div
              className={[
                "overflow-hidden",
                "transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                // make it large so it never clamps early (still smooth)
                maxHeight: isOpen ? 800 : 0,
              }}
            >
              <div
                className={[
                  "pt-4 transform-gpu",
                  "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen ? "translate-y-0" : "-translate-y-1",
                ].join(" ")}
              >
                <p className="text-sm leading-relaxed text-gray-600">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
