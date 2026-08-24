# -*- coding: utf-8 -*-
"""Embute a marca vetorial no index.html como <symbol> do proprio documento.

Por que nao <use href="arquivo.svg#id">: referencia EXTERNA em <use> nao e
suportada de forma confiavel (Safari nao resolve, e falha em silencio -- o
cabecalho fica sem logo e nada aparece no console). <symbol> no mesmo
documento funciona em todo navegador e ainda herda currentColor.
"""
import re, pathlib

svg = pathlib.Path("assets/img/marca-mr.svg").read_text(encoding="utf-8")
interno = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()

simbolo = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true">'
           f'<symbol id="marca-mr" viewBox="-110 -110 220 220">{interno}</symbol></svg>')

html = pathlib.Path("index.html").read_text(encoding="utf-8")
html = html.replace('<use href="assets/img/marca-mr.svg#raiz"></use>',
                    '<use href="#marca-mr"></use>')

bloco = f"<!--marca:inicio-->{simbolo}<!--marca:fim-->"
if "<!--marca:inicio-->" in html:
    html = re.sub(r"<!--marca:inicio-->.*?<!--marca:fim-->", bloco, html, flags=re.S)
else:
    html = html.replace("<body>", "<body>\n" + bloco, 1)

pathlib.Path("index.html").write_text(html, encoding="utf-8")
print("marca embutida:", len(simbolo), "bytes;",
      html.count('<use href="#marca-mr">'), "usos")
