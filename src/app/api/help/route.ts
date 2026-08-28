import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Receives "Help the Encyclopedia" form submissions (see
 * src/components/HelpForm.tsx), validates them, then forwards them to
 * Formspree (https://formspree.io) — Formspree is the system of record:
 * it stores each submission and emails a notification. This route holds
 * no storage of its own and never will for this version; see the setup
 * steps for FORMSPREE_FORM_ID reported alongside this change.
 */

const helpSubmissionSchema = z.object({
  category: z.enum([
    "missing-information",
    "source-link",
    "correction",
    "new-content",
    "other",
  ]),
  relatedPage: z.string().trim().max(300).optional().or(z.literal("")),
  suggestion: z.string().trim().min(1).max(5000),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
  name: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = helpSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form and try again." },
      { status: 400 }
    );
  }

  const formId = process.env.FORMSPREE_FORM_ID;
  if (!formId) {
    console.error(
      "[help-form] FORMSPREE_FORM_ID is not set — submission was not sent anywhere."
    );
    return NextResponse.json(
      { ok: false, error: "Submissions aren't connected yet. Please try again later." },
      { status: 503 }
    );
  }

  let formspreeResponse: Response;
  try {
    formspreeResponse = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    console.error("[help-form] Formspree request failed:", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't send your suggestion right now. Please try again." },
      { status: 502 }
    );
  }

  if (!formspreeResponse.ok) {
    console.error(
      "[help-form] Formspree rejected the submission:",
      formspreeResponse.status,
      await formspreeResponse.text().catch(() => "")
    );
    return NextResponse.json(
      { ok: false, error: "Couldn't send your suggestion right now. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
