/**
 * Small money helpers shared by the calculators.
 *
 * Amounts are plain numbers in major units (dollars, pounds). Every value that
 * is shown or summed is rounded to whole cents with `roundMoney`, which first
 * trims binary floating-point noise (1.005 * 100 = 100.49999…) by going through
 * 15 significant digits, then rounds half away from zero.
 */

export type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-IE",
  CAD: "en-CA",
  AUD: "en-AU",
};

function trim(n: number): number {
  return Number(n.toPrecision(15));
}

/** Round to `decimals` places, half away from zero, without float drift. */
export function roundTo(n: number, decimals = 2): number {
  if (!Number.isFinite(n)) return NaN;
  const factor = 10 ** decimals;
  const scaled = trim(Math.abs(n) * factor);
  const rounded = Math.round(scaled) / factor;
  return n < 0 ? -rounded : rounded;
}

/** Round a money amount to cents. */
export function roundMoney(n: number): number {
  return roundTo(n, 2);
}

/** Percentage of an amount, rounded to cents (e.g. pct(12.5, 0.065)). */
export function pct(amount: number, rate: number): number {
  return roundMoney(amount * rate);
}

/** Sum money values without accumulating float error. */
export function sumMoney(...values: number[]): number {
  const cents = values.reduce((acc, v) => acc + Math.round(trim(v * 100)), 0);
  return cents / 100;
}

/** Subtract money values (a - b - c …) in cents. */
export function subMoney(a: number, ...rest: number[]): number {
  const cents = rest.reduce((acc, v) => acc - Math.round(trim(v * 100)), Math.round(trim(a * 100)));
  return cents / 100;
}

export function formatMoney(amount: number, currency: CurrencyCode = "USD"): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount === 0 ? 0 : amount); // avoid "-$0.00"
}

export function formatPercent(rate: number, decimals = 2): string {
  if (!Number.isFinite(rate)) return "—";
  return `${roundTo(rate * 100, decimals).toFixed(decimals)}%`;
}

export function currencySymbol(currency: CurrencyCode): string {
  return { USD: "$", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$" }[currency];
}

/**
 * Parse a user-typed number. Empty strings return `null` (field left blank);
 * anything that is not a finite number returns NaN so validation can flag it.
 * Commas used as thousands separators are accepted ("1,250.50").
 */
export function parseNumber(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  const s = raw.trim().replace(/,/g, "");
  if (s === "") return null;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Smallest whole-cent value in [lo, hi] for which `predicate` is true, assuming
 * the predicate is monotone (false … false true … true). Returns null if even
 * `hi` fails. Used by the reverse ("what should I charge?") modes, so the answer
 * is always checked with the exact forward calculation and its rounding.
 */
export function smallestCentSatisfying(
  predicate: (amount: number) => boolean,
  lo = 0,
  hi = 10_000_000
): number | null {
  let loC = Math.round(lo * 100);
  let hiC = Math.round(hi * 100);
  if (!predicate(hiC / 100)) return null;
  if (predicate(loC / 100)) return loC / 100;
  while (hiC - loC > 1) {
    const mid = Math.floor((loC + hiC) / 2);
    if (predicate(mid / 100)) hiC = mid;
    else loC = mid;
  }
  return hiC / 100;
}

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export type CalcOutcome<R, K extends string = string> =
  | { ok: true; result: R }
  | { ok: false; errors: FieldErrors<K> };
