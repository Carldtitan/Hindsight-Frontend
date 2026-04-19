import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CircuitBoard,
  FolderKanban,
  GitBranch,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AttemptTable } from "@/components/dashboard/attempt-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InfoHint } from "@/components/dashboard/info-hint";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectViewScrollReset } from "@/components/dashboard/project-view-scroll-reset";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskTable } from "@/components/dashboard/task-table";
import { TopDeadEndFiles } from "@/components/dashboard/top-dead-end-files";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getActorPresentation,
  getOutcomeHeadline,
  getTaskTitle,
  getTouchedFilePaths,
} from "@/lib/display";
import { getProjectOverview } from "@/lib/data";
import { formatNumber, formatRelativeTime } from "@/lib/formatting";

function isFailureStatus(status: string) {
  return status === "failed" || status === "reverted";
}

export default async function ProjectOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;
  const overview = await getProjectOverview(projectId);
  const isActivityView = view === "activity";

  if (!overview) {
    notFound();
  }

  const openTasks = overview.tasks.filter((summary) => summary.task.status === "ongoing");
  const failureAttempts = overview.attempts.filter((record) =>
    isFailureStatus(record.attempt.status),
  );
  const recoveredAttempts = overview.attempts.filter(
    (record) => record.attempt.status === "accepted",
  );
  const latestRecoveryTask = recoveredAttempts[0]
    ? overview.tasks.find((summary) => summary.task.id === recoveredAttempts[0].attempt.task_id)?.task
    : null;

  const overviewStats = (
    <section className="grid gap-4 xl:grid-cols-4">
      <StatCard
        icon={FolderKanban}
        label="Open tasks"
        value={formatNumber(overview.stats.active_tasks)}
        helpText="Tasks that are still open."
      />
      <StatCard
        icon={AlertTriangle}
        label="Failed attempts / 24h"
        value={formatNumber(overview.stats.failed_attempts_24h)}
        helpText="Attempts that failed or were reverted in the last 24 hours."
      />
      <StatCard
        icon={CircuitBoard}
        label="Recovered attempts / 24h"
        value={formatNumber(overview.stats.successful_pivots_24h)}
        helpText="Accepted attempts that landed after a failed or reverted try."
      />
      <StatCard
        icon={GitBranch}
        label="Hot files"
        value={formatNumber(overview.stats.top_dead_end_files.length)}
        helpText="Files that appear most often in failed or reverted attempts."
      />
    </section>
  );

  const activityStats = (
    <section className="grid gap-4 xl:grid-cols-4">
      <StatCard
        icon={AlertTriangle}
        label="Failed attempts / 24h"
        value={formatNumber(overview.stats.failed_attempts_24h)}
        helpText="Attempts that failed or were reverted in the last 24 hours."
      />
      <StatCard
        icon={CircuitBoard}
        label="Recovered attempts / 24h"
        value={formatNumber(overview.stats.successful_pivots_24h)}
        helpText="Accepted attempts that landed after a failed or reverted try."
      />
      <StatCard
        icon={GitBranch}
        label="Hot files"
        value={formatNumber(overview.stats.top_dead_end_files.length)}
        helpText="Files that appear most often in failed or reverted attempts."
      />
      <StatCard
        icon={Activity}
        label="Attempts shown"
        value={formatNumber(overview.attempts.length)}
        helpText="Attempts currently loaded into this activity view."
      />
    </section>
  );

  return (
    <div className="space-y-8">
      <ProjectViewScrollReset />
      <PageHeader
        eyebrow={isActivityView ? "Activity" : "Overview"}
        title={overview.project.name}
        description={
          isActivityView
            ? "Recent attempts, repeated failures, and the files absorbing bad fixes."
            : "Open work, current failure pressure, and the latest project state."
        }
        helpText={
          isActivityView
            ? "Use this view to inspect recent attempts and repeated failures."
            : "Use this view to understand the current task load and where the project is getting stuck."
        }
        breadcrumbs={[
          { title: "Projects", href: "/" },
          { title: overview.project.name },
        ]}
        actions={
          <Button asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
            <Link href={`/projects/${overview.project.id}/search`}>
              Search
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {isActivityView ? activityStats : overviewStats}

      {isActivityView ? (
        <>
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <Card className="surface-panel border">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CardTitle>Attempt feed</CardTitle>
                    <InfoHint>
                      Recent attempts with status, result, author, files, and timing.
                    </InfoHint>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${overview.project.id}/search`}>Search</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {overview.attempts.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      icon={GitBranch}
                      title="No attempts yet"
                      description="No attempts recorded."
                    />
                  </div>
                ) : (
                  <AttemptTable projectId={overview.project.id} attempts={overview.attempts} />
                )}
              </CardContent>
            </Card>

            <TopDeadEndFiles files={overview.stats.top_dead_end_files} />
          </section>

          <section>
            <Card className="surface-panel border">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CardTitle>Recent tasks</CardTitle>
                  <InfoHint>
                    Tasks recently touched by the project, with their latest result.
                  </InfoHint>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {overview.tasks.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      icon={FolderKanban}
                      title="No tasks recorded"
                      description="No tasks recorded."
                    />
                  </div>
                ) : (
                  <TaskTable projectId={overview.project.id} tasks={overview.tasks} />
                )}
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <Card className="surface-panel border">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CardTitle>Latest failure signals</CardTitle>
                  <InfoHint>
                    The most recent failed or reverted attempts in this project.
                  </InfoHint>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {failureAttempts.length === 0 ? (
                  <EmptyState
                    icon={AlertTriangle}
                    title="No failures recorded"
                    description="Recent attempts are not failing."
                  />
                ) : (
                  failureAttempts.slice(0, 4).map((record) => {
                    const actor = getActorPresentation(
                      record.attempt.actor_type,
                      record.attempt.actor_name,
                    );
                    const touchedPaths = getTouchedFilePaths(record.fileTouches, 3);

                    return (
                      <Link
                        key={record.attempt.id}
                        href={`/projects/${overview.project.id}/attempts/${record.attempt.id}`}
                        className="block rounded-2xl border border-white/8 bg-black/15 p-4 transition-colors hover:bg-white/[0.05]"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-pretty break-words font-medium text-foreground">
                              {record.attempt.summary ?? "Summary unavailable"}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(record.attempt.started_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getOutcomeHeadline(record.outcomes[0] ?? null)}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{actor.primary}</span>
                            {touchedPaths.length > 0 ? (
                              <>
                                <span aria-hidden="true">&bull;</span>
                                {touchedPaths.map((path) => (
                                  <span
                                    key={path}
                                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono"
                                  >
                                    {path}
                                  </span>
                                ))}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <TopDeadEndFiles files={overview.stats.top_dead_end_files} />
          </section>

          <section>
            <Card className="surface-panel border">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CardTitle>{openTasks.length > 0 ? "Open tasks" : "Recent tasks"}</CardTitle>
                    <InfoHint>
                      Task-level view of the project, with the latest result for each task.
                    </InfoHint>
                  </div>
                  {latestRecoveryTask ? (
                    <div className="text-sm text-muted-foreground">
                      Latest recovery: {getTaskTitle(latestRecoveryTask)}
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {overview.tasks.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      icon={FolderKanban}
                      title="No tasks recorded"
                      description="No tasks recorded."
                    />
                  </div>
                ) : (
                  <TaskTable
                    projectId={overview.project.id}
                    tasks={openTasks.length > 0 ? openTasks : overview.tasks}
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
