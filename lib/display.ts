import { getOutcomeMeta } from "@/lib/status";
import { titleCase } from "@/lib/formatting";
import type { FileTouch, Outcome, SearchTab, Task } from "@/lib/types";

function cleanValue(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function getShortId(value: string, length = 8) {
  return value.slice(0, length);
}

export function getTaskTitle(task: Pick<Task, "id" | "title">) {
  const title = cleanValue(task.title);
  return title.length > 0 ? title : `Task ${getShortId(task.id)}`;
}

export function getTaskStatusLabel(status: string) {
  switch (status) {
    case "ongoing":
      return "Open";
    case "closed_success":
      return "Closed";
    default:
      return titleCase(status);
  }
}

export function getTaskSourceLabel(source: string) {
  switch (source) {
    case "human":
      return "Human";
    case "agent":
      return "Agent";
    default:
      return titleCase(source);
  }
}

export function getBranchLabel(branch: string | null) {
  const value = cleanValue(branch);
  return value.length > 0 ? value : null;
}

export function getActorPresentation(actorType: string, actorName: string) {
  const typeLabel = titleCase(cleanValue(actorType) || "unknown");
  const nameLabel = cleanValue(actorName);

  if (
    nameLabel.length === 0 ||
    nameLabel.toLowerCase() === "system" ||
    nameLabel.toLowerCase() === typeLabel.toLowerCase()
  ) {
    return {
      primary: typeLabel,
      secondary: null,
    };
  }

  return {
    primary: nameLabel,
    secondary: typeLabel,
  };
}

export function getProjectRepoLabel(repoUrl: string | null) {
  const value = cleanValue(repoUrl);

  if (value.length === 0) {
    return "Repository not linked";
  }

  const sshMatch = value.match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/);

  if (sshMatch?.[1]) {
    return sshMatch[1];
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const pathname = url.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
    return pathname || url.hostname;
  } catch {
    return value.replace(/\.git$/, "");
  }
}

export function getProjectRepoHref(repoUrl: string | null) {
  const value = cleanValue(repoUrl);

  if (value.length === 0) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("git@")) {
    const sshMatch = value.match(/^git@[^:]+:([^/]+\/[^/]+?)(?:\.git)?$/);
    return sshMatch?.[1] ? `https://github.com/${sshMatch[1]}` : null;
  }

  if (value.includes("/")) {
    return `https://github.com/${value.replace(/\.git$/, "")}`;
  }

  return `https://${value.replace(/\.git$/, "")}`;
}

export function getTouchedFilePaths(
  fileTouches: Pick<FileTouch, "path">[],
  limit?: number,
) {
  const paths: string[] = [];
  const seen = new Set<string>();

  for (const touch of fileTouches) {
    const path = cleanValue(touch.path);

    if (path.length === 0 || seen.has(path)) {
      continue;
    }

    seen.add(path);
    paths.push(path);
  }

  return typeof limit === "number" ? paths.slice(0, limit) : paths;
}

export function getFileTouchEmptyMessage(
  fileCount: number,
  fileTouches: Pick<FileTouch, "path">[],
) {
  const paths = getTouchedFilePaths(fileTouches);

  if (paths.length > 0) {
    return null;
  }

  if (fileCount > 0) {
    return `This attempt reports ${fileCount} touched file${
      fileCount === 1 ? "" : "s"
    }, but no file-level records were synced.`;
  }

  return "No file touch records were synced for this attempt.";
}

export function getSearchTabLabel(tab: SearchTab) {
  switch (tab) {
    case "path":
      return "File path";
    case "symbol":
      return "Symbol";
    case "failing-test":
      return "Failing test";
    case "error-signature":
      return "Error";
    case "semantic":
      return "Meaning";
    default:
      return titleCase(tab);
  }
}

export function getSearchPlaceholder(tab: SearchTab) {
  switch (tab) {
    case "path":
      return "Find a file path";
    case "symbol":
      return "Find a function, class, or symbol";
    case "failing-test":
      return "Find a failing test name";
    case "error-signature":
      return "Find an error message or signature";
    case "semantic":
      return "Describe the kind of work or failure";
    default:
      return "Search";
  }
}

export function getOutcomeHeadline(outcome: Outcome | null | undefined) {
  if (!outcome) {
    return "No recorded result";
  }

  return outcome.error_sig?.trim() || getOutcomeMeta(outcome.outcome_type).label;
}

export function getOutcomeSubline(outcome: Outcome | null | undefined) {
  if (!outcome) {
    return null;
  }

  const failingTests = Array.isArray(outcome.details_json?.failing_tests)
    ? outcome.details_json?.failing_tests
    : [];

  if (failingTests.length > 0) {
    return failingTests.slice(0, 2).join(", ");
  }

  return getOutcomeMeta(outcome.outcome_type).label;
}
