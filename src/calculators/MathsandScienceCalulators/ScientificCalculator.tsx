"use client";

import React, { useMemo, useState } from "react";
import {
  Percent,
  CheckCircle2,
  RotateCcw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

/* -------------------- Safe Scientific Expression Engine --------------------
Supports:
- Numbers (decimals)
- + - * / ^ ( ) 
- Constants: π, e
- Functions: sin, cos, tan, log, ln, sqrt
- Postfix: ! (factorial), % (percent)
- DEG/RAD toggle for trig

No eval / no Function
---------------------------------------------------------------------------- */

type Assoc = "L" | "R";

type FuncName = "sin" | "cos" | "tan" | "log" | "ln" | "sqrt";

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "lpar" }
  | { type: "rpar" }
  | { type: "func"; value: FuncName }
  | { type: "post"; value: "!" | "%" };

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
const ASSOC: Record<string, Assoc> = {
  "+": "L",
  "-": "L",
  "*": "L",
  "/": "L",
  "^": "R",
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded);
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function factorial(n: number) {
  if (!Number.isFinite(n)) throw new Error("Invalid factorial input.");
  if (n < 0) throw new Error("Factorial is not defined for negatives.");
  if (Math.floor(n) !== n) throw new Error("Factorial requires an integer.");
  if (n > 170) throw new Error("Number too large for factorial.");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function tokenizeScientific(input: string): Token[] {
  const s = input
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .toLowerCase();

  const tokens: Token[] = [];
  let i = 0;

  const isDigit = (c: string) => c >= "0" && c <= "9";
  const startsWith = (w: string) => s.slice(i, i + w.length) === w;

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

    // postfix
    if (c === "!") {
      tokens.push({ type: "post", value: "!" });
      i++;
      continue;
    }
    if (c === "%") {
      tokens.push({ type: "post", value: "%" });
      i++;
      continue;
    }

    // operators
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      // unary minus => convert to 0 - x
      const prev = tokens[tokens.length - 1];
      const unary =
        c === "-" &&
        (!prev ||
          prev.type === "op" ||
          prev.type === "lpar" ||
          prev.type === "func");

      if (unary) {
        tokens.push({ type: "num", value: 0 });
        tokens.push({ type: "op", value: "-" });
        i++;
        continue;
      }

      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }

    // functions
    if (startsWith("sin")) {
      tokens.push({ type: "func", value: "sin" });
      i += 3;
      continue;
    }
    if (startsWith("cos")) {
      tokens.push({ type: "func", value: "cos" });
      i += 3;
      continue;
    }
    if (startsWith("tan")) {
      tokens.push({ type: "func", value: "tan" });
      i += 3;
      continue;
    }
    if (startsWith("sqrt")) {
      tokens.push({ type: "func", value: "sqrt" });
      i += 4;
      continue;
    }
    if (startsWith("log")) {
      tokens.push({ type: "func", value: "log" });
      i += 3;
      continue;
    }
    if (startsWith("ln")) {
      tokens.push({ type: "func", value: "ln" });
      i += 2;
      continue;
    }

    // constants
    if (startsWith("pi")) {
      tokens.push({ type: "num", value: Math.PI });
      i += 2;
      continue;
    }
    if (c === "e") {
      tokens.push({ type: "num", value: Math.E });
      i++;
      continue;
    }

    // number
    if (isDigit(c) || c === ".") {
      let j = i;
      let dots = 0;
      while (j < s.length && (isDigit(s[j]) || s[j] === ".")) {
        if (s[j] === ".") dots++;
        if (dots > 1) throw new Error("Invalid number format.");
        j++;
      }
      const numStr = s.slice(i, j);
      const val = Number(numStr);
      if (!Number.isFinite(val)) throw new Error("Invalid number.");
      tokens.push({ type: "num", value: val });
      i = j;
      continue;
    }

    throw new Error("Invalid input. Use numbers, operators, functions, and ()");
  }

  return tokens;
}

