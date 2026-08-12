# Portfolio Profissional — Henrique Dias

Repositorio oficial do site pessoal e portfolio de Henrique Dias, estudante de Engenharia da Computacao na Universidade de Taubate (UNITAU) e Estagiario de TI no Instituto Nacional do Seguro Social (INSS).

O site foi concebido como um "sistema operacional pessoal" — conceito NEXUS OS: ao acessar o portfolio, o visitante interage com uma interface tecnica imersiva, completa com sequencia de boot, canvas 3D de particulas, HUD em tempo real e terminal interativo.

Site publicado: [henriquedias.vercel.app](https://henriquedias.vercel.app)

---

## Funcionalidades

- Alternancia instantanea de idiomas (PT / EN) com cobertura de 100% do conteudo, persistida via `localStorage`
- Boot sequence animada com logs de sistema ao carregar a pagina pela primeira vez em cada sessao
- Esfera de particulas interconectadas (Three.js) que reage ao movimento do mouse
- Terminal interativo com suporte a comandos: `help`, `about`, `skills`, `projects`, `experience`, `contact`, `whoami`, `ls`, `pwd`, `clear`
- HUD persistente exibindo coordenadas do cursor e o modulo atual em tempo real
- Barra de progresso de scroll lateral
- Progress rings animados na secao de formacao academica
- Contadores numericos animados na secao Sobre
- Tilt 3D nos cards de projetos ao passar o mouse
- Heatmap de proficiencia de habilidades tecnicas com tooltips
- Animacao TCP Handshake na secao de contato
- Respeito total a `prefers-reduced-motion`: todos os efeitos pesados sao omitidos em dispositivos que solicitam menos movimento
- Cursor customizado com inercia (GPU-accelerated via `transform: translate3d`)
- Design responsivo com fallback mobile (canvas 3D substituido por gradiente estatico em telas abaixo de 768px)

---

## Tecnologias Utilizadas

| Categoria | Tecnologia |
|---|---|
| Estrutura | HTML5 semantico |
| Estilizacao | CSS3 Vanilla — Grid, Flexbox, Custom Properties |
| Logica | JavaScript ES6+ Vanilla (sem frameworks) |
| Canvas 3D | Three.js r128 |
| Animacoes | GSAP 3.12.5 + ScrollTrigger |
| Traducao | i18n customizado (dicionario em `translations.js`) |
| Versionamento | Git / GitHub |
| Deploy | Vercel |
| Headers de seguranca | `vercel.json` (X-Frame-Options, X-Content-Type-Options, etc.) |

---

## Secoes do Site

| Modulo | Descricao |
|---|---|
| Hero | Identidade principal, terminal interativo e canvas 3D |
| Sobre | Perfil, paragrafo descritivo e metricas animadas |
| Experiencia | Timeline Git da experiencia no INSS com log stream |
| Formacao | Cards de formacao com progress rings SVG |
| Projetos | Cards estilo IDE com tilt 3D e links para GitHub |
| Habilidades | Heatmap matrix de proficiencia com tooltips |
| Extracurricular | Science Day UNITAU + Acao Social Institucional INSS |
| Contato | Links GitHub / LinkedIn + animacao TCP Handshake |

---

## Estrutura de Arquivos

```
portfolio/
|-- index.html          # Estrutura HTML semantica com data-i18n e markup NEXUS OS
|-- styles.css          # Design system completo: tokens CSS, HUD, cursor, animacoes
|-- vercel.json         # Configuracao de deploy e headers de seguranca HTTP
|-- .gitignore          # Regras de exclusao de arquivos sensiveis e temporarios
|-- README.md           # Documentacao do repositorio
|-- js/
    |-- translations.js # Dicionario de traducoes PT e EN (todas as secoes)
    |-- boot.js         # Sequencia de boot animada (NEXUS OS v2.6)
    |-- nexus3d.js      # Canvas Three.js: esfera de particulas + fallback 2D
    |-- script.js       # Sistema principal: i18n, terminal, HUD, GSAP, cursor
```

---

## Como Rodar Localmente

O projeto nao possui dependencias de build. Basta servir os arquivos estaticos:

**Python (recomendado):**
```bash
cd portfolio
python -m http.server 8080
# Acesse: http://localhost:8080
```

**Node.js:**
```bash
npx http-server . -p 8080
```

**VS Code:** instale a extensao "Live Server" e clique em "Go Live" no `index.html`.

> Abrir o `index.html` diretamente no navegador via `file://` pode bloquear
> modulos JavaScript por restricoes de CORS. Use sempre um servidor local.

---

## Projetos em Destaque

- [Portal Ferreira Imoveis](https://github.com/henriqueDias57/ferreira-imoveis) — Portal institucional e sistema de gestao imobiliaria.
- [Landing Page Advocacia Mariana](https://github.com/henriqueDias57/site---Advogada-Mariana-) — Landing page profissional para escritorio de advocacia.

---

## Seguranca

- Nenhuma chave de API, token ou credencial esta presente no codigo-fonte ou no historico de commits.
- Headers HTTP de seguranca configurados via `vercel.json`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy.
- HTTPS automatico via Vercel.
- Input do terminal restrito por `switch/case` — sem uso de `eval()` ou `innerHTML` de dados do usuario.

---

## Performance

- Three.js com `pixelRatio` fixo em 1x e throttle de 60fps via `requestAnimationFrame`
- Canvas 3D pausado via `IntersectionObserver` quando fora da viewport
- Scroll 100% nativo (sem bibliotecas de interceptacao de scroll)
- Cursor customizado usa `transform: translate3d` (GPU-accelerated, sem layout reflow)
- `backdrop-filter` removido de todos os elementos fixos
- Fallback automatico 2D em dispositivos sem WebGL ou com tela abaixo de 768px

---

## Contato

- LinkedIn: [linkedin.com/in/henrique-dias-5411a8355](https://www.linkedin.com/in/henrique-dias-5411a8355/)
- GitHub: [github.com/henriqueDias57](https://github.com/henriqueDias57/)

---

(c) 2026 Henrique Dias. Todos os direitos reservados.
