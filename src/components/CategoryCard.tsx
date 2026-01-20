// components/CategoryCard.tsx
import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface CategoryCardProps {
  title: string;
  id: string;
  description: string;
  icon: LucideIcon;
  calculators: string[];
  badge?: string;
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
      <div
        className="
          relative h-full rounded-3xl p-[1.25px]
          bg-gradient-to-r from-[#008FBE] to-[#125FF9]
          transition-transform duration-300
          group-hover:-translate-y-1
        "
      >
        <div
          className="
            relative flex h-full min-h-[360px] sm:min-h-[400px] md:min-h-[420px]
            flex-col overflow-hidden rounded-3xl
            bg-white
            shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]
            transition
            group-hover:shadow-[0_22px_55px_-32px_rgba(0,0,0,0.45)]
          "
        >
          <div className="p-6 sm:p-7 flex flex-col flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col items-start justify-center gap-4 min-w-0">
              {badge && (
                <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                  {badge}
                </span>
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                  <Icon className="h-6 w-6 text-slate-900" />
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
            </div>

            {/* Divider */}
            <div className="my-5 h-px w-full bg-slate-200" />

            {/* Popular calculators */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 mb-3">
                Popular calculators
              </p>

              <div className="grid grid-cols-2 gap-2 min-w-0">
                {calculators.slice(0, 6).map((c) => (
                  <span
                    key={c}
                    title={c}
                    className="
                      truncate text-center rounded-full
                      border border-slate-300 bg-white
                      px-3 py-1 text-xs text-slate-700
                    "
                  >
                    {c}
                  </span>
                ))}
              </div>

              {calculators.length > 6 && (
                <p className="mt-3 text-xs text-slate-500">
                  +{calculators.length - 6} more
                </p>
              )}
            </div>

            {/* Footer (your stacked layout) */}
            <div className="mt-6 flex flex-col w-full items-center justify-center gap-3">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  {calculators.length}+
                </span>{" "}
                tools inside
              </div>

              <div className="w-full">
                <Button title={title} id={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
