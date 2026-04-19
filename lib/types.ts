export const ATTEMPT_STATUSES = [
  "accepted",
  "failed",
  "reverted",
  "abandoned",
  "superseded",
  "in_progress",
] as const;

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export const OUTCOME_TYPES = [
  "tests_failed",
  "tests_passed",
  "build_failed",
  "build_passed",
  "reverted",
  "annotation",
] as const;

export type OutcomeType = (typeof OUTCOME_TYPES)[number];

export const SEARCH_TABS = [
  "path",
  "symbol",
  "failing-test",
  "error-signature",
  "semantic",
] as const;

export type SearchTab = (typeof SEARCH_TABS)[number];

export interface Project {
  id: string;
  name: string;
  repo_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string | null;
  source: string;
  branch: string | null;
  status: string;
  created_at: string;
  closed_at: string | null;
  synced_by: string | null;
}

export interface Attempt {
  id: string;
  project_id: string;
  task_id: string;
  parent_attempt_id: string | null;
  actor_type: string;
  actor_name: string;
  started_at: string;
  ended_at: string | null;
  status: AttemptStatus;
  summary: string | null;
  file_count: number;
  lines_added: number;
  lines_removed: number;
  synced_by: string | null;
}

export interface FileTouch {
  id: string;
  attempt_id: string;
  path: string;
  symbol: string | null;
  change_kind: string;
  added_lines: number;
  removed_lines: number;
}

export interface Outcome {
  id: string;
  attempt_id: string;
  outcome_type: OutcomeType | string;
  severity: string | null;
  error_sig: string | null;
  created_at: string;
  details_json: {
    failing_tests?: string[];
    [key: string]: unknown;
  } | null;
}

export interface TopDeadEndFile {
  path: string;
  fail_count: number;
}

export interface ProjectStats {
  failed_attempts_24h: number;
  successful_pivots_24h: number;
  top_dead_end_files: TopDeadEndFile[];
  active_tasks: number;
}

export interface SemanticMatch {
  id: string;
  task_id: string;
  summary: string | null;
  status: AttemptStatus;
  actor_name: string;
  started_at: string;
  ended_at: string | null;
  score: number;
}

export interface AttemptRecord {
  attempt: Attempt;
  fileTouches: FileTouch[];
  outcomes: Outcome[];
}

export interface ProjectChromeData {
  project: Project;
  activeTasks: Task[];
}

export interface ProjectOverviewData {
  project: Project;
  tasks: Task[];
  attempts: AttemptRecord[];
  stats: ProjectStats;
}

export interface TaskEpisodeData {
  project: Project;
  task: Task;
  attempts: AttemptRecord[];
}

export interface AttemptDetailData {
  project: Project;
  task: Task;
  attempt: AttemptRecord;
  lineage: AttemptRecord[];
}

export interface SearchResult {
  id: string;
  matchedOn: SearchTab;
  matchedValue: string;
  note: string | null;
  attempt: Attempt;
  score?: number;
}

export interface SearchResultsData {
  query: string;
  tab: SearchTab;
  results: SearchResult[];
  notice: string | null;
}
