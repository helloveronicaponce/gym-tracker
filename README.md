# Gym Tracker PWA

Aplicativo PWA de acompanhamento de treinos de academia com React + Vite + Supabase.

## Passo a passo de setup

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (gratuita).
2. Clique em **New Project** e preencha nome e senha do banco.
3. Aguarde o projeto ser provisionado.

### 2. Configurar o banco de dados

1. No painel do Supabase, vá em **SQL Editor**.
2. Cole o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**.
3. Isso criará as tabelas `profiles`, `plans`, `plan_exercises` e `workout_sessions`, com RLS e trigger de criação automática de perfil.

### 3. Habilitar autenticação por Magic Link

1. No Supabase, vá em **Authentication > Providers**.
2. Confirme que **Email** está habilitado com **Enable Email OTP** ativado.
3. Em **URL Configuration**, defina o **Site URL** como `http://localhost:5173` (dev) ou o domínio de produção.

### 4. Obter as credenciais

1. No Supabase, vá em **Settings > API**.
2. Copie a **Project URL** e a **anon public key**.

### 5. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 6. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### 7. Deploy (produção)

```bash
npm run build
```

A pasta `dist/` contém os arquivos estáticos. Faça deploy em Vercel, Netlify, Cloudflare Pages ou qualquer host estático.

Lembre-se de atualizar o **Site URL** no Supabase para o domínio de produção.

## Estrutura de arquivos

```
gym-tracker/
├── index.html              # HTML shell com meta tags PWA
├── package.json            # Dependências
├── vite.config.js          # Configuração Vite
├── .env.example            # Variáveis de ambiente (template)
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker
│   └── icon.svg            # Ícone do app
├── src/
│   ├── main.jsx            # Entry point React
│   ├── supabase.js         # Cliente Supabase
│   └── App.jsx             # Aplicação completa
├── supabase/
│   └── schema.sql          # Schema SQL com RLS e trigger
└── README.md               # Este arquivo
```

## Funcionalidades

- **Autenticação** via magic link (e-mail)
- **4 abas**: Treinos, Sugestões, Exercícios, Histórico
- **39 exercícios** com animações SVG de stick figure
- **Criação de treinos** com modal bottom sheet em 2 etapas
- **Player de treino** em tela cheia com progresso circular
- **4 objetivos** de treino: Hipertrofia, Força, Emagrecimento, Resistência
- **Histórico** de sessões com duração e calorias
- **Configurações**: peso, objetivo, logout
- **PWA**: instalável, funciona offline para assets estáticos
- **2 treinos pré-cadastrados**: Treino A (Pernas) e Treino B (Superior)
