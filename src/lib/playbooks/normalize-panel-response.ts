import type { Playbook, PlaybookStepProgress } from "./types";

export type PlaybookPanelResponse = {
  playbook: Playbook | null;
  progress: PlaybookStepProgress[];
  nextStepKey: string | null;
  summary: { completed: number; total: number; skipped: number };
  priorityAction?: {
    level: string;
    title: { en: string; fr: string };
    message: { en: string; fr: string };
  } | null;
};

function isValidSummary(raw: unknown): raw is PlaybookPanelResponse["summary"] {
  if (!raw || typeof raw !== "object") {
    return false;
  }
  const summary = raw as PlaybookPanelResponse["summary"];
  return (
    typeof summary.completed === "number" &&
    Number.isFinite(summary.completed) &&
    typeof summary.total === "number" &&
    Number.isFinite(summary.total) &&
    typeof summary.skipped === "number" &&
    Number.isFinite(summary.skipped)
  );
}

function normalizeSummary(raw: unknown): PlaybookPanelResponse["summary"] {
  if (!isValidSummary(raw)) {
    return { completed: 0, total: 0, skipped: 0 };
  }
  return raw;
}

function normalizeProgress(raw: unknown): PlaybookStepProgress[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((entry): entry is PlaybookStepProgress => {
    if (!entry || typeof entry !== "object") return false;
    const row = entry as PlaybookStepProgress;
    return typeof row.stepKey === "string" && typeof row.status === "string";
  });
}

function isPlaybook(raw: unknown): raw is Playbook {
  if (!raw || typeof raw !== "object") return false;
  const playbook = raw as Playbook;
  return (
    typeof playbook.id === "string" &&
    Array.isArray(playbook.steps) &&
    typeof playbook.title === "object"
  );
}

export function normalizePlaybookPanelResponse(
  raw: unknown
): PlaybookPanelResponse | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Partial<PlaybookPanelResponse>;
  const rawPlaybook = data.playbook;
  const playbook =
    rawPlaybook === null || rawPlaybook === undefined
      ? null
      : isPlaybook(rawPlaybook)
        ? rawPlaybook
        : null;

  if (rawPlaybook !== null && rawPlaybook !== undefined && !playbook) {
    return null;
  }

  if (playbook && !isValidSummary(data.summary)) {
    return null;
  }

  return {
    playbook,
    progress: normalizeProgress(data.progress),
    nextStepKey:
      typeof data.nextStepKey === "string" || data.nextStepKey === null
        ? data.nextStepKey
        : null,
    summary: normalizeSummary(data.summary),
    priorityAction:
      data.priorityAction === null || data.priorityAction === undefined
        ? data.priorityAction ?? null
        : data.priorityAction,
  };
}
