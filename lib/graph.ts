import type { AttemptRecord } from "@/lib/types";

export interface AttemptGraphNodePosition {
  id: string;
  x: number;
  y: number;
}

export function buildAttemptGraphPositions(attempts: AttemptRecord[]) {
  const depthMap = new Map<string, number>();
  const byParent = new Map<string | null, AttemptRecord[]>();

  for (const record of attempts) {
    const parentId = record.attempt.parent_attempt_id;
    const bucket = byParent.get(parentId) ?? [];
    bucket.push(record);
    byParent.set(parentId, bucket);
  }

  const roots = attempts.filter((record) => {
    const parentId = record.attempt.parent_attempt_id;
    return !parentId || !attempts.some((candidate) => candidate.attempt.id === parentId);
  });

  const assignDepth = (record: AttemptRecord, depth: number) => {
    depthMap.set(record.attempt.id, depth);

    for (const child of byParent.get(record.attempt.id) ?? []) {
      assignDepth(child, depth + 1);
    }
  };

  for (const root of roots) {
    assignDepth(root, 0);
  }

  const columns = new Map<number, AttemptRecord[]>();

  for (const record of attempts) {
    const depth = depthMap.get(record.attempt.id) ?? 0;
    const column = columns.get(depth) ?? [];
    column.push(record);
    columns.set(depth, column);
  }

  const positions: AttemptGraphNodePosition[] = [];

  for (const [depth, column] of columns.entries()) {
    column.sort((left, right) =>
      left.attempt.started_at.localeCompare(right.attempt.started_at),
    );

    column.forEach((record, index) => {
      positions.push({
        id: record.attempt.id,
        x: depth * 284,
        y: index * 156,
      });
    });
  }

  return positions;
}
