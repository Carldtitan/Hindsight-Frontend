"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export function ProjectViewScrollReset() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "";
  const previousView = useRef<string | null>(null);

  useEffect(() => {
    const hasViewChanged = previousView.current !== null && previousView.current !== view;
    const scrollRoot = document.querySelector<HTMLElement>("[data-project-scroll-root]");
    const currentScrollTop = scrollRoot?.scrollTop ?? window.scrollY;
    const shouldResetOnMount = previousView.current === null && currentScrollTop > 0;

    previousView.current = view;

    if (!hasViewChanged && !shouldResetOnMount) {
      return;
    }

    requestAnimationFrame(() => {
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0, left: 0, behavior: "auto" });
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [view]);

  return null;
}
