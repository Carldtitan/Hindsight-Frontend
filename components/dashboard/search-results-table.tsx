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
import {
  getActorPresentation,
  getOutcomeHeadline,
  getSearchTabLabel,
  getTaskTitle,
} from "@/lib/display";
import { formatRelativeTime } from "@/lib/formatting";
import type { SearchResult } from "@/lib/types";

import { StatusBadge } from "./status-badge";

interface SearchResultsTableProps {
  projectId: string;
  results: SearchResult[];
}

export function SearchResultsTable({
  projectId,
  results,
}: SearchResultsTableProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-black/10">
      <Table className="min-w-[64rem] table-fixed">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 w-[34%] bg-slate-950/95 backdrop-blur">
              Match
            </TableHead>
            <TableHead className="w-[34%]">Task and attempt</TableHead>
            <TableHead className="w-[14%]">Result</TableHead>
            <TableHead className="w-[10%]">Actor</TableHead>
            <TableHead className="w-[8%]">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => {
            const actor = getActorPresentation(
              result.attempt.actor_type,
              result.attempt.actor_name,
            );

            return (
              <TableRow key={result.id} className="border-white/8 hover:bg-white/[0.03]">
                <TableCell className="sticky left-0 z-[1] min-w-[16rem] bg-slate-950/95 align-top backdrop-blur">
                  <div className="min-w-0 space-y-2">
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.16em]"
                    >
                      {getSearchTabLabel(result.matchedOn)}
                    </Badge>
                    <p className="whitespace-normal break-all font-mono text-sm text-foreground">
                      {result.matchedValue}
                    </p>
                    {result.note ? (
                      <p className="break-words text-xs text-muted-foreground">
                        {result.note}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="min-w-[20rem] align-top">
                  <Link
                    href={`/projects/${projectId}/attempts/${result.attempt.id}`}
                    className="block min-w-0 space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">
                      {result.task ? getTaskTitle(result.task) : "Task"}
                    </p>
                    <p className="text-pretty break-words font-medium text-foreground">
                      {result.attempt.summary ?? "Summary unavailable"}
                    </p>
                    {result.score !== undefined ? (
                      <p className="text-xs text-muted-foreground">
                        Similarity {(result.score * 100).toFixed(1)}%
                      </p>
                    ) : null}
                  </Link>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-2">
                    <StatusBadge status={result.attempt.status} />
                    <div className="break-words text-xs text-muted-foreground">
                      {getOutcomeHeadline(result.latestOutcome)}
                    </div>
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
                <TableCell className="align-top whitespace-nowrap text-sm text-muted-foreground">
                  {formatRelativeTime(result.attempt.started_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
