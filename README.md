# Hindsight Frontend

Frontend dashboard for Hindsight.

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

This app reads from an existing Supabase project. It does not create or manage backend resources.

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

## Scope

- Dashboard UI
- Route structure
- Read-only Supabase queries
- Realtime refresh for project updates
