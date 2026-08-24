# -*- coding: utf-8 -*-
"""Extrai o selo da MR/RedePRO do JPEG de origem e devolve PNG/WebP com alfa real.

O arquivo que chega do CEO traz o xadrez de transparencia **chapado em pixel** —
nao e alfa, sao pixels cinza (~180-205) e branco. Sem tratamento, o site exibe o
xadrez como se fosse parte da marca.

Duas decisoes que nao sao obvias:

1. **O fundo se detecta por CINZA-E-CLARO, nao por claridade.** O selo tem
   dentes de serra prateados e texto branco, tao claros quanto o xadrez; o que
   os separa e a cor. `spread < 14` (canais quase iguais) **e** `valor > 178`
   pega o xadrez sem comer o miolo do desenho.

2. **A mascara e geometrica; a deteccao so acha a caixa.** Usar a deteccao como
   alfa deixa franja: o antialiasing da borda mistura o cinza do xadrez e sobra
   um halo claro em volta do disco. Entao o recorte e uma **elipse** ajustada a
   caixa — elipse, e nao circulo, porque o desenho de 24/08/2026 mede 1543x1561
   (1,2% fora do redondo) e um circulo cortaria 18 px de um eixo ou deixaria
   xadrez no outro.
"""
from PIL import Image
import numpy as np, pathlib, json

SRC = pathlib.Path("assets/fonte/logo-redepro-origem.jpeg")
OUT = pathlib.Path("assets/img")
SS = 4          # supersample da mascara
INSET = 3       # px descontados do raio, para comer a franja do antialiasing

# 128 e o selo do cabecalho (52 px em tela 2x); 512 alimenta o JSON-LD e o
# gerador do og:image; 1024 e o mestre e serve o `srcset` de tela 2x.
TAMANHOS = (1024, 512, 128)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(int)

spread = a.max(axis=2) - a.min(axis=2)
valor = a.mean(axis=2)
objeto = ~((spread < 14) & (valor > 178))

# exige massa na linha/coluna: descarta pixel solto de artefato de JPEG
ys = np.where(objeto.sum(axis=1) > 12)[0]
xs = np.where(objeto.sum(axis=0) > 12)[0]
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()

cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
rx, ry = (x1 - x0) / 2 - INSET, (y1 - y0) / 2 - INSET

W, H = im.size
yy, xx = np.mgrid[0:H * SS, 0:W * SS]
d = (((xx + 0.5) / SS - cx) / rx) ** 2 + (((yy + 0.5) / SS - cy) / ry) ** 2
alpha = (d <= 1).astype(np.float32).reshape(H, SS, W, SS).mean(axis=(1, 3))

rgba = np.dstack([a.astype(np.uint8), (alpha * 255).round().astype(np.uint8)])
selo = Image.fromarray(rgba, "RGBA").crop(
    (int(cx - rx) - 1, int(cy - ry) - 1, int(cx + rx) + 2, int(cy + ry) + 2))

for s in TAMANHOS:
    # o selo nao e quadrado: a largura manda e a altura acompanha, sem deformar
    peca = selo.resize((s, round(s * selo.height / selo.width)), Image.LANCZOS)
    peca.save(OUT / f"logo-mr-{s}.webp", quality=92, method=6)
    if s in (512, 128):
        peca.save(OUT / f"logo-mr-{s}.png", optimize=True)


def quadrado(lado):
    """Icone e quadrado: o selo entra centrado, sem corte."""
    q = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    p = selo.copy()
    p.thumbnail((lado, lado), Image.LANCZOS)
    q.paste(p, ((lado - p.width) // 2, (lado - p.height) // 2), p)
    return q


quadrado(180).save(OUT / "apple-touch-icon.png", optimize=True)
quadrado(48).save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

print(json.dumps({"origem": im.size, "caixa": [int(x0), int(y0), int(x1), int(y1)],
                  "raios": [rx, ry],
                  "fora_do_redondo_pct": round(abs(rx - ry) / max(rx, ry) * 100, 2),
                  "recorte": selo.size}, ensure_ascii=False))
