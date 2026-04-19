"use client";

import { startTransition, useState } from "react";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchTab } from "@/lib/types";

const SEARCH_OPTIONS: Array<{ value: SearchTab; label: string }> = [
  { value: "path", label: "Path" },
  { value: "symbol", label: "Symbol" },
  { value: "failing-test", label: "Failing test" },
  { value: "error-signature", label: "Error signature" },
  { value: "semantic", label: "Semantic" },
];

interface SearchControlsProps {
  initialTab: SearchTab;
  initialQuery: string;
}

export function SearchControls({
  initialTab,
  initialQuery,
}: SearchControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const updateRoute = (tab: SearchTab, nextQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("tab", tab);

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-card/90 p-4 backdrop-blur">
      <Tabs value={initialTab} onValueChange={(value) => updateRoute(value as SearchTab, query)}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-5">
          {SEARCH_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5 text-xs uppercase tracking-[0.18em] data-[state=active]:border-sky-500/30 data-[state=active]:bg-sky-500/12 data-[state=active]:text-sky-200"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <form
        className="flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          updateRoute(initialTab, query);
        }}
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file, symbol, failing test, signature, or semantic intent"
            className="h-11 rounded-2xl border-white/10 bg-black/20 pl-10"
          />
        </div>
        <Button type="submit" className="h-11 rounded-2xl bg-sky-500 text-slate-950 hover:bg-sky-400">
          Run query
        </Button>
      </form>
    </div>
  );
}
