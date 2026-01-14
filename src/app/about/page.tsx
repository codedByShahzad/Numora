// app/about/page.tsx
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";

import Link from "next/link";
import {
  Calculator,
  HeartPulse,
  DollarSign,
  Ruler,
  FlaskRound,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Zap,
  BadgeCheck,
  Users,
  Globe,
  Star,
  Quote,
} from "lucide-react";
import FAQAccordion from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "About Numora",
  description:
    "Learn about Numora — your trusted hub for quick, accurate, and user-friendly calculators. Explore our mission and discover health, finance, science, and everyday life tools designed to simplify your decisions.",
  keywords: [
    "About Numora",
    "online calculators",
    "free calculators",
    "BMI calculator",
    "finance calculator",
    "unit converters",
    "scientific tools",
    "GPA calculator",
    "everyday calculators",
  ],
  openGraph: {
    title: "About Numora",
    description:
      "Numora is your trusted hub for health, finance, science, and everyday life calculators. Learn about our mission to simplify complex calculations.",
    url: "https://yourdomain.com/about",
    siteName: "Numora",
    images: [
      {
        url: "https://yourdomain.com/og-about.png",
        width: 1200,
        height: 630,
        alt: "About Numora - Free Online Calculators",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Numora",
    description:
      "Discover Numora’s mission and explore our free calculators for health, finance, science, and daily life.",
    images: ["https://yourdomain.com/og-about.png"],
  },
};

type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  chips: string[];
};


