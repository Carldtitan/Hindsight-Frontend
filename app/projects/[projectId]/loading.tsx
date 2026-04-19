import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectRouteLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-28 rounded-[2rem]" />
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-[2rem]" />
        ))}
      </div>
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <Skeleton className="h-[520px] rounded-[2rem]" />
        <Skeleton className="h-[520px] rounded-[2rem]" />
      </div>
    </div>
  );
}
