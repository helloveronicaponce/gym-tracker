# 🏋️ Gym Tracker — PWA + Supabase

App de acompanhamento de treinos com autenticação por magic link e dados sincronizados na nuvem.

---

## 🚀 Setup em 4 passos

### 1. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/schema.sql`
3. Clique em **Run** para criar as tabelas
4. Em **Authentication → URL Configuration**:
   - **Site URL**: `https://seu-dominio.com`
   - **Redirect URLs**: `https://seu-dominio.com`
5. Em **Settings → API**, copie:
   - `Project URL`
   - `anon public` key

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
```

### 3. Instale e rode localmente

```bash
npm install
npm run dev
```

### 4. Deploy (Vercel / Netlify)

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```
Adicione as variáveis de ambiente no painel da Vercel.

**Netlify:**
```bash
npm run build
# Faça upload da pasta /dist no painel do Netlify
# Adicione as variáveis de ambiente em Site Settings → Environment
```

---

## 🔑 Como funciona o Magic Link

1. Usuário digita o e-mail
2. Clica em **"Enviar link de acesso"**
3. Recebe um e-mail com um link seguro
4. Clica no link → é redirecionado para o app já autenticado
5. Sessão fica salva no dispositivo (não precisa entrar de novo)

---

## 📱 Instalar como PWA

- **Android**: Chrome → menu → "Adicionar à tela inicial"
- **iOS**: Safari → compartilhar → "Adicionar à Tela de Início"
- **Desktop**: ícone de instalação na barra de endereço do Chrome

---

## 🗄️ Estrutura do banco de dados

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário (peso, objetivo) |
| `plans` | Planos de treino |
| `plan_exercises` | Exercícios de cada plano (com ordem) |
| `workout_sessions` | Histórico de treinos realizados |

Todos os dados são isolados por usuário via **Row Level Security (RLS)**.

---

## 📁 Estrutura do projeto

```
gym-tracker/
├── public/
│   ├── manifest.json     # Configuração PWA
│   ├── sw.js             # Service Worker (cache offline)
│   ├── icon.svg          # Ícone do app
│   ├── icon-192.png      # Ícone PWA 192×192 (adicione manualmente)
│   └── icon-512.png      # Ícone PWA 512×512 (adicione manualmente)
├── src/
│   ├── App.jsx           # App completo
│   ├── main.jsx          # Entrada React
│   └── supabase.js       # Cliente Supabase
├── supabase/
│   └── schema.sql        # Schema do banco de dados
├── .env.example          # Template de variáveis de ambiente
├── index.html            # HTML principal com meta tags PWA
├── package.json
└── vite.config.js
```

---

## 🖼️ Ícones PWA

Para uma PWA completa, adicione os ícones PNG em `/public/`:
- `icon-192.png` — 192×192 pixels
- `icon-512.png` — 512×512 pixels
- `apple-touch-icon.png` — 180×180 pixels (para iOS)

Você pode usar o `icon.svg` como base e converter com ferramentas como
[realfavicongenerator.net](https://realfavicongenerator.net).

---

## 🛠️ Tecnologias

- **React 18** + **Vite** — frontend
- **Supabase** — auth (magic link) + banco de dados PostgreSQL
- **PWA** — service worker + manifest para instalação nativa
- **Nunito + Bebas Neue** — tipografia (Google Fonts)
