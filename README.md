# Hindsight Frontend

P2 dashboard for Hindsight. This repository contains only the Next.js frontend.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- shadcn/ui
- Supabase client
- React Flow (`@xyflow/react`)

## Required environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

P3 owns provisioning the Supabase project, tables, RPCs, edge function, and realtime setup. This app only consumes those contracts.

## Scripts

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

## External contracts consumed

- Tables: `projects`, `tasks`, `attempts`, `file_touches`, `outcomes`
- RPCs:
  - `project_stats(project_id_input uuid)`
  - `match_attempts_semantic(query_embedding, project_id_filter, match_count?, similarity_threshold?)`
- Edge Function:
  - `functions/v1/embed` accepting `{ text }`
- Realtime:
  - `attempts`
  - `outcomes`

## Separation of concerns

- P2 owns the dashboard UI, route structure, client-side querying, and realtime refresh behavior.
- Elbion owns the JetBrains plugin, local SQLite, MCP server, warning logic, and sync worker.
- P3 owns Supabase provisioning, migrations, RPCs, edge functions, demo assets, and seed data.
