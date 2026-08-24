# -*- coding: utf-8 -*-
"""Gera o ladrilho de GRAO DE MADEIRA das amostras da cartela.

Por que existe: a primeira versao desenhava as amostras com
`repeating-linear-gradient` — listras de largura constante e espacamento
constante. Isso nao e chapa de MDF, e **painel ripado**: o olho le sarrafo e
fresta, nao fibra. O CEO apontou em 24/08/2026, e esta certo — chapa de MDF
revestido e lisa, e o que ela tem e um decor IMPRESSO, de fibra irregular e
contraste baixo. Ripado e um produto diferente, e ganhou amostra propria.

Como: duas camadas de ruido somadas, as duas geradas no dominio da FREQUENCIA
e trazidas de volta por FFT inversa — periodicas por construcao, entao o
ladrilho fecha sem emenda.
  - FIBRA: detalhe fino no eixo X, muito longo no eixo Y (o veio da madeira)
  - VEIA:  manchas largas e suaves, que dao a variacao de tom que impede o
           padrao de parecer papel de parede repetido

O ladrilho sai em CINZA em torno de 128 e e aplicado com `mix-blend-mode:
overlay` sobre a cor de cada padrao. Assim UM arquivo serve as 18 amostras:
o cinza medio nao mexe na cor, e so o desvio dele vira claro e escuro.

Uso: python scripts/gera-grao.py
"""
import numpy as np, pathlib
from PIL import Image

LADO = 512
SEMENTE = 19

# fibra: sigma alto em X = risco fino; sigma baixo em Y = risco comprido
FIBRA = (170.0, 0.9, 0.62)      # (sigma_x, sigma_y, peso)
# veia: mancha larga nos dois eixos, para quebrar a regularidade
VEIA = (7.0, 2.2, 0.38)

rng = np.random.default_rng(SEMENTE)
fy = np.fft.fftfreq(LADO)[:, None] * LADO
fx = np.fft.fftfreq(LADO)[None, :] * LADO


def camada(sigma_x, sigma_y):
    filtro = np.exp(-(fx / sigma_x) ** 2) * np.exp(-(fy / sigma_y) ** 2)
    c = np.real(np.fft.ifft2(np.fft.fft2(rng.normal(size=(LADO, LADO))) * filtro))
    c -= c.mean()
    return c / np.abs(c).max()


grao = FIBRA[2] * camada(*FIBRA[:2]) + VEIA[2] * camada(*VEIA[:2])
grao /= np.abs(grao).max()

# assimetria de proposito: na madeira o escuro do veio marca mais que o claro
grao = np.where(grao < 0, grao * 1.25, grao * 0.85)
grao -= grao.mean()          # a assimetria desloca a media; recentra, senao a
                             # mistura `overlay` escurece toda a cartela
# amplitude: decor de MDF e de contraste BAIXO. Em 74 a amostra lia como
# madeira macica muito figurada; 48 e o que parece chapa revestida.
cinza = np.clip(128 + grao * 48, 0, 255).astype(np.uint8)

saida = pathlib.Path("assets/img/grao.png")
Image.fromarray(cinza, "L").save(saida, optimize=True)

def costura(a, eixo):
    """A emenda so e emenda se o salto no wrap destoar dos saltos NORMAIS.

    Comparar o par do wrap com UM par vizinho nao decide nada: com fibra longa
    cada coluna e quase constante, entao os dois valores sao amostras unicas de
    uma distribuicao larga e a razao entre elas oscila sozinha. A referencia
    tem de ser a distribuicao INTEIRA dos saltos adjacentes — e o percentil em
    que o wrap cai e a resposta.
    """
    x = a.astype(int) if eixo == 1 else a.astype(int).T
    saltos = np.abs(np.diff(x, axis=1)).mean(axis=0)      # todos os pares vizinhos
    wrap = float(np.abs(x[:, 0] - x[:, -1]).mean())
    pct = float((saltos < wrap).mean() * 100)
    return wrap, float(np.percentile(saltos, 95)), pct


print(f"{saida} — {saida.stat().st_size/1024:.0f} KB, {LADO}x{LADO}, cinza")
print(f"media {cinza.mean():.1f} (queremos ~128, senao a mistura tinge a cor)")
falhou = False
for nome, eixo in (("X", 1), ("Y", 0)):
    wrap, p95, pct = costura(cinza, eixo)
    ok = pct <= 95
    falhou |= not ok
    print(f"costura {nome}: salto {wrap:.2f} cai no percentil {pct:.0f} dos "
          f"saltos normais (p95 = {p95:.2f}) — "
          f"{'dentro da distribuicao, sem emenda' if ok else 'FORA: EMENDA VISIVEL'}")
raise SystemExit(1 if falhou else 0)
