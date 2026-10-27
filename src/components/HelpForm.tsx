"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type Category =
  | "missing-information"
  | "source-link"
  | "correction"
  | "new-content"
  | "other";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "missing-information", label: "Missing information" },
  { value: "source-link", label: "Source / link suggestion" },
  { value: "correction", label: "Correction" },
  { value: "new-content", label: "New content suggestion" },
  { value: "other", label: "Other" },
];

interface FormValues {
  category: Category | "";
  relatedPage: string;
  suggestion: string;
  sourceUrl: string;
  name: string;
  email: string;
}

const EMPTY_VALUES: FormValues = {
  category: "",
  relatedPage: "",
  suggestion: "",
  sourceUrl: "",
  name: "",
  email: "",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.category) {
    errors.category = "Please let us know what kind of note this is.";
  }

  if (!values.suggestion.trim()) {
    errors.suggestion = "Tell us what you found — this can't be empty.";
  }

  const sourceUrl = values.sourceUrl.trim();
  if (sourceUrl) {
    try {
      new URL(sourceUrl);
    } catch {
      errors.sourceUrl = "That doesn't look like a valid URL — include https://";
    }
  }

  const email = values.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That doesn't look like a valid email address.";
  }

  return errors;
}

const fieldClasses =
  "mt-2 w-full border border-line bg-ivory px-3 py-2.5 text-base text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-colors placeholder:text-charcoal/65 hover:border-charcoal/40 focus:border-plum aria-[invalid=true]:border-plum sm:text-sm";

const cardClasses =
  "border border-line bg-ivory/60 p-6 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_22px_44px_-30px_color-mix(in_srgb,var(--plum)_50%,transparent)] backdrop-blur-[2px] sm:p-8";

export default function HelpForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formId = useId();

  useEffect(() => {
    if (status === "success") headingRef.current?.focus();
  }, [status]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setSubmitError(
        "Oh no — the envelope got lost. 🥲 Your note didn't send. Please try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div className={cardClasses}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl leading-snug sm:text-3xl"
        >
          A little star has reached the archive!{" "}
          <span aria-hidden="true">✦</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/85">
          Thank you for leaving a note. <span aria-hidden="true">♡</span>
          <br />
          We&apos;ll look into it and see where it belongs.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href="/" className="btn btn-filled py-3.5 hover:border-plum hover:bg-plum">
            Back to the Encyclopedia
          </Link>
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY_VALUES);
              setStatus("idle");
            }}
            className="btn btn-secondary py-3.5"
          >
            Leave another note
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cardClasses}
    >
      <div>
        <label htmlFor={`${formId}-category`} className="eyebrow text-charcoal/85">
          What would you like to share?{" "}
          <span aria-hidden="true" className="text-plum">
            *
          </span>
        </label>
        <div className="relative">
          <select
            id={`${formId}-category`}
            value={values.category}
            onChange={(e) => updateField("category", e.target.value as Category)}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? `${formId}-category-error` : undefined}
            className={`${fieldClasses} appearance-none pr-10 ${values.category ? "" : "text-charcoal/65!"}`}
          >
            <option value="" disabled>
              Choose one…
            </option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 8"
            className="pointer-events-none absolute right-3.5 top-1/2 mt-1 h-2 w-3 -translate-y-1/2 text-plum"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </div>
        {errors.category && (
          <p id={`${formId}-category-error`} role="alert" className="mt-1.5 text-xs text-plum">
            {errors.category}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor={`${formId}-relatedPage`} className="eyebrow text-charcoal/85">
          Related encyclopedia page
        </label>
        <input
          id={`${formId}-relatedPage`}
          type="text"
          value={values.relatedPage}
          onChange={(e) => updateField("relatedPage", e.target.value)}
          placeholder="Is there a page this belongs with?"
          aria-describedby={`${formId}-relatedPage-hint`}
          className={fieldClasses}
        />
        <p id={`${formId}-relatedPage-hint`} className="mt-1.5 text-xs text-charcoal/70">
          Optional — the entry or page title this belongs with, if you know it.
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor={`${formId}-suggestion`} className="eyebrow text-charcoal/85">
          Your note{" "}
          <span aria-hidden="true" className="text-plum">
            *
          </span>
        </label>
        <textarea
          id={`${formId}-suggestion`}
          value={values.suggestion}
          onChange={(e) => updateField("suggestion", e.target.value)}
          placeholder="A detail, a missing piece, a clue worth following…"
          rows={6}
          aria-invalid={errors.suggestion ? true : undefined}
          aria-describedby={errors.suggestion ? `${formId}-suggestion-error` : undefined}
          className={`${fieldClasses} resize-y`}
        />
        {errors.suggestion && (
          <p id={`${formId}-suggestion-error`} role="alert" className="mt-1.5 text-xs text-plum">
            {errors.suggestion}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor={`${formId}-sourceUrl`} className="eyebrow text-charcoal/85">
          Source URL
        </label>
        <input
          id={`${formId}-sourceUrl`}
          type="url"
          value={values.sourceUrl}
          onChange={(e) => updateField("sourceUrl", e.target.value)}
          placeholder="https://…"
          aria-invalid={errors.sourceUrl ? true : undefined}
          aria-describedby={
            errors.sourceUrl
              ? `${formId}-sourceUrl-error`
              : `${formId}-sourceUrl-hint`
          }
          className={fieldClasses}
        />
        {errors.sourceUrl ? (
          <p id={`${formId}-sourceUrl-error`} role="alert" className="mt-1.5 text-xs text-plum">
            {errors.sourceUrl}
          </p>
        ) : (
          <p id={`${formId}-sourceUrl-hint`} className="mt-1.5 text-xs text-charcoal/70">
            Official sources are especially appreciated. <span aria-hidden="true">✦</span>
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className="eyebrow text-charcoal/85">
            Name / nickname
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-email`} className="eyebrow text-charcoal/85">
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              errors.email ? `${formId}-email-error` : `${formId}-email-hint`
            }
            className={fieldClasses}
          />
          {errors.email ? (
            <p id={`${formId}-email-error`} role="alert" className="mt-1.5 text-xs text-plum">
              {errors.email}
            </p>
          ) : (
            <p id={`${formId}-email-hint`} className="mt-1.5 text-xs text-charcoal/70">
              Only needed if you&apos;d like a reply.
            </p>
          )}
        </div>
      </div>

      <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-charcoal/75">
        Suggestions are checked against sources before anything is added.{" "}
        <span aria-hidden="true">♡</span>
      </p>

      {status === "error" && submitError && (
        <p role="alert" className="mt-6 text-sm text-plum">
          {submitError}
        </p>
      )}

      <div className="mt-8">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn btn-filled w-full py-3.5 hover:border-plum hover:bg-plum disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {status === "submitting" ? "Sending your note…" : "Send it to the Archive ✦"}
        </button>
      </div>
    </form>
  );
}
