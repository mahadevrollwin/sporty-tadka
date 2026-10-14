"use client";

import { useEffect, useId, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { verticals } from "@/content/home";
import { isValidEmail, isValidPhone } from "@/lib/lead";

type Listener = () => void;

const listeners = new Set<Listener>();

export function openLeadForm() {
  listeners.forEach((listener) => listener());
}

export function StartProjectButton({
  className,
  children = "Start a project",
  onOpen,
}: {
  className?: string;
  children?: ReactNode;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onOpen?.();
        openLeadForm();
      }}
    >
      {children}
    </button>
  );
}

const empty = { name: "", phone: "", email: "" };

const fieldErrors = { name: "", phone: "", email: "", requirement: "" };

const selectedClass = {
  "bg-lime": "border-lime shadow-[0_0_18px_rgba(198,255,61,.3)]",
  "bg-magenta": "border-magenta shadow-[0_0_18px_rgba(255,60,172,.3)]",
  "bg-cyan": "border-cyan shadow-[0_0_18px_rgba(51,230,255,.3)]",
  "bg-yellow": "border-yellow shadow-[0_0_18px_rgba(255,228,94,.35)]",
} as const;

export function LeadForm({
  options = verticals,
}: {
  options?: readonly { label: string; dot: string; hover: string }[];
} = {}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState(empty);
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState(fieldErrors);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const openForm = () => {
      setSent(false);
      setError("");
      setErrors(fieldErrors);
      setOpen(true);
    };
    listeners.add(openForm);
    return () => {
      listeners.delete(openForm);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, sending]);

  function close() {
    if (sending) return;
    setOpen(false);
  }

  function clearError(name: "name" | "phone" | "email") {
    setErrors((current) => (current[name] ? { ...current, [name]: "" } : current));
  }

  function toggleRequirement(label: string) {
    setPicked((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
    setErrors((current) => ({ ...current, requirement: "" }));
  }

  function validate() {
    const requirement = options.filter((item) => picked.includes(item.label)).map((item) => item.label);
    const next = {
      name: fields.name.trim().length >= 2 ? "" : "Enter your name.",
      phone: isValidPhone(fields.phone) ? "" : "Enter a valid phone number.",
      email: isValidEmail(fields.email) ? "" : "Enter a valid email.",
      requirement: requirement.length > 0 ? "" : "Pick at least one requirement.",
    };
    return { next, requirement };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { next, requirement } = validate();
    setErrors(next);
    if (next.name || next.phone || next.email || next.requirement) return;
    setError("");
    setSending(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, requirement }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error || "Something went wrong. Try again.");
        return;
      }
      setFields(empty);
      setPicked([]);
      setErrors(fieldErrors);
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/80" onClick={close}>
      <div className="flex min-h-full justify-center px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-[440px] rounded-[18px] border border-line bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,.55)]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="m-0 font-display text-[32px] leading-none font-black uppercase">
            Start a project
          </h2>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-dim hover:text-ink"
          >
            Close
          </button>
        </div>
        {sent ? (
          <p className="m-0 text-[16px] text-soft">
            Got it. We&apos;ll be in touch about your project.
          </p>
        ) : (
          <form className="grid gap-3.5" noValidate onSubmit={submit}>
            <Field
              label="Name"
              name="name"
              autoComplete="name"
              value={fields.name}
              error={errors.name}
              clearError={() => clearError("name")}
              onChange={setFields}
            />
            <Field
              label="Phone number"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={fields.phone}
              error={errors.phone}
              clearError={() => clearError("phone")}
              onChange={setFields}
              sanitize={(value) => value.replace(/[^\d\s()+.-]/g, "")}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={fields.email}
              error={errors.email}
              clearError={() => clearError("email")}
              onChange={setFields}
            />
            <fieldset className="m-0 grid gap-2 border-0 p-0">
              <legend className="mb-1.5 text-sm font-semibold text-dim">Requirement</legend>
              <div className="flex flex-wrap gap-2">
                {options.map((item) => {
                  const selected = picked.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleRequirement(item.label)}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border bg-canvas px-3.5 py-2 text-left text-[13.5px] font-semibold text-ink transition ${item.hover} ${
                        selected ? selectedClass[item.dot as keyof typeof selectedClass] : "border-line"
                      }`}
                    >
                      <i className={`h-[9px] w-[9px] shrink-0 rounded-full ${item.dot}`} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              {errors.requirement ? (
                <p className="m-0 text-sm font-medium text-magenta">{errors.requirement}</p>
              ) : null}
            </fieldset>
            {error ? <p className="m-0 text-sm text-magenta">{error}</p> : null}
            <button
              type="submit"
              disabled={sending}
              className="mt-1 cursor-pointer rounded-lg bg-lime px-5 py-3.5 text-[15.5px] font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] transition hover:bg-[#d4ff5c] disabled:cursor-wait disabled:opacity-70"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  clearError,
  type = "text",
  inputMode,
  autoComplete,
  sanitize,
}: {
  label: string;
  name: "name" | "phone" | "email";
  value: string;
  onChange: Dispatch<SetStateAction<typeof empty>>;
  error?: string;
  clearError?: () => void;
  type?: string;
  inputMode?: "tel" | "email" | "text";
  autoComplete?: string;
  sanitize?: (value: string) => string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-dim">
      {label}
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          const next = sanitize ? sanitize(event.target.value) : event.target.value;
          onChange((current) => ({ ...current, [name]: next }));
          clearError?.();
        }}
        className={`rounded-lg border bg-canvas px-3.5 py-3 text-[15px] font-medium text-ink outline-none focus:border-lime ${
          error ? "border-magenta" : "border-line"
        }`}
      />
      {error ? <span className="text-[13px] font-medium text-magenta">{error}</span> : null}
    </label>
  );
}
