import { FileWarning } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatting";
import type { TopDeadEndFile } from "@/lib/types";

interface TopDeadEndFilesProps {
  files: TopDeadEndFile[];
}

export function TopDeadEndFiles({ files }: TopDeadEndFilesProps) {
  return (
    <Card className="surface-panel border">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-2.5 text-amber-300">
            <FileWarning className="size-5" />
          </div>
          <div>
            <CardTitle>Top dead-end files</CardTitle>
            <p className="text-sm text-muted-foreground">
              Paths absorbing the highest volume of failed or reverted work.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No failure hotspots have been recorded yet.
          </p>
        ) : (
          files.map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-foreground">{file.path}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Failure density
                </p>
              </div>
              <div className="rounded-full border border-amber-500/25 bg-amber-500/8 px-3 py-1 font-mono text-sm text-amber-200">
                {formatNumber(file.fail_count)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
