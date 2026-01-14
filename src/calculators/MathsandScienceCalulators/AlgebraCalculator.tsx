"use client";

import React, { useMemo, useState } from "react";
import {
  FunctionSquare,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

/* ------------------------ Safe Math Expression Parser ------------------------
Supports: + - * / ( ) decimals and spaces.
No variables, no exponent, no functions.
---------------------------------------------------------------------------- */

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lpar" }
  | { type: "rpar" };

function tokenize(expr: string): Token[] {
  const s = expr.replace(/\s+/g, "");
  const tokens: Token[] = [];
  let i = 0;

  const isDigit = (c: string) => c >= "0" && c <= "9";

  while (i < s.length) {
    const c = s[i];

    if (c === "(") {
      tokens.push({ type: "lpar" });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rpar" });
      i++;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/") {
      // handle unary minus: "-3" or "(-3" => convert to "0 - 3"
      const prev = tokens[tokens.length - 1];
      const isUnaryMinus =
        c === "-" &&
        (!prev || prev.type === "op" || prev.type === "lpar");

      if (isUnaryMinus) {
        tokens.push({ type: "num", value: 0 });
        tokens.push({ type: "op", value: "-" });
        i++;
        continue;
      }

      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }

    if (isDigit(c) || c === ".") {
      let j = i;
      let dotCount = 0;

      while (j < s.length && (isDigit(s[j]) || s[j] === ".")) {
        if (s[j] === ".") dotCount++;
        if (dotCount > 1) throw new Error("Invalid number format.");
        j++;
      }

      const numStr = s.slice(i, j);
      const value = Number(numStr);
      if (!Number.isFinite(value)) throw new Error("Invalid number.");

      tokens.push({ type: "num", value });
      i = j;
      continue;
    }

    // any other character => reject
    throw new Error("Only numbers and + - * / ( ) are allowed.");
  }

  return tokens;
}

function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (const t of tokens) {
    if (t.type === "num") output.push(t);
    else if (t.type === "op") {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === "op" && prec[top.value] >= prec[t.value]) {
          output.push(stack.pop()!);
        } else break;
      }
      stack.push(t);
    } else if (t.type === "lpar") stack.push(t);
    else if (t.type === "rpar") {
      while (stack.length && stack[stack.length - 1].type !== "lpar") {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error("Mismatched parentheses.");
      stack.pop(); // remove lpar
    }
  }

  while (stack.length) {
    const t = stack.pop()!;
    if (t.type === "lpar" || t.type === "rpar") throw new Error("Mismatched parentheses.");
    output.push(t);
  }

  return output;
}

function evalRPN(rpn: Token[]): number {
  const st: number[] = [];

  for (const t of rpn) {
    if (t.type === "num") st.push(t.value);
    else if (t.type === "op") {
      if (st.length < 2) throw new Error("Invalid expression.");
      const b = st.pop()!;
      const a = st.pop()!;
      let res = 0;
      if (t.value === "+") res = a + b;
      if (t.value === "-") res = a - b;
      if (t.value === "*") res = a * b;
      if (t.value === "/") {
        if (b === 0) throw new Error("Division by zero.");
        res = a / b;
      }
      st.push(res);
    }
  }

  if (st.length !== 1) throw new Error("Invalid expression.");
  return st[0];
}

function safeEvaluate(expr: string): number {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evalRPN(rpn);
}

/* ------------------------------- UI Helpers ------------------------------- */



const safeNum = (v: string) => {
  if (v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  // avoid 1.99999999
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded);
};

type Tab = "expression" | "linear" | "quadratic";

