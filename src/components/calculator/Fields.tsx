/**
 * Form controls shared by the calculators. Plain components (no hooks), styled
 * to match the existing Numoro calculator cards. Every control has a real
 * <label> tied to its input, helper text via aria-describedby and an error
 * message announced with role="alert".
 */
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

const boxBase =
  "mt-2 flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30";

type NumberFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: ReactNode;
  error?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
  className?: string;
};

export function NumberField({
  id,
  label,
  value,
  onChange,
  help,
  error,
  prefix,
  suffix,
  placeholder,
  inputMode = "decimal",
  className = "",
}: NumberFieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errId = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className={`${boxBase} ${error ? "border-amber-400" : "border-black/10"}`}>
        {prefix ? <span className="text-sm font-semibold text-gray-600">{prefix}</span> : null}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[helpId, errId].filter(Boolean).join(" ") || undefined}
          className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        {suffix ? <span className="whitespace-nowrap text-sm font-semibold text-gray-600">{suffix}</span> : null}
      </div>
      {help ? (
        <p id={helpId} className="mt-1.5 text-xs leading-snug text-gray-600">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errId} role="alert" className="mt-1.5 flex items-start gap-1 text-xs font-medium text-amber-800">
          <AlertTriangle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Option = { value: string; label: string };

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  help,
  error,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  help?: ReactNode;
  error?: string;
  className?: string;
}) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className={`${boxBase} ${error ? "border-amber-400" : "border-black/10"}`}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={helpId}
          className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {help ? (
        <p id={helpId} className="mt-1.5 text-xs leading-snug text-gray-600">
          {help}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-amber-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  help,
}: {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={help ? `${id}-help` : undefined}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#125FF9]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {help ? (
          <p id={`${id}-help`} className="mt-0.5 text-xs leading-snug text-gray-600">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Radio group styled as a segmented control (keyboard: arrow keys move between options). */
export function Segmented({
  name,
  legend,
  value,
  onChange,
  options,
  className = "",
}: {
  name: string;
  legend: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="text-sm font-semibold text-gray-900">{legend}</legend>
      <div className="mt-2 grid auto-cols-fr grid-flow-col gap-1 rounded-2xl border border-black/10 bg-gray-50 p-1">
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          const active = o.value === value;
          return (
            <div key={o.value} className="min-w-0">
              <input
                type="radio"
                id={id}
                name={name}
                value={o.value}
                checked={active}
                onChange={() => onChange(o.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`block cursor-pointer truncate rounded-xl px-2 py-2 text-center text-xs font-semibold transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#125FF9]/50 sm:text-sm ${
                  active ? "bg-white text-[#125FF9] shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {o.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-black/10 bg-white/85 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  );
}

export function BreakdownRow({
  label,
  value,
  hint,
  strong = false,
  negative = false,
}: {
  label: ReactNode;
  value: string;
  hint?: ReactNode;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${strong ? "border-t border-black/10 pt-3" : ""}`}>
      <dt className={`text-sm ${strong ? "font-semibold text-gray-900" : "text-gray-700"}`}>
        {label}
        {hint ? <span className="mt-0.5 block text-xs font-normal text-gray-500">{hint}</span> : null}
      </dt>
      <dd className={`whitespace-nowrap text-sm tabular-nums ${strong ? "font-semibold text-gray-900" : negative ? "text-gray-900" : "text-gray-900"}`}>
        {negative && value !== "—" ? `− ${value}` : value}
      </dd>
    </div>
  );
}

export function StatTile({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-gray-900";
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums tracking-tight ${color}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-gray-500">{sub}</div> : null}
    </div>
  );
}

export function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-4 space-y-2">
      {items.map((w) => (
        <li key={w} className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900">
          <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{w}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyResult({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 px-4 py-6 text-center text-sm text-gray-600">
      {children}
    </div>
  );
}

/**
 * Mobile-only bar pinned to the bottom of the screen with the headline result,
 * so people see the answer update while they edit the form. Links to the full
 * breakdown (element with id `targetId`). Hidden on large screens, where the
 * result card sits beside the form.
 */
export function MobileResultBar({ label, value, targetId }: { label: string; value: string | null; targetId: string }) {
  if (value === null) return null;
  return (
    <div className="mobile-result-bar fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 py-2.5 shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.35)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</div>
          <div className="truncate text-lg font-semibold tabular-nums text-gray-900" aria-hidden>
            {value}
          </div>
        </div>
        <a href={`#${targetId}`} className="shrink-0 rounded-full bg-gradient-to-r from-[#008FBE] to-[#125FF9] px-4 py-2 text-sm font-semibold text-white">
          See breakdown
        </a>
      </div>
    </div>
  );
}
