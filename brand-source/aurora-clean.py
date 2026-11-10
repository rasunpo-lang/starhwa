# Derives the text-free aurora background from aurora-scene.original.png: masks the baked 星化 lockup
# strokes + glow and fills them from the surrounding sky (numpy only). The original is never modified.
import numpy as np, struct, sys
import os
S = os.path.dirname(os.path.abspath(__file__)) + '/work/'  # needs src.bmp (sips -s format bmp aurora-scene.original.png --out work/src.bmp); writes work/clean.bmp
d = open(S + 'src.bmp', 'rb').read()
off = struct.unpack('<I', d[10:14])[0]
W, H = 1536, 1024
img = np.frombuffer(d[off:off + W * H * 3], np.uint8).reshape(H, W, 3)[:, :, ::-1].astype(np.float32)  # RGB

def box(a, r):
    k = 2 * r + 1
    p = np.pad(a, ((r + 1, r), (r + 1, r)) + ((0, 0),) * (a.ndim - 2), mode='edge')
    c = p.cumsum(0).cumsum(1)
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)

def blur(a, r, n=3):
    for _ in range(n):
        a = box(a, r)
    return a

lum = img.mean(2)
bg = blur(lum, 6, 2)
hi = lum - bg
X0, X1, Y0, Y1 = 560, 990, 315, 640
box_m = np.zeros((H, W), bool)
box_m[Y0:Y1, X0:X1] = True
def dil(m, r):
    return box(m.astype(np.float32), r) > 0.001
core = (hi > 11) & box_m
ring = np.zeros((H, W), bool); ring[318:375, 680:900] = True
core |= (hi > 5) & ring
m = dil(core, 8) & box_m
m2 = dil(core, 17) & box_m
np.save(S + 'mask.npy', m)
# harmonic (Laplace) fill of masked pixels from their surroundings, on the box crop
sub = img[Y0 - 20:Y1 + 20, X0 - 20:X1 + 20].copy()
mm = m[Y0 - 20:Y1 + 20, X0 - 20:X1 + 20]
fill = sub.copy()
fill[mm] = sub[~mm].mean(0)
# coarse-to-fine: diffuse at 1/4 res first for fast convergence
def diffuse(f, mk, iters):
    for _ in range(iters):
        p = np.pad(f, ((1, 1), (1, 1), (0, 0)), mode='edge')
        avg = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4
        f = np.where(mk[..., None], avg, f)
    return f
fill = diffuse(fill, mm, 4000)

# put back high-frequency grain/stars texture borrowed from a clean donor patch
h2, w2 = sub.shape[:2]
dy, dx = 330, 20   # patch directly above, clean sky
donor = img[dy:dy + h2, dx:dx + w2]
dres = donor - blur(donor, 3, 2)
dres = np.clip(dres, -14, 14)
soft = box(mm.astype(np.float32), 5)[..., None]
out = fill + dres * soft * 0.9
a = np.clip(box(mm.astype(np.float32), 3) * 1.6, 0, 1)[..., None]
A = np.where(mm[..., None] | (a > 0.02), sub * (1 - a) + out * a, sub)
# stage 2: remove the soft glow halo — keep A's fine texture, replace only its low frequencies
mm2 = m2[Y0 - 20:Y1 + 20, X0 - 20:X1 + 20]
low = blur(A, 4, 2)
lowfill = diffuse(low.copy(), mm2, 5000)
feather = np.clip(box(mm2.astype(np.float32), 8) * 1.4, 0, 1)[..., None]
res = A + (lowfill - low) * feather
res = np.where(mm2[..., None], np.minimum(res, lowfill + 12), res)
sm = blur(res, 7, 3)
inner = np.clip(box(mm2.astype(np.float32), 10) * 1.3 - 0.15, 0, 1)[..., None]
res = res * (1 - 0.7 * inner) + (sm + dres * 0.8 * soft) * 0.7 * inner
clean = img.copy()
clean[Y0 - 20:Y1 + 20, X0 - 20:X1 + 20] = res
clean = np.clip(clean, 0, 255).astype(np.uint8)

bgr = clean[:, :, ::-1]
hdr = bytearray(d[:off])
open(S + 'clean.bmp', 'wb').write(bytes(hdr) + bgr.tobytes())
print('masked px', int(m.sum()))
