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
    errors.suggestion = "Tell us a little about what you found — this can't be empty.";
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
  "mt-2 w-full border border-line bg-ivory px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-charcoal/50 focus:border-plum focus:outline-none";

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
        "Oh no — the little envelope got lost. 🥲 Something went wrong while sending your note. Please try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="border border-line p-6 sm:p-8">
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
          We&apos;ll have a look and see where your discovery belongs —
          nothing changes in the archive until then.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="btn btn-primary">
            Back to the Encyclopedia
          </Link>
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY_VALUES);
              setStatus("idle");
            }}
            className="btn btn-secondary"
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
      className="border border-line p-6 sm:p-8"
    >
      <div>
        <label htmlFor={`${formId}-category`} className="eyebrow text-charcoal/85">
          What would you like to share?{" "}
          <span aria-hidden="true" className="text-plum">
            *
          </span>
        </label>
        <select
          id={`${formId}-category`}
          value={values.category}
          onChange={(e) => updateField("category", e.target.value as Category)}
          aria-invalid={errors.category ? true : undefined}
          aria-describedby={errors.category ? `${formId}-category-error` : undefined}
          className={fieldClasses}
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
          className={fieldClasses}
        />
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
          placeholder="A little detail, a missing piece, a clue worth following…"
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
              Only needed if you&apos;d like a little reply.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <p className="eyebrow text-charcoal/75">A Little Archive Note</p>
        <p className="mt-3 text-xs leading-relaxed text-charcoal/75">
          Every note gets a little visit from the archive keeper before
          anything changes. Sending something here doesn&apos;t guarantee
          it&apos;ll be added — we&apos;ll check it against the clues first.{" "}
          <span aria-hidden="true">♡</span>
        </p>
      </div>

      {status === "error" && submitError && (
        <p role="alert" className="mt-6 text-sm text-plum">
          {submitError}
        </p>
      )}

      <div className="mt-8">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending your note…" : "Send it to the Archive ✦"}
        </button>
      </div>
    </form>
  );
}
