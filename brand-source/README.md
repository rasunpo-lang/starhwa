# 星化 mark — sources

- `starhwa-mark.original.png` — Seonghwa's supplied handwriting, untouched. The only visual source.
- `starhwa-mark.R3-light.master.png` — day/dusk cut, full canvas (same registration as the dark master).
- `starhwa-mark.L2-dark.master.png` — night cut, full canvas, aligned to the light master.
- `mark2.py` — the generator (needs numpy, pillow, scipy). R3 = `build(theme='light', Hs=22, p=0.5, RS=0.12, amp=1.0, bandpow=12, bands=2.5, nmod=0.45, rim=0.7, cool=0.5, edge_o=0.03, mid_l=0.22, hi_o=1.0, sheen=0.85, chrome=0.85, seg=0.75, iri=1.2, irip=0.75, skyref=0.65, sat=1.35, spk=0, arm=36, spk_tint=0.55, glist=24, gseed=3, crop=False)`.
  The night cut (L2) was produced by an earlier version of the glint code, so its master is kept as-is rather than regenerated.
- `public/brand/starhwa-mark-{light,dark}.png` — exports: both masters cropped with the same box (glint halos included, 12px margin, verified transparent at the border) and scaled to 780px wide, so they register exactly for the crossfade.
- `starhwa-mark.refined-uniform.png` — an earlier uniform-thickening pass, kept for reference.

## Aurora scene
- `aurora-scene.original.png` — the complete aurora composition (星化 + STARHWA lettering, nav and taglines baked in), untouched.
- `aurora-clean.py` — derives the text-free sky from it (the lockup is masked and filled from the surrounding sky; nothing is redrawn).
- `public/brand/aurora-sky.jpg` — the site background: the cleaned scene cropped to y 140–740 (no nav/tagline/landscape). The calligraphy lives only in the original and in the site's own `Mark` element.
- `aurora-layers.py` — derives `public/brand/aurora-far.jpg` and `aurora-near.jpg` (the depth layers the WebGL aurora warps) from the cleaned sky.

### Aurora workflow (manual steps)
`aurora-clean.py` does not write `aurora-sky.jpg` itself: it writes only a full-size `clean.bmp`. The sky JPEG comes from two manual steps around it. Run from the repo root on macOS (needs Python 3 with NumPy, and the built-in `sips`):

1. Create the work folder (it is not in the repo): `mkdir brand-source/work`
2. Convert the original to BMP: `sips -s format bmp brand-source/aurora-scene.original.png --out brand-source/work/src.bmp`
3. Run the cleaner: `python3 brand-source/aurora-clean.py` — writes `brand-source/work/clean.bmp` (1536×1024).
4. Crop to y 140–740 (full width, so the result is 1536×600) and convert to JPEG, e.g. `sips -c 600 1536 --cropOffset 140 0 -s format jpeg -s formatOptions 90 brand-source/work/clean.bmp --out brand-source/work/aurora-sky.jpg`, then copy the result to `public/brand/aurora-sky.jpg`. The component expects exactly 1536×600 (`src/components/AuroraArt.tsx`).
5. Only then run `python3 brand-source/aurora-layers.py`, which reads `public/brand/aurora-sky.jpg` and rewrites `aurora-far.jpg` and `aurora-near.jpg` (JPEG quality 88 and 90 are set in the script).

Notes: step 4's `sips` command is a reconstruction. The crop coordinates and size are established (above), but the exact original command was not recorded and this command has not been run. The quality for `aurora-sky.jpg` was not recorded either; 90 is inferred because its JPEG quantization tables are identical to `aurora-near.jpg`'s, which the script writes at 90 (`aurora-far.jpg`, written at 88, differs). Writing into `public/brand/` replaces the committed artwork, so work on copies in `brand-source/work/` first.
