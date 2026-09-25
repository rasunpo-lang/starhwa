# 星化 mark — sources

- `starhwa-mark.original.png` — Seonghwa's supplied handwriting, untouched. The only visual source.
- `starhwa-mark.R3-light.master.png` — day/dusk cut, full canvas (same registration as the dark master).
- `starhwa-mark.L2-dark.master.png` — night cut, full canvas, aligned to the light master.
- `mark2.py` — the generator (needs numpy, pillow, scipy). R3 = `build(theme='light', Hs=22, p=0.5, RS=0.12, amp=1.0, bandpow=12, bands=2.5, nmod=0.45, rim=0.7, cool=0.5, edge_o=0.03, mid_l=0.22, hi_o=1.0, sheen=0.85, chrome=0.85, seg=0.75, iri=1.2, irip=0.75, skyref=0.65, sat=1.35, spk=0, arm=36, spk_tint=0.55, glist=24, gseed=3, crop=False)`.
  The night cut (L2) was produced by an earlier version of the glint code, so its master is kept as-is rather than regenerated.
- `public/brand/starhwa-mark-{light,dark}.png` — exports: both masters cropped with the same box (glint halos included, 12px margin, verified transparent at the border) and scaled to 780px wide, so they register exactly for the crossfade.
- `starhwa-mark.refined-uniform.png` — an earlier uniform-thickening pass, kept for reference.
