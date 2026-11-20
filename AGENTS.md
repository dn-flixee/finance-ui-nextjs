# AI Agent Instructions & Project Guidelines (`AGENTS.md`)

This file provides rules, architectural conventions, and instructions for AI agents working in the **Finance Manager UI** (`finance-ui-nextjs`) repository.

---

## 1. Project Overview & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS, PostCSS, Radix UI / shadcn-style component primitives (`components/ui`)
- **State Management**: Redux Toolkit (`StoreProvider.tsx`), TanStack React Query (`@tanstack/react-query`)
- **Backend / Database**: Prisma ORM (`prisma/schema.prisma`), Supabase (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`), NextAuth / Supabase Auth
- **Icons**: Lucide React (`lucide-react`), Heroicons (`@heroicons/react`)

### Directory Layout
- `app/` — Next.js App Router pages, layouts, and route handlers (`app/api/`)
- `components/` — Shared, reusable UI components (e.g., `components/ui/`)
- `hooks/` — Custom React hooks
- `lib/` — Shared helpers, Prisma client instances, and utility libraries
- `services/` — Business logic and external API integrations
- `types/` — TypeScript interfaces, models, and type declarations
- `utils/` — Helper utility functions
- `prisma/` — Prisma schema, migrations, and seed scripts
- `supabase/` — Supabase migrations and configuration

---

## 2. Core Development Rules

### TypeScript & Code Quality
- **Strict Typing**: Avoid `any` types wherever possible. Define clear interfaces or types in `types/` or co-located type files.
- **Components**:
  - Distinguish between **Server Components** (default in App Router) and **Client Components**.
  - Mark client-side interactive components with `'use client'` at the very top.
  - Keep client components minimal; keep data fetching in server components or React Query where suitable.
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `TransactionList.tsx`).
  - Hooks: `camelCase` starting with `use` (e.g., `useTransactions.ts`).
  - Utilities/Services: `camelCase` (e.g., `formatCurrency.ts`).

### Styling & UI
- Use **Tailwind CSS** classes. Follow responsive design patterns (`sm:`, `md:`, `lg:`).
- Reuse existing Radix/shadcn primitives in `components/ui/` rather than creating redundant custom widgets.
- Respect dark/light mode theming where implemented.

### Database & Backend
- **Prisma**:
  - When modifying the database schema in `prisma/schema.prisma`, run `npx prisma generate` to refresh types.
  - Use database migrations (`npx prisma migrate dev`) for structural changes.
- **Supabase & RLS**:
  - Enforce Row Level Security (RLS) on database tables where user data is isolated.
  - Never bypass RLS policies or expose service keys to the client.

### Security & Environment Variables
- Keep secrets in `.env.local` or `.env`. Never commit credentials, private keys, or API secrets.
- Only expose variables with the `NEXT_PUBLIC_` prefix if they are intended to be public on the client.

---

## 3. Standard Commands

```bash
# Development server
npm run dev

# Linting
npm run lint

# Build check
npm run build

# Prisma Commands
npm run db:generate   # prisma generate
npm run db:migrate    # prisma migrate dev
npm run db:seed       # tsx prisma/seed.ts
```

---

## 4. Instructions for AI Agents

1. **Verify Before Completing**: Always ensure modified files compile and pass TypeScript/lint checks before concluding a task.
2. **Minimal & Targeted Changes**: Avoid refactoring unrelated code or reformatting entire files when fixing a bug or adding a feature.
3. **Preserve Project Structure**: Place new components in `components/`, hooks in `hooks/`, and route handlers in `app/api/`.
4. **Environment Awareness**: Read existing `.env.example` or configuration files before assuming environment variables exist.
