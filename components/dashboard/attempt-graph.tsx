"use client";

import { useEffect, useRef, useState } from "react";
import { ScanSearch, ZoomIn, ZoomOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Background,
  ControlButton,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  useReactFlow,
} from "@xyflow/react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActorPresentation, getOutcomeHeadline } from "@/lib/display";
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
  const actor = getActorPresentation(record.attempt.actor_type, record.attempt.actor_name);

  return (
    <Card
      className={cn(
        "w-[240px] border bg-card/95 p-4 shadow-2xl backdrop-blur-sm md:w-[260px]",
        meta.graphClassName,
      )}
    >
      <Handle type="target" position={Position.Left} className="border-none bg-sky-400" />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={record.attempt.status} />
          <Badge
            variant="outline"
            className="max-w-[8rem] break-all border-white/10 bg-black/15 font-mono text-[11px]"
          >
            {actor.primary}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="line-clamp-3 break-words text-sm font-medium text-foreground">
            {record.attempt.summary ?? "Summary unavailable"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {record.fileTouches.slice(0, 2).map((touch) => (
            <Badge
              key={touch.id}
              variant="outline"
              className="max-w-full break-all border-white/10 bg-white/5 font-mono text-[11px]"
            >
              {touch.path}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{formatRelativeTime(record.attempt.started_at)}</span>
          <span>{getOutcomeHeadline(latestOutcome)}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="border-none bg-sky-400" />
    </Card>
  );
}

const nodeTypes = {
  attempt: AttemptGraphNode,
} satisfies NodeTypes;

const controlButtonClassName =
  "!flex !size-10 !items-center !justify-center !border-0 !bg-transparent !text-slate-100 transition-colors hover:!bg-white/8";

function AttemptGraphControls() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  return (
    <Controls
      showZoom={false}
      showFitView={false}
      showInteractive={false}
      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-lg"
    >
      <ControlButton
        aria-label="Zoom in"
        title="Zoom in"
        className={controlButtonClassName}
        onClick={() => {
          void zoomIn({ duration: 180 });
        }}
      >
        <ZoomIn className="size-4" />
      </ControlButton>
      <ControlButton
        aria-label="Zoom out"
        title="Zoom out"
        className={controlButtonClassName}
        onClick={() => {
          void zoomOut({ duration: 180 });
        }}
      >
        <ZoomOut className="size-4" />
      </ControlButton>
      <ControlButton
        aria-label="Fit graph"
        title="Fit graph"
        className={controlButtonClassName}
        onClick={() => {
          void fitView({ duration: 220, maxZoom: 1, padding: 0.18 });
        }}
      >
        <ScanSearch className="size-4" />
      </ControlButton>
    </Controls>
  );
}

function AttemptGraphAutoFit({
  width,
  height,
  nodeCount,
}: {
  width: number;
  height: number;
  nodeCount: number;
}) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (width === 0 || height === 0 || nodeCount === 0) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      void fitView({ duration: 220, maxZoom: 1, padding: 0.12 });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fitView, height, nodeCount, width]);

  return null;
}

export function AttemptGraph({ attempts }: AttemptGraphProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const positions = buildAttemptGraphPositions(attempts);
  const compactMode = attempts.length <= 2;
  const graphHeight =
    attempts.length <= 2 ? "auto" : attempts.length <= 4 ? "h-[360px]" : "h-[480px]";

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateSize = (width: number, height: number) => {
      setContainerSize((current) => {
        const nextWidth = Math.round(width);
        const nextHeight = Math.round(height);

        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateSize(container.clientWidth, container.clientHeight);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

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

  const isReady = containerSize.width > 0 && containerSize.height > 0;

  if (compactMode) {
    return (
      <div className="grid gap-4 p-6 md:grid-cols-2">
        {attempts.map((record, index) => {
          const actor = getActorPresentation(
            record.attempt.actor_type,
            record.attempt.actor_name,
          );
          const latestOutcome = record.outcomes[0];

          return (
            <button
              key={record.attempt.id}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("attempt", record.attempt.id);
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              className="rounded-3xl border border-white/10 bg-black/15 p-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Attempt {index + 1}
                    </p>
                    <p className="text-pretty break-words font-medium text-foreground">
                      {record.attempt.summary ?? "Summary unavailable"}
                    </p>
                  </div>
                  <StatusBadge status={record.attempt.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.fileTouches.slice(0, 2).map((touch) => (
                    <Badge
                      key={touch.id}
                      variant="outline"
                      className="max-w-full break-all border-white/10 bg-white/5 font-mono text-[11px]"
                    >
                      {touch.path}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>{actor.primary}</div>
                  <div>{getOutcomeHeadline(latestOutcome)}</div>
                  <div>{formatRelativeTime(record.attempt.started_at)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        graphHeight,
        "w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-black/20",
      )}
    >
      {isReady ? (
        <ReactFlow
          aria-label="Attempt history"
          minZoom={0.3}
          maxZoom={1}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          zoomOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("attempt", node.id);
            router.push(`?${params.toString()}`, { scroll: false });
          }}
        >
          <AttemptGraphAutoFit
            width={containerSize.width}
            height={containerSize.height}
            nodeCount={attempts.length}
          />
          <Background gap={24} size={1} color="rgba(255,255,255,0.08)" />
          <AttemptGraphControls />
        </ReactFlow>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Loading attempt history
        </div>
      )}
    </div>
  );
}
