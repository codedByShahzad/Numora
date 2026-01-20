"use client";

import React, { useMemo, useState } from "react";
import {
  Shapes,
  ChevronDown,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type Shape =
  | "square"
  | "rectangle"
  | "circle"
  | "triangle"
  | "cube"
  | "cuboid"
  | "sphere";

type Metric = "area" | "perimeter" | "circumference" | "volume" | "surface-area";

const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const fmt = (n: number, d = 4) =>
  Number.isFinite(n) ? Number(n.toFixed(d)).toString() : "—";

export default function GeometryCalculator() {
  const [shape, setShape] = useState<Shape>("square");
  const [metric, setMetric] = useState<Metric>("area");

  const [side, setSide] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [radius, setRadius] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const shapes = useMemo(
    () => [
      { key: "square" as const, label: "Square", dim: "2D" },
      { key: "rectangle" as const, label: "Rectangle", dim: "2D" },
      { key: "circle" as const, label: "Circle", dim: "2D" },
      { key: "triangle" as const, label: "Triangle", dim: "2D" },
      { key: "cube" as const, label: "Cube", dim: "3D" },
      { key: "cuboid" as const, label: "Cuboid", dim: "3D" },
      { key: "sphere" as const, label: "Sphere", dim: "3D" },
    ],
    []
  );

  const metricOptions = useMemo(() => {
    // show only valid metrics per shape
    const is2D = shape === "square" || shape === "rectangle" || shape === "circle" || shape === "triangle";
    const is3D = shape === "cube" || shape === "cuboid" || shape === "sphere";

    const options: { value: Metric; label: string }[] = [];

    if (shape === "circle") {
      options.push({ value: "area", label: "Area" });
      options.push({ value: "circumference", label: "Circumference" });
    } else if (is2D) {
      options.push({ value: "area", label: "Area" });
      // triangle doesn't have perimeter here because we only have base & height (no sides)
      if (shape !== "triangle") options.push({ value: "perimeter", label: "Perimeter" });
    }

    if (is3D) {
      options.push({ value: "volume", label: "Volume" });
      options.push({ value: "surface-area", label: "Surface Area" });
    }

    return options;
  }, [shape]);

  // ensure metric stays valid when switching shapes
  React.useEffect(() => {
    const valid = metricOptions.some((m) => m.value === metric);
    if (!valid) setMetric(metricOptions[0]?.value ?? "area");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  const reset = () => {
    setSide("");
    setLength("");
    setWidth("");
    setHeight("");
    setRadius("");
    setResult("");
    setError(null);
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

  const canCalculate = useMemo(() => {
    if (shape === "square" || shape === "cube") return side.trim() !== "";
    if (shape === "circle" || shape === "sphere") return radius.trim() !== "";
    if (shape === "triangle") return length.trim() !== "" && height.trim() !== "";
    if (shape === "rectangle") return length.trim() !== "" && width.trim() !== "";
    if (shape === "cuboid") return length.trim() !== "" && width.trim() !== "" && height.trim() !== "";
    return false;
  }, [shape, side, length, width, height, radius]);

  const calculate = () => {
    setCopied(false);
    setError(null);

    let out = "";

    // helpers for validation
    const need = (cond: boolean, msg: string) => {
      if (!cond) {
        setError(msg);
        setResult("");
        throw new Error("invalid");
      }
    };

    try {
      if (shape === "square") {
        const s = safeNum(side);
        need(s > 0, "Enter a valid side length.");

        if (metric === "area") out = `Area = s² = ${fmt(s * s)} unit²`;
        if (metric === "perimeter") out = `Perimeter = 4s = ${fmt(4 * s)} units`;
      }

      if (shape === "rectangle") {
        const l = safeNum(length);
        const w = safeNum(width);
        need(l > 0 && w > 0, "Enter valid length and width.");

        if (metric === "area") out = `Area = l × w = ${fmt(l * w)} unit²`;
        if (metric === "perimeter") out = `Perimeter = 2(l + w) = ${fmt(2 * (l + w))} units`;
      }

      if (shape === "circle") {
        const r = safeNum(radius);
        need(r > 0, "Enter a valid radius.");

        if (metric === "area") out = `Area = πr² = ${fmt(Math.PI * r * r)} unit²`;
        if (metric === "circumference") out = `Circumference = 2πr = ${fmt(2 * Math.PI * r)} units`;
      }

      if (shape === "triangle") {
        const b = safeNum(length);
        const h = safeNum(height);
        need(b > 0 && h > 0, "Enter valid base and height.");

        if (metric === "area") out = `Area = ½ × b × h = ${fmt(0.5 * b * h)} unit²`;
      }

      if (shape === "cube") {
        const s = safeNum(side);
        need(s > 0, "Enter a valid side length.");

        if (metric === "volume") out = `Volume = s³ = ${fmt(s ** 3)} unit³`;
        if (metric === "surface-area") out = `Surface Area = 6s² = ${fmt(6 * s * s)} unit²`;
      }

      if (shape === "cuboid") {
        const l = safeNum(length);
        const w = safeNum(width);
        const h = safeNum(height);
        need(l > 0 && w > 0 && h > 0, "Enter valid length, width, and height.");

        if (metric === "volume") out = `Volume = l × w × h = ${fmt(l * w * h)} unit³`;
        if (metric === "surface-area") {
          const sa = 2 * (l * w + l * h + w * h);
          out = `Surface Area = 2(lw + lh + wh) = ${fmt(sa)} unit²`;
        }
      }

      if (shape === "sphere") {
        const r = safeNum(radius);
        need(r > 0, "Enter a valid radius.");

        if (metric === "volume") out = `Volume = 4/3πr³ = ${fmt((4 / 3) * Math.PI * r ** 3)} unit³`;
        if (metric === "surface-area") out = `Surface Area = 4πr² = ${fmt(4 * Math.PI * r * r)} unit²`;
      }

      if (!out) {
        setError("This calculation is not available for the selected shape.");
        setResult("");
        return;
      }

      setResult(out);
    } catch {
      // handled above
    }
  };

  const metricLabel = useMemo(() => {
    return (
      metricOptions.find((m) => m.value === metric)?.label ??
      "Calculation"
    );
  }, [metric, metricOptions]);

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* SaaS background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <Shapes className="h-4 w-4 text-[#125FF9]" />
              Maths • Geometry
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Geometry{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Pick a shape, then choose what you want to calculate: area, perimeter, volume, or surface area.
            </p>
          </div>

          {/* Card */}
          <div className="mt-10 rounded-3xl border border-black/10 bg-white/80 shadow-xl backdrop-blur">
            <div className="h-[4px] bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

            <div className="p-6 sm:p-8">
              {/* Shape selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {shapes.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setShape(s.key);
                      setResult("");
                      setError(null);
                      setCopied(false);
                    }}
                    className={[
                      "rounded-2xl px-4 py-3 border text-sm font-semibold transition shadow-sm text-left",
                      shape === s.key
                        ? "bg-gradient-to-r from-[#008FBE] to-[#125FF9] text-white border-transparent"
                        : "bg-white border-black/10 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {s.label}
                    <div className="text-xs opacity-80">{s.dim}</div>
                  </button>
                ))}
              </div>

              {/* Metric dropdown */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-900">
                  Calculate
                </label>
                <p className="mt-1 text-xs text-gray-600">
                  Available options depend on the selected shape.
                </p>

                <div className="mt-3 relative rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                  <select
                    value={metric}
                    onChange={(e) => {
                      setMetric(e.target.value as Metric);
                      setResult("");
                      setError(null);
                      setCopied(false);
                    }}
                    className="w-full appearance-none bg-transparent text-sm text-gray-900 outline-none pr-10"
                  >
                    {metricOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(shape === "square" || shape === "cube") && (
                  <Input label="Side" value={side} set={setSide} />
                )}

                {(shape === "rectangle" || shape === "cuboid") && (
                  <>
                    <Input label="Length" value={length} set={setLength} />
                    <Input label="Width" value={width} set={setWidth} />
                  </>
                )}

                {(shape === "triangle" || shape === "cuboid") && (
                  <Input label="Height" value={height} set={setHeight} />
                )}

                {(shape === "circle" || shape === "sphere") && (
                  <Input label="Radius" value={radius} set={setRadius} />
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={calculate}
                  disabled={!canCalculate}
                  className="
                    rounded-2xl py-3 bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                    text-white font-semibold disabled:opacity-50
                    inline-flex items-center justify-center gap-2
                  "
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Calculate {metricLabel}
                </button>

                <button
                  onClick={reset}
                  className="
                    rounded-2xl py-3 border border-black/10 bg-white font-semibold
                    inline-flex items-center justify-center gap-2
                  "
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                  <AlertTriangle className="inline mr-2 h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Result
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {result}
                  </p>

                  <button
                    onClick={copyResult}
                    className="mt-4 rounded-full px-4 py-2 border border-black/10 text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    <Copy className="inline mr-2 h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}

              {/* Formula box */}
              <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                <h3 className="text-sm font-semibold text-gray-900">Formulas</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                  <Bullet text="Square: area s², perimeter 4s" />
                  <Bullet text="Rectangle: area lw, perimeter 2(l+w)" />
                  <Bullet text="Circle: area πr², circumference 2πr" />
                  <Bullet text="Cube: volume s³, surface area 6s²" />
                  <Bullet text="Cuboid: volume lwh, surface area 2(lw+lh+wh)" />
                  <Bullet text="Sphere: volume 4/3πr³, surface area 4πr²" />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Numoro calculators — clean, fast, and accurate.
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-900">{label}</label>
      <div className="mt-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
        <input
          type="number"
          value={value}
          onChange={(e) => set(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-900 outline-none"
          placeholder={`Enter ${label.toLowerCase()}`}
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