function toRPN(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const stack: Token[] = [];

  for (const t of tokens) {
    if (t.type === "num") {
      out.push(t);
      continue;
    }

    if (t.type === "func") {
      stack.push(t);
      continue;
    }

    if (t.type === "post") {
      out.push(t);
      continue;
    }

    if (t.type === "op") {
      while (stack.length) {
        const top = stack[stack.length - 1];

        if (top.type === "func") {
          out.push(stack.pop()!);
          continue;
        }

        if (top.type === "op") {
          const pTop = PREC[top.value];
          const pCur = PREC[t.value];
          const shouldPop = ASSOC[t.value] === "R" ? pTop > pCur : pTop >= pCur;
          if (shouldPop) out.push(stack.pop()!);
          else break;
          continue;
        }
        break;
      }
      stack.push(t);
      continue;
    }

    if (t.type === "lpar") {
      stack.push(t);
      continue;
    }

    if (t.type === "rpar") {
      while (stack.length && stack[stack.length - 1].type !== "lpar") {
        out.push(stack.pop()!);
      }
      if (!stack.length) throw new Error("Mismatched parentheses.");
      stack.pop(); // pop lpar

      // if function before "(" => apply function
      if (stack.length && stack[stack.length - 1].type === "func") {
        out.push(stack.pop()!);
      }
      continue;
    }
  }

  while (stack.length) {
    const t = stack.pop()!;
    if (t.type === "lpar" || t.type === "rpar")
      throw new Error("Mismatched parentheses.");
    out.push(t);
  }

  return out;
}

function evalRPN(rpn: Token[], mode: "DEG" | "RAD") {
  const st: number[] = [];
  const trigArg = (x: number) => (mode === "DEG" ? degToRad(x) : x);

  for (const t of rpn) {
    if (t.type === "num") {
      st.push(t.value);
      continue;
    }

    if (t.type === "post") {
      if (st.length < 1) throw new Error("Invalid expression.");
      const a = st.pop()!;
      if (t.value === "%") st.push(a / 100);
      if (t.value === "!") st.push(factorial(a));
      continue;
    }

    if (t.type === "func") {
      if (st.length < 1) throw new Error("Invalid function usage.");
      const a = st.pop()!;
      let res = 0;

      if (t.value === "sqrt") {
        if (a < 0) throw new Error("√ of negative number is not real.");
        res = Math.sqrt(a);
      }
      if (t.value === "sin") res = Math.sin(trigArg(a));
      if (t.value === "cos") res = Math.cos(trigArg(a));
      if (t.value === "tan") res = Math.tan(trigArg(a));
      if (t.value === "log") {
        if (a <= 0) throw new Error("log requires a positive number.");
        res = Math.log10(a);
      }
      if (t.value === "ln") {
        if (a <= 0) throw new Error("ln requires a positive number.");
        res = Math.log(a);
      }

      st.push(res);
      continue;
    }

    if (t.type === "op") {
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
      if (t.value === "^") res = Math.pow(a, b);

      st.push(res);
      continue;
    }
  }

  if (st.length !== 1) throw new Error("Invalid expression.");
  const ans = st[0];
  if (!Number.isFinite(ans)) throw new Error("Result is too large.");
  return ans;
}

function safeScientificEval(expr: string, mode: "DEG" | "RAD") {
  const tokens = tokenizeScientific(expr);
  const rpn = toRPN(tokens);
  return evalRPN(rpn, mode);
}

/* ------------------------------ Page ------------------------------ */

