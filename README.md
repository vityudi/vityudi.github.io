# vitoryudi.dev — Portfolio

Portfolio pessoal de Vitor Yudi (Fullstack & DevOps), construído como um site estático em Next.js com tema de terminal/macOS. Dados de projetos e do guestbook são servidos via Supabase (client-side, tempo real).

## Stack

- **Next.js 16** (App Router, 100% client components, `output: "export"`)
- **React 19** + **Tailwind CSS 4**
- **Framer Motion** para animações e parallax
- **Supabase** (Postgres + Realtime) para projetos, guestbook e controle de acesso do CV
- Fontes: `Unbounded` (display), `Manrope` (corpo), `JetBrains Mono` (terminal)

## Estrutura

```
src/
  app/
    page.tsx        # home (hero, stack, projetos, guestbook)
    cv/page.tsx      # currículo com gate de acesso via token
    admin/page.tsx   # painel para gerenciar projetos/guestbook/CV
  components/        # TopBar, TerminalHero, BentoSkills, ServerDashboard, GuestbookTerminal, StatusBar...
  lib/
    supabase.ts      # client Supabase
    types.ts         # tipos das tabelas (Project, GuestbookEntry, CvVersion, CvAccessToken)
supabase/
  schema.sql         # schema das tabelas + RLS
```

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Crie um `.env.local` na raiz com as credenciais do seu projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

Aplique `supabase/schema.sql` no seu projeto Supabase antes de rodar — ele cria as tabelas `projects`, `guestbook`, `cv_versions`, `cv_access_tokens` e as respectivas policies de RLS.

## Build

```bash
npm run build
```

Como o site é 100% client-side (sem rotas de API, sem SSR dinâmico), `next build` gera um export estático completo em `out/` (`output: "export"` no `next.config.ts`).

## Deploy

O deploy é feito via **GitHub Pages**, publicado automaticamente pelo workflow `.github/workflows/deploy.yml` a cada push na branch `main`:

1. `npm ci && npm run build` (injeta as env vars `NEXT_PUBLIC_SUPABASE_*` a partir dos Secrets do repositório)
2. Upload do diretório `out/` como artifact do Pages
3. Deploy via `actions/deploy-pages`

Para funcionar, o repositório precisa ter **Settings → Pages → Source: GitHub Actions** habilitado, e os secrets `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` configurados em **Settings → Secrets and variables → Actions**.

> O projeto não usa mais Vercel — a integração antiga (se ainda existir) pode ser desconectada em Vercel → Project Settings → Git.
