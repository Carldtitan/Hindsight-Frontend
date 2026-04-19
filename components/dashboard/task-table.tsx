import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBranchLabel,
  getOutcomeHeadline,
  getTaskSourceLabel,
  getTaskStatusLabel,
  getTaskTitle,
} from "@/lib/display";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/formatting";
import type { TaskSummary } from "@/lib/types";

interface TaskTableProps {
  projectId: string;
  tasks: TaskSummary[];
}

export function TaskTable({ projectId, tasks }: TaskTableProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-black/10">
      <Table className="min-w-[52rem] table-fixed">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 w-[38%] bg-slate-950/95 backdrop-blur">
              Task
            </TableHead>
            <TableHead className="w-[14%]">Status</TableHead>
            <TableHead className="w-[12%]">Attempts</TableHead>
            <TableHead className="w-[22%]">Latest result</TableHead>
            <TableHead className="w-[14%]">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map(({ task, attemptCount, latestAttempt, latestOutcome }) => {
            const branchLabel = getBranchLabel(task.branch);

            return (
              <TableRow key={task.id} className="border-white/8 hover:bg-white/[0.03]">
                <TableCell className="sticky left-0 z-[1] min-w-[18rem] bg-slate-950/95 align-top backdrop-blur">
                  <Link
                    href={`/projects/${projectId}/tasks/${task.id}`}
                    className="block min-w-0 space-y-1"
                  >
                    <span className="block text-pretty break-words font-medium text-foreground">
                      {getTaskTitle(task)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {branchLabel
                        ? `${getTaskSourceLabel(task.source)} · ${branchLabel}`
                        : getTaskSourceLabel(task.source)}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">
                  {getTaskStatusLabel(task.status)}
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">
                  {attemptCount}
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div className="break-words text-foreground">
                      {latestOutcome
                        ? getOutcomeHeadline(latestOutcome)
                        : latestAttempt?.summary ?? "Attempt recorded"}
                    </div>
                    {latestAttempt ? (
                      <div className="break-words text-xs text-muted-foreground">
                        {latestAttempt.summary ?? "Latest attempt recorded"}
                      </div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="align-top whitespace-nowrap text-sm text-muted-foreground">
                  <div>{formatRelativeTime(latestAttempt?.started_at ?? task.created_at)}</div>
                  <div className="font-mono text-xs text-muted-foreground/70">
                    {formatAbsoluteTime(latestAttempt?.started_at ?? task.created_at)}
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
