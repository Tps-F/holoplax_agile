import { storyPointOptions } from "./points";
import { SEVERITY, SEVERITY_FROM_LABEL, type Severity } from "./types";

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

export const normalizeStoryPoint = (value: unknown, fallback = 3) => {
  const target = toNumber(value);
  if (!Number.isFinite(target)) return fallback;
  let nearest = storyPointOptions[0];
  let minDiff = Infinity;
  for (const option of storyPointOptions) {
    const diff = Math.abs(option - target);
    if (diff < minDiff) {
      nearest = option;
      minDiff = diff;
    }
  }
  return nearest;
};

const toStringValue = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

// Maps both Japanese (低/中/高) and English (LOW/MEDIUM/HIGH) to Severity enum
export const normalizeSeverity = (
  value: unknown,
  fallback: Severity = SEVERITY.MEDIUM,
): Severity => {
  const candidate = toStringValue(value).toUpperCase();

  // Direct enum value
  if (candidate === SEVERITY.LOW || candidate === SEVERITY.MEDIUM || candidate === SEVERITY.HIGH) {
    return candidate as Severity;
  }

  // Japanese label
  const rawCandidate = toStringValue(value);
  if (SEVERITY_FROM_LABEL[rawCandidate]) {
    return SEVERITY_FROM_LABEL[rawCandidate];
  }

  return fallback;
};

// Deprecated: use normalizeSeverity instead
// Kept for backwards compatibility during migration
export const normalizePriorityLevel = normalizeSeverity;

export const sanitizeSplitSuggestion = (item: {
  title: string;
  points: unknown;
  urgency?: unknown;
  risk?: unknown;
  detail?: string | null;
}) => ({
  title: toStringValue(item.title),
  points: normalizeStoryPoint(item.points),
  urgency: normalizeSeverity(item.urgency),
  risk: normalizeSeverity(item.risk),
  detail: toStringValue(item.detail),
});
