#!/usr/bin/env python3
"""Generates the soil cut between #who and #stats and writes it into src/styles/stats.css.

One non-repeating 1600x80 SVG (stretched to the section width by the CSS, so it never tiles):
transparent above the surface, solid below it. Only its alpha matters: it is the mask that
cuts the top edge of #stats.

    python3 tools/strata-cut.py
"""
import math
import re
from pathlib import Path

W, H = 1600, 80
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


xs = list(range(0, W + 1, STEP))
A = [relief(x) + grain(x) for x in xs]


def fmt(v):
    s = f"{v:.1f}".rstrip('0').rstrip('.')
    s = re.sub(r'^(-?)0\.', r'\1.', s)  # 0.4 -> .4, -0.4 -> -.4 (10.4 stays)
    return s if s not in ('-0', '', '-') else '0'


d = f"M{xs[0]},{fmt(A[0])}"
for (x0, y0), (x1, y1) in zip(zip(xs, A), zip(xs[1:], A[1:])):
    d += f"l{fmt(x1 - x0)},{fmt(y1 - y0)}"
svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' preserveAspectRatio='none'>"
       f"<path d='{d}V{H + 2}H0Z'/></svg>")   # surface down to below the image, solid
url = "data:image/svg+xml," + svg.replace('<', '%3C').replace('>', '%3E').replace(' ', '%20')

css = CSS.read_text()
new = re.sub(r'--strata:url\("data:[^"]*"\);', f'--strata:url("{url}");', css)
assert new != css or url in css, "no --strata declaration found in stats.css"
CSS.write_text(new)
print(f"surface y {min(A):.1f}..{max(A):.1f} of {H}, {len(url)} bytes -> {CSS.name}")
