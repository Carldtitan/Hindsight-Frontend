import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAbsoluteTime, formatRelativeTime, titleCase } from "@/lib/formatting";
import type { Task } from "@/lib/types";

interface TaskTableProps {
  projectId: string;
  tasks: Task[];
}

export function TaskTable({ projectId, tasks }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/10">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead>Task</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="border-white/8 hover:bg-white/[0.03]">
              <TableCell className="min-w-[280px] align-top">
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}`}
                  className="block space-y-1"
                >
                  <span className="font-medium text-foreground">
                    {task.title ?? "Untitled task"}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {task.id}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="align-top text-sm text-muted-foreground">
                {task.source}
              </TableCell>
              <TableCell className="align-top text-sm text-muted-foreground">
                {titleCase(task.status)}
              </TableCell>
              <TableCell className="align-top">
                <span className="font-mono text-xs text-muted-foreground">
                  {task.branch ?? "No branch"}
                </span>
              </TableCell>
              <TableCell className="align-top text-sm text-muted-foreground">
                <div>{formatRelativeTime(task.created_at)}</div>
                <div className="font-mono text-xs text-muted-foreground/70">
                  {formatAbsoluteTime(task.created_at)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
