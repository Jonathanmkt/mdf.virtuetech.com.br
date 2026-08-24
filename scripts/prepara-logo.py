# -*- coding: utf-8 -*-
"""Extrai o disco da logo MR/RedePRO do JPEG de origem (que traz o xadrez de
transparencia *chapado em pixel*, nao em alfa) e devolve PNG/WebP com alfa real.

O disco e um circulo perfeito: a mascara e geometrica, nao por cor -- por cor,
o antialiasing da borda mistura o cinza 199 do xadrez e sobra uma franja clara.
"""
from PIL import Image
import numpy as np, pathlib, json

SRC = pathlib.Path("assets/fonte/logo-redepro-origem.jpeg")
OUT = pathlib.Path("assets/img")
SS = 4          # supersample da mascara
INSET = 3       # px descontados do raio, para comer a franja do antialiasing

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(int)
m = a.mean(axis=2) < 160
ys, xs = np.where(m)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
r = min(x1 - x0, y1 - y0) / 2 - INSET

# mascara circular supersampled -> borda suave sem franja
W, H = im.size
yy, xx = np.mgrid[0:H * SS, 0:W * SS]
d2 = ((xx + 0.5) / SS - cx) ** 2 + ((yy + 0.5) / SS - cy) ** 2
big = (d2 <= r * r).astype(np.float32)
alpha = big.reshape(H, SS, W, SS).mean(axis=(1, 3))

rgba = np.dstack([a.astype(np.uint8), (alpha * 255).round().astype(np.uint8)])
logo = Image.fromarray(rgba, "RGBA").crop(
    (int(cx - r) - 1, int(cy - r) - 1, int(cx + r) + 2, int(cy + r) + 2))

# 1024 so em WebP (a tela 2x do hero); 512 tambem em PNG, que e o que
# o JSON-LD e o gerador do og:image consomem.
sizes = {"logo-mr-1024": 1024, "logo-mr-512": 512}
for name, s in sizes.items():
    im2 = logo.resize((s, s), Image.LANCZOS)
    im2.save(OUT / f"{name}.webp", quality=92, method=6)
    if s == 512:
        im2.save(OUT / f"{name}.png", optimize=True)

logo.resize((180, 180), Image.LANCZOS).save(OUT / "apple-touch-icon.png", optimize=True)
ico = [logo.resize((s, s), Image.LANCZOS) for s in (16, 32, 48)]
ico[2].save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

print(json.dumps({"origem": im.size, "centro": [cx, cy], "raio": r,
                  "recorte": logo.size}, ensure_ascii=False))