export default function AlgebraCalculator() {
  const [tab, setTab] = useState<Tab>("expression");

  const [expression, setExpression] = useState("");

  const [linearA, setLinearA] = useState("");
  const [linearB, setLinearB] = useState("");
  const [linearC, setLinearC] = useState("");

  const [quadA, setQuadA] = useState("");
  const [quadB, setQuadB] = useState("");
  const [quadC, setQuadC] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Expression", "Linear", "Quadratic", "Clear output"],
    []
  );

  const reset = () => {
    setExpression("");
    setLinearA("");
    setLinearB("");
    setLinearC("");
    setQuadA("");
    setQuadB("");
    setQuadC("");
    setError(null);
    setResult("");
    setCopied(false);
    setTab("expression");
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const onNumChange =
    (setter: (v: string) => void, allowDecimal: boolean) => (v: string) => {
      
      // allow negative numbers for coefficients
      const reNeg = allowDecimal ? /^-?\d*\.?\d*$/ : /^-?\d*$/;

      if (!reNeg.test(v)) return;
      // prevent just "-" staying forever? allow it for typing, but compute will validate
      setter(v);
      setError(null);
      setResult("");
      setCopied(false);
    };

  const evaluateExpression = () => {
    setCopied(false);
    if (!expression.trim()) {
      setError("Please enter an expression.");
      setResult("");
      return;
    }
    try {
      const v = safeEvaluate(expression);
      setError(null);
      setResult(`Expression: ${expression}\nResult: ${fmt(v)}`);
    } catch (e: unknown) {
  const msg =
    e instanceof Error ? e.message : "Invalid expression.";
  setError(msg);
  setResult("");
}

  };

  const solveLinear = () => {
    setCopied(false);

    const a = safeNum(linearA);
    const b = safeNum(linearB);
    const c = safeNum(linearC);

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
      setError("Please enter valid numbers for a, b, and c.");
      setResult("");
      return;
    }
    if (a === 0) {
      setError("a cannot be 0 for ax + b = c.");
      setResult("");
      return;
    }

    const x = (c - b) / a;

    setError(null);
    setResult(
      `Solve: ${a}x + ${b} = ${c}\n` +
        `Step 1: ${a}x = ${c} - ${b} = ${fmt(c - b)}\n` +
        `Step 2: x = ${fmt(c - b)} / ${a} = ${fmt(x)}`
    );
  };

  const solveQuadratic = () => {
    setCopied(false);

    const a = safeNum(quadA);
    const b = safeNum(quadB);
    const c = safeNum(quadC);

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
      setError("Please enter valid numbers for a, b, and c.");
      setResult("");
      return;
    }
    if (a === 0) {
      setError("a cannot be 0 for a quadratic equation.");
      setResult("");
      return;
    }

    const disc = b * b - 4 * a * c;

    if (disc < 0) {
      setError(null);
      setResult(
        `Solve: ${a}x² + ${b}x + ${c} = 0\n` +
          `Discriminant (b² - 4ac) = ${fmt(disc)}\n` +
          `No real roots (discriminant is negative).`
      );
      return;
    }

    const sqrtD = Math.sqrt(disc);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    setError(null);
    setResult(
      `Solve: ${a}x² + ${b}x + ${c} = 0\n` +
        `Discriminant (b² - 4ac) = ${fmt(disc)}\n` +
        `x₁ = (-b + √D) / (2a) = ${fmt(x1)}\n` +
        `x₂ = (-b - √D) / (2a) = ${fmt(x2)}`
    );
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
               <FunctionSquare className="h-4 w-4 text-[#125FF9]" />
              Math & Science • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Algebra{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Evaluate expressions, solve linear equations, and find quadratic roots with clear steps.
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
                <div className="grid grid-cols-3 gap-2">
                  <TabButton
                    active={tab === "expression"}
                    onClick={() => setTab("expression")}
                    title="Expression"
                  />
                  <TabButton
                    active={tab === "linear"}
                    onClick={() => setTab("linear")}
                    title="Linear"
                  />
                  <TabButton
                    active={tab === "quadratic"}
                    onClick={() => setTab("quadratic")}
                    title="Quadratic"
                  />
                </div>

                {/* Tab content */}
                <div className="mt-6">
                  {tab === "expression" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Evaluate expression
                      </label>
                      <p className="mt-1 text-xs text-gray-600">
                        Allowed: numbers, + - * / and parentheses.
                      </p>

                      <div className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#125FF9]/30">
                        <input
                          value={expression}
                          onChange={(e) => {
                            setExpression(e.target.value);
                            setError(null);
                            setResult("");
                            setCopied(false);
                          }}
                          placeholder="e.g. (2 + 3) * 5 - 4/2"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          onClick={evaluateExpression}
                          className="
                            inline-flex items-center justify-center gap-2
                            rounded-2xl px-5 py-3 text-sm font-semibold
                            text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                            shadow-sm hover:shadow-md hover:brightness-105 transition
                          "
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Evaluate
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
                    </div>
                  )}

                  {tab === "linear" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Solve linear equation
                      </label>
                      <p className="mt-1 text-xs text-gray-600">
                        Form: <span className="font-semibold text-gray-900">ax + b = c</span>
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <NumField label="a" value={linearA} onChange={onNumChange(setLinearA, true)} />
                        <NumField label="b" value={linearB} onChange={onNumChange(setLinearB, true)} />
                        <NumField label="c" value={linearC} onChange={onNumChange(setLinearC, true)} />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          onClick={solveLinear}
                          className="
                            inline-flex items-center justify-center gap-2
                            rounded-2xl px-5 py-3 text-sm font-semibold
                            text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                            shadow-sm hover:shadow-md hover:brightness-105 transition
                          "
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Solve linear
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
                    </div>
                  )}

                  {tab === "quadratic" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Solve quadratic equation
                      </label>
                      <p className="mt-1 text-xs text-gray-600">
                        Form: <span className="font-semibold text-gray-900">ax² + bx + c = 0</span>
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <NumField label="a" value={quadA} onChange={onNumChange(setQuadA, true)} />
                        <NumField label="b" value={quadB} onChange={onNumChange(setQuadB, true)} />
                        <NumField label="c" value={quadC} onChange={onNumChange(setQuadC, true)} />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          onClick={solveQuadratic}
                          className="
                            inline-flex items-center justify-center gap-2
                            rounded-2xl px-5 py-3 text-sm font-semibold
                            text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9]
                            shadow-sm hover:shadow-md hover:brightness-105 transition
                          "
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Solve quadratic
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
                    </div>
                  )}
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
                      Expression evaluation is restricted to basic arithmetic for safety.
                    </p>
                  </div>
                )}

                {/* Footer tips */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick tips
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="Use parentheses for priority" />
                    <Bullet text="Supports decimals (e.g. 2.5)" />
                    <Bullet text="Linear form: ax + b = c" />
                    <Bullet text="Quadratic uses discriminant" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numora calculators are designed to be simple, fast, and easy to use.
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
          placeholder={label}
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
