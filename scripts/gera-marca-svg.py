# -*- coding: utf-8 -*-
"""Redesenha a marca MR como SVG: serra circular + monograma.

Por que vetor: o emblema de origem e um raster escuro de 1776px. Abaixo de ~64px
"DISTRIBUIDORA" e "RedePRO" viram borrao, e sobre fundo escuro o disco preto some.
O vetor herda currentColor, entao serve em qualquer fundo e em qualquer tamanho.
"""
import math, pathlib

DENTES = 20
R_EXT, R_BASE = 100.0, 84.0     # ponta e vale do dente
R_VAO = 70.0                    # furo do anel dentado
R_ANEL_EXT, R_ANEL_INT = 62.0, 58.0   # anel fino interno
FOLGA = 0.34                    # fracao do passo ocupada pela face reta do dente


def p(x, y):
    return f"{x:.2f},{y:.2f}"


def serra():
    """Dente de serra circular: face radial reta + dorso em rampa (sentido horario)."""
    passo = 2 * math.pi / DENTES
    d = []
    for i in range(DENTES):
        a0 = i * passo - math.pi / 2
        a1 = a0 + passo * FOLGA
        a2 = a0 + passo
        pt = lambda a, r: (r * math.cos(a), r * math.sin(a))
        cmd = "M" if i == 0 else "L"
        d.append(f"{cmd}{p(*pt(a0, R_BASE))}")          # vale
        d.append(f"L{p(*pt(a0, R_EXT))}")               # face de corte (radial)
        d.append(f"L{p(*pt(a1, R_EXT))}")               # ponta
        d.append(f"L{p(*pt(a2, R_BASE))}")              # dorso em rampa
    return "".join(d) + "Z"


def circulo(r):
    return (f"M0,-{r}A{r},{r} 0 1,0 0,{r}A{r},{r} 0 1,0 0,-{r}Z")


# a coroa e UM path so: dentes + furo, resolvidos por evenodd. Dois <path>
# irmaos nao se subtraem -- cada um preenche por conta e o furo nunca aparece.
coroa = serra() + circulo(R_VAO)
anel = circulo(R_ANEL_EXT) + circulo(R_ANEL_INT)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-110 -110 220 220" role="img" aria-label="MR Distribuidora">
  <g fill="currentColor" fill-rule="evenodd">
    <path d="{coroa}"/>
    <path d="{anel}"/>
  </g>
  <text x="0" y="0" fill="currentColor" text-anchor="middle" dominant-baseline="central"
        font-family="Sora, Archivo, system-ui, sans-serif" font-weight="800"
        font-size="50" letter-spacing="-2">MR</text>
</svg>'''

pathlib.Path("assets/img/marca-mr.svg").write_text(svg, encoding="utf-8")
print("ok", len(svg), "bytes")
