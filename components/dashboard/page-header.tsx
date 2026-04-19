import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

interface BreadcrumbItemData {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItemData[];
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <div key={`${item.title}-${index}`} className="contents">
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-300">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
      <Separator className="bg-white/8" />
    </div>
  );
}
