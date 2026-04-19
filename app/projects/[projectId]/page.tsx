import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CircuitBoard,
  FolderKanban,
  GitBranch,
  TriangleAlert,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AttemptTable } from "@/components/dashboard/attempt-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskTable } from "@/components/dashboard/task-table";
import { TopDeadEndFiles } from "@/components/dashboard/top-dead-end-files";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatting";
import { getProjectOverview } from "@/lib/data";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const overview = await getProjectOverview(projectId);

  if (!overview) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project overview"
        title={overview.project.name}
        description="Aggregate failure pressure, active task load, recent attempts, and the files that keep absorbing bad fixes."
        breadcrumbs={[
          { title: "Projects", href: "/" },
          { title: overview.project.name },
        ]}
        actions={
          <Button asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
            <Link href={`/projects/${overview.project.id}/search`}>
              Open search
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard
          icon={TriangleAlert}
          label="Failed attempts / 24h"
          value={formatNumber(overview.stats.failed_attempts_24h)}
          description="Failed or reverted attempts recorded during the last 24 hours."
        />
        <StatCard
          icon={CircuitBoard}
          label="Successful pivots / 24h"
          value={formatNumber(overview.stats.successful_pivots_24h)}
          description="Accepted attempts that landed after at least one failed or reverted sibling."
        />
        <StatCard
          icon={FolderKanban}
          label="Active tasks"
          value={formatNumber(overview.stats.active_tasks)}
          description="Ongoing tasks still collecting attempts in this project."
        />
        <StatCard
          icon={Activity}
          label="Loaded attempts"
          value={formatNumber(overview.attempts.length)}
          description="Most recent attempts pulled into this overview surface."
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <Card className="surface-panel border" id="attempts">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Recent attempts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest attempt summaries with status, actor, outcome, and file
                  touch context.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/projects/${overview.project.id}/search`}>
                  Search history
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {overview.attempts.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={GitBranch}
                  title="No attempts yet"
                  description="Start coding. Hindsight will fill in as your agent acts."
                />
              </div>
            ) : (
              <AttemptTable
                projectId={overview.project.id}
                attempts={overview.attempts}
              />
            )}
          </CardContent>
        </Card>

        <TopDeadEndFiles files={overview.stats.top_dead_end_files} />
      </section>

      <section>
        <Card className="surface-panel border">
          <CardHeader className="border-b border-white/10">
            <CardTitle>Recent tasks</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current and recently closed tasks flowing into the attempt graph.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {overview.tasks.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={FolderKanban}
                  title="No tasks recorded"
                  description="Tasks will appear here once Elbion emits the first task_start event."
                />
              </div>
            ) : (
              <TaskTable projectId={overview.project.id} tasks={overview.tasks} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
