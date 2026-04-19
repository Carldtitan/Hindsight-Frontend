import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Attempt,
  AttemptDetailData,
  AttemptRecord,
  FileTouch,
  Outcome,
  Project,
  ProjectChromeData,
  ProjectOverviewData,
  ProjectStats,
  SearchResult,
  SearchResultsData,
  SearchTab,
  SemanticMatch,
  Task,
  TaskEpisodeData,
  TopDeadEndFile,
} from "@/lib/types";

function ensureClient() {
  return createServerSupabaseClient();
}

function throwIfError(context: string, error: PostgrestError | null) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function normalizeStats(payload: unknown): ProjectStats {
  const raw = Array.isArray(payload) ? payload[0] : payload;
  const stats = (raw ?? {}) as Partial<ProjectStats> & {
    top_dead_end_files?: TopDeadEndFile[] | null;
  };

  return {
    failed_attempts_24h: stats.failed_attempts_24h ?? 0,
    successful_pivots_24h: stats.successful_pivots_24h ?? 0,
    active_tasks: stats.active_tasks ?? 0,
    top_dead_end_files: Array.isArray(stats.top_dead_end_files)
      ? stats.top_dead_end_files
      : [],
  };
}

function coerceAttempt(candidate: unknown): Attempt | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  return candidate as Attempt;
}

async function getFileTouchesByAttemptId(
  client: SupabaseClient,
  attemptIds: string[],
) {
  if (attemptIds.length === 0) {
    return new Map<string, FileTouch[]>();
  }

  const { data, error } = await client
    .from("file_touches")
    .select("*")
    .in("attempt_id", attemptIds);

  throwIfError("Loading file touches failed", error);

  const grouped = new Map<string, FileTouch[]>();

  for (const touch of (data ?? []) as FileTouch[]) {
    const bucket = grouped.get(touch.attempt_id) ?? [];
    bucket.push(touch);
    grouped.set(touch.attempt_id, bucket);
  }

  return grouped;
}

async function getOutcomesByAttemptId(
  client: SupabaseClient,
  attemptIds: string[],
) {
  if (attemptIds.length === 0) {
    return new Map<string, Outcome[]>();
  }

  const { data, error } = await client
    .from("outcomes")
    .select("*")
    .in("attempt_id", attemptIds)
    .order("created_at", { ascending: false });

  throwIfError("Loading outcomes failed", error);

  const grouped = new Map<string, Outcome[]>();

  for (const outcome of (data ?? []) as Outcome[]) {
    const bucket = grouped.get(outcome.attempt_id) ?? [];
    bucket.push(outcome);
    grouped.set(outcome.attempt_id, bucket);
  }

  return grouped;
}

async function bundleAttemptRecords(
  client: SupabaseClient,
  attempts: Attempt[],
): Promise<AttemptRecord[]> {
  const attemptIds = attempts.map((attempt) => attempt.id);
  const [fileTouchesByAttemptId, outcomesByAttemptId] = await Promise.all([
    getFileTouchesByAttemptId(client, attemptIds),
    getOutcomesByAttemptId(client, attemptIds),
  ]);

  return attempts.map((attempt) => ({
    attempt,
    fileTouches: fileTouchesByAttemptId.get(attempt.id) ?? [],
    outcomes: outcomesByAttemptId.get(attempt.id) ?? [],
  }));
}

export async function getProjects() {
  const client = ensureClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  throwIfError("Loading projects failed", error);

  return (data ?? []) as Project[];
}

