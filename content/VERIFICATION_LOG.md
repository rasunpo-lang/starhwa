# Verification baseline log

This file is a record of archive data-integrity checkpoints. It is **not**
read by the application — the content loader only scans `content/entries/`,
so nothing here ever reaches the live site. It exists purely so future
audits have an explicit, agreed reference point instead of re-deriving
counts from scratch or trusting a prior chat message's phrasing.

## Counting convention

- **Live entries** = every `.md` file in `content/entries/` whose name does
  **not** start with `_`. This is what the content loader indexes, what
  `getAllEntriesSorted()` returns, and what the build's `/archive/[slug]`
  route count reflects.
- **`_TEMPLATE.md`** is never a live entry. It is excluded by the loader's
  own filter (`!f.startsWith("_")`) and must always be counted and reported
  **separately** from live-entry totals — never folded into "unverified"
  or "total entries" figures without saying so explicitly.
- "Files on disk" = live entries + `_TEMPLATE.md`. Use this framing only
  when the template is being counted on purpose (e.g. a full directory
  listing), and say so.

## Baseline — 2026-08-14

| Metric | Count |
|---|---|
| Live entries (in `content/entries/`, excluding `_TEMPLATE.md`) | **44** |
| — of which verified | 22 |
| — of which unverified | 22 |
| Files on disk including `_TEMPLATE.md` | 45 |
| — of which unverified (22 live + `_TEMPLATE.md`) | 23 |
| Build output (`/archive/[slug]` pages generated) | 44 |
| Lint | clean |

This checkpoint follows: the original 27-entry chronological re-research
pass (8 corrected, rest left unverified with reasons on file), the removal
of `early-editorial-feature.md` (no primary source found, dangling
`related:` reference cleaned up in `treasure-ep3-one-to-all.md`), and a
full consistency audit confirming no other file, status, or UI/code change
occurred alongside it.
