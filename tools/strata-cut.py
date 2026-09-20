#!/usr/bin/env python3
"""Generates the soil cut between #who and #stats and writes it into src/styles/stats.css.

Two SVGs, both transparent above the surface and solid below it; only their alpha matters,
they are the mask that cuts the top edge of #stats.

  --strata    1600x80, non-repeating (stretched to the section width by the CSS, never tiles)
  --strata-m  400x80, seamless: every component is a whole number of cycles across the tile,
              so the phone rule can tile it (repeat-x) at a width narrow enough to fit several
              humps on a 360px screen instead of stretching one across the whole edge.

    python3 tools/strata-cut.py
"""
import math
import re
from pathlib import Path

W, H = 1600, 80
WM = 400  # seamless phone tile, same height
STEP = 3  # px between points; the fine grain needs it this dense
CSS = Path(__file__).resolve().parent.parent / 'src/styles/stats.css'


def gauss(x, c, w):
    return math.exp(-((x - c) / w) ** 2)


def relief(x):
    """Surface line without grain: long gentle waves plus three accents."""
    y = 33
    y += 5.5 * math.sin(2 * math.pi * x / 690 + 0.9)
    y += 3.5 * math.sin(2 * math.pi * x / 1130 + 2.4)
    y += 1.8 * math.sin(2 * math.pi * x / 310 + 4.1)
    y -= 8.5 * gauss(x, 430, 42)    # stone bump
    y += 13.0 * gauss(x, 1010, 80)  # pocket
    y -= 6.0 * gauss(x, 1345, 30)   # small bump
    return y


def grain(x):
    """Fine roughness so the line reads as soil, not glaze."""
    return 0.45 * math.sin(x / 2.3) + 0.4 * math.sin(x / 3.7 + 1) + 0.25 * math.sin(x / 1.7)


def wave(x, period, amp, phase):
    return amp * math.sin(2 * math.pi * x / period + phase)


def relief_m(x):
    """Phone surface: same shapes as relief(), but every period divides WM, so the tile joins
    itself seamlessly. No gaussian accents — a one-off bump would show up on every repeat."""
    return (33 + wave(x, WM, 8.0, 0.9) + wave(x, WM / 2, 5.0, 2.4)
            + wave(x, WM / 4, 3.2, 4.1) + wave(x, WM / 8, 1.6, 1.3))


def grain_m(x):
    """Same roughness as grain(), snapped to periods that divide WM."""
    return (0.45 * math.sin(2 * math.pi * x * 44 / WM) + 0.4 * math.sin(2 * math.pi * x * 27 / WM + 1)
            + 0.25 * math.sin(2 * math.pi * x * 59 / WM))


xs = list(range(0, W + 1, STEP))
A = [relief(x) + grain(x) for x in xs]


def fmt(v):
    s = f"{v:.1f}".rstrip('0').rstrip('.')
    s = re.sub(r'^(-?)0\.', r'\1.', s)  # 0.4 -> .4, -0.4 -> -.4 (10.4 stays)
    return s if s not in ('-0', '', '-') else '0'


def build(xs, ys, w):
    d = f"M{xs[0]},{fmt(ys[0])}"
    for (x0, y0), (x1, y1) in zip(zip(xs, ys), zip(xs[1:], ys[1:])):
        d += f"l{fmt(x1 - x0)},{fmt(y1 - y0)}"
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {H}' preserveAspectRatio='none'>"
           f"<path d='{d}V{H + 2}H0Z'/></svg>")   # surface down to below the image, solid
    return "data:image/svg+xml," + svg.replace('<', '%3C').replace('>', '%3E').replace(' ', '%20')


xs_m = list(range(0, WM + 1, STEP if WM % STEP == 0 else 2))
A_m = [relief_m(x) + grain_m(x) for x in xs_m]
assert abs(A_m[0] - A_m[-1]) < 0.01, f"phone tile does not close: {A_m[0]:.2f} vs {A_m[-1]:.2f}"

url = build(xs, A, W)
url_m = build(xs_m, A_m, WM)

css = CSS.read_text()
new = re.sub(r'--strata:url\("data:[^"]*"\);', f'--strata:url("{url}");', css)
new = re.sub(r'--strata-m:url\("data:[^"]*"\);', f'--strata-m:url("{url_m}");', new)
assert '--strata:url("data:' in new and '--strata-m:url("data:' in new, "declarations not found in stats.css"
CSS.write_text(new)
print(f"desktop y {min(A):.1f}..{max(A):.1f}, phone y {min(A_m):.1f}..{max(A_m):.1f} of {H}; "
      f"{len(url)} + {len(url_m)} bytes -> {CSS.name}")
