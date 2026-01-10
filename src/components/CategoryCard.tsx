// components/CategoryCard.tsx
import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface CategoryCardProps {
  title: string;
  id: string;
  description: string;
  icon: LucideIcon;
  calculators: string[];
  badge?: string; // optional (won't break anything if not passed)
}

export function CategoryCard({
  title,
  id,
  description,
  icon: Icon,
  calculators,
  badge,
}: CategoryCardProps) {
  return (
    <div className="group relative h-full">
      {/* Soft glow on hover */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition duration-500 group-hover:opacity-100 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />

      <div className="relative flex h-full min-h-[360px] sm:min-h-[400px] md:min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {/* top subtle gradient line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

        <div className="p-6 sm:p-7 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Icon badge */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/30 to-indigo-400/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/75 shadow-sm">
                  <Icon className="h-6 w-6 text-slate-900" />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {description}
                </p>
              </div>
            </div>

            {/* Optional badge */}
            {badge ? (
              <span className="shrink-0 rounded-full border border-white/10 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                {badge}
              </span>
            ) : null}
          </div>

          {/* Divider */}
          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

          {/* Chips */}
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 mb-3">
              Popular calculators
            </p>

            <div className="flex flex-wrap gap-2">
              {calculators.slice(0, 6).map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-xs text-slate-700"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* If list is long */}
            {calculators.length > 6 ? (
              <p className="mt-3 text-xs text-slate-500">
                +{calculators.length - 6} more
              </p>
            ) : null}
          </div>

          {/* Footer CTA */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {calculators.length}+
              </span>{" "}
              tools inside
            </div>

            <div className="transition-transform duration-300 group-hover:translate-x-0.5">
              <Button title={title} id={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
