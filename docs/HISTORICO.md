# Histórico — mdf.virtuetech.com.br

Diário do projeto, append-only. Entrada mais recente no topo.

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
