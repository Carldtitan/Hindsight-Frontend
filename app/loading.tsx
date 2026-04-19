import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-12 md:px-8">
      <Skeleton className="h-72 rounded-[2rem]" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-[2rem]" />
        <Skeleton className="h-80 rounded-[2rem]" />
      </div>
    </main>
  );
}
