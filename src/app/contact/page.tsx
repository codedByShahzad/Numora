// app/contact/page.tsx
import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import React from "react";
import {
  Sparkles,
  Mail,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  MessageSquareText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Numoro. Have questions, feedback, or suggestions? Fill out our contact form and we’ll respond as soon as possible.",
  keywords: [
    "Numoro contact",
    "calculator support",
    "feedback",
    "bug report",
    "calculator request",
    "partnerships",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Numoro",
    description:
      "Have questions, feedback, or want a new calculator added? Contact Numoro and we’ll reply as soon as possible.",
    url: "/contact",
    siteName: "Numoro",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Numoro – Contact" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Numoro",
    description:
      "Send feedback, report an issue, request a calculator, or reach the Numoro team.",
    images: ["/og.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7FAFF] text-gray-900">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFF] to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#008FBE]/14 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute -bottom-40 right-[-140px] h-[420px] w-[420px] rounded-full bg-[#125FF9]/12 blur-3xl sm:h-[520px] sm:w-[520px]" />

        {/* extra blobs (kept but safe) */}
        <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-[#125FF9]/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-40 w-40 rounded-full bg-[#008FBE]/10 blur-3xl" />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#125FF9]" />
            Contact Numoro
          </span>

          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Let’s{" "}
            <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
              talk
            </span>{" "}
            to our Team
          </h1>

          <p className="mt-4 text-pretty text-sm text-gray-600 sm:text-base md:text-lg">
            Have feedback, found an issue, or want a new calculator added? Send a
            message and we’ll reply as soon as possible.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["Feedback", "Bug report", "Calculator request", "Partnerships"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left */}
          <aside className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7 lg:sticky lg:top-24">
              <div className="absolute left-0 top-0 h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Quick help & support
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We read every message. If you’re requesting a new calculator, share the
                formula, use-case, and preferred input/output — we’ll prioritize it.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <InfoRow
                  icon={<Mail className="h-4 w-4 text-[#125FF9]" />}
                  title="Email"
                  desc="Reach us directly any time."
                  right={
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=support@numoro.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 sm:w-auto"
                    >
                      <span className="truncate">Email us</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </a>
                  }
                />

                <InfoRow
                  icon={<Clock className="h-4 w-4 text-[#125FF9]" />}
                  title="Response time"
                  desc="Usually within 24–48 hours."
                />

                <InfoRow
                  icon={<ShieldCheck className="h-4 w-4 text-[#125FF9]" />}
                  title="Privacy"
                  desc="Your details are used only to reply to your message."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-[hsl(200,100%,85%)] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid place-items-center rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
                    <MessageSquareText className="h-5 w-5 text-[#125FF9]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Want to hire a developer?
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700/80">
                      Do you want to build a website or tool that can generate revenue
                      through Google AdSense, affiliate marketing, or other online
                      channels? I help create modern, high-performance, and
                      revenue-focused platforms.
                    </p>
<div className="mt-4">
  <span
    className="
      block w-full
      rounded-xl border border-black/10
      bg-[hsl(159,97%,86%)]
      px-3 py-2
      text-center text-xs font-medium text-gray-800
      shadow-sm
      break-words leading-relaxed
      sm:inline-block sm:w-auto sm:rounded-xl sm:py-1
    "
  >
    Let&apos;s work together to turn your idea into a profitable online business.
  </span>
</div>

                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="absolute left-0 top-0 h-[4px] w-full bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  desc,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-sm text-gray-600">{desc}</div>
          </div>
        </div>

        {right ? <div className="sm:shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
