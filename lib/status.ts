import type { AttemptStatus, OutcomeType } from "@/lib/types";

export const ATTEMPT_STATUS_META: Record<
  AttemptStatus,
  {
    label: string;
    badgeClassName: string;
    dotClassName: string;
    graphClassName: string;
  }
> = {
  accepted: {
    label: "Accepted",
    badgeClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
    graphClassName: "border-emerald-500/40 bg-emerald-500/10",
  },
  failed: {
    label: "Failed",
    badgeClassName: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dotClassName: "bg-rose-400",
    graphClassName: "border-rose-500/40 bg-rose-500/10",
  },
  reverted: {
    label: "Reverted",
    badgeClassName: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClassName: "bg-amber-400",
    graphClassName: "border-amber-500/40 bg-amber-500/10",
  },
  abandoned: {
    label: "Abandoned",
    badgeClassName: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    dotClassName: "bg-slate-400",
    graphClassName: "border-slate-500/40 bg-slate-500/10",
  },
  superseded: {
    label: "Superseded",
    badgeClassName: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    dotClassName: "bg-sky-400",
    graphClassName: "border-sky-500/40 bg-sky-500/10",
  },
  in_progress: {
    label: "In progress",
    badgeClassName:
      "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 animate-pulse",
    dotClassName: "bg-indigo-400 animate-pulse",
    graphClassName: "border-indigo-500/40 bg-indigo-500/10",
  },
};

export const OUTCOME_META: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  tests_failed: {
    label: "Tests failed",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  tests_passed: {
    label: "Tests passed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  build_failed: {
    label: "Build failed",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  },
  build_passed: {
    label: "Build passed",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  reverted: {
    label: "Reverted",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  annotation: {
    label: "Annotation",
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  },
};

export function getAttemptStatusMeta(status: AttemptStatus) {
  return ATTEMPT_STATUS_META[status];
}

export function getOutcomeMeta(outcomeType: OutcomeType | string) {
  return (
    OUTCOME_META[outcomeType] ?? {
      label: outcomeType.replaceAll("_", " "),
      className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
    }
  );
}
