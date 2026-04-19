import Link from "next/link";
import { ArrowUpRight, FolderKanban, Radar, Workflow } from "lucide-react";
import { redirect } from "next/navigation";

import { ConfigMissingState } from "@/components/dashboard/config-missing-state";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/formatting";
import { getProjects, getProjectOverview } from "@/lib/data";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <ConfigMissingState />;
  }

  const projects = await getProjects();

  if (projects.length === 1) {
    redirect(`/projects/${projects[0].id}`);
  }

  if (projects.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-12 md:px-8">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-sky-300">
            <Radar className="size-5" />
            <p className="font-mono text-xs uppercase tracking-[0.24em]">
              Hindsight command center
            </p>
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              Team attempt memory, without frontend-side guesswork.
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
              This dashboard is ready to read project memory as soon as P3 provisions
              Supabase and Elbion starts syncing attempts. Until then, there are no
              projects to display.
            </p>
          </div>
        </section>
        <EmptyState
          icon={FolderKanban}
          title="No projects synced yet"
          description="Start coding. Hindsight will fill in as your agent acts."
        />
      </main>
    );
  }

  const projectSnapshots = await Promise.all(
    projects.map(async (project) => ({
      project,
      overview: await getProjectOverview(project.id),
    })),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-12 md:px-8">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="surface-panel surface-grid overflow-hidden border">
          <CardContent className="space-y-8 p-8">
            <div className="flex items-center gap-3 text-sky-300">
              <Radar className="size-5" />
              <p className="font-mono text-xs uppercase tracking-[0.24em]">
                Hindsight frontend / P2
              </p>
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                Read-only team memory for failed fixes, pivots, and task lineage.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                The dashboard stays distinct from Elbion and P3. It reads projects,
                tasks, attempts, file touches, and outcomes directly from the shared
                Supabase contract and surfaces them as a dense engineering command
                center.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
                <a href="#projects">Browse projects</a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://github.com/Carldtitan/Hindsight-Frontend"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowUpRight className="size-4" />
                  Repository
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel border">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg">What this frontend consumes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            {[
              "Supabase tables: projects, tasks, attempts, file_touches, outcomes",
              "RPCs: project_stats and match_attempts_semantic",
              "Edge function: functions/v1/embed for semantic search",
              "Realtime on attempts and outcomes",
            ].map((line) => (
              <div
                key={line}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-muted-foreground"
              >
                {line}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="projects" className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Synced projects
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Team memory surfaces
            </h2>
          </div>
          <StatusBadge status="in_progress" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {projectSnapshots.map(({ project, overview }) => (
            <Card key={project.id} className="surface-panel border">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <p className="font-mono text-xs text-muted-foreground">
                      {project.repo_url ?? "No repo URL"}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/projects/${project.id}`}>Open dashboard</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Tasks
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {overview?.tasks.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Attempts
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {overview?.attempts.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Active tasks
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {overview?.stats.active_tasks ?? 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Workflow className="size-4 text-sky-300" />
                    Latest recorded attempt
                  </div>
                  {overview?.attempts[0] ? (
                    <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">
                            {overview.attempts[0].attempt.summary ?? "No summary generated yet"}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {overview.attempts[0].fileTouches[0]?.path ?? "No file touch data"}
                          </p>
                        </div>
                        <StatusBadge status={overview.attempts[0].attempt.status} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>{formatRelativeTime(overview.attempts[0].attempt.started_at)}</span>
                        <span>{formatAbsoluteTime(overview.attempts[0].attempt.started_at)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/12 bg-black/10 p-4 text-sm text-muted-foreground">
                      No attempts have landed yet for this project.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
