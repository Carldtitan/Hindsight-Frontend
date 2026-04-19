import { Search, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchControls } from "@/components/dashboard/search-controls";
import { SearchResultsTable } from "@/components/dashboard/search-results-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchProject } from "@/lib/data";
import { SEARCH_TABS, type SearchTab } from "@/lib/types";

function parseTab(value: string | undefined): SearchTab {
  if (!value) {
    return "path";
  }

  return SEARCH_TABS.includes(value as SearchTab) ? (value as SearchTab) : "path";
}

export default async function ProjectSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { projectId } = await params;
  const queryState = await searchParams;
  const tab = parseTab(queryState.tab);
  const query = queryState.q?.trim() ?? "";
  const results = await searchProject(projectId, query, tab);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cross-attempt retrieval"
        title="Search team memory"
        description="Trace attempt history by file path, symbol, failing test, error signature, or semantic intent without crossing into plugin or backend ownership."
        breadcrumbs={[
          { title: "Projects", href: "/" },
          { title: "Search" },
        ]}
      />

      <SearchControls initialTab={tab} initialQuery={query} />

      {results.notice ? (
        <Alert className="border-amber-500/25 bg-amber-500/10 text-amber-100">
          <Sparkles className="size-4" />
          <AlertTitle>Partial backend contract</AlertTitle>
          <AlertDescription>{results.notice}</AlertDescription>
        </Alert>
      ) : null}

      {query.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Run a query"
          description="Use the tabs to search by path, symbol, failing test, error signature, or semantic intent. Query state stays in the URL so links remain shareable."
        />
      ) : (
        <Card className="surface-panel border">
          <CardHeader className="border-b border-white/10">
            <CardTitle>Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              {results.results.length} matches for <span className="font-mono">{query}</span>
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {results.results.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Search}
                  title="No matches found"
                  description="Try a broader query or switch retrieval mode. Semantic search depends on the embed function and RPC being live."
                />
              </div>
            ) : (
              <SearchResultsTable projectId={projectId} results={results.results} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
