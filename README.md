# mdf.virtuetech.com.br — MR Distribuidora / Rede Pró

Site estático de uma página para a **MR Distribuidora / Rede Pró**, distribuidora de MDF,
ferragens e acessórios para marcenaria em Araruama/RJ (Região dos Lagos).

Peça de conquista de cliente: construída a pedido do CEO da VirtueTech para ser mostrada à MR e
ganhar a conta. Publicada em `mdf.virtuetech.com.br` via GitHub Pages.

## Como rodar localmente

```bash
python -m http.server 8099 --directory .
```

Abra `http://localhost:8099`. Sem build, sem instalação — HTML, CSS e JS servidos direto.

## Estrutura

```
index.html            a página inteira
assets/css/site.css    uma folha só (tokens → reset → layout → seções → movimento)
assets/js/site.js      IIFE sem dependência; a página funciona sem ele
assets/img/            logos, ícones, og:image
assets/fonte/          material de origem (logo do cliente, não editado)
scripts/               ferramentas de geração e conferência (Python/Node)
docs/A-CONFIRMAR.md    o que depende de resposta da MR antes de publicar como definitivo
```

## Conferir antes de publicar mudança

```bash
python -m http.server 8099 --directory .
node scripts/confere.js
```

`confere.js` roda em Chrome real e mede, em 360/414/768/1280/1920px: erro de console, requisição
quebrada, rolagem lateral, contraste pelo pixel renderizado, foco visível com Tab real,
`alt`/hierarquia/OG/JSON-LD. Detalhes técnicos e as decisões de design não óbvias estão no
`AGENTS.md` deste repositório.

`scripts/mede-peso.js` mede o peso real da primeira carga por tipo de recurso (o que o
visitante baixa, não o que há na pasta) — é a ferramenta que produziu o número citado no
`docs/HISTORICO.md`. Recalcule com ele sempre que o número precisar ser conferido de novo,
nunca reaproveite o valor antigo.

## Conteúdo

Todo o conteúdo (endereço, telefones, fábricas parceiras, frases de marca) vem do Instagram
[@mr.distribuidoramdf](https://www.instagram.com/mr.distribuidoramdf/). O que ainda depende de
confirmação da própria MR está listado em [`docs/A-CONFIRMAR.md`](docs/A-CONFIRMAR.md).
