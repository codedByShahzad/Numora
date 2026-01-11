// app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import {
  Sparkles,
  Mail,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  MessageSquareText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Numora. Have questions, feedback, or suggestions? Fill out our contact form and we’ll respond as soon as possible.",
  keywords: [
    "Numora contact",
    "calculator support",
    "feedback",
    "frontend developer",
    "React developer",
    "Next.js developer",
  ],
  openGraph: {
    title: "Contact Us | Numora",
    description:
      "Have questions, feedback, or want to hire a frontend developer? Contact Numora today.",
    siteName: "Numora",
    type: "website",
  },
};

export default function ContactPage() {
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
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#125FF9]" />
            Contact Numora
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Let’s{" "}
            <span className="bg-gradient-to-r from-[#008FBE] to-[#125FF9] bg-clip-text text-transparent">
              talk
            </span>{" "}
            to  our Team
          </h1>

          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Have feedback, found an issue, or want a new calculator added? Send a message
            and we’ll reply as soon as possible.
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
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: SaaS info panel */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-7 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="h-[4px] w-full absolute left-0 top-0 bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />

              <h2 className="text-xl font-semibold text-gray-900">
                Quick help & support
              </h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
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
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=mr.shahzad.developer@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition"
                    >
                      Email us <ArrowUpRight className="h-4 w-4" />
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

              <div className="mt-6 rounded-2xl border border-black/10 bg-[hsl(51,97%,86%)] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h- w-10 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                    <MessageSquareText className="h-5 w-5 text-[#125FF9]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Want to hire a developer?
                    </p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      Do you want to build a website or tool that can generate revenue through Google AdSense, affiliate marketing, or other online channels? I help create modern, high-performance, and revenue-focused platforms.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 bg-[hsl(51,97%,86%)]">
                      {["Let's work together to turn your idea into a profitable online business."].map((x) => (
                        <span
                          key={x}
                          className="rounded-full border border-black/10 bg-[hsl(34,97%,86%)] px-3 py-1 text-xs text-center text-gray-700 shadow-sm"
                        >
                          {x}
                        </span>
                      ))}
                    </div>

                  
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Contact form */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_22px_60px_-34px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="h-[4px] w-full absolute left-0 top-0 bg-gradient-to-r from-[#008FBE] to-[#125FF9]" />
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
    <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-sm text-gray-600">{desc}</div>
          </div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
