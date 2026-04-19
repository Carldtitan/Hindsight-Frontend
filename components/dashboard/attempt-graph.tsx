"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buildAttemptGraphPositions } from "@/lib/graph";
import { formatRelativeTime } from "@/lib/formatting";
import { getAttemptStatusMeta } from "@/lib/status";
import type { AttemptRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./status-badge";

interface AttemptGraphProps {
  attempts: AttemptRecord[];
}

type AttemptNodeData = {
  record: AttemptRecord;
};

type AttemptFlowNode = Node<AttemptNodeData, "attempt">;

function AttemptGraphNode({ data }: NodeProps<AttemptFlowNode>) {
  const record = data.record;
  const meta = getAttemptStatusMeta(record.attempt.status);
  const latestOutcome = record.outcomes[0];

  return (
    <Card
      className={cn(
        "w-[280px] border bg-card/95 p-4 shadow-2xl backdrop-blur-sm",
        meta.graphClassName,
      )}
    >
      <Handle type="target" position={Position.Left} className="border-none bg-sky-400" />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={record.attempt.status} />
          <Badge variant="outline" className="border-white/10 bg-black/15 font-mono text-[11px]">
            {record.attempt.actor_name}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="line-clamp-3 text-sm font-medium text-foreground">
            {record.attempt.summary ?? "No summary generated yet"}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {record.attempt.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {record.fileTouches.slice(0, 2).map((touch) => (
            <Badge
              key={touch.id}
              variant="outline"
              className="border-white/10 bg-white/5 font-mono text-[11px]"
            >
              {touch.path}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{formatRelativeTime(record.attempt.started_at)}</span>
          <span>{latestOutcome?.outcome_type ?? "No outcome"}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="border-none bg-sky-400" />
    </Card>
  );
}

const nodeTypes = {
  attempt: AttemptGraphNode,
} satisfies NodeTypes;

export function AttemptGraph({ attempts }: AttemptGraphProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const positions = buildAttemptGraphPositions(attempts);

  const nodes: AttemptFlowNode[] = attempts.map((record) => {
    const position =
      positions.find((candidate) => candidate.id === record.attempt.id) ?? {
        x: 0,
        y: 0,
      };

    return {
      id: record.attempt.id,
      type: "attempt",
      position,
      data: { record },
    };
  });

  const edges: Edge[] = attempts
    .filter((record) => record.attempt.parent_attempt_id)
    .map((record) => ({
      id: `${record.attempt.parent_attempt_id}-${record.attempt.id}`,
      source: record.attempt.parent_attempt_id!,
      target: record.attempt.id,
      animated: record.attempt.status === "in_progress",
      markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(91, 156, 255, 0.7)" },
      style: { stroke: "rgba(91, 156, 255, 0.45)", strokeWidth: 1.5 },
    }));

  return (
    <div className="h-[480px] overflow-hidden rounded-3xl border border-white/10 bg-black/20">
      <ReactFlow
        fitView
        minZoom={0.4}
        maxZoom={1.2}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("attempt", node.id);
          router.push(`?${params.toString()}`, { scroll: false });
        }}
      >
        <Background gap={24} size={1} color="rgba(255,255,255,0.08)" />
        <Controls className="rounded-2xl border border-white/10 bg-slate-950/90 text-white" />
      </ReactFlow>
    </div>
  );
}