export default function AboutPage() {
  const features: Feature[] = [
    {
      id: "health",
      icon: HeartPulse,
      title: "Health Calculators",
      description:
        "Practical tools for everyday wellness — with sensible inputs, clear ranges, and results that are easy to interpret.",
      chips: ["BMI", "Calories", "Hydration", "Heart rate"],
    },
    {
      id: "finance",
      icon: DollarSign,
      title: "Finance Calculators",
      description:
        "Make confident money decisions with transparent breakdowns for loans, interest, mortgages, and return estimates.",
      chips: ["EMI", "Interest", "Mortgage", "ROI"],
    },
    {
      id: "unit-conversions",
      icon: Ruler,
      title: "Unit Conversions",
      description:
        "Accurate, consistent conversions across the units you actually use — formatted cleanly and built for speed.",
      chips: ["Length", "Weight", "Temp", "Volume"],
    },
    {
      id: "maths-science",
      icon: FlaskRound,
      title: "Math & Science Tools",
      description:
        "From algebra and statistics to everyday science helpers — designed to be reliable, readable, and practical.",
      chips: ["Algebra", "Physics", "Chemistry", "Stats"],
    },
    {
      id: "everyday-life",
      icon: Calendar,
      title: "Everyday Life Calculators",
      description:
        "Quick utilities for daily planning — age, dates, tips, time zones, GPA, and more in a consistent interface.",
      chips: ["Age", "Timezone", "Tip", "GPA"],
    },
  ];

  const valueProps = [
    {
      icon: Zap,
      title: "Fast by design",
      desc: "Instant results with a lightweight UI and minimal steps.",
    },
    {
      icon: BadgeCheck,
      title: "Trusted formulas",
      desc: "Built using widely accepted formulas and conventions wherever possible.",
    },
    {
      icon: Lock,
      title: "Privacy-first",
      desc: "Most tools work without storing your inputs — designed for peace of mind.",
    },
    {
      icon: Globe,
      title: "Works everywhere",
      desc: "Responsive layouts that feel great on mobile, tablet, and desktop.",
    },
  ];

  const stats = [
    { icon: Calculator, label: "Calculators", value: "50+" },
    { icon: Users, label: "Users helped", value: "10k+" },
    { icon: ShieldCheck, label: "Validated inputs", value: "100%" },
    { icon: Star, label: "Focus", value: "Clarity" },
  ];

  const testimonials = [
    {
      name: "Product Designer",
      role: "SaaS team",
      quote:
        "Numora feels like a polished product — quick answers, clean breakdowns, zero distractions.",
    },
    {
      name: "Student",
      role: "Everyday use",
      quote:
        "The unit conversions and GPA tools are the fastest I’ve used. The UI is super clear.",
    },
    {
      name: "Entrepreneur",
      role: "Finance planning",
      quote:
        "Loan and ROI calculators give exactly what I need — inputs, results, and context.",
    },
  ];

  const faqs = [
    {
      q: "Are Numora calculators free to use?",
      a: "Yes. Numora is built to be accessible — core calculators are free and designed for quick, everyday use.",
    },
    {
      q: "How do you ensure accuracy?",
      a: "We use standard formulas where possible, validate inputs, and format results consistently to reduce confusion.",
    },
    {
      q: "Do you store my data?",
      a: "Most calculators run without storing inputs. If a tool ever needs saving, we’ll make that explicit.",
    },
    {
      q: "Can I request a calculator?",
      a: "Absolutely. Share a request through the Contact page — we prioritize tools that provide the most value.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-gray-900">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:56px_56px]" />
        {/* glow blobs */}
        <div className="pointer-events-none absolute -top-16 right-0 z-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 z-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />
      {/* SaaS background (grid + glows) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-[#125FF9]/12 blur-3xl" />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        {/* HERO */}
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#125FF9]" />
            About Numora
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            A trusted place for{" "}
            <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
              accurate, everyday calculations
            </span>
          </h1>

          <p className="mt-4 text-base text-gray-600 sm:text-lg leading-relaxed">
            Numora is a modern calculator platform built for people who want answers they can rely on
            — without clutter, confusing steps, or outdated interfaces. Each tool is designed with
            clear inputs, consistent formatting, and helpful context so you understand the result,
            not just the number.
            <br />
            <span className="font-medium text-gray-700">
              Whether you’re checking health metrics, planning finances, converting units, or solving
              everyday problems — Numora keeps it simple, fast, and easy to trust.
            </span>
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {["Fast", "Accurate", "Clear breakdowns", "Free"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>

        </section>

        {/* LOGO STRIP */}
        <section className="mt-12">
          <div className="mx-auto max-w-5xl rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="text-center text-xs font-medium text-gray-600">
              Designed with a SaaS mindset: consistency, clarity, and speed
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {["Health", "Finance", "Math", "Science", "Conversions", "Everyday"].map((x) => (
                <div
                  key={x}
                  className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-center text-xs font-semibold text-gray-800 shadow-sm"
                >
                  {x}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_30%_10%,black,transparent_60%)] bg-gradient-to-br from-[#008FBE]/25 to-[#125FF9]/20" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                      <div className="mt-1 text-xs text-gray-600">{s.label}</div>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-[#125FF9]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MISSION + TRUST */}
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-7 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute left-0 top-0 h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />
            <h2 className="text-xl font-semibold text-gray-900">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              We’re building Numora to make practical calculations accessible to everyone — with a
              clean interface, validated inputs, and results that are easy to understand. The goal
              isn’t just speed; it’s confidence.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <MiniPoint text="Standard formulas where possible" />
              <MiniPoint text="Designed for quick answers" />
              <MiniPoint text="Simple UI, clean outputs" />
              <MiniPoint text="Works great on mobile" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-7 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute left-0 top-0 h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />
            <h2 className="text-xl font-semibold text-gray-900">What you can expect</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              A consistent experience across every calculator: clear inputs, sensible defaults,
              validated values, and clean formatting. Wherever it helps, we add small notes and
              breakdowns so the result is meaningful — not confusing.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <TrustRow title="Reliable results" desc="Inputs validated + clean formatting." />
              <TrustRow title="No distractions" desc="Focus on what matters: the answer." />
              <TrustRow title="Consistent UI" desc="Same layout and patterns across tools." />
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="mt-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built with product-level quality
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Every tool follows the same standard: clean UI, fast flow, and results you can trust.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-2xl" />
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                      <Icon className="h-6 w-6 text-[#125FF9]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-gray-900">{v.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-gray-600">{v.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CATEGORIES (clickable + last centered) */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Our calculator categories
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Numora is organized into practical categories so you can find the right tool instantly.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              const isLast = idx === features.length - 1;

              return (
                <Link
                  key={f.id}
                  href={`/categories/${f.id}`}
                  className={[
                    "group relative block focus:outline-none",
                    !isLast ? "lg:col-span-3" : "lg:col-span-2 lg:col-start-3",
                  ].join(" ")}
                  aria-label={`Explore ${f.title}`}
                >
                  <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#008FBE]/25 via-[#125FF9]/20 to-[#008FBE]/20 opacity-0 blur-xl transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

                  <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_18px_44px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition will-change-transform hover:-translate-y-1 hover:bg-white/95 group-focus-visible:ring-2 group-focus-visible:ring-[#125FF9]/40">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#008FBE]/20 to-[#125FF9]/20 blur-md opacity-70" />
                        <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                          <Icon className="h-6 w-6 text-gray-900" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.description}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {f.chips.map((c) => (
                            <span
                              key={c}
                              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <ShieldCheck className="h-4 w-4 text-[#125FF9]" />
                        Clean & consistent UI
                      </div>

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                        Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Loved for clarity
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              A calm UI, consistent patterns, and results that make sense.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#008FBE]/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Quote className="h-4 w-4 text-[#125FF9]" />
                    {t.role}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">“{t.quote}”</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-600">Verified user</div>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-[#125FF9]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ (now fully smooth) */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Quick answers about Numora and how we build calculators.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <FAQAccordion items={faqs} />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_50%_0%,black,transparent_65%)] bg-gradient-to-r from-[#008FBE]/25 via-[#125FF9]/20 to-[#008FBE]/20" />

            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                <Calculator className="h-7 w-7 text-[#125FF9]" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                Simple. Accurate. Free.
              </h2>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                That’s the Numora promise — no matter what you’re calculating.
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#008FBE] to-[#125FF9] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_44px_-26px_rgba(18,95,249,0.55)] transition hover:opacity-95 sm:w-auto"
                >
                  Start using Numora
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-white/80 sm:w-auto"
                >
                  Share feedback
                  <CheckCircle2 className="h-4 w-4 text-[#125FF9]" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-[#125FF9]" />
                  Consistent UI
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 shadow-sm">
                  <Lock className="h-4 w-4 text-[#125FF9]" />
                  Privacy-first
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 shadow-sm">
                  <Zap className="h-4 w-4 text-[#125FF9]" />
                  Fast results
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* --------------------- Small UI components --------------------- */

function MiniPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-xs text-gray-700 shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-[#125FF9]" />
      <span>{text}</span>
    </div>
  );
}

function TrustRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
    </div>
  );
}
