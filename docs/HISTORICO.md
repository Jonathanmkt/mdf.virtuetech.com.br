# Histórico — mdf.virtuetech.com.br

Diário do projeto, append-only. Entrada mais recente no topo.

---

## 2026-08-24 — Revisão do CEO: logo nova, marca vetorial retirada, texturas por FFT

**O quê:** Quatro mudanças decorrentes da revisão do site pelo CEO. (1) A marca vetorial
redesenhada (`assets/img/marca-mr.svg` e os scripts que a geravam/embutiam) foi removida do site
inteiro — a logo deixou de flutuar no herói e passou a aparecer só, pequena, no cabeçalho; sem ela
o herói virou uma coluna e o título subiu de 5,6 para 6,6rem. (2) O selo trocou para a segunda
versão gerada pelo CEO (azul royal, dourado e prata, no lugar do disco grafite quase preto);
`scripts/prepara-logo.py` foi reescrito para detectar o fundo por cor (cinza-e-claro, não
claridade) e recortar em elipse (o desenho mede 1543×1561, 1,2% fora do redondo). (3) A textura do
herói trocou de `feTurbulence` (que o Chrome deixava de pintar em telas grandes, em silêncio) para
um ladrilho gerado por FFT (`scripts/gera-veio.py`), periódico por construção; o ladrilho clareou
o fundo e derrubou dois trechos abaixo do piso da WCAG, corrigido subindo `--tinta-3`. (4) As
amostras da cartela de acabamento trocaram de `repeating-linear-gradient` (lia como ripado, não
chapa) para grão de madeira real via FFT (`scripts/gera-grao.py`), com o ripado ganhando
tratamento próprio.

**Por quê:** Pedidos diretos do CEO durante a revisão do site em sessão ao vivo. A marca vetorial
existia para compensar a primeira versão do selo, escura demais em tamanho pequeno — a segunda
versão resolveu isso no próprio desenho, e ele decidiu que só a marca original da loja deve
aparecer. A textura por `feTurbulence` era bug de composição do navegador, não escolha de design —
medido: em 2560px só 3 decis de 10 tinham textura. O ripado das amostras foi apontamento do CEO:
MDF revestido é liso, com decor impresso, não sarrafo e fresta. Peso da primeira carga recalculado
com `node scripts/mede-peso.js`: **214 KB** (imagem 74 · fonte 72 · CSS 35 · documento 24 · JS 9) —
substitui o número de 190 KB da entrada anterior, que valia para a versão com a marca vetorial.
Conferido com `node scripts/confere.js` em 360/414/768/1280/1920px: console limpo, sem requisição
quebrada, sem rolagem lateral, contraste no pixel renderizado acima do piso, foco visível nos 36
focalizáveis, SEO/OG/JSON-LD íntegros, 60 quadros/s.

**Arquivos-chave:** `CLAUDE.md`, `assets/css/site.css`, `assets/js/site.js`, `index.html`,
`scripts/prepara-logo.py`, `scripts/gera-veio.py`, `scripts/gera-grao.py`

---

## 2026-08-24 — Criação do site: página única para conquista da conta MR Distribuidora

**O quê:** Primeiro commit do repositório. Site estático de uma página (HTML/CSS/JS à mão, sem
build) para a MR Distribuidora / Rede Pró (MDF, ferragens e acessórios para marcenaria em
Araruama/RJ). Inclui herói, seções de produto, cartela de padrões ilustrativa, mapa (bairro, sem
alfinete cravado), botão de orçamento que monta mensagem e abre WhatsApp (sem backend), marca
redesenhada em SVG embutido, e ferramentas de geração/conferência em `scripts/` (logo, marca,
og:image, contraste, medição geral em Chrome real). Peso da primeira carga: 190 KB.

**Por quê:** Peça de conquista de cliente — o CEO pediu para ser mostrada à MR e ganhar a conta.
Publicada em subdomínio da VirtueTech (`mdf.virtuetech.com.br`, GitHub Pages) enquanto o negócio
não fecha; se migrar para domínio próprio da MR, a escolha de plataforma volta à mesa com o
`devops-infra` (o veto de 14/08/2026 ao GitHub Pages vale para domínio de terceiro). Conteúdo
inteiro extraído do Instagram @mr.distribuidoramdf (sem contato direto com a empresa ainda) — o
que não tinha fonte ficou como ressalva impressa na página ou foi listado em
`docs/A-CONFIRMAR.md` para validar antes de tratar como definitivo. Arquitetura da página seguiu
o DR de mercado do `pesquisador-de-marketing`
(`marketing/pesquisador-de-marketing/pesquisas/2026-08-24-mdf-distribuidora-mercado-catalogo-seo-design-premiado.md`),
que apontou o tratamento fotográfico de padrão de acabamento como a maior alavanca de
diferenciação frente a GMAD, C&D, Leo Madeiras e Arauco.

**Arquivos-chave:** `index.html`, `assets/css/site.css`, `assets/js/site.js`, `scripts/confere.js`,
`docs/A-CONFIRMAR.md`
