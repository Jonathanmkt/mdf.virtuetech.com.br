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

Peso da primeira carga, **medido com `node scripts/mede-peso.js`**: **214 KB**
(imagem 74 · fonte 72 · CSS 35 · documento 24 · JS 9). Não confira isso por `du -sh assets/`:
a pasta tem 3 MB e quase nada dela vai para o visitante — o JPEG de origem da logo não é servido,
o `og.png` só o robô de compartilhamento busca, e o `srcset` escolhe uma variante por largura.

**Sem servidor de aplicação — e isso é decisão, não limitação.** O formulário de orçamento não
faz POST em lugar nenhum: ele **monta a mensagem e abre o WhatsApp** com o texto pronto. É para
onde a conversa ia de qualquer jeito nesse ramo, e assim não há backend, banco nem LGPD de
formulário para manter.

## As decisões que não são óbvias no código

**A marca é o selo original da loja, e só ele — decisão do CEO em 24/08/2026.**
A arte em uso é a **segunda versão** que ele gerou naquele dia (azul royal, dourado e prata);
a primeira era um disco grafite quase preto e foi substituída. O JPEG de origem
(`assets/fonte/logo-redepro-origem.jpeg`) traz o xadrez de transparência **chapado em pixel** —
não é alfa, são pixels cinza (~180-205) e branco. O `scripts/prepara-logo.py` o remove, e as duas
decisões dele não são óbvias:

- **O fundo se detecta por cinza-e-claro, não por claridade.** O selo tem dentes de serra
  prateados e "RedePRO" em branco, tão claros quanto o xadrez; o que os separa é a **cor**.
- **A máscara é geométrica; a detecção só acha a caixa.** Detecção usada como alfa deixa franja —
  o antialiasing da borda mistura o cinza do xadrez e sobra um halo. E o recorte é uma **elipse**,
  não um círculo: este desenho mede 1543×1561, 1,2% fora do redondo, e um círculo cortaria 18 px
  de um eixo ou deixaria xadrez no outro.

Dele saem o selo do cabeçalho e do rodapé (128 e 512 px), o do `og:image` (512), o
`apple-touch-icon` e o `favicon.ico`. ⚠️ **O selo não é quadrado** (512×518): quem mexer no
`width`/`height` do `<img>` tem de manter a proporção, ou ele achata.

⚠️ **Houve uma marca vetorial redesenhada, e ela foi retirada.** O CEO decidiu que só a marca
original da loja aparece. Ela existia porque a **primeira** versão do selo era escura demais para
funcionar pequena — problema que a versão atual resolveu no próprio desenho. Junto dela caiu
também a elevação de brilho que o cabeçalho precisava: o selo novo tem aro metálico claro próprio
e se destaca do fundo escuro sem retoque, com sombra só para dar profundidade.

**A logo não aparece no herói — decisão do CEO em 24/08/2026.** Ela flutuava numa segunda coluna;
ele pediu que ficasse só no cabeçalho, pequena. Sem ela o herói virou **uma coluna**, e quem
carrega a dobra passou a ser a tipografia (o título subiu de 5,6 para 6,6 rem). ⚠️ O bloco do
herói também é `.env`: encurtá-lo com `max-width` o **centraliza** (o `.env` traz
`margin-inline:auto`) e ele sai do prumo do cabeçalho e de todas as seções. A medida vai nos
filhos — `.hero__grade > *` —, nunca no bloco.

**O quadro do mapa está fora da ordem de tabulação, de propósito.** Quadro de outra origem é
escopo de foco próprio: o Chrome não desenha anel nele, e nem `:focus`, nem `:focus-within`, nem
`focusin` no documento de fora alcançam o estado — conferido com Tab real em 24/08/2026, os três
deram falso com o `<iframe>` já como `document.activeElement`. Deixá-lo tabulável criava uma
**parada de teclado invisível**, que é pior do que não ter. O caminho de teclado para o mesmo dado
é o botão "Traçar rota", logo abaixo.

**A textura do herói é um ladrilho, não `feTurbulence` — e isso foi conserto, não gosto.**
O Chrome pinta o filtro SVG numa superfície de tamanho limitado e devolve **vazio no resto, em
silêncio**. Medido em 24/08/2026: a textura cobria ~950 px fixos e a faixa morta **crescia com a
janela** — em 2560 px só 3 decis de 10 tinham textura. `background-repeat` não tem região de
filtro: ladrilha até onde a tela for. O `scripts/gera-veio.py` gera o ruído no domínio da
**frequência** e o traz de volta por FFT inversa, o que o torna periódico por construção — o
ladrilho fecha sem emenda nas quatro bordas, e o próprio script imprime a prova da costura.

⚠️ **O ladrilho clareia o fundo, e isso mexe no contraste.** Ao entrar, ele derrubou
`.marca__sub` (4,28:1) e o `.apagado` do título (2,89:1) abaixo do piso da WCAG — nada disso
aparece no olho, e só a medida no pixel pegou. Foi por isso que `--tinta-3` subiu de `#7E8DAB`
para `#8E9CB8`. **Mexeu na textura ou em qualquer camada de fundo? Rode o `confere.js` antes de
achar que só mudou o visual.**

**As amostras da cartela usam grão de madeira, não listras — e isso é regra do produto.**
Chapa de MDF revestido é **lisa**: o que ela tem é um decor **impresso**, de fibra irregular e
contraste baixo. A primeira versão desenhava `repeating-linear-gradient` — listras de largura e
espaçamento constantes —, e isso não é chapa: é **painel ripado**, o olho lê sarrafo e fresta.
O CEO apontou em 24/08/2026. Hoje o grão vem de `scripts/gera-grao.py`, mesmo método de FFT do
veio do herói, num ladrilho cinza em torno de 128 misturado em `overlay`: o cinza médio não mexe
na cor, só o desvio dele vira claro e escuro — **um arquivo serve as 18 amostras em qualquer
tom**. E o ripado, que é outro produto, ganhou tratamento próprio (`[data-ripado]`), com sarrafo
largo, fresta escura e fio de luz na quina.

Três coisas que parecem detalhe e não são: a **amplitude** do ladrilho (48, não 74 — em 74 lê
madeira maciça figurada, não chapa revestida); o `--deslo` por índice, que faz cada amostra entrar
num ponto diferente do ladrilho (sem ele as 18 exibem o mesmo recorte e a cartela parece uma cor
repintada); e o `--grao` por padrão, que é **0,10 a 0,18 nos unicolores** — chapa branca de fábrica
é quase lisa, e dar-lhe veio seria mentir sobre o produto.

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
