import { FileWarning } from "lucide-react";

import { InfoHint } from "@/components/dashboard/info-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatRelativeTime } from "@/lib/formatting";
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
          <div className="flex items-center gap-2">
            <CardTitle>Files with the most failed work</CardTitle>
            <InfoHint>
              Files that appear most often in failed or reverted attempts.
            </InfoHint>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hotspots yet.</p>
        ) : (
          files.map((file) => (
            <div
              key={file.path}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="truncate font-mono text-sm text-foreground">{file.path}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Failed attempts
                    </p>
                  </div>
                  {file.latest_failure_summary ? (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Latest failure
                      </p>
                      <p className="text-sm text-foreground">
                        {file.latest_failure_summary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.latest_failure_signal ?? "Failure recorded"}
                        {file.latest_failure_at
                          ? ` · ${formatRelativeTime(file.latest_failure_at)}`
                          : ""}
                      </p>
                    </div>
                  ) : null}
                  {file.latest_recovery_summary ? (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Latest fix
                      </p>
                      <p className="text-sm text-foreground">
                        {file.latest_recovery_summary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.latest_recovery_at
                          ? formatRelativeTime(file.latest_recovery_at)
                          : "Accepted attempt"}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="rounded-full border border-amber-500/25 bg-amber-500/8 px-3 py-1 font-mono text-sm text-amber-200">
                  {formatNumber(file.fail_count)}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
