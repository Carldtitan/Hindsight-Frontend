"use client";

import { useEffect } from "react";

export function WorkspaceViewScrollReset() {
  useEffect(() => {
    requestAnimationFrame(() => {
      const scrollRoot = document.querySelector<HTMLElement>("[data-workspace-scroll-root]");

      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0, left: 0, behavior: "auto" });
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  return null;
}
