# 📻 Radio SaaS — Plataforma de Sites para Rádios

> Sites modernos e bonitos para rádios, sem precisar de desenvolvedor.

Projeto inspirado na **Rádio Marajá AM 660** (Rosário do Sul/RS), com o objetivo de se tornar uma plataforma SaaS universal onde qualquer rádio pode ter seu site profissional configurável.

## 🎯 Visão do Produto

A maioria dos sites de rádio são feios e desatualizados. Este projeto resolve isso oferecendo um template moderno, responsivo e fácil de configurar — cada rádio personaliza cores, programação, locutores, notícias e patrocinadores sem tocar em código.

**Modelo:** Multi-tenant — cada rádio tem seu site customizado a partir de um template base.

## 🚀 Stack

- **Frontend:** React 19 + Vite
- **Backend:** Supabase (Postgres + Auth + Storage) + Vercel Serverless Functions
- **Hospedagem:** Vercel (com suporte a wildcard subdomains)
- **Pagamentos:** Estrutura pronta (Stripe/Mercado Pago — integração futura)
- **Estado atual:** MVP completo — multi-tenant, auth, temas, planos, landing page

## 📁 Estrutura do Projeto

```
api/
├── radio/
│   └── [slug].js            # ⭐ Serverless function — retorna config por rádio
└── radios/
    └── maraja.json          # Dados da Rádio Marajá (piloto)

src/
├── App.jsx                  # Layout principal (header, nav, grid, player)
├── App.css                  # Estilos globais
├── data/
│   └── config.js            # Config local (fallback quando API não responde)
├── components/
│   ├── Admin.jsx            # Painel admin (edita dados via localStorage)
│   ├── Sidebar.jsx          # Sidebar com player e patrocinadores
│   ├── StickyPlayer.jsx     # Player fixo no rodapé
│   ├── TabHome.jsx          # Aba Início (notícias + banners)
│   ├── TabProgramacao.jsx   # Aba Programação (grade semanal)
│   ├── TabLocutores.jsx     # Aba Locutores (equipe)
│   ├── TabHistoria.jsx      # Aba Nossa História
│   ├── TabComercial.jsx     # Aba Comercial (anúncios)
│   └── TabContatos.jsx      # Aba Contatos (WhatsApp, redes)
└── hooks/
    ├── useNowPlaying.js     # Hook de metadados "tocando agora"
    ├── useRadioConfig.js    # ⭐ Multi-tenant: detecta rádio e carrega config
    └── useTheme.js          # ⭐ Aplica tema dinâmico (cores da rádio)
```

## ✨ Features Atuais

- 🎵 **Player de streaming** com múltiplas fontes e fallback
- 📋 **Grade de programação** completa (7 dias da semana)
- 🎙️ **Página de locutores** com foto, descrição e programas
- 📰 **Notícias** com destaque e imagens
- 💼 **Banners premium** e patrocinadores na sidebar
- 🌙 **Dark mode** com persistência
- 📱 **PWA-ready** (manifest, icons, mobile-capable)
- ⚙️ **Painel admin** com login real (email/senha via Supabase Auth)
- 💾 **Dados no banco** — tudo salva no Supabase Postgres
- 📤 **Upload de imagens** — fotos de locutores, notícias (Supabase Storage)
- 🔒 **RLS** — cada rádio só edita seus próprios dados
- 📲 **Integração WhatsApp** (pedir música)
- 🔍 **SEO + Open Graph** configurados
- 🏢 **Multi-tenant** — cada rádio tem seu site via subdomínio ou query param
- 🎨 **Temas dinâmicos** — cores e fontes configuráveis por rádio via API
- 🔌 **API serverless** — `/api/radio/:slug` serve config de cada rádio
- 💳 **Sistema de planos** — free/basic/premium com controle de features
- 🏷️ **Marca d'água** — removível nos planos pagos
- 🌐 **Landing page** — página de venda da plataforma com tabela de preços

## 🗺️ Roadmap — Evolução para SaaS

### Fase 1 — Multi-tenant ✅
- [x] Backend leve (API serverless na Vercel)
- [x] Config dinâmico por rádio (fetch via subdomínio ou query param `?radio=slug`)
- [x] JSON por rádio em `api/radios/` (futuro: migra pra banco)
- [x] Tema dinâmico (cores aplicadas via CSS variables)
- [x] Fallback pro config local se API falhar

### Fase 2 — Admin real ✅
- [x] Autenticação real (Supabase Auth — email/senha)
- [x] Painel admin salva no Supabase (Postgres)
- [x] Upload de imagens (Supabase Storage — bucket `media`)
- [x] RLS (Row Level Security) — cada dono edita só sua rádio
- [x] Aba de locutores no admin com foto e programas

### Fase 3 — Personalização visual ✅
- [x] Cores configuráveis no admin (primária, secundária, fundo, cards, texto)
- [x] Fontes do Google Fonts (seleção no admin com preview)
- [x] Fonte separada pra títulos
- [x] Border radius configurável
- [x] Preview ao vivo no painel admin
- [x] Carregamento dinâmico de fontes do Google Fonts

### Fase 4 — Monetização ✅
- [x] Sistema de planos (free / basic / premium) com controle de features
- [x] Marca d'água "Feito com RadioSaaS" no plano grátis
- [x] Bloqueio visual de features no admin (cores, fontes) com badge de upgrade
- [x] Landing page com tabela de preços e demo
- [x] Estrutura preparada pra integração com gateway de pagamento
- [ ] Integração com Stripe/Mercado Pago (futuro)

### Fase 5 — Domínio customizado
- [x] Detecção automática por subdomínio
- [x] Vercel configurado pra wildcard domains
- [ ] Painel pra rádio configurar domínio próprio (futuro — requer DNS + Vercel API)

## 🌐 Domínio Customizado

Cada rádio pode usar seu próprio domínio. O fluxo:

1. No painel Vercel, vá em Settings > Domains
2. Adicione um wildcard: `*.radiosite.com.br`
3. Cada rádio acessa via `maraja.radiosite.com.br`
4. Pra domínio 100% customizado (ex: `www.radiomaraja.com`):
   - A rádio aponta o DNS (CNAME) pro domínio da plataforma
   - No Vercel, adiciona o domínio customizado
   - O app detecta automaticamente pela tabela de domínios

## 🛠️ Rodando localmente

```bash
# Instalar dependências
npm install

# Rodar em dev
npm start
```

O dev server simula as API routes localmente via plugin Vite — funciona igual à Vercel.

**Testar outra rádio:** Acesse `http://localhost:3000?radio=maraja` (ou crie outro JSON em `api/radios/`).

```bash
# Build de produção
npm run build
```

## 📝 Configuração

### Adicionando uma nova rádio

1. Crie um arquivo JSON em `api/radios/<slug>.json`
2. Siga a estrutura de `api/radios/maraja.json` como modelo
3. Acesse via `?radio=<slug>` ou configure o subdomínio `<slug>.seudominio.com`

### Campos do JSON de uma rádio

- `slug` — Identificador único (usado na URL)
- `nome` / `frequencia` / `logo` — Identidade visual
- `whatsapp` — Número pra integração WhatsApp
- `tema` — Cores (primária, secundária, fundo, cards, texto)
- `streams` — URLs de streaming (principal + fallbacks)
- `programacao` — Grade semanal (0=Dom a 6=Sáb)
- `locutores` — Equipe com foto e descrição
- `noticias` — Notícias com imagem e destaque
- `bannersPremium` — Anúncios premium
- `patrocinadores` — Apoio cultural na sidebar

## 📄 Licença

Projeto pessoal em desenvolvimento. Todos os direitos reservados.
