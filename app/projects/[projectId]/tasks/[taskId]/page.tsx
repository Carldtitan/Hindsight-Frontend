import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  FileCode2,
  Network,
  TestTubeDiagonal,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AttemptGraph } from "@/components/dashboard/attempt-graph";
import { InfoHint } from "@/components/dashboard/info-hint";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTaskEpisode } from "@/lib/data";
import {
  getActorPresentation,
  getFileTouchEmptyMessage,
  getOutcomeHeadline,
  getTaskStatusLabel,
  getTaskTitle,
} from "@/lib/display";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/formatting";
import { getOutcomeMeta } from "@/lib/status";

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
  const latestAttempt = episode.attempts[episode.attempts.length - 1] ?? null;
  const selectedActor = selectedAttempt
    ? getActorPresentation(selectedAttempt.attempt.actor_type, selectedAttempt.attempt.actor_name)
    : null;

  return (
    <div className="min-w-0 space-y-8">
      <PageHeader
        eyebrow="Task"
        title={getTaskTitle(episode.task)}
        description="Every recorded attempt for this task, in order."
        helpText="A task is one piece of work. Use this page to inspect what was tried and what happened next."
        breadcrumbs={[
          { title: "Projects", href: "/" },
          { title: episode.project.name, href: `/projects/${episode.project.id}` },
          { title: "Task" },
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
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{getTaskStatusLabel(episode.task.status)}</p>
          </CardContent>
        </Card>
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Network className="size-4 text-sky-300" />
              {episode.attempts.length}
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Latest result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <TestTubeDiagonal className="size-4 text-sky-300" />
              {getOutcomeHeadline(latestAttempt?.outcomes[0] ?? null)}
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel min-w-0 border">
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
      </section>

      <Card className="surface-panel min-w-0 overflow-hidden border">
        <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-2">
              <CardTitle>Attempt history</CardTitle>
              <InfoHint>
                Each card is one attempt. Use it to follow the sequence of work on this task.
              </InfoHint>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AttemptGraph attempts={episode.attempts} />
          </CardContent>
        </Card>

      <section
        className={
          episode.attempts.length > 1
            ? "grid items-start gap-6 xl:grid-cols-[minmax(20rem,0.95fr)_minmax(0,1.05fr)]"
            : "grid items-start gap-6"
        }
      >
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-2">
              <CardTitle>Selected attempt</CardTitle>
              <InfoHint>
                Details for the attempt selected in the history view.
              </InfoHint>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {selectedAttempt ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {selectedActor?.secondary ?? "Source"}
                    </p>
                    <h2 className="text-pretty break-words text-xl font-semibold tracking-tight">
                      {selectedAttempt.attempt.summary ?? "Summary unavailable"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedActor?.primary}
                    </p>
                  </div>
                  <StatusBadge status={selectedAttempt.attempt.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Started
                    </p>
                    <p className="mt-2 break-words text-sm text-foreground">
                      {formatAbsoluteTime(selectedAttempt.attempt.started_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Ended
                    </p>
                    <p className="mt-2 break-words text-sm text-foreground">
                      {formatAbsoluteTime(selectedAttempt.attempt.ended_at)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Files touched</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttempt.fileTouches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {getFileTouchEmptyMessage(
                          selectedAttempt.attempt.file_count,
                          selectedAttempt.fileTouches,
                        )}
                      </p>
                    ) : (
                      selectedAttempt.fileTouches.map((touch) => (
                        <Badge
                          key={touch.id}
                          variant="outline"
                          className="max-w-full break-all border-white/10 bg-white/4 font-mono text-[11px]"
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
                      <p className="text-sm text-muted-foreground">No outcomes recorded.</p>
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
                                <span className="break-all font-mono text-xs">
                                  {outcome.error_sig}
                                </span>
                              </div>
                            ) : null}
                            {Array.isArray(outcome.details_json?.failing_tests) ? (
                              <div className="flex flex-wrap gap-2">
                                {outcome.details_json?.failing_tests.map((failingTest) => (
                                  <Badge
                                    key={failingTest}
                                    variant="outline"
                                    className="max-w-full break-all border-white/10 bg-white/4 font-mono text-[11px]"
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
                No attempts recorded for this task.
              </p>
            )}
          </CardContent>
        </Card>

        {episode.attempts.length > 1 ? (
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-2">
              <CardTitle>Attempts</CardTitle>
              <InfoHint>
                A simple list of attempts from earliest to latest.
              </InfoHint>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[min(42rem,calc(100vh-18rem))] min-h-[20rem]">
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
                        <div className="min-w-0 space-y-2">
                          <p className="text-pretty break-words font-medium text-foreground">
                            {record.attempt.summary ?? "Summary unavailable"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>
                              {
                                getActorPresentation(
                                  record.attempt.actor_type,
                                  record.attempt.actor_name,
                                ).primary
                              }
                            </span>
                            <span aria-hidden="true">&bull;</span>
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
                            className="max-w-full break-all border-white/10 bg-black/15 font-mono text-[11px]"
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
        ) : null}
      </section>
    </div>
  );
}