type PadKey =
  | "sin"
  | "cos"
  | "tan"
  | "log"
  | "ln"
  | "sqrt"
  | "pi"
  | "e"
  | "^"
  | "!"
  | "%"
  | "("
  | ")"
  | "+"
  | "-"
  | "×"
  | "÷"
  | "."
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export default function ScientificCalculator() {
  const [mode, setMode] = useState<"DEG" | "RAD">("DEG");
  const [expression, setExpression] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const chips = useMemo(
    () => ["Trig", "log/ln", "√, π, e", "Power", "No eval"],
    []
  );

  const reset = () => {
    setMode("DEG");
    setExpression("");
    setError(null);
    setResult("");
    setCopied(false);
  };

  const insert = (k: PadKey) => {
    setError(null);
    setResult("");
    setCopied(false);

    const map: Record<PadKey, string> = {
      sin: "sin(",
      cos: "cos(",
      tan: "tan(",
      log: "log(",
      ln: "ln(",
      sqrt: "sqrt(",
      pi: "π",
      e: "e",
      "^": "^",
      "!": "!",
      "%": "%",
      "(": "(",
      ")": ")",
      "+": "+",
      "-": "-",
      "×": "×",
      "÷": "÷",
      ".": ".",
      "0": "0",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
    };

    setExpression((prev) => prev + map[k]);
  };

  const del = () => {
    setError(null);
    setResult("");
    setCopied(false);
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    setCopied(false);
    setError(null);

    if (!expression.trim()) {
      setError("Please enter an expression.");
      setResult("");
      return;
    }

    try {
      const v = safeScientificEval(expression, mode);
      setResult(
        `Expression: ${expression}\n` + `Mode: ${mode}\n` + `Result: ${fmt(v)}`
      );
      setError(null);
   } catch (e: unknown) {
  const msg = e instanceof Error ? e.message : "Invalid expression.";
  setError(msg);
  setResult("");
}

  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const keypad = useMemo(
    () =>
      [
        // row 1
        "sin",
        "cos",
        "tan",
        "sqrt",
        // row 2
        "log",
        "ln",
        "pi",
        "e",
        // row 3
        "7",
        "8",
        "9",
        "÷",
        // row 4
        "4",
        "5",
        "6",
        "×",
        // row 5
        "1",
        "2",
        "3",
        "-",
        // row 6
        "0",
        ".",
        "+",
        "^",
        // row 7
        "(",
        ")",
        "%",
        "!",
      ] as PadKey[],
    []
  );

  return (
    <div className="min-h-[92vh] bg-[#F7FAFF] text-gray-900">
      {/* SaaS background (same as Physics) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-7 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header (same style as Physics) */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm"></span>

            <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                <Percent className="h-4 w-4 text-[#125FF9]" />
                Math & Science • Calculator
              </HoverBorderGradient>
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Scientific{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Trigonometry, logarithms, powers, constants, and more — safely
              evaluated without eval.
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

          {/* Main Card (same as Physics) */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Mode Toggle (like a tab) */}
                <div className="grid grid-cols-2 gap-2">
                  <ModeButton
                    active={mode === "DEG"}
                    onClick={() => setMode("DEG")}
                    title="DEG"
                  />
                  <ModeButton
                    active={mode === "RAD"}
                    onClick={() => setMode("RAD")}
                    title="RAD"
                  />
                </div>

                {/* Expression input */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900">
                    Expression
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Example:{" "}
                    <span className="font-semibold text-gray-900">
                      sin(30) + sqrt(9)
                    </span>
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
                      placeholder="Type or use keypad…"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
                      inputMode="text"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <span>Supported: sin cos tan log ln sqrt π e ^ ! %</span>
                    <button
                      type="button"
                      onClick={del}
                      className="rounded-full border border-black/10 bg-white px-3 py-1 shadow-sm hover:bg-gray-50 transition text-xs font-semibold text-gray-700"
                    >
                      DEL
                    </button>
                  </div>
                </div>

                {/* Keypad */}
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {keypad.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => insert(k)}
                      className="
                        rounded-2xl px-4 py-3 text-sm font-semibold
                        border border-black/10 bg-white text-gray-900
                        shadow-sm hover:bg-gray-50 transition
                      "
                    >
                      {k === "pi" ? "π" : k}
                    </button>
                  ))}
                </div>

                {/* Actions (same as Physics) */}
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

                {/* Error (same as Physics) */}
                {error && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                {/* Result (same as Physics) */}
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
                      Tip: In DEG mode,{" "}
                      <span className="font-semibold text-gray-900">
                        sin(30)
                      </span>{" "}
                      ≈ 0.5
                    </p>
                  </div>
                )}

                {/* Tips block (same style) */}
                <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick tips
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <Bullet text="Use parentheses for priority" />
                    <Bullet text="DEG vs RAD affects trig" />
                    <Bullet text="Factorial: 5!" />
                    <Bullet text="Percent: 25% = 0.25" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Numora calculators are designed to be simple, fast, and easy to
              use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Components ------------------------------- */

function ModeButton({
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

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[#125FF9]" />
      <span>{text}</span>
    </div>
  );
}
