"use client";

import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

type Course = {
  name: string;
  grade: string;
  credit: string; // ✅ string so user can clear / replace 0 cleanly
};

const gradePoints: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

type GPAResult = {
  gpa: number;
  totalCredits: number;
  qualityPoints: number;
  summary: string;
};

export default function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { name: "", grade: "A", credit: "3" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GPAResult | null>(null);
  const [copied, setCopied] = useState(false);

  const gradeOptions = useMemo(() => Object.keys(gradePoints), []);

  const handleCourseChange = (
    index: number,
    field: keyof Course,
    value: string
  ) => {
    setCopied(false);
    setError(null);
    setResult(null);

    setCourses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCourse = () => {
    setCopied(false);
    setError(null);
    setResult(null);
    setCourses((prev) => [...prev, { name: "", grade: "A", credit: "3" }]);
  };

  const removeCourse = (index: number) => {
    setCopied(false);
    setError(null);
    setResult(null);
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const parseCredits = (v: string) => {
    // allow "", "0", "3", "3.5"
    if (v.trim() === "") return NaN;
    return Number(v);
  };

  const calculateGPA = () => {
    setCopied(false);

    if (!courses.length) {
      setError("Please add at least one course.");
      setResult(null);
      return;
    }

    // Validation
    for (let i = 0; i < courses.length; i++) {
      const c = courses[i];
      const creditsNum = parseCredits(c.credit);

      if (!Number.isFinite(creditsNum) || creditsNum <= 0) {
        setError(`Please enter valid credits (> 0) for course row ${i + 1}.`);
        setResult(null);
        return;
      }

      if (!(c.grade in gradePoints)) {
        setError(`Please select a valid grade for course row ${i + 1}.`);
        setResult(null);
        return;
      }
    }

    let qualityPoints = 0;
    let totalCredits = 0;

    courses.forEach((c) => {
      const points = gradePoints[c.grade] ?? 0;
      const creditsNum = Number(c.credit);
      qualityPoints += points * creditsNum;
      totalCredits += creditsNum;
    });

    if (totalCredits === 0) {
      setError("Total credits cannot be zero.");
      setResult(null);
      return;
    }

    const gpa = qualityPoints / totalCredits;
    const summary = `GPA: ${gpa.toFixed(2)} • Credits: ${totalCredits} • Quality Points: ${qualityPoints.toFixed(
      2
    )}`;

    setError(null);
    setResult({ gpa, totalCredits, qualityPoints, summary });
  };

  const reset = () => {
    setCourses([{ name: "", grade: "A", credit: "3" }]);
    setError(null);
    setResult(null);
    setCopied(false);
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

      <div className="mx-auto max-w-5xl ">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
    <div className="flex justify-center">
              <HoverBorderGradient className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              <BookOpen className="h-4 w-4 text-[#125FF9]" />
              Everyday Life • Education
              </HoverBorderGradient>
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              GPA{" "}
              <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
                Calculator
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Add courses with credits and grades to calculate your GPA instantly.
            </p>
          </div>

          {/* Main Card */}
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <div className="p-6 sm:p-8">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <div className="col-span-6">Course</div>
                  <div className="col-span-3">Grade</div>
                  <div className="col-span-2">Credits</div>
                  <div className="col-span-1 text-right"> </div>
                </div>

                {/* Rows */}
                <div className="mt-3 space-y-3">
                  {courses.map((course, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center sm:gap-3">
                        {/* Course name */}
                        <div className="sm:col-span-6">
                          <label className="sm:hidden block text-xs font-semibold text-gray-600 mb-1">
                            Course
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Calculus I"
                            value={course.name}
                            onChange={(e) =>
                              handleCourseChange(index, "name", e.target.value)
                            }
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#125FF9]/30"
                          />
                        </div>

                        {/* Grade */}
                        <div className="sm:col-span-3">
                          <label className="sm:hidden block text-xs font-semibold text-gray-600 mb-1">
                            Grade
                          </label>
                          <select
                            value={course.grade}
                            onChange={(e) =>
                              handleCourseChange(index, "grade", e.target.value)
                            }
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#125FF9]/30"
                          >
                            {gradeOptions.map((g) => (
                              <option key={g} value={g}>
                                {g} ({gradePoints[g].toFixed(1)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Credits (✅ fixed) */}
                        <div className="sm:col-span-2">
                          <label className="sm:hidden block text-xs font-semibold text-gray-600 mb-1">
                            Credits
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 3"
                            value={course.credit}
                            onChange={(e) => {
                              // allow only digits + optional dot
                              const v = e.target.value;
                              if (!/^\d*\.?\d*$/.test(v)) return;

                              // ✅ if current is "0" and user types a number, replace it
                              if (course.credit === "0" && v.length === 2 && v.startsWith("0")) {
                                handleCourseChange(index, "credit", v.slice(1));
                                return;
                              }

                              handleCourseChange(index, "credit", v);
                            }}
                            onFocus={(e) => {
                              // nice UX: select all so user can replace quickly
                              e.currentTarget.select();
                            }}
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#125FF9]/30"
                          />
                        </div>

                        {/* Remove */}
                        <div className="sm:col-span-1 sm:flex sm:justify-end">
                          {courses.length > 1 ? (
                            <button
                              onClick={() => removeCourse(index)}
                              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition w-full sm:w-auto"
                              aria-label={`Remove course row ${index + 1}`}
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          ) : (
                            <div className="hidden sm:block" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={addCourse}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-900 border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Add course
                  </button>

                  <button
                    onClick={calculateGPA}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#008FBE] to-[#125FF9] shadow-sm hover:shadow-md hover:brightness-105 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Calculate
                  </button>

                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-900 border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
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
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Your GPA: {result.gpa.toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Total credits:{" "}
                          <span className="font-semibold text-gray-900">
                            {result.totalCredits}
                          </span>{" "}
                          • Quality points:{" "}
                          <span className="font-semibold text-gray-900">
                            {result.qualityPoints.toFixed(2)}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          if (!result) return;
                          try {
                            await navigator.clipboard.writeText(result.summary);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                          } catch {}
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white shadow-sm hover:bg-gray-50 transition"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Tip: Credits affect GPA weight — higher credits impact GPA more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
