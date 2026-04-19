import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAbsoluteTime, formatDelta, formatRelativeTime } from "@/lib/formatting";
import { getActorPresentation, getOutcomeHeadline } from "@/lib/display";
import { getOutcomeMeta } from "@/lib/status";
import type { AttemptRecord } from "@/lib/types";

import { StatusBadge } from "./status-badge";

interface AttemptTableProps {
  projectId: string;
  attempts: AttemptRecord[];
}

export function AttemptTable({ projectId, attempts }: AttemptTableProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-black/10">
      <Table className="min-w-[62rem] table-fixed">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 w-[38%] bg-slate-950/95 backdrop-blur">
              Attempt
            </TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[12%]">Actor</TableHead>
            <TableHead className="w-[14%]">Files</TableHead>
            <TableHead className="w-[12%]">Impact</TableHead>
            <TableHead className="w-[12%]">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((record) => {
            const latestOutcome = record.outcomes[0];
            const actor = getActorPresentation(
              record.attempt.actor_type,
              record.attempt.actor_name,
            );

            return (
              <TableRow
                key={record.attempt.id}
                className="border-white/8 hover:bg-white/[0.03]"
              >
                <TableCell className="sticky left-0 z-[1] min-w-[18rem] bg-slate-950/95 align-top backdrop-blur">
                  <Link
                    href={`/projects/${projectId}/attempts/${record.attempt.id}`}
                    className="block min-w-0 space-y-2"
                  >
                    <div className="space-y-1">
                      <p className="text-pretty break-words font-medium text-foreground">
                        {record.attempt.summary ?? "Summary unavailable"}
                      </p>
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        {record.attempt.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.fileTouches.slice(0, 3).map((touch) => (
                        <Badge
                          key={touch.id}
                          variant="outline"
                          className="max-w-full break-all border-white/10 bg-white/5 font-mono text-[11px]"
                        >
                          {touch.path}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-2">
                    <StatusBadge status={record.attempt.status} />
                    {latestOutcome ? (
                      <div className="space-y-1">
                        <Badge
                          className={getOutcomeMeta(latestOutcome.outcome_type).className}
                        >
                          {getOutcomeMeta(latestOutcome.outcome_type).label}
                        </Badge>
                        <div className="max-w-[12rem] break-words text-xs text-muted-foreground">
                          {getOutcomeHeadline(latestOutcome)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="min-w-0 space-y-1 text-sm">
                    <div className="break-words font-medium text-foreground">
                      {actor.primary}
                    </div>
                    {actor.secondary ? (
                      <div className="break-all text-xs text-muted-foreground">
                        {actor.secondary}
                      </div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="min-w-0 space-y-1 text-sm text-muted-foreground">
                    <div>{record.attempt.file_count} touched</div>
                    <div className="whitespace-normal break-all font-mono text-xs">
                      {record.fileTouches[0]?.symbol ??
                        record.fileTouches[0]?.path ??
                        "No file details"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top whitespace-nowrap">
                  <div className="space-y-1 font-mono text-xs text-muted-foreground">
                    <div>{formatDelta(record.attempt.lines_added)} lines added</div>
                    <div>{formatDelta(-record.attempt.lines_removed)} lines removed</div>
                  </div>
                </TableCell>
                <TableCell className="align-top whitespace-nowrap text-sm text-muted-foreground">
                  <div>{formatRelativeTime(record.attempt.started_at)}</div>
                  <div className="font-mono text-xs text-muted-foreground/70">
                    {formatAbsoluteTime(record.attempt.started_at)}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
