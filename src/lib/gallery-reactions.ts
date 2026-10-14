export const REACTION_TYPES = ["heart", "laugh", "angry", "up", "down"] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export type ReactionCounts = Record<ReactionType, number>;

export type ReactionsMap = Record<string, ReactionCounts>;

export const REACTION_OPTIONS: { id: ReactionType; emoji: string; label: string }[] = [
  { id: "heart", emoji: "❤️", label: "Love" },
  { id: "laugh", emoji: "😂", label: "Laugh" },
  { id: "angry", emoji: "😡", label: "Angry" },
  { id: "up", emoji: "👍", label: "Thumbs up" },
  { id: "down", emoji: "👎", label: "Thumbs down" },
];

export function emptyCounts(): ReactionCounts {
  return { heart: 0, laugh: 0, angry: 0, up: 0, down: 0 };
}

export function normalizeCounts(value: unknown): ReactionCounts {
  const base = emptyCounts();
  if (!value || typeof value !== "object") return base;
  const record = value as Record<string, unknown>;
  for (const key of REACTION_TYPES) {
    const n = record[key];
    base[key] = typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  return base;
}

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === "string" && (REACTION_TYPES as readonly string[]).includes(value);
}

export function likesTotal(counts: ReactionCounts | undefined) {
  if (!counts) return 0;
  return REACTION_TYPES.reduce((sum, key) => sum + counts[key], 0);
}

export function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

const PICKS_KEY = "sporty-tadka-gallery-reaction-picks";
const CACHE_KEY = "sporty-tadka-gallery-reaction-counts";

export function readLocalPicks(): Record<string, ReactionType> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PICKS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, ReactionType> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isReactionType(value)) out[id] = value;
    }
    return out;
  } catch {
    return {};
  }
}

export function writeLocalPick(itemId: string, reaction: ReactionType | null) {
  if (typeof window === "undefined") return;
  const picks = readLocalPicks();
  if (reaction) picks[itemId] = reaction;
  else delete picks[itemId];
  localStorage.setItem(PICKS_KEY, JSON.stringify(picks));
}

export function readLocalCounts(): ReactionsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: ReactionsMap = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      out[id] = normalizeCounts(value);
    }
    return out;
  } catch {
    return {};
  }
}

export function writeLocalCounts(map: ReactionsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(map));
}

export function applyReactionChange(
  counts: ReactionCounts,
  previous: ReactionType | null | undefined,
  next: ReactionType | null,
): ReactionCounts {
  const updated = { ...counts };
  if (previous && previous !== next) {
    updated[previous] = Math.max(0, updated[previous] - 1);
  }
  if (next && next !== previous) {
    updated[next] = updated[next] + 1;
  }
  return updated;
}
