import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  FileCode2,
  GitBranch,
  Network,
  TestTubeDiagonal,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AttemptGraph } from "@/components/dashboard/attempt-graph";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatAbsoluteTime, formatRelativeTime, titleCase } from "@/lib/formatting";
import { getOutcomeMeta } from "@/lib/status";
import { getTaskEpisode } from "@/lib/data";

export default async function TaskEpisodePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { projectId, taskId } = await params;
  const { attempt: selectedAttemptId } = await searchParams;
  const episode = await getTaskEpisode(projectId, taskId);

  if (!episode) {
    notFound();
  }

  const selectedAttempt =
    episode.attempts.find((record) => record.attempt.id === selectedAttemptId) ??
    episode.attempts[episode.attempts.length - 1] ??
    null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Task episode"
        title={episode.task.title ?? "Untitled task"}
        description="Lineage view across sibling attempts, pivots, and failure signatures within a single task."
        breadcrumbs={[
          { title: "Projects", href: "/" },
          { title: episode.project.name, href: `/projects/${episode.project.id}` },
          { title: "Task episode" },
        ]}
        actions={
          selectedAttempt ? (
            <Button asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
              <Link href={`/projects/${projectId}/attempts/${selectedAttempt.attempt.id}`}>
                Open full attempt
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="surface-panel border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{titleCase(episode.task.status)}</p>
          </CardContent>
        </Card>
        <Card className="surface-panel border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 font-mono text-sm text-foreground">
              <GitBranch className="size-4 text-sky-300" />
              {episode.task.branch ?? "No branch"}
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock3 className="size-4 text-sky-300" />
              {formatRelativeTime(episode.task.created_at)}
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Network className="size-4 text-sky-300" />
              {episode.attempts.length} recorded branches
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="surface-panel border">
        <CardHeader className="border-b border-white/10">
          <CardTitle>Attempt lineage graph</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click a node to inspect that attempt inside this task episode.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <AttemptGraph attempts={episode.attempts} />
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
        <Card className="surface-panel border">
          <CardHeader className="border-b border-white/10">
            <CardTitle>Selected attempt</CardTitle>
            <p className="text-sm text-muted-foreground">
              The graph selection and the full attempt page stay separate on purpose.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {selectedAttempt ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {selectedAttempt.attempt.actor_type}
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {selectedAttempt.attempt.summary ?? "No summary generated yet"}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground">
                      {selectedAttempt.attempt.id}
                    </p>
                  </div>
                  <StatusBadge status={selectedAttempt.attempt.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Started
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatAbsoluteTime(selectedAttempt.attempt.started_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Ended
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatAbsoluteTime(selectedAttempt.attempt.ended_at)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Files touched</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttempt.fileTouches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No file touch data.</p>
                    ) : (
                      selectedAttempt.fileTouches.map((touch) => (
                        <Badge
                          key={touch.id}
                          variant="outline"
                          className="border-white/10 bg-white/4 font-mono text-[11px]"
                        >
                          {touch.path}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Outcomes</h3>
                  <div className="space-y-2">
                    {selectedAttempt.outcomes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No outcomes recorded yet.</p>
                    ) : (
                      selectedAttempt.outcomes.map((outcome) => (
                        <div
                          key={outcome.id}
                          className="rounded-2xl border border-white/8 bg-black/15 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <Badge className={getOutcomeMeta(outcome.outcome_type).className}>
                              {getOutcomeMeta(outcome.outcome_type).label}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatRelativeTime(outcome.created_at)}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {outcome.error_sig ? (
                              <div className="flex items-center gap-2">
                                <TestTubeDiagonal className="size-4 text-sky-300" />
                                <span className="font-mono text-xs">{outcome.error_sig}</span>
                              </div>
                            ) : null}
                            {Array.isArray(outcome.details_json?.failing_tests) ? (
                              <div className="flex flex-wrap gap-2">
                                {outcome.details_json?.failing_tests.map((failingTest) => (
                                  <Badge
                                    key={failingTest}
                                    variant="outline"
                                    className="border-white/10 bg-white/4 font-mono text-[11px]"
                                  >
                                    {failingTest}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No attempts have been recorded for this task yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="surface-panel border">
          <CardHeader className="border-b border-white/10">
            <CardTitle>Task attempt timeline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sequential view for browsing the full episode without leaving the task.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[720px]">
              <div className="space-y-4 p-6">
                {episode.attempts.map((record) => (
                  <Link
                    key={record.attempt.id}
                    href={`?attempt=${record.attempt.id}`}
                    scroll={false}
                    className="block"
                  >
                    <div className="rounded-3xl border border-white/8 bg-white/4 p-4 transition-colors hover:bg-white/[0.08]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">
                            {record.attempt.summary ?? "No summary generated yet"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{record.attempt.actor_name}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(record.attempt.started_at)}</span>
                          </div>
                        </div>
                        <StatusBadge status={record.attempt.status} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {record.fileTouches.slice(0, 3).map((touch) => (
                          <Badge
                            key={touch.id}
                            variant="outline"
                            className="border-white/10 bg-black/15 font-mono text-[11px]"
                          >
                            <FileCode2 className="size-3" />
                            {touch.path}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
