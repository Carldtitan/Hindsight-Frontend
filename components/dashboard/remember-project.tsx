"use client";

import { useEffect } from "react";

const RECENT_PROJECT_STORAGE_KEY = "hindsight:last-project";

interface RememberProjectProps {
  projectId: string;
  projectName: string;
  repoLabel: string;
}

export function RememberProject({
  projectId,
  projectName,
  repoLabel,
}: RememberProjectProps) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECENT_PROJECT_STORAGE_KEY,
        JSON.stringify({
          projectId,
          projectName,
          repoLabel,
          updatedAt: Date.now(),
        }),
      );
    } catch {
      // Ignore storage failures. This only improves local navigation.
    }
  }, [projectId, projectName, repoLabel]);

  return null;
}

export { RECENT_PROJECT_STORAGE_KEY };
