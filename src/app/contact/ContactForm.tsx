"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  User,
  Tag,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setErrorMsg("");
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const isSending = status === "sending";

  // ✅ UPDATED: send to support@numoro.net
  const FORM_ENDPOINT =
  "https://formsubmit.co/ajax/ad4b02da563b5f1e3f0ada2dc3301d5d";


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      // ✅ Use FormData (reliable with FormSubmit + avoids CORS preflight)
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("_subject", formData.subject); // ✅ FormSubmit uses _subject
      fd.append("message", formData.message);

      // optional quality-of-life fields for FormSubmit
      fd.append("_captcha", "false");

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: fd,
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const msg =
          data?.message ||
          data?.error ||
          `Request failed (${response.status})`;
        setErrorMsg(msg);
        setStatus("error");
      }
    } catch (error: unknown) {
      console.error("Form submission error:", error);

      const msg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Network error";

      setErrorMsg(msg);
      setStatus("error");
    }
  };

  return (
    <div className="rounded-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
          <Sparkles className="h-4 w-4 text-[#125FF9]" />
          Contact form
        </div>

        <h3 className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl">
          Send us a message
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 sm:text-base">
          Share your question, feedback, or a calculator request. Include details
          so we can respond faster.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            required
            icon={<User className="h-4 w-4 text-gray-500" />}
            iconAlign="center"
          >
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Your name"
              className={inputClass}
              inputMode="text"
              autoComplete="name"
            />
          </Field>

          <Field
            label="Email"
            required
            icon={<Mail className="h-4 w-4 text-gray-500" />}
            iconAlign="center"
          >
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@example.com"
              className={inputClass}
              inputMode="email"
              autoComplete="email"
            />
          </Field>
        </div>

        {/* Subject */}
        <Field
          label="Subject"
          required
          icon={<Tag className="h-4 w-4 text-gray-500" />}
          hint="Example: Calculator request, feedback, bug report, partnership."
          iconAlign="center"
        >
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="What is this about?"
            className={inputClass}
            inputMode="text"
            autoComplete="off"
          />
        </Field>

        {/* Message */}
        <Field
          label="Message"
          required
          icon={<MessageSquareText className="h-4 w-4 text-gray-500" />}
          hint="If it’s a bug: steps to reproduce + expected result. If it’s a request: formula + inputs/outputs."
          iconAlign="top"
        >
          <textarea
            rows={6}
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="Write your message…"
            className={`${inputClass} resize-none py-3`}
          />
        </Field>

        {/* Actions row (responsive) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="submit"
            disabled={isSending}
            className={[
              "group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white",
              "bg-gradient-to-r from-[#008FBE] to-[#125FF9]",
              "shadow-[0_18px_44px_-26px_rgba(18,95,249,0.55)]",
              "transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#125FF9]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            ].join(" ")}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send message
                <CheckCircle2 className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({ name: "", email: "", subject: "", message: "" })
            }
            disabled={isSending}
            className="
              inline-flex w-full items-center justify-center gap-2
              rounded-2xl px-5 py-3 text-sm font-semibold
              text-gray-900 border border-black/10 bg-white
              shadow-sm hover:bg-gray-50 transition
              disabled:opacity-60 disabled:cursor-not-allowed
              sm:w-[180px]
            "
          >
            Clear form
          </button>
        </div>
      </form>

      {/* Status */}
      <div className="mt-5 min-h-[44px]">
        {status === "success" && (
          <StatusBar
            variant="success"
            text="Message sent successfully. We’ll get back to you soon."
          />
        )}

        {status === "error" && (
          <StatusBar
            variant="error"
            text={
              errorMsg
                ? `Failed to send: ${errorMsg}`
                : "Failed to send message. Please try again in a moment."
            }
          />
        )}
      </div>

      <p className="mt-2 px-2 text-center text-xs leading-relaxed text-gray-500 sm:px-0">
        By sending this message, you agree to share your contact details so we
        can reply.
      </p>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none " +
  "placeholder:text-gray-400 " +
  "focus:border-[#125FF9]/30 focus:ring-2 focus:ring-[#125FF9]/20 " +
  "transition";

function Field({
  label,
  required,
  icon,
  hint,
  iconAlign = "center",
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  hint?: string;
  iconAlign?: "center" | "top";
  children: React.ReactNode;
}) {
  const iconPos =
    iconAlign === "top"
      ? "top-3 -translate-y-0"
      : "top-1/2 -translate-y-1/2";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900">
          {label} {required ? <span className="text-gray-400">*</span> : null}
        </label>
      </div>

      <div className="relative">
        {icon ? (
          <div className={`pointer-events-none absolute left-3 ${iconPos}`}>
            {icon}
          </div>
        ) : null}

        <div className={icon ? " [&>input]:pl-10 [&>textarea]:pl-10" : ""}>
          {children}
        </div>
      </div>

      {hint ? (
        <p className="text-xs leading-relaxed text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

function StatusBar({
  variant,
  text,
}: {
  variant: "success" | "error";
  text: string;
}) {
  const cfg = useMemo(() => {
    if (variant === "success") {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        box: "border-emerald-200 bg-emerald-50 text-emerald-800",
      };
    }
    return {
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      box: "border-red-200 bg-red-50 text-red-800",
    };
  }, [variant]);

  return (
    <div
      className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${cfg.box}`}
    >
      {cfg.icon}
      <span className="break-words leading-relaxed">{text}</span>
    </div>
  );
}
