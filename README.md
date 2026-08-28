# The Starhwa Encyclopedia

An unofficial fan-maintained archive documenting Park Seonghwa of ATEEZ,
from the group's 2018 debut onward. Next.js (App Router) + TypeScript +
Tailwind CSS.

## Adding or editing archive entries

**You don't need to touch any application code.** Every entry lives as one
Markdown file in `content/entries/` — see **[content/README.md](content/README.md)**
for the full field reference and workflow.

## Development

```bash
npm run dev      # start the dev server at localhost:3000
npm run build    # production build (also type-checks and validates content)
npm run lint     # eslint
```

## Project structure

```
content/entries/*.md   the archive database — see content/README.md
src/data/               eras.ts (fixed taxonomy), officialLinks.ts, entries.ts (content loader)
src/lib/                Entry/Category types, zod schema for entry frontmatter
src/components/         shared UI (Header, Footer, EntryCard, filters, search)
src/app/                routes (home, chronology, archive, entry pages, search, about, official)
```
