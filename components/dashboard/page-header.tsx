import Link from "next/link";

import { InfoHint } from "@/components/dashboard/info-hint";
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
  description?: string;
  helpText?: string;
  breadcrumbs: BreadcrumbItemData[];
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  helpText,
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
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-300">
            {eyebrow}
          </p>
          <div className="min-w-0 space-y-2">
            <div className="flex min-w-0 items-start gap-2">
              <h1 className="min-w-0 text-balance break-words text-3xl font-semibold tracking-tight md:text-4xl">
                {title}
              </h1>
              {helpText ? <InfoHint className="mt-1">{helpText}</InfoHint> : null}
            </div>
            {description ? (
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
      <Separator className="bg-white/8" />
    </div>
  );
}
