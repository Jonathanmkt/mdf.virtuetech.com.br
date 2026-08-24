# -*- coding: utf-8 -*-
"""Gera o ladrilho de veio de madeira do fundo do heroi.

Por que um ladrilho e nao `feTurbulence`: o Chrome pinta o filtro SVG numa
superficie de tamanho LIMITADO e devolve vazio no resto -- sem erro, sem aviso.
Medido em 24/08/2026: a textura cobria ~950 px fixos e a faixa morta CRESCIA
com a janela (em 2560 px so 3 decis de 10 tinham textura). Um `background`
repetido nao tem regiao de filtro: ladrilha ate onde a tela for.

O ruido e gerado no dominio da FREQUENCIA e trazido de volta por FFT inversa —
isso o torna **periodico por construcao**, entao o ladrilho fecha sem emenda
nas quatro bordas. Espelhar seria mais simples e criaria simetria visivel.

O veio e vertical: energia alta em frequencia horizontal (detalhe fino no eixo
X) e baixa na vertical (a fibra corre longa no eixo Y).

Uso: python scripts/gera-veio.py
"""
import numpy as np, pathlib
from PIL import Image

LADO = 768
SIGMA_X = 150.0    # detalhe no eixo X -> quanto maior, mais fibras finas
SIGMA_Y = 1.1      # coerencia no eixo Y -> quanto menor, mais longa a fibra
SEMENTE = 7

rng = np.random.default_rng(SEMENTE)
ruido = rng.normal(size=(LADO, LADO))

fy = np.fft.fftfreq(LADO)[:, None] * LADO
fx = np.fft.fftfreq(LADO)[None, :] * LADO
filtro = np.exp(-(fx / SIGMA_X) ** 2) * np.exp(-(fy / SIGMA_Y) ** 2)

veio = np.real(np.fft.ifft2(np.fft.fft2(ruido) * filtro))
veio -= veio.mean()
veio /= np.abs(veio).max()

# so a metade clara vira alfa: a textura CLAREIA o fundo, nunca o escurece --
# escurecer sobre um fundo ja quase preto nao aparece e so suja a compressao.
alfa = np.clip(veio, 0, 1) ** 2.1
rgba = np.dstack([
    np.full((LADO, LADO), 140, np.uint8),   # o tom da fibra: azul-aco claro
    np.full((LADO, LADO), 168, np.uint8),
    np.full((LADO, LADO), 225, np.uint8),
    (alfa * 255).round().astype(np.uint8),
])

saida = pathlib.Path("assets/img/veio.png")
Image.fromarray(rgba, "RGBA").save(saida, optimize=True)

# prova de que fecha: a coluna 0 tem de casar com a coluna seguinte a ultima,
# e o mesmo nas linhas. Numa textura periodica a diferenca na costura e da
# mesma ordem da diferenca entre duas colunas quaisquer vizinhas.
costura_x = np.abs(alfa[:, 0] - alfa[:, -1]).mean()
vizinha_x = np.abs(alfa[:, 1] - alfa[:, 0]).mean()
costura_y = np.abs(alfa[0, :] - alfa[-1, :]).mean()
vizinha_y = np.abs(alfa[1, :] - alfa[0, :]).mean()
print(f"{saida} — {saida.stat().st_size/1024:.0f} KB, {LADO}x{LADO}")
print(f"costura X {costura_x:.4f} vs vizinha {vizinha_x:.4f} — "
      f"{'sem emenda' if costura_x <= vizinha_x * 1.6 else 'EMENDA VISIVEL'}")
print(f"costura Y {costura_y:.4f} vs vizinha {vizinha_y:.4f} — "
      f"{'sem emenda' if costura_y <= vizinha_y * 1.6 else 'EMENDA VISIVEL'}")
