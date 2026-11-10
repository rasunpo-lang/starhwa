# Derives the two depth layers the WebGL aurora (src/components/AuroraArt.tsx) warps, from the
# cleaned sky public/brand/aurora-sky.jpg. numpy + macOS sips only. Run from the repo root:
#   python3 brand-source/aurora-layers.py
# Outputs public/brand/aurora-far.jpg (diffuse far haze) and aurora-near.jpg (the picture's own
# brightest fine light, premultiplied on black — the shader adds it, so no alpha channel is needed).
import numpy as np, struct, subprocess, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = ROOT + '/public/brand/'
TMP = '/tmp/aurora-layers-'
subprocess.run(['sips', '-s', 'format', 'bmp', OUT + 'aurora-sky.jpg', '--out', TMP + 'sky.bmp'], capture_output=True)
d = open(TMP + 'sky.bmp', 'rb').read()
off = struct.unpack('<I', d[10:14])[0]
W, H = struct.unpack('<ii', d[18:26]); top_down = H < 0; H = abs(H)
bpp = struct.unpack('<H', d[28:30])[0] // 8
stride = (W * bpp + 3) // 4 * 4
raw = np.frombuffer(d[off:off + stride * H], np.uint8).reshape(H, stride)[:, :W * bpp].reshape(H, W, bpp)[:, :, :3]
img = raw[:, :, ::-1].astype(np.float32)
if not top_down: img = img[::-1]

def box1(a, r, axis):
    k = 2 * r + 1
    p = np.pad(a, [(r + 1, r) if i == axis else (0, 0) for i in range(a.ndim)], mode='edge')
    c = p.cumsum(axis)
    sl = lambda s, e: tuple(slice(s, e) if i == axis else slice(None) for i in range(a.ndim))
    return (c[sl(k, None)] - c[sl(0, -k)]) / k

def blur(a, r, n=3):
    for _ in range(n):
        a = box1(box1(a, r, 0), r, 1)
    return a

def write_jpg(path, rgb, q=88):
    h, w, _ = rgb.shape
    bgr = np.clip(rgb, 0, 255)[:, :, ::-1].astype(np.uint8)
    hdr = struct.pack('<2sIHHI', b'BM', 54 + w * h * 3, 0, 0, 54) + struct.pack('<IiiHHIIiiII', 40, w, -h, 1, 24, 0, w * h * 3, 2835, 2835, 0, 0)
    open(TMP + 'tmp.bmp', 'wb').write(hdr + bgr.tobytes())
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', str(q), TMP + 'tmp.bmp', '--out', path], capture_output=True)

lum = img.mean(2)
# ── FAR veil: atmospheric perspective — only the broad, diffuse light of the scene,
#    softened, slightly cooled/desaturated and lifted.
far = blur(img, 14, 3)
g = far.mean(2, keepdims=True)
far = g + (far - g) * 0.8
far = far * np.array([0.93, 1.02, 1.1]) * 1.18
write_jpg(OUT + 'aurora-far.jpg', far)

# ── NEAR filaments: the picture's own brightest, finest light (high-pass + cores),
#    gently drawn out vertically like auroral rays. RGBA, colour = original colour.
base = blur(lum, 8, 3)
hp = lum - base
v = np.clip((hp - 3) / 26, 0, 1)
cores = np.clip((lum - 150) / 85, 0, 1) ** 1.6
a = np.maximum(v * 1.25, cores * 0.9)
a = box1(box1(a, 14, 0), 1, 1)                 # vertical drawing-out, tiny horizontal softening
a = np.clip(a * 1.15, 0, 1)
col = img.copy()
gm = col.mean(2, keepdims=True)
col = np.clip(gm + (col - gm) * 1.3, 0, 255) * 1.08
write_jpg(OUT + 'aurora-near.jpg', np.clip(col, 0, 255) * a[..., None], 90)

