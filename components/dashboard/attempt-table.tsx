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
import { getOutcomeMeta } from "@/lib/status";
import type { AttemptRecord } from "@/lib/types";

import { StatusBadge } from "./status-badge";

interface AttemptTableProps {
  projectId: string;
  attempts: AttemptRecord[];
}

export function AttemptTable({ projectId, attempts }: AttemptTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/10">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead>Attempt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Files</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((record) => {
            const latestOutcome = record.outcomes[0];

            return (
              <TableRow
                key={record.attempt.id}
                className="border-white/8 hover:bg-white/[0.03]"
              >
                <TableCell className="min-w-[340px] align-top">
                  <Link
                    href={`/projects/${projectId}/attempts/${record.attempt.id}`}
                    className="block space-y-2"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {record.attempt.summary ?? "No summary generated yet"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {record.attempt.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.fileTouches.slice(0, 3).map((touch) => (
                        <Badge
                          key={touch.id}
                          variant="outline"
                          className="border-white/10 bg-white/5 font-mono text-[11px]"
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
                      <Badge
                        className={getOutcomeMeta(latestOutcome.outcome_type).className}
                      >
                        {getOutcomeMeta(latestOutcome.outcome_type).label}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-foreground">
                      {record.attempt.actor_name}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {record.attempt.actor_type}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{record.attempt.file_count} touched</div>
                    <div className="font-mono text-xs">
                      {record.fileTouches[0]?.symbol ?? "No symbol data"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-1 font-mono text-xs text-muted-foreground">
                    <div>{formatDelta(record.attempt.lines_added)} lines added</div>
                    <div>{formatDelta(-record.attempt.lines_removed)} lines removed</div>
                  </div>
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">
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
