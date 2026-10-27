import { z } from "zod";
import { CATEGORIES, Category } from "./types";

/**
 * Validates the YAML frontmatter of a single content/entries/*.md file.
 * Anything that fails this schema throws a build/dev-time error naming
 * the offending file — see loadEntryFile() in data/entries.ts.
 */
// qualifiesForTourSource is meaningful only on a Tours-category concert
// entry's source — an explicit, author-set flag (never inferred from the
// label/url) marking this specific source as the one verified against the
// Tours page's official-source rule: an @ateezofficial/@ateezofficialjp X
// post that is either #TODAY_ATEEZ-tagged or a confirmed venue-specific
// photo for that exact date, OR an official ATEEZ YouTube video/short
// about that specific show. See content/README.md "Tour/concert entry
// sourcing." Defaults to unset/false — a source is never treated as
// qualifying just because it happens to be hosted on x.com or youtube.com.
export const sourceSchema = z.object({
  label: z.string().min(1, "source.label is required"),
  url: z.string().url("source.url must be a valid URL"),
  qualifiesForTourSource: z.literal(true).optional(),
  // Author-set: embed this specific X post on the entry page (when the entry
  // has no video player). See content/README.md "Embedding an X post."
  embed: z.literal(true).optional(),
});

// Optional editorial visual anchor — see content/README.md "Image
// selection." credit is required whenever an image is set, matching the
// attribution the site already shows for every other media type.
//
// sharePermission defaults to "unknown", never "permitted" — see
// content/README.md "Image sourcing & permission." An author must
// explicitly write `sharePermission: "permitted"` after confirming the
// source's own rules allow it (e.g. KQ's ATEEZ Official Platform
// FOR_ATINY board); omitting the field, or an image from a board that
// explicitly prohibits sharing (e.g. ATINY ZONE), must never resolve to
// "permitted" by default.
export const imageSchema = z.object({
  url: z.string().url("image.url must be a valid URL"),
  credit: z.string().min(1, "image.credit is required when image is set"),
  type: z.enum(["photo", "product"]).default("photo"),
  sourcePlatform: z.string().min(1).optional(),
  sourceUrl: z.string().url("image.sourceUrl must be a valid URL").optional(),
  sharePermission: z.enum(["permitted", "prohibited", "unknown"]).default("unknown"),
});

// YAML parses a key written with nothing after it (e.g. `related:` with no
// list items below) as null rather than an empty array — treat that the
// same as "not set" so authors don't have to remember to write `[]`.
const optionalStringArray = z
  .array(z.string())
  .nullish()
  .transform((v) => v ?? []);

export const frontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  tags: optionalStringArray,
  verification: z.enum(["verified", "unverified"]).default("unverified"),
  sources: z.array(sourceSchema).min(1, "at least one source is required"),
  image: imageSchema.optional(),
  related: optionalStringArray,
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      return `  - ${path}: ${issue.message}`;
    })
    .join("\n");
}
