import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOutcomeHeadline } from "@/lib/display";
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
  TaskSummary,
  TaskEpisodeData,
  TopDeadEndFile,
} from "@/lib/types";

function ensureClient() {
  const client = createServerSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  return client;
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

async function getTaskSummaries(
  client: SupabaseClient,
  projectId: string,
  tasks: Task[],
): Promise<TaskSummary[]> {
  if (tasks.length === 0) {
    return [];
  }

  const taskIds = tasks.map((task) => task.id);
  const { data, error } = await client
    .from("attempts")
    .select("*")
    .eq("project_id", projectId)
    .in("task_id", taskIds)
    .order("started_at", { ascending: false });

  throwIfError("Loading task attempt summaries failed", error);

  const attemptsByTaskId = new Map<string, Attempt[]>();

  for (const attempt of (data ?? []) as Attempt[]) {
    const bucket = attemptsByTaskId.get(attempt.task_id) ?? [];
    bucket.push(attempt);
    attemptsByTaskId.set(attempt.task_id, bucket);
  }

  const latestAttemptIds = tasks
    .map((task) => attemptsByTaskId.get(task.id)?.[0]?.id)
    .filter((value): value is string => Boolean(value));
  const outcomesByAttemptId = await getOutcomesByAttemptId(client, latestAttemptIds);

  return tasks.map((task) => {
    const attempts = attemptsByTaskId.get(task.id) ?? [];
    const latestAttempt = attempts[0] ?? null;

    return {
      task,
      attemptCount: attempts.length,
      latestAttempt,
      latestOutcome: latestAttempt
        ? (outcomesByAttemptId.get(latestAttempt.id)?.[0] ?? null)
        : null,
    };
  });
}

function isFailedWork(attempt: Attempt, outcomes: Outcome[]) {
  if (attempt.status === "failed" || attempt.status === "reverted") {
    return true;
  }

  return outcomes.some((outcome) =>
    ["tests_failed", "build_failed", "reverted"].includes(outcome.outcome_type),
  );
}

async function enrichTopDeadEndFiles(
  client: SupabaseClient,
  projectId: string,
  files: TopDeadEndFile[],
) {
  if (files.length === 0) {
    return files;
  }

  const paths = files.map((file) => file.path);
  const { data: touches, error: touchError } = await client
    .from("file_touches")
    .select("attempt_id, path")
    .in("path", paths);

  throwIfError("Loading hotspot file touches failed", touchError);

  const attemptIds = [...new Set((touches ?? []).map((touch) => touch.attempt_id))];

  if (attemptIds.length === 0) {
    return files;
  }

  const { data: attempts, error: attemptError } = await client
    .from("attempts")
    .select("*")
    .eq("project_id", projectId)
    .in("id", attemptIds)
    .order("started_at", { ascending: false });

  throwIfError("Loading hotspot attempts failed", attemptError);

  const outcomesByAttemptId = await getOutcomesByAttemptId(client, attemptIds);
  const attemptsById = new Map(((attempts ?? []) as Attempt[]).map((attempt) => [attempt.id, attempt]));
  const attemptIdsByPath = new Map<string, string[]>();

  for (const touch of touches ?? []) {
    const bucket = attemptIdsByPath.get(touch.path) ?? [];

    if (!bucket.includes(touch.attempt_id)) {
      bucket.push(touch.attempt_id);
    }

    attemptIdsByPath.set(touch.path, bucket);
  }

  return files.map((file) => {
    const relatedAttempts = (attemptIdsByPath.get(file.path) ?? [])
      .map((attemptId) => attemptsById.get(attemptId))
      .filter((attempt): attempt is Attempt => Boolean(attempt))
      .sort((left, right) => right.started_at.localeCompare(left.started_at));

    const latestFailure =
      relatedAttempts.find((attempt) =>
        isFailedWork(attempt, outcomesByAttemptId.get(attempt.id) ?? []),
      ) ?? null;
    const latestRecovery =
      relatedAttempts.find((attempt) => attempt.status === "accepted") ?? null;

    return {
      ...file,
      latest_failure_attempt_id: latestFailure?.id ?? null,
      latest_failure_summary: latestFailure?.summary ?? null,
      latest_failure_at: latestFailure?.started_at ?? null,
      latest_failure_signal: latestFailure
        ? getOutcomeHeadline(outcomesByAttemptId.get(latestFailure.id)?.[0] ?? null)
        : null,
      latest_recovery_attempt_id: latestRecovery?.id ?? null,
      latest_recovery_summary: latestRecovery?.summary ?? null,
      latest_recovery_at: latestRecovery?.started_at ?? null,
    };
  });
}

async function enrichSearchResults(client: SupabaseClient, results: SearchResult[]) {
  if (results.length === 0) {
    return results;
  }

  const taskIds = [...new Set(results.map((result) => result.attempt.task_id))];
  const attemptIds = results.map((result) => result.attempt.id);
  const [{ data: tasks, error: taskError }, outcomesByAttemptId] = await Promise.all([
    client.from("tasks").select("*").in("id", taskIds),
    getOutcomesByAttemptId(client, attemptIds),
  ]);

  throwIfError("Loading search task context failed", taskError);

  const tasksById = new Map(((tasks ?? []) as Task[]).map((task) => [task.id, task]));

  return results.map((result) => ({
    ...result,
    task: tasksById.get(result.attempt.task_id) ?? null,
    latestOutcome: outcomesByAttemptId.get(result.attempt.id)?.[0] ?? null,
  }));
}

export async function getProjects() {
  const client = ensureClient();

  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  throwIfError("Loading projects failed", error);
  return (data ?? []) as Project[];
}

export async function getProjectChrome(projectId: string): Promise<ProjectChromeData | null> {
  const client = ensureClient();

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

  const normalizedStats = statsResponse.error ? normalizeStats(null) : normalizeStats(statsResponse.data);
  const rawTasks = (tasks ?? []) as Task[];
  const orderedAttempts = ((attempts ?? []) as Attempt[]).sort((left, right) =>
    right.started_at.localeCompare(left.started_at),
  );
  const [bundledAttempts, taskSummaries, topDeadEndFiles] = await Promise.all([
    bundleAttemptRecords(client, orderedAttempts),
    getTaskSummaries(client, projectId, rawTasks),
    enrichTopDeadEndFiles(client, projectId, normalizedStats.top_dead_end_files),
  ]);

  return {
    project: project as Project,
    tasks: taskSummaries,
    attempts: bundledAttempts,
    stats: {
      ...normalizedStats,
      top_dead_end_files: topDeadEndFiles,
    },
  };
}

export async function getTaskEpisode(
  projectId: string,
  taskId: string,
): Promise<TaskEpisodeData | null> {
  const client = ensureClient();

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

  if (selectedAttempt.fileTouches.length === 0 || selectedAttempt.outcomes.length === 0) {
    const [touchMap, outcomeMap] = await Promise.all([
      selectedAttempt.fileTouches.length === 0
        ? getFileTouchesByAttemptId(client, [attemptId])
        : Promise.resolve(new Map<string, FileTouch[]>()),
      selectedAttempt.outcomes.length === 0
        ? getOutcomesByAttemptId(client, [attemptId])
        : Promise.resolve(new Map<string, Outcome[]>()),
    ]);

    if (selectedAttempt.fileTouches.length === 0) {
      selectedAttempt.fileTouches = touchMap.get(attemptId) ?? [];
    }

    if (selectedAttempt.outcomes.length === 0) {
      selectedAttempt.outcomes = outcomeMap.get(attemptId) ?? [];
    }
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
  identity?: string,
  score?: number,
): SearchResult {
  return {
    id: identity ?? `${matchedOn}:${attempt.id}:${matchedValue}`,
    matchedOn,
    matchedValue,
    note,
    attempt,
    task: null,
    latestOutcome: null,
    score,
  };
}

function dedupeSearchResults(results: SearchResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.matchedOn}:${result.attempt.id}:${result.matchedValue}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function searchProject(
  projectId: string,
  query: string,
  tab: SearchTab,
): Promise<SearchResultsData> {
  const client = ensureClient();
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
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
          `${tab}:${(row as { id: string }).id}`,
        );
      })
      .filter((row): row is SearchResult => row !== null);

    return {
      query: trimmedQuery,
      tab,
      results: dedupeSearchResults(await enrichSearchResults(client, results)),
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
          `${tab}:${(row as { id: string }).id}`,
        );
      })
      .filter((row): row is SearchResult => row !== null);

    return {
      query: trimmedQuery,
      tab,
      results: dedupeSearchResults(await enrichSearchResults(client, results)),
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
          `${tab}:${(row as { id: string }).id}:${matchedTest}`,
        );
      })
      .filter((row): row is SearchResult => row !== null);

    return {
      query: trimmedQuery,
      tab,
      results: dedupeSearchResults(await enrichSearchResults(client, results)),
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
      notice: "Embedding service unavailable.",
    };
  }

  const embedding = (invoke.data as { embedding?: number[] } | null)?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    return {
      query: trimmedQuery,
      tab,
      results: [],
      notice: "Embedding response was invalid.",
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
      notice: "Semantic search backend unavailable.",
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

  const semanticResults = semanticMatches
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
        `${tab}:${match.id}`,
        match.score,
      );
    })
    .filter((row): row is SearchResult => row !== null);

  return {
    query: trimmedQuery,
    tab,
    results: dedupeSearchResults(await enrichSearchResults(client, semanticResults)),
    notice: null,
  };
}
