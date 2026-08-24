# -*- coding: utf-8 -*-
"""Contraste WCAG medido no PIXEL RENDERIZADO.

Le os artefatos que o `confere.js` deixa em `_confere/`: a captura de pagina
inteira com TODO o texto em `transparent` (o fundo real, ja composto com
degrade, veu e brilho) e a lista de caixas de texto com a cor declarada.

Por que o pixel e nao o token: contraste e uma razao entre duas luminancias, e
opacidade/degrade nao fixam nenhuma das duas -- elas misturam o texto com o
fundo DAQUELE pixel. Medir "a cor do texto contra a cor de fundo declarada"
pressupoe que existe uma cor de fundo; num degrade nao existe.

Do fundo sob cada caixa toma-se o pixel MAIS CLARO, nao a media: com texto
claro sobre fundo escuro, o pior caso e o ponto em que o fundo mais clareia.
"""
import json, pathlib, re, sys
from PIL import Image
import numpy as np

RAIZ = pathlib.Path("_confere")


def luminancia(rgb):
    c = np.asarray(rgb, dtype=float) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return c[..., 0] * 0.2126 + c[..., 1] * 0.7152 + c[..., 2] * 0.0722


def razao(a, b):
    la, lb = float(luminancia(a)), float(luminancia(b))
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


falhas = 0
for caixas_json in sorted(RAIZ.glob("*-caixas.json")):
    nome = caixas_json.name.replace("-caixas.json", "")
    fundo = RAIZ / f"{nome}-fundo.png"
    if not fundo.exists():
        continue
    img = np.asarray(Image.open(fundo).convert("RGB"))
    alt, larg, _ = img.shape
    caixas = json.loads(caixas_json.read_text(encoding="utf-8"))

    reprovados, medidos = [], 0
    for c in caixas:
        x0 = max(0, int(c["x"])); y0 = max(0, int(c["y"]))
        x1 = min(larg, int(c["x"] + c["w"]) + 1); y1 = min(alt, int(c["y"] + c["h"]) + 1)
        if x1 <= x0 or y1 <= y0:
            continue
        recorte = img[y0:y1, x0:x1]
        pior = recorte.reshape(-1, 3)[int(np.argmax(luminancia(recorte.reshape(-1, 3))))]

        texto = [int(v) for v in re.findall(r"[\d.]+", c["cor"])[:3]]
        r = razao(texto, pior)
        piso = 3.0 if c["grande"] else 4.5
        medidos += 1
        if r < piso:
            reprovados.append(
                f'    {c["onde"]} "{c["texto"]}" — {r:.2f}:1 (piso {piso}) '
                f'texto rgb{tuple(texto)} sobre rgb{tuple(int(v) for v in pior)}')

    if reprovados:
        falhas += len(reprovados)
        print(f"  x {nome}px — {len(reprovados)} de {medidos} trechos abaixo do piso:")
        print("\n".join(reprovados))
    else:
        print(f"  v {nome}px — {medidos} trechos, todos acima do piso WCAG AA")

sys.exit(1 if falhas else 0)
