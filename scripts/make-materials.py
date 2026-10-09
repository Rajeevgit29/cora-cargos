"""
Procedural STAND-IN materials for the opening scene.

These exist because no Higgsfield credits were available when the scene was
built. Replace them with generated photography when you can (see README,
"Opening scene assets"). Requires numpy and Pillow.

  python3 scripts/make-materials.py                      regenerate the stand-ins
  python3 scripts/make-materials.py --desk-photo F.png   optimise a desk photograph
  python3 scripts/make-materials.py --paper F.png        seamless, colour-matched newsprint
  python3 scripts/make-materials.py --walnut F.png       walnut texture for the procedural desk

Outputs
  public/assets/desk/walnut.jpg          3072 x 2048  dark walnut desk top (8 x 5.33 scene units)
  public/assets/desk/walnut-compact.jpg  1536 x 1024  same, for phones
  public/assets/desk/walnut-detail.jpg   1024 x 1024  seamless pore/grain detail, tiled close up
  public/assets/paper/newsprint.jpg       768 x 768   seamless newsprint, mean colour = --paper
"""

import argparse
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
os.makedirs(os.path.join(ROOT, 'desk'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'paper'), exist_ok=True)
rng = np.random.default_rng(29)


def smooth_noise(w, h, cells_x, cells_y, seed):
    """Value noise: a coarse random grid resized with bicubic filtering."""
    r = np.random.default_rng(seed)
    grid = r.random((max(2, cells_y), max(2, cells_x))).astype(np.float32)
    img = Image.fromarray(grid).resize((w, h), Image.BICUBIC)
    return np.asarray(img)