export async function getProjectChrome(projectId: string): Promise<ProjectChromeData | null> {
  const client = ensureClient();

  if (!client) {
    return null;
  }

  const [{ data: project, error: projectError }, { data: activeTasks, error: taskError }] =
    await Promise.all([
      client.from("projects").select("*").eq("id", projectId).maybeSingle(),
      client
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "ongoing")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  throwIfError("Loading project failed", projectError);
  throwIfError("Loading active tasks failed", taskError);

  if (!project) {
    return null;
  }

  return {
    project: project as Project,
    activeTasks: (activeTasks ?? []) as Task[],
  };
}

export async function getProjectOverview(
  projectId: string,
): Promise<ProjectOverviewData | null> {
  const client = ensureClient();

  if (!client) {
    return null;
  }

  const [
    { data: project, error: projectError },
    { data: tasks, error: tasksError },
    { data: attempts, error: attemptsError },
    statsResponse,
  ] = await Promise.all([
    client.from("projects").select("*").eq("id", projectId).maybeSingle(),
    client
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(20),
    client
      .from("attempts")
      .select("*")
      .eq("project_id", projectId)
      .order("started_at", { ascending: false })
      .limit(16),
    client.rpc("project_stats", { project_id_input: projectId }),
  ]);

  throwIfError("Loading project failed", projectError);
  throwIfError("Loading tasks failed", tasksError);
  throwIfError("Loading attempts failed", attemptsError);

  if (!project) {
    return null;
  }

  const bundledAttempts = await bundleAttemptRecords(
    client,
    ((attempts ?? []) as Attempt[]).sort((left, right) =>
      right.started_at.localeCompare(left.started_at),
    ),
  );

  return {
    project: project as Project,
    tasks: (tasks ?? []) as Task[],
    attempts: bundledAttempts,
    stats: statsResponse.error ? normalizeStats(null) : normalizeStats(statsResponse.data),
  };
}

export async function getTaskEpisode(
  projectId: string,
  taskId: string,
): Promise<TaskEpisodeData | null> {
  const client = ensureClient();

  if (!client) {
    return null;
  }

  const [
    { data: project, error: projectError },
    { data: task, error: taskError },
    { data: attempts, error: attemptsError },
  ] = await Promise.all([
    client.from("projects").select("*").eq("id", projectId).maybeSingle(),
    client
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("project_id", projectId)
      .maybeSingle(),
    client
      .from("attempts")
      .select("*")
      .eq("task_id", taskId)
      .eq("project_id", projectId)
      .order("started_at", { ascending: true }),
  ]);

  throwIfError("Loading project failed", projectError);
  throwIfError("Loading task failed", taskError);
  throwIfError("Loading task attempts failed", attemptsError);

  if (!project || !task) {
    return null;
  }

  return {
    project: project as Project,
    task: task as Task,
    attempts: await bundleAttemptRecords(client, (attempts ?? []) as Attempt[]),
  };
}

export async function getAttemptDetail(
  projectId: string,
  attemptId: string,
): Promise<AttemptDetailData | null> {
  const client = ensureClient();

  if (!client) {
    return null;
  }

  const [
    { data: project, error: projectError },
    { data: attempt, error: attemptError },
  ] = await Promise.all([
    client.from("projects").select("*").eq("id", projectId).maybeSingle(),
    client
      .from("attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  throwIfError("Loading project failed", projectError);
  throwIfError("Loading attempt failed", attemptError);

  if (!project || !attempt) {
    return null;
  }

  const [{ data: task, error: taskError }, { data: lineage, error: lineageError }] =
    await Promise.all([
      client
        .from("tasks")
        .select("*")
        .eq("id", (attempt as Attempt).task_id)
        .eq("project_id", projectId)
        .maybeSingle(),
      client
        .from("attempts")
        .select("*")
        .eq("task_id", (attempt as Attempt).task_id)
        .eq("project_id", projectId)
        .order("started_at", { ascending: true }),
    ]);

  throwIfError("Loading task failed", taskError);
  throwIfError("Loading lineage failed", lineageError);

  if (!task) {
    return null;
  }

  const bundledLineage = await bundleAttemptRecords(client, (lineage ?? []) as Attempt[]);
  const selectedAttempt =
    bundledLineage.find((record) => record.attempt.id === attemptId) ??
    ({
      attempt: attempt as Attempt,
      fileTouches: [],
      outcomes: [],
    } satisfies AttemptRecord);

  if (selectedAttempt.fileTouches.length === 0 && selectedAttempt.outcomes.length === 0) {
    const [touchMap, outcomeMap] = await Promise.all([
      getFileTouchesByAttemptId(client, [attemptId]),
      getOutcomesByAttemptId(client, [attemptId]),
    ]);

    selectedAttempt.fileTouches = touchMap.get(attemptId) ?? [];
    selectedAttempt.outcomes = outcomeMap.get(attemptId) ?? [];
  }

  return {
    project: project as Project,
    task: task as Task,
    attempt: selectedAttempt,
    lineage: bundledLineage,
  };
}

function buildSearchResult(
  attempt: Attempt,
  matchedOn: SearchTab,
  matchedValue: string,
  note: string | null,
  score?: number,
): SearchResult {
  return {
    id: `${matchedOn}:${attempt.id}:${matchedValue}`,
    matchedOn,
    matchedValue,
    note,
    attempt,
    score,
  };
}

export async function searchProject(
  projectId: string,
  query: string,
  tab: SearchTab,
): Promise<SearchResultsData> {
  const client = ensureClient();
  const trimmedQuery = query.trim();

  if (!client || trimmedQuery.length === 0) {
    return {
      query: trimmedQuery,
      tab,
      results: [],
      notice: null,
    };
  }

  if (tab === "path" || tab === "symbol") {
    const column = tab === "path" ? "path" : "symbol";
    const { data, error } = await client
      .from("file_touches")
      .select(
        "id, attempt_id, path, symbol, change_kind, added_lines, removed_lines, attempts!inner(*)",
      )
      .eq("attempts.project_id", projectId)
      .ilike(column, `%${trimmedQuery}%`)
      .limit(50);

    throwIfError(`Searching ${tab} failed`, error);

    const results = (data ?? [])
      .map((row) => {
        const attempt = coerceAttempt(
          Array.isArray((row as { attempts?: unknown }).attempts)
            ? (row as { attempts: unknown[] }).attempts[0]
            : (row as { attempts?: unknown }).attempts,
        );

        if (!attempt) {
          return null;
        }

        const matchedValue =
          tab === "path"
            ? String((row as { path: string }).path)
            : String((row as { symbol?: string | null }).symbol ?? "Unknown symbol");

        return buildSearchResult(
          attempt,
          tab,
          matchedValue,
          tab === "path"
            ? (row as { symbol?: string | null }).symbol ?? null
            : (row as { path: string }).path,
        );
      })
      .filter((row): row is SearchResult => row !== null);

    return {
      query: trimmedQuery,
      tab,
      results,
      notice: null,
    };
  }

  if (tab === "error-signature") {
    const { data, error } = await client
      .from("outcomes")
      .select("id, attempt_id, error_sig, outcome_type, severity, created_at, details_json, attempts!inner(*)")
      .eq("attempts.project_id", projectId)
      .ilike("error_sig", `%${trimmedQuery}%`)
      .limit(50);

    throwIfError("Searching error signatures failed", error);

    const results = (data ?? [])
      .map((row) => {
        const attempt = coerceAttempt(
          Array.isArray((row as { attempts?: unknown }).attempts)
            ? (row as { attempts: unknown[] }).attempts[0]
            : (row as { attempts?: unknown }).attempts,
        );

        if (!attempt) {
          return null;
        }

        return buildSearchResult(
          attempt,
          tab,
          String((row as { error_sig?: string | null }).error_sig ?? "Unknown signature"),
          String((row as { outcome_type?: string | null }).outcome_type ?? "Outcome"),
        );
      })
      .filter((row): row is SearchResult => row !== null);

    return {
      query: trimmedQuery,
      tab,
      results,
      notice: null,
    };
  }

  if (tab === "failing-test") {
    const { data, error } = await client
      .from("outcomes")
      .select("id, attempt_id, outcome_type, severity, error_sig, created_at, details_json, attempts!inner(*)")
      .eq("attempts.project_id", projectId)
      .eq("outcome_type", "tests_failed")
      .limit(100);

    throwIfError("Searching failing tests failed", error);

    const loweredQuery = trimmedQuery.toLowerCase();
    const results = (data ?? [])
      .map((row) => {
        const details = (row as { details_json?: Outcome["details_json"] }).details_json;
        const failingTests = Array.isArray(details?.failing_tests)
          ? details.failing_tests
          : [];
        const matchedTest = failingTests.find((candidate) =>
          candidate.toLowerCase().includes(loweredQuery),
        );

        if (!matchedTest) {
          return null;
        }

        const attempt = coerceAttempt(
          Array.isArray((row as { attempts?: unknown }).attempts)
            ? (row as { attempts: unknown[] }).attempts[0]
            : (row as { attempts?: unknown }).attempts,
        );

        if (!attempt) {
          return null;
        }

        return buildSearchResult(
          attempt,
          tab,
          matchedTest,
          (row as { error_sig?: string | null }).error_sig ?? null,
        );
      })
      .filter((row): row is SearchResult => row !== null);

    return {
      query: trimmedQuery,
      tab,
      results,
      notice: null,
    };
  }

  const invoke = await client.functions.invoke("embed", {
    body: { text: trimmedQuery },
  });

  if (invoke.error) {
    return {
      query: trimmedQuery,
      tab,
      results: [],
      notice:
        "Semantic search is unavailable until P3 deploys the Supabase embed function.",
    };
  }

  const embedding = (invoke.data as { embedding?: number[] } | null)?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    return {
      query: trimmedQuery,
      tab,
      results: [],
      notice: "Semantic search returned no embedding payload.",
    };
  }

  const semanticResponse = await client.rpc("match_attempts_semantic", {
    query_embedding: embedding,
    project_id_filter: projectId,
    match_count: 10,
    similarity_threshold: 0.72,
  });

  if (semanticResponse.error) {
    return {
      query: trimmedQuery,
      tab,
      results: [],
      notice:
        "Semantic search is waiting on the `match_attempts_semantic` RPC from P3.",
    };
  }

  const semanticMatches = (semanticResponse.data ?? []) as SemanticMatch[];
  const attemptIds = semanticMatches.map((match) => match.id);

  if (attemptIds.length === 0) {
    return {
      query: trimmedQuery,
      tab,
      results: [],
      notice: null,
    };
  }

  const { data: attempts, error: attemptError } = await client
    .from("attempts")
    .select("*")
    .in("id", attemptIds);

  throwIfError("Loading semantic attempts failed", attemptError);

  const byAttemptId = new Map(
    ((attempts ?? []) as Attempt[]).map((attempt) => [attempt.id, attempt]),
  );

  return {
    query: trimmedQuery,
    tab,
    results: semanticMatches
      .map((match) => {
        const attempt = byAttemptId.get(match.id);

        if (!attempt) {
          return null;
        }

        return buildSearchResult(
          attempt,
          tab,
          match.summary ?? "Semantic match",
          `Similarity ${(match.score * 100).toFixed(1)}%`,
          match.score,
        );
      })
      .filter((row): row is SearchResult => row !== null),
    notice: null,
  };
}
