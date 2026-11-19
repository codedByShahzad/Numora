import type { ReactNode } from "react";
import { ChevronDown, ExternalLink, Info } from "lucide-react";

export type Faq = { q: string; a: string };
export type Source = { title: string; url: string; date?: string };

export function ContentSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

export function Formula({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="overflow-x-auto rounded-2xl border border-[#125FF9]/15 bg-[#125FF9]/[0.04] px-4 py-3">
      <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900">{children}</code>
      {caption ? <figcaption className="mt-2 text-xs text-gray-600">{caption}</figcaption> : null}
    </figure>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-[#125FF9]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ol>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function WorkedTable({ rows, caption }: { rows: [string, string][]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
      <table className="w-full text-left text-sm">
        {caption ? <caption className="px-4 pt-3 text-left text-xs text-gray-500">{caption}</caption> : null}
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={i} className="border-t border-black/5 first:border-t-0">
              <th scope="row" className="px-4 py-2 font-medium text-gray-700">
                {k}
              </th>
              <td className="px-4 py-2 text-right font-semibold tabular-nums text-gray-900">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** FAQ list using native <details>, so answers are in the HTML and work without JavaScript. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.q} className="group rounded-2xl border border-black/10 bg-white/85 px-4 py-3 open:bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            <h3 className="text-sm font-semibold">{f.q}</h3>
            <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-gray-500 transition group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function SourcesList({ items }: { items: Source[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((s) => (
        <li key={s.url + s.title} className="flex items-start gap-2">
          <ExternalLink aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#125FF9] hover:underline">
              {s.title}
            </a>
            {s.date ? <span className="text-gray-500"> · {s.date}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  const cls =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-[#125FF9]/15 bg-[#125FF9]/[0.05] text-gray-800";
  return (
    <div className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