def fbm(w, h, cx, cy, seed, octaves=4, gain=0.5):
    total = np.zeros((h, w), np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        total += amp * smooth_noise(w, h, cx * 2 ** o, cy * 2 ** o, seed + o * 17)
        norm += amp
        amp *= gain
    return total / norm


def periodic_noise(n, scale, seed):
    """Seamlessly tiling noise: white noise low-passed in the frequency domain."""
    r = np.random.default_rng(seed)
    white = r.standard_normal((n, n))
    f = np.fft.fft2(white)
    ky = np.fft.fftfreq(n)[:, None]
    kx = np.fft.fftfreq(n)[None, :]
    k = np.sqrt(kx ** 2 + ky ** 2)
    f *= np.exp(-(k * scale) ** 2)
    out = np.real(np.fft.ifft2(f))
    return (out - out.mean()) / (out.std() + 1e-9)


def srgb(hex_):
    hex_ = hex_.lstrip('#')
    return np.array([int(hex_[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


# ─────────────────────────────────────────────────────────────── walnut ──

def walnut(W, H, seed=11):
    y = np.arange(H, dtype=np.float32)[:, None]
    x = np.arange(W, dtype=np.float32)[None, :]
    s = W / 3072.0  # keep features the same size in scene units at any resolution

    # Boards run left to right, ~0.9 scene units wide each.
    edges = [0]
    r = np.random.default_rng(seed)
    while edges[-1] < H:
        edges.append(edges[-1] + int(r.uniform(300, 420) * s))
    edges[-1] = H
    board = np.zeros((H, 1), np.int32)
    local = np.zeros((H, 1), np.float32)
    for b in range(len(edges) - 1):
        board[edges[b]:edges[b + 1]] = b
        local[edges[b]:edges[b + 1], 0] = np.arange(edges[b + 1] - edges[b])

    dark = srgb('#24170f')
    mid = srgb('#3f2a1c')
    light = srgb('#5e4029')
    tint = srgb('#4a3530')  # walnut's faint purple-grey

    img = np.zeros((H, W, 3), np.float32)
    warp = fbm(W, H, 6, 40, seed + 1, octaves=4) - 0.5
    streak = fbm(W, H, 3, 26, seed + 2, octaves=3)
    pores_n = smooth_noise(W, H, int(W / (5 * s)), int(H / (1.1 * s)), seed + 3)
    fine = fbm(W, H, 90, 900, seed + 4, octaves=2)

    for b in range(len(edges) - 1):
        y0, y1 = edges[b], edges[b + 1]
        bh = y1 - y0
        rb = np.random.default_rng(seed + 100 + b)
        v = local[y0:y1]
        xs = x
        # Flat-sawn figure: rings of a log whose axis drifts below the surface.
        depth = (rb.uniform(40, 160) + rb.uniform(-0.03, 0.03) * xs + 60 * np.sin(xs / (rb.uniform(500, 1100) * s) + rb.uniform(0, 6))) * s
        centre = rb.uniform(0.25, 0.75) * bh
        radius = np.sqrt((v - centre) ** 2 + depth ** 2)
        radius = radius + warp[y0:y1] * 26 * s
        spacing = rb.uniform(9, 15) * s
        g = (radius / spacing) % 1.0
        late = np.clip((g - 0.62) / 0.38, 0, 1) ** 1.6  # latewood bands
        # Board colour: each board slightly different.
        k = rb.uniform(-0.12, 0.14)
        base = mid * (1 + k)
        col = base[None, None, :] * (1 - 0.30 * late[..., None])
        # Long heartwood streaks.
        st = streak[y0:y1]
        col = col * (0.78 + 0.5 * st)[..., None] + (light - mid)[None, None, :] * np.clip(st - 0.62, 0, 1)[..., None] * 0.9
        col = col * (1 - 0.1 * np.clip(0.4 - st, 0, 1))[..., None] + (tint - mid)[None, None, :] * 0.18 * (1 - st)[..., None]
        # Open pores: tiny dark dashes that follow the grain.
        pores = np.clip((pores_n[y0:y1] - 0.86) / 0.14, 0, 1)
        col = col * (1 - 0.32 * pores[..., None])
        col = col * (0.94 + 0.12 * fine[y0:y1][..., None])
        # Ease the darkest values toward the walnut floor colour.
        col = np.maximum(col, dark[None, None, :] * 0.85)
        img[y0:y1] = col
        # Seam between boards: a dark gap with a faint bevel highlight.
        if b > 0:
            img[y0:y0 + max(1, int(2 * s))] *= 0.35
            img[y0 + max(1, int(2 * s)):y0 + max(2, int(4 * s))] *= 1.12

    # Understated wear: a few faint scratches and a softly polished centre.
    pil = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    over = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(over)
    for _ in range(int(70)):
        x0, y0_ = r.uniform(0, W), r.uniform(0, H)
        ang = r.normal(0, 0.25)
        ln = r.uniform(40, 260) * s
        d.line([(x0, y0_), (x0 + np.cos(ang) * ln, y0_ + np.sin(ang) * ln)], fill=int(r.uniform(10, 26)), width=1)
    over = over.filter(ImageFilter.GaussianBlur(0.6))
    arr = np.asarray(pil).astype(np.float32)
    arr += np.asarray(over, np.float32)[..., None] * 0.55
    polish = fbm(W, H, 2, 2, seed + 9, octaves=2)
    arr *= (0.94 + 0.1 * polish[..., None])
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def save_walnut(desk):
    desk = desk.convert('RGB')
    desk.save(os.path.join(ROOT, 'desk', 'walnut.jpg'), quality=84, optimize=True, progressive=True)
    desk.resize((1536, 1024), Image.LANCZOS).save(os.path.join(ROOT, 'desk', 'walnut-compact.jpg'), quality=82, optimize=True, progressive=True)


def make_detail():

    # Seamless detail tile: fine pores and hairline grain, centred on mid-grey.
    n = 1024
    grain = periodic_noise(n, 1.2, 5)
    streaks = np.real(np.fft.ifft2(np.fft.fft2(np.random.default_rng(6).standard_normal((n, n))) *
                                   np.exp(-((np.fft.fftfreq(n)[None, :] * 60) ** 2 + (np.fft.fftfreq(n)[:, None] * 2.5) ** 2))))
    streaks = (streaks - streaks.mean()) / streaks.std()
    detail = 128 + 7 * grain + 10 * streaks
    pores = periodic_noise(n, 0.8, 7)
    detail -= np.clip(pores - 2.2, 0, None) * 22
    Image.fromarray(np.clip(detail, 0, 255).astype(np.uint8)).save(
        os.path.join(ROOT, 'desk', 'walnut-detail.jpg'), quality=80, optimize=True)

# ──────────────────────────────────────────────────────────── newsprint ──

def make_newsprint():

    N = 768
    paper = srgb('#f2ecdf')
    mottle = periodic_noise(N, 70, 21)  # large, soft tonal variation
    speck = periodic_noise(N, 1.1, 22)  # fine grain
    arr = np.ones((N, N, 3), np.float32) * paper
    arr *= (1 + 0.0055 * mottle[..., None] + 0.0075 * speck[..., None])

    # Fibres: short curved strokes, drawn with wraparound so the tile is seamless.
    fib = Image.new('L', (N, N), 128)
    d = ImageDraw.Draw(fib)
    r = np.random.default_rng(23)
    for _ in range(1400):
        x0, y0 = r.uniform(0, N), r.uniform(0, N)
        a = r.uniform(0, np.pi * 2)
        ln = r.uniform(4, 16)
        bend = r.normal(0, 0.5)
        pts = [(x0 + np.cos(a + bend * t) * ln * t, y0 + np.sin(a + bend * t) * ln * t) for t in np.linspace(0, 1, 6)]
        val = int(128 + r.choice([-1, 1]) * r.uniform(10, 26))
        for ox in (-N, 0, N):
            for oy in (-N, 0, N):
                d.line([(px + ox, py + oy) for px, py in pts], fill=val, width=1)
    fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.35)), np.float32) - 128
    arr += fib[..., None] * 0.2
    arr *= paper / arr.reshape(-1, 3).mean(axis=0)  # keep the mean exactly on --paper
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(os.path.join(ROOT, 'paper', 'newsprint.jpg'), quality=86, optimize=True)

PAPER = srgb('#f2ecdf')


def fit(img, w, h):
    """Cover-crop to w × h."""
    img = img.convert('RGB')
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x, y = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((x, y, x + w, y + h))


def paper_from(path, n=768):
    """Seamless, low-contrast newsprint tile whose mean is exactly --paper."""
    img = fit(Image.open(path), n, n)
    a = np.asarray(img, np.float32)
    rolled = np.roll(np.roll(a, n // 2, 0), n // 2, 1)
    t = np.minimum(np.arange(n), n - 1 - np.arange(n)) / (n / 2)
    w = np.clip(np.minimum(t[:, None], t[None, :]) * 2.2, 0, 1)[..., None]
    a = a * w + rolled * (1 - w)
    lum = a.mean(axis=2, keepdims=True)
    dev = (lum - lum.mean()) / (lum.std() + 1e-6)
    a = PAPER[None, None, :] * (1 + 0.012 * np.clip(dev, -3, 3))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(ROOT, 'paper', 'newsprint.jpg'), quality=86, optimize=True)


def desk_photo_from(path):
    img = Image.open(path).convert('RGB')
    for width, name, q in ((2560, 'desk-photo.jpg', 84), (1280, 'desk-photo-1280.jpg', 80)):
        h = round(img.height * width / img.width)
        img.resize((width, h), Image.LANCZOS).save(os.path.join(ROOT, 'desk', name), quality=q, optimize=True, progressive=True)
    print("Now set DESK.photo.src = '/assets/desk/desk-photo.jpg' and compact = '/assets/desk/desk-photo-1280.jpg' in src/intro/newspaper/config.js")


def report(files):
    for p in files:
        print(f"{p:28s} {os.path.getsize(os.path.join(ROOT, p)) / 1024:7.0f} KB")


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--desk-photo')
    ap.add_argument('--paper')
    ap.add_argument('--walnut')
    args = ap.parse_args()
    if args.desk_photo:
        desk_photo_from(args.desk_photo)
        report(['desk/desk-photo.jpg', 'desk/desk-photo-1280.jpg'])
    if args.paper:
        paper_from(args.paper)
        report(['paper/newsprint.jpg'])
    if args.walnut:
        save_walnut(fit(Image.open(args.walnut), 3072, 2048))
        report(['desk/walnut.jpg', 'desk/walnut-compact.jpg'])
    if not (args.desk_photo or args.paper or args.walnut):
        save_walnut(walnut(3072, 2048))
        make_detail()
        make_newsprint()
        report(['desk/walnut.jpg', 'desk/walnut-compact.jpg', 'desk/walnut-detail.jpg', 'paper/newsprint.jpg'])
