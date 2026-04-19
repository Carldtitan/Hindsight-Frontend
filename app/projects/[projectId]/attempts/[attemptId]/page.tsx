import Link from "next/link";
import { ArrowLeft, Clock3, FileCode2, ListChecks, Network } from "lucide-react";
import { notFound } from "next/navigation";

import { InfoHint } from "@/components/dashboard/info-hint";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAttemptDetail } from "@/lib/data";
import {
  getActorPresentation,
  getFileTouchEmptyMessage,
  getOutcomeHeadline,
  getTaskTitle,
} from "@/lib/display";
import { formatAbsoluteTime, formatRelativeTime, titleCase } from "@/lib/formatting";
import { getOutcomeMeta } from "@/lib/status";

export default async function AttemptDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; attemptId: string }>;
}) {
  const { projectId, attemptId } = await params;
  const detail = await getAttemptDetail(projectId, attemptId);

  if (!detail) {
    notFound();
  }

  const selectedIndex = detail.lineage.findIndex(
    (record) => record.attempt.id === detail.attempt.attempt.id,
  );
  const actor = getActorPresentation(
    detail.attempt.attempt.actor_type,
    detail.attempt.attempt.actor_name,
  );
  const showLineageRail = detail.lineage.length > 1;

  return (
    <div className="min-w-0 space-y-8">
      <PageHeader
        eyebrow="Attempt"
        title={detail.attempt.attempt.summary ?? "Summary unavailable"}
        description="What changed in this attempt, and the result that came back."
        helpText="An attempt is one try at a task. Use this page to inspect its files, results, and neighboring attempts."
        breadcrumbs={[
          { title: "Projects", href: "/" },
          { title: detail.project.name, href: `/projects/${detail.project.id}` },
          {
            title: getTaskTitle(detail.task),
            href: `/projects/${detail.project.id}/tasks/${detail.task.id}`,
          },
          { title: "Attempt" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link
              href={`/projects/${detail.project.id}/tasks/${detail.task.id}?attempt=${detail.attempt.attempt.id}`}
            >
              <ArrowLeft className="size-4" />
              Back to task
            </Link>
          </Button>
        }
      />

      <section
        className={
          showLineageRail
            ? "grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
            : "grid items-start gap-6"
        }
      >
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {actor.secondary ?? "Source"}
                </p>
                <CardTitle className="break-words text-2xl">
                  {actor.primary}
                </CardTitle>
              </div>
              <StatusBadge status={detail.attempt.attempt.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="size-4 text-sky-300" />
                  Started
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {formatAbsoluteTime(detail.attempt.attempt.started_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeTime(detail.attempt.attempt.started_at)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="size-4 text-sky-300" />
                  Ended
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {formatAbsoluteTime(detail.attempt.attempt.ended_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {detail.attempt.attempt.ended_at
                    ? formatRelativeTime(detail.attempt.attempt.ended_at)
                    : "Open"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Files touched</h2>
              <div className="grid gap-3">
                {detail.attempt.fileTouches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {getFileTouchEmptyMessage(
                      detail.attempt.attempt.file_count,
                      detail.attempt.fileTouches,
                    )}
                  </p>
                ) : (
                  detail.attempt.fileTouches.map((touch) => (
                    <div
                      key={touch.id}
                      className="rounded-2xl border border-white/8 bg-black/15 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <FileCode2 className="size-4 text-sky-300" />
                            <span className="break-all font-mono">{touch.path}</span>
                          </div>
                          <p className="break-all text-xs text-muted-foreground">
                            {touch.symbol ?? "No symbol"} &middot;{" "}
                            {titleCase(touch.change_kind)}
                          </p>
                        </div>
                        <div className="text-right font-mono text-xs text-muted-foreground">
                          <div>+{touch.added_lines}</div>
                          <div>-{touch.removed_lines}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Outcomes</h2>
              <div className="grid gap-3">
                {detail.attempt.outcomes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No outcomes recorded.</p>
                ) : (
                  detail.attempt.outcomes.map((outcome) => (
                    <div
                      key={outcome.id}
                      className="rounded-2xl border border-white/8 bg-black/15 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Badge className={getOutcomeMeta(outcome.outcome_type).className}>
                            {getOutcomeMeta(outcome.outcome_type).label}
                          </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatAbsoluteTime(outcome.created_at)}
                        </span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <p className="break-words text-foreground">
                            {getOutcomeHeadline(outcome)}
                          </p>
                          {outcome.error_sig ? (
                            <p className="break-all font-mono text-xs text-foreground">
                              {outcome.error_sig}
                            </p>
                          ) : null}
                        {Array.isArray(outcome.details_json?.failing_tests) ? (
                          <div className="flex flex-wrap gap-2">
                            {outcome.details_json?.failing_tests.map((testName) => (
                              <Badge
                                key={testName}
                                variant="outline"
                                className="max-w-full break-all border-white/10 bg-white/4 font-mono text-[11px]"
                              >
                                <ListChecks className="size-3" />
                                {testName}
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
          </CardContent>
        </Card>

        {showLineageRail ? (
        <Card className="surface-panel min-w-0 border">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-3">
              <Network className="size-5 text-sky-300" />
              <div className="flex min-w-0 items-center gap-2">
                <CardTitle>Other attempts in this task</CardTitle>
                <InfoHint>
                  Other tries for the same task, shown in order.
                </InfoHint>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[min(42rem,calc(100vh-18rem))] min-h-[20rem]">
              <div className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {selectedIndex + 1} of {detail.lineage.length}
                </p>
                {detail.lineage.map((record) => (
                  <Link
                    key={record.attempt.id}
                    href={`/projects/${projectId}/attempts/${record.attempt.id}`}
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
