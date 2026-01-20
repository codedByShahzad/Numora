"use client";

import React, { useMemo, useState } from "react";
import {
  Beaker,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type Mode = "molarity" | "density" | "moles";

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const fmt = (n: number, decimals = 4) => {
  if (!Number.isFinite(n)) return "—";
  const fixed = Number(n.toFixed(decimals));
  // trim trailing zeros
  return fixed.toString();
};

export default function ChemistryCalculator() {
  const [mode, setMode] = useState<Mode>("molarity");

  // shared inputs
  const [mass, setMass] = useState(""); // g
  const [moles, setMoles] = useState(""); // mol
  const [volume, setVolume] = useState(""); // L or mL based on selection
  const [molarMass, setMolarMass] = useState(""); // g/mol

  const [volumeUnit, setVolumeUnit] = useState<"L" | "mL">("L");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Molarity", "Density", "Moles", "Unit-aware"],
    []
  );

  const onNumChange =
    (setter: (v: string) => void, allowDecimal: boolean) => (v: string) => {
      const re = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!re.test(v)) return;
      if (v.includes("-")) return;
      setter(v);
      setError(null);
      setResult("");
      setCopied(false);
    };

  const reset = () => {
    setMass("");
    setMoles("");
    setVolume("");
    setMolarMass("");
    setVolumeUnit("L");
    setError(null);
    setResult("");
    setCopied(false);
    setMode("molarity");
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const getVolumeInLiters = () => {
    const v = safeNum(volume);
    if (!Number.isFinite(v)) return NaN;
    if (v <= 0) return NaN;

    return volumeUnit === "L" ? v : v / 1000;
  };

  const calculate = () => {
    setCopied(false);

    if (mode === "molarity") {
      const n = safeNum(moles);
      const vL = getVolumeInLiters();
      if (!Number.isFinite(n) || n <= 0) {
        setError("Please enter valid moles (mol) greater than 0.");
        setResult("");
        return;
      }
      if (!Number.isFinite(vL) || vL <= 0) {
        setError("Please enter valid volume greater than 0.");
        setResult("");
        return;
      }

      const M = n / vL; // mol/L
      setError(null);
      setResult(
        `Molarity (M) = n / V\n` +
          `n = ${fmt(n, 6)} mol\n` +
          `V = ${fmt(vL, 6)} L\n\n` +
          `Result: ${fmt(M, 6)} mol/L`
      );
      return;
    }

    if (mode === "density") {
      const m = safeNum(mass); // g
      const v = safeNum(volume);
      if (!Number.isFinite(m) || m <= 0) {
        setError("Please enter valid mass (g) greater than 0.");
        setResult("");
        return;
      }
      if (!Number.isFinite(v) || v <= 0) {
        setError("Please enter valid volume greater than 0.");
        setResult("");
        return;
      }

      // Density = mass/volume
      // If volume is mL => g/mL, if L => g/L
      const density = m / v;
      const unit = volumeUnit === "mL" ? "g/mL" : "g/L";

      setError(null);
      setResult(
        `Density (ρ) = m / V\n` +
          `m = ${fmt(m, 6)} g\n` +
          `V = ${fmt(v, 6)} ${volumeUnit}\n\n` +
          `Result: ${fmt(density, 6)} ${unit}`
      );
      return;
    }

    if (mode === "moles") {
      const m = safeNum(mass); // g
      const mm = safeNum(molarMass); // g/mol

      if (!Number.isFinite(m) || m <= 0) {
        setError("Please enter valid mass (g) greater than 0.");
        setResult("");
        return;
      }
      if (!Number.isFinite(mm) || mm <= 0) {
        setError("Please enter a valid molar mass (g/mol) greater than 0.");
        setResult("");
        return;
      }

      // n = m / M
      const n = m / mm;

      setError(null);
      setResult(
        `Moles (n) = mass / molar mass\n` +
          `mass = ${fmt(m, 6)} g\n` +
          `molar mass = ${fmt(mm, 6)} g/mol\n\n` +
          `Result: ${fmt(n, 8)} mol`
      );
      return;
    }
  };

  const canCalculate = useMemo(() => {
    if (mode === "molarity") return moles.trim() !== "" && volume.trim() !== "";
    if (mode === "density") return mass.trim() !== "" && volume.trim() !== "";
    return mass.trim() !== "" && molarMass.trim() !== "";
  }, [mode, mass, moles, volume, molarMass]);

  // visual: map result magnitude to bar (just UI)
  const barPercent = useMemo(() => {
    if (!result) return 0;
    const num = Number(result.match(/Result:\s*([0-9.]+)/)?.[1] ?? NaN);
    if (!Number.isFinite(num)) return 0;
    // compress scale for nice visuals
    const scaled = Math.log10(num + 1);
    return clamp(scaled * 35, 8, 100);
  }, [result]);

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* SaaS background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl ">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">

             <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
               <Beaker className="h-4 w-4 text-[#125FF9]" />
              Maths & Science • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Chemistry{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Calculate molarity, density, or moles with clean steps and correct units.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Mode tabs */}
                <div className="grid md:grid-cols-3 gap-2">
                  <TabButton
                    active={mode === "molarity"}
                    title="Molarity"
                    subtitle="mol / L"
                    onClick={() => {
                      setMode("molarity");
                      setError(null);
                      setResult("");
                      setCopied(false);
                    }}
                  />
                  <TabButton
                    active={mode === "density"}
                    title="Density"
                    subtitle="g / mL"
                    onClick={() => {
                      setMode("density");
                      setError(null);
                      setResult("");
                      setCopied(false);
                    }}
                  />
                  <TabButton
                    active={mode === "moles"}
                    title="Moles"
                    subtitle="mass / molar mass"
                    onClick={() => {
                      setMode("moles");
                      setError(null);
                      setResult("");
                      setCopied(false);
                    }}
                  />
                </div>

                {/* Inputs */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Mass */}
                  <Field
                    label="Mass"
                    hint="grams (g)"
                    value={mass}
                    onChange={onNumChange(setMass, true)}
                    placeholder="e.g. 10"
                    disabled={mode === "molarity"}
                  />

                  {/* Moles */}
                  <Field
                    label="Moles"
                    hint="mol"
                    value={moles}
                    onChange={onNumChange(setMoles, true)}
                    placeholder="e.g. 0.25"
                    disabled={mode !== "molarity"}
                  />

                  {/* Volume + Unit */}
                  <div className={mode === "moles" ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-semibold text-gray-900">
                      Volume
                    </label>
                    <p className="mt-1 text-xs text-gray-600">
                      {mode === "moles"
                        ? "Not required for this mode."
                        : "Use L or mL (affects units for density)."}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          value={volume}
                          onChange={(e) => onNumChange(setVolume, true)(e.target.value)}
                          placeholder={mode === "moles" ? "—" : "e.g. 1.5"}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none disabled:cursor-not-allowed disabled:text-gray-400"
                          inputMode="decimal"
                          disabled={mode === "moles"}
                        />
                      </div>

                      <div className="w-24 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm">
                        <select
                          value={volumeUnit}
                          onChange={(e) => {
                            setVolumeUnit(e.target.value as "L" | "mL");
                            setError(null);
                            setResult("");
                            setCopied(false);
                          }}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none disabled:text-gray-400"
                          disabled={mode === "moles"}
                        >
                          <option value="L">L</option>
                          <option value="mL">mL</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Molar Mass */}
                  <Field
                    label="Molar Mass"
                    hint="g/mol (needed for moles)"
                    value={molarMass}
                    onChange={onNumChange(setMolarMass, true)}
                    placeholder="e.g. 18.015"
                    disabled={mode !== "moles"}
                  />
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculate}
                    disabled={!canCalculate}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate
                  </button>

                  <button
                    onClick={reset}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-gray-900 border border-black/10 bg-white
                      shadow-sm hover:bg-gray-50 transition
                    "
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Result
                        </p>
                        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                          {result}
                        </pre>
                      </div>

                      <button
                        onClick={copyResult}
                        className="
                          inline-flex items-center justify-center gap-2
                          rounded-full px-4 py-2 text-sm font-semibold
                          border border-black/10 bg-white
                          shadow-sm hover:bg-gray-50 transition
                        "
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* Visual bar */}
                    <div className="mt-5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Visual indicator (not a scientific scale).
                      </p>
                    </div>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Tip: use consistent units to avoid confusion (L vs mL).
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Formulas used
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="Molarity: M = n / V (mol/L)" />
                    <Bullet text="Density: ρ = m / V (g/mL or g/L)" />
                    <Bullet text="Moles: n = m / M (mol)" />
                    <Bullet text="Molar mass: g/mol (you provide)" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numoro calculators are designed to be simple, fast, and easy to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Components ------------------------------ */

function TabButton({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-3 text-left border transition shadow-sm",
        active
          ? "border-transparent text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]"
          : "border-black/10 bg-white text-gray-900 hover:bg-gray-50",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className={active ? "text-xs text-white/90" : "text-xs text-gray-600"}>
        {subtitle}
      </div>
    </button>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-60" : ""}>
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      <p className="mt-1 text-xs text-gray-600">{hint}</p>

      <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 outline-none disabled:cursor-not-allowed disabled:text-gray-400"
          inputMode="decimal"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[#125FF9]" />
      <span>{text}</span>
    </div>
  );
}
