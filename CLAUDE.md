# mdf.virtuetech.com.br — MR Distribuidora · Rede Pró

Site **estático** de uma página para a **MR Distribuidora / Rede Pró**, distribuidora de MDF,
ferragens e acessórios para marcenaria em **Araruama/RJ** (Região dos Lagos).

⚠️ **Isto é uma peça de conquista de cliente, não um site contratado.** Foi construído a pedido
do CEO para ser mostrado à MR e ganhar a conta. Enquanto isso, mora num subdomínio da VirtueTech.
**Se um dia migrar para o domínio da própria MR, a decisão de plataforma volta à mesa com o
`devops-infra`** — o veto de 14/08/2026 ao GitHub Pages vale para domínio de terceiro.

## O que é, tecnicamente

HTML + CSS + JavaScript à mão. **Sem build, sem framework, sem dependência em runtime.** Três
arquivos servidos e mais nada:

```
index.html            a página inteira
assets/css/site.css   uma folha só, em ordem: tokens → reset → layout → seções → movimento
assets/js/site.js     um IIFE, sem dependência; a página funciona sem ele
```

Peso da primeira carga, medido: **190 KB** (fonte 72 · CSS 33 · documento 27 · imagem 47 · JS 9).

**Sem servidor de aplicação — e isso é decisão, não limitação.** O formulário de orçamento não
faz POST em lugar nenhum: ele **monta a mensagem e abre o WhatsApp** com o texto pronto. É para
onde a conversa ia de qualquer jeito nesse ramo, e assim não há backend, banco nem LGPD de
formulário para manter.

## As decisões que não são óbvias no código

**A marca vem em duas formas, e cada uma tem um lugar.**
O JPEG de origem (`assets/fonte/`) traz o xadrez de transparência **chapado em pixel** — não é
alfa, são pixels cinza 199 e branco. O `scripts/prepara-logo.py` recorta o disco por **geometria**
(círculo perfeito, centro e raio medidos), nunca por cor: por cor, o antialiasing da borda mistura
o cinza do xadrez e sobra uma franja clara.
- **`logo-mr-*.webp/png`** — o selo original. Só funciona **grande**: é escuro, tem relevo e traz
  "DISTRIBUIDORA" e "RedePRO" em corpo miúdo. Usado no herói e no `og:image`.
- **`marca-mr.svg`** — a marca **redesenhada em vetor**: coroa de serra + monograma, em
  `currentColor`. É ela no cabeçalho, no rodapé e no favicon. Existe porque o raster não sobrevive
  a 32 px nem inverte de cor.

**A marca é embutida como `<symbol>`, não referenciada como arquivo.** `<use href="arquivo.svg#id">`
não é resolvido de forma confiável (o Safari não resolve, e falha **em silêncio** — o cabeçalho
fica sem logo e nada aparece no console). O `scripts/embute-marca.py` injeta o símbolo no
`index.html` entre `<!--marca:inicio-->` e `<!--marca:fim-->`; **rode-o depois de mexer no SVG.**

**O quadro do mapa está fora da ordem de tabulação, de propósito.** Quadro de outra origem é
escopo de foco próprio: o Chrome não desenha anel nele, e nem `:focus`, nem `:focus-within`, nem
`focusin` no documento de fora alcançam o estado — conferido com Tab real em 24/08/2026, os três
deram falso com o `<iframe>` já como `document.activeElement`. Deixá-lo tabulável criava uma
**parada de teclado invisível**, que é pior do que não ter. O caminho de teclado para o mesmo dado
é o botão "Traçar rota", logo abaixo.

**`overflow-x` está em `clip`, no `html` e no `body`.** `hidden` só no `body` não recorta nada: ele
propaga para a viewport e o próprio `body` volta a `visible`. `clip` recorta sem criar caixa de
rolagem — `hidden` criaria, e isso quebraria o `position:sticky`.

**Hierarquia sobre fundo colorido vem de tamanho e peso, nunca de opacidade.** Contraste é razão
entre duas luminâncias, e a opacidade não fixa nenhuma das duas — num degradê o contraste muda ao
longo do próprio elemento. Todo texto aqui é opaco.

## Conferir — e é medida, não olho

```bash
python -m http.server 8099 --directory .
```
```bash
node scripts/confere.js
```

O `confere.js` roda em **Chrome de verdade** (`playwright-core`, `channel: 'chrome'`) porque o
navegador do harness não compõe quadro com o painel fechado: captura devolve *timed out* e medida
de animação devolve número falso. Ele começa contando quadros de `requestAnimationFrame` — **zero
quadros invalida tudo o que vier depois**.

O que ele mede, em 360 · 414 · 768 · 1280 · 1920:
- erro de console e requisição quebrada;
- **rolagem lateral de verdade** (`scrollTo(9999,0)` e ver se `scrollX` mexeu), não `scrollWidth` —
  decorativo dentro de `clip` estufa o `scrollWidth` sem o visitante conseguir arrastar nada;
- **contraste pelo pixel renderizado**, não pela cor declarada. A página é renderizada **duas
  vezes**: uma normal e outra com todo o texto em `transparent`. A segunda dá o fundo real sob cada
  caixa de texto — degradê, véu e brilho já compostos — e dele se toma o **pixel mais claro**, que
  é o pior caso para texto claro. A conta da WCAG fica no `confere-contraste.py` (PIL), porque não
  há decodificador de PNG para o Node nesta máquina;
- foco visível com **Tab real**, não `.focus()`: o indicador desta casa vem de `:focus-visible`, e
  foco por script não o satisfaz;
- `alt`, nome acessível, hierarquia de título, âncora quebrada, `title`/description/OG/JSON-LD.

Os artefatos caem em `_confere/`, que está no `.gitignore`.

**Cartão de compartilhamento:** `node scripts/gera-og.js` — regera `assets/img/og.png` e **falha se
algum texto encostar na margem**. O card é o produto: no WhatsApp e no grupo de marceneiros ele
aparece antes de qualquer um abrir a página.

## O que é conteúdo do cliente, e não se inventa aqui

Endereço, telefones, fábricas parceiras e as frases da marca saíram do **Instagram
[@mr.distribuidoramdf](https://www.instagram.com/mr.distribuidoramdf/)**, lidos em 24/08/2026.
A cartela de padrões é **ilustrativa** — famílias de acabamento reproduzidas em CSS, não códigos
de produto de fábrica —, e a página diz isso em texto visível.

**O que ainda depende de confirmação da MR está em [`docs/A-CONFIRMAR.md`](docs/A-CONFIRMAR.md).**
Nada ali é chute publicado: ou o site não afirma, ou afirma com a ressalva impressa.
