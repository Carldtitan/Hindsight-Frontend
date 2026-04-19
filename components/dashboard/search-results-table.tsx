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
import { formatRelativeTime, titleCase } from "@/lib/formatting";
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
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/10">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead>Match</TableHead>
            <TableHead>Attempt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id} className="border-white/8 hover:bg-white/[0.03]">
              <TableCell className="min-w-[240px] align-top">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.16em]">
                    {titleCase(result.matchedOn)}
                  </Badge>
                  <p className="font-mono text-sm text-foreground">{result.matchedValue}</p>
                  {result.note ? (
                    <p className="text-xs text-muted-foreground">{result.note}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="min-w-[320px] align-top">
                <Link
                  href={`/projects/${projectId}/attempts/${result.attempt.id}`}
                  className="block space-y-1"
                >
                  <p className="font-medium text-foreground">
                    {result.attempt.summary ?? "No summary generated yet"}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {result.attempt.id}
                  </p>
                </Link>
              </TableCell>
              <TableCell className="align-top">
                <StatusBadge status={result.attempt.status} />
              </TableCell>
              <TableCell className="align-top">
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-foreground">
                    {result.attempt.actor_name}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {result.attempt.actor_type}
                  </div>
                </div>
              </TableCell>
              <TableCell className="align-top text-sm text-muted-foreground">
                {formatRelativeTime(result.attempt.started_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
