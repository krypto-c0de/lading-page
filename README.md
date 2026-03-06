# Daily Flow — Landing Page + Waitlist (Vercel)

## Como funciona a segurança

```
Navegador  →  /api/waitlist  →  Supabase
            (sem credenciais)   (chaves só no servidor)
```

Nenhuma chave de API aparece no HTML ou no console do navegador.

---

## Setup em 4 passos

### 1. Criar a tabela no Supabase

Painel Supabase → SQL Editor → execute:

```sql
create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text default 'landing_page',
  lang       text default 'pt',
  created_at timestamptz default now()
);

alter table waitlist enable row level security;
```

### 2. Pegar as credenciais no Supabase

Painel → Project Settings → API:
- SUPABASE_URL        → Project URL (ex: https://xyzabc.supabase.co)
- SUPABASE_SERVICE_KEY → chave service_role (não a anon!)

### 3. Configurar variáveis na Vercel

vercel.com → projeto → Settings → Environment Variables

Adicionar:
  SUPABASE_URL          = https://xyzabc.supabase.co
  SUPABASE_SERVICE_KEY  = eyJhbGc...

Marcar como Production (e Preview se quiser testar).

### 4. Deploy

Opção A — arrastar a pasta dailyflow-vercel/ em vercel.com/new

Opção B — CLI:
  npm install -g vercel
  vercel login
  cd dailyflow-vercel/
  vercel --prod

---

## Ver os emails

Supabase → Table Editor → waitlist
ou: select email, lang, created_at from waitlist order by created_at desc;

---

## Estrutura

dailyflow-vercel/
├── index.html        ← landing page (zero credenciais)
├── vercel.json       ← config de rotas
└── api/
    └── waitlist.js   ← função serverless (credenciais ficam aqui)
