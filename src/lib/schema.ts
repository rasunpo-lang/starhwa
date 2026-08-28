import { z } from "zod";
import { CATEGORIES, Category } from "./types";

/**
 * Validates the YAML frontmatter of a single content/entries/*.md file.
 * Anything that fails this schema throws a build/dev-time error naming
 * the offending file — see loadEntryFile() in data/entries.ts.
 */
export const sourceSchema = z.object({
  label: z.string().min(1, "source.label is required"),
  url: z.string().url("source.url must be a valid URL"),
});

// Optional editorial visual anchor — see content/README.md "Image
// selection." credit is required whenever an image is set, matching the
// attribution the site already shows for every other media type.
export const imageSchema = z.object({
  url: z.string().url("image.url must be a valid URL"),
  credit: z.string().min(1, "image.credit is required when image is set"),
  type: z.enum(["photo", "product"]).default("photo"),
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
