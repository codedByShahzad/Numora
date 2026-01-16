"use client";

import React, { useMemo, useState } from "react";
import {
  Gauge,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type Tab = "forces" | "energy" | "motion" | "power";

type FormulaKey =
  // Forces
  | "force_f_ma"
  | "weight_w_mg"
  // Energy
  | "ke_half_m_v2"
  | "pe_mgh"
  // Motion
  | "speed_v_s_t"
  | "accel_a_dv_t"
  // Power
  | "power_p_w_t";

type FieldKey = "m" | "a" | "g" | "v" | "s" | "t" | "u" | "h" | "W";

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded);
};

export default function PhysicsCalculator() {
  const [tab, setTab] = useState<Tab>("forces");

  const [formula, setFormula] = useState<FormulaKey>("force_f_ma");
  const [values, setValues] = useState<Record<FieldKey, string>>({
    m: "",
    a: "",
    g: "9.81",
    v: "",
    s: "",
    t: "",
    u: "",
    h: "",
    W: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Force", "Energy", "Motion", "Power", "Units included"],
    []
  );

  const reset = () => {
    setTab("forces");
    setFormula("force_f_ma");
    setValues({
      m: "",
      a: "",
      g: "9.81",
      v: "",
      s: "",
      t: "",
      u: "",
      h: "",
      W: "",
    });
    setError(null);
    setResult("");
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const onValue =
    (key: FieldKey) => (v: string) => {
      // allow decimals and negative for some fields (like acceleration)
      const re = /^-?\d*\.?\d*$/;
      if (!re.test(v)) return;
      setValues((prev) => ({ ...prev, [key]: v }));
      setError(null);
      setResult("");
      setCopied(false);
    };

  const formulasByTab: Record<
    Tab,
    { key: FormulaKey; title: string; eq: string; unit: string; fields: { k: FieldKey; label: string; hint: string }[] }[]
  > = useMemo(
    () => ({
      forces: [
        {
          key: "force_f_ma",
          title: "Force",
          eq: "F = m × a",
          unit: "N",
          fields: [
            { k: "m", label: "Mass", hint: "kg" },
            { k: "a", label: "Acceleration", hint: "m/s²" },
          ],
        },
        {
          key: "weight_w_mg",
          title: "Weight",
          eq: "W = m × g",
          unit: "N",
          fields: [
            { k: "m", label: "Mass", hint: "kg" },
            { k: "g", label: "Gravity", hint: "m/s² (default 9.81)" },
          ],
        },
      ],
      energy: [
        {
          key: "ke_half_m_v2",
          title: "Kinetic Energy",
          eq: "KE = ½ × m × v²",
          unit: "J",
          fields: [
            { k: "m", label: "Mass", hint: "kg" },
            { k: "v", label: "Velocity", hint: "m/s" },
          ],
        },
        {
          key: "pe_mgh",
          title: "Potential Energy",
          eq: "PE = m × g × h",
          unit: "J",
          fields: [
            { k: "m", label: "Mass", hint: "kg" },
            { k: "g", label: "Gravity", hint: "m/s² (default 9.81)" },
            { k: "h", label: "Height", hint: "m" },
          ],
        },
      ],
      motion: [
        {
          key: "speed_v_s_t",
          title: "Speed",
          eq: "v = s / t",
          unit: "m/s",
          fields: [
            { k: "s", label: "Distance", hint: "m" },
            { k: "t", label: "Time", hint: "s" },
          ],
        },
        {
          key: "accel_a_dv_t",
          title: "Acceleration",
          eq: "a = (v − u) / t",
          unit: "m/s²",
          fields: [
            { k: "u", label: "Initial velocity (u)", hint: "m/s" },
            { k: "v", label: "Final velocity (v)", hint: "m/s" },
            { k: "t", label: "Time", hint: "s" },
          ],
        },
      ],
      power: [
        {
          key: "power_p_w_t",
          title: "Power",
          eq: "P = W / t",
          unit: "W",
          fields: [
            { k: "W", label: "Work (W)", hint: "J" },
            { k: "t", label: "Time", hint: "s" },
          ],
        },
      ],
    }),
    []
  );

  // keep selected formula valid when tab changes
  const availableFormulas = formulasByTab[tab];
  const currentFormula =
    availableFormulas.find((f) => f.key === formula) ?? availableFormulas[0];

  // if formula not in tab, auto switch
  React.useEffect(() => {
    const ok = availableFormulas.some((f) => f.key === formula);
    if (!ok) setFormula(availableFormulas[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const calculate = () => {
    setCopied(false);
    setError(null);

    const n = (k: FieldKey) => safeNum(values[k]);

    try {
      let res: number | null = null;

      switch (currentFormula.key) {
        case "force_f_ma": {
          const m = n("m");
          const a = n("a");
          if (!(m > 0)) throw new Error("Enter a valid mass (kg).");
          if (!Number.isFinite(a)) throw new Error("Enter a valid acceleration (m/s²).");
          res = m * a;
          break;
        }

        case "weight_w_mg": {
          const m = n("m");
          const g = n("g");
          if (!(m > 0)) throw new Error("Enter a valid mass (kg).");
          if (!(g > 0)) throw new Error("Enter a valid gravity value (m/s²).");
          res = m * g;
          break;
        }

        case "ke_half_m_v2": {
          const m = n("m");
          const v = n("v");
          if (!(m > 0)) throw new Error("Enter a valid mass (kg).");
          if (!Number.isFinite(v)) throw new Error("Enter a valid velocity (m/s).");
          res = 0.5 * m * v * v;
          break;
        }

        case "pe_mgh": {
          const m = n("m");
          const g = n("g");
          const h = n("h");
          if (!(m > 0)) throw new Error("Enter a valid mass (kg).");
          if (!(g > 0)) throw new Error("Enter a valid gravity value (m/s²).");
          if (!(h > 0)) throw new Error("Enter a valid height (m).");
          res = m * g * h;
          break;
        }

        case "speed_v_s_t": {
          const s = n("s");
          const t = n("t");
          if (!(s >= 0)) throw new Error("Enter a valid distance (m).");
          if (!(t > 0)) throw new Error("Time must be greater than 0.");
          res = s / t;
          break;
        }

        case "accel_a_dv_t": {
          const u = n("u");
          const v = n("v");
          const t = n("t");
          if (!Number.isFinite(u)) throw new Error("Enter initial velocity u (m/s).");
          if (!Number.isFinite(v)) throw new Error("Enter final velocity v (m/s).");
          if (!(t > 0)) throw new Error("Time must be greater than 0.");
          res = (v - u) / t;
          break;
        }

        case "power_p_w_t": {
          const W = n("W");
          const t = n("t");
          if (!Number.isFinite(W)) throw new Error("Enter a valid work value (J).");
          if (!(t > 0)) throw new Error("Time must be greater than 0.");
          res = W / t;
          break;
        }
      }

      if (res === null || !Number.isFinite(res)) throw new Error("Could not calculate. Check inputs.");

      setResult(
        `${currentFormula.title}\n` +
          `Formula: ${currentFormula.eq}\n` +
          `Result: ${fmt(res)} ${currentFormula.unit}`
      );
      setError(null);
   } catch (e: unknown) {
  const msg = e instanceof Error ? e.message : "Invalid input.";
  setError(msg);
  setResult("");
}

  };

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* SaaS background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-7 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <Gauge className="h-4 w-4 text-[#125FF9]" />
              Math & Science • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Physics{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Pick a formula, enter values, and get results with correct units.
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
                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  <TabButton active={tab === "forces"} onClick={() => setTab("forces")} title="Forces" />
                  <TabButton active={tab === "energy"} onClick={() => setTab("energy")} title="Energy" />
                  <TabButton active={tab === "motion"} onClick={() => setTab("motion")} title="Motion" />
                  <TabButton active={tab === "power"} onClick={() => setTab("power")} title="Power" />
                </div>

                {/* Formula Selector */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900">
                    Select formula
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Choose the calculation you need.
                  </p>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                    <select
                      value={currentFormula.key}
                      onChange={(e) => {
                        setFormula(e.target.value as FormulaKey);
                        setError(null);
                        setResult("");
                        setCopied(false);
                      }}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                    >
                      {availableFormulas.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.title} — {f.eq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inputs */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentFormula.fields.map((f) => (
                    <NumField
                      key={f.k}
                      label={`${f.label} (${f.hint})`}
                      value={values[f.k]}
                      onChange={onValue(f.k)}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={calculate}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl px-5 py-3 text-sm font-semibold
                      text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                      shadow-sm hover:shadow-md hover:brightness-105 transition
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

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <p className="mt-4 text-xs text-gray-600">
                      Units: N (Newtons), J (Joules), W (Watts), m/s, m/s²
                    </p>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick tips
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="Use kg for mass" />
                    <Bullet text="Use meters (m) for distance" />
                    <Bullet text="Use seconds (s) for time" />
                    <Bullet text="Gravity defaults to 9.81 m/s²" />
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

/* ------------------------------- Components ------------------------------- */

function TabButton({
  active,
  onClick,
  title,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-3 text-sm font-semibold border transition shadow-sm",
        active
          ? "border-transparent text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]"
          : "border-black/10 bg-white text-gray-900 hover:bg-gray-50",
      ].join(" ")}
    >
      {title}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700">{label}</label>
      <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-sm text-gray-900 outline-none"
          inputMode="decimal"
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
