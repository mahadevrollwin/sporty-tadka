export const REACTION_TYPES = ["heart", "laugh", "angry", "up", "down"] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export type ReactionCounts = Record<ReactionType, number>;

export type ItemReactionState = {
  counts: ReactionCounts;
  /** Unique people who have reacted (one count per person). */
  likes: number;
};

export type ReactionsMap = Record<string, ItemReactionState>;

export type VoterMap = Record<string, ReactionType>;

export const REACTION_OPTIONS: { id: ReactionType; emoji: string; label: string }[] = [
  { id: "heart", emoji: "❤️", label: "Love" },
  { id: "laugh", emoji: "😂", label: "Laugh" },
  { id: "angry", emoji: "😡", label: "Angry" },
  { id: "up", emoji: "👍", label: "Thumbs up" },
  { id: "down", emoji: "👎", label: "Thumbs down" },
];

const VOTER_KEY = "sporty-tadka-gallery-voter-id";
const PICKS_KEY = "sporty-tadka-gallery-reaction-picks";
const CACHE_KEY = "sporty-tadka-gallery-reaction-counts";

export function emptyCounts(): ReactionCounts {
  return { heart: 0, laugh: 0, angry: 0, up: 0, down: 0 };
}

export function emptyState(): ItemReactionState {
  return { counts: emptyCounts(), likes: 0 };
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

export function countsFromVoters(voters: VoterMap): ReactionCounts {
  const counts = emptyCounts();
  for (const reaction of Object.values(voters)) {
    if (isReactionType(reaction)) counts[reaction] += 1;
  }
  return counts;
}

export function stateFromVoters(voters: VoterMap): ItemReactionState {
  return {
    counts: countsFromVoters(voters),
    likes: Object.keys(voters).length,
  };
}

export function normalizeState(value: unknown): ItemReactionState {
  if (!value || typeof value !== "object") return emptyState();
  const record = value as Record<string, unknown>;

  if (record.voters && typeof record.voters === "object") {
    const voters = normalizeVoters(record.voters);
    return stateFromVoters(voters);
  }

  // Legacy shape: either { counts, likes } or bare ReactionCounts
  if (record.counts && typeof record.counts === "object") {
    const counts = normalizeCounts(record.counts);
    const likes =
      typeof record.likes === "number" && Number.isFinite(record.likes) && record.likes >= 0
        ? Math.floor(record.likes)
        : REACTION_TYPES.reduce((sum, key) => sum + counts[key], 0);
    return { counts, likes };
  }

  if (REACTION_TYPES.some((key) => key in record)) {
    const counts = normalizeCounts(record);
    return {
      counts,
      likes: REACTION_TYPES.reduce((sum, key) => sum + counts[key], 0),
    };
  }

  return emptyState();
}

export function normalizeVoters(value: unknown): VoterMap {
  if (!value || typeof value !== "object") return {};
  const out: VoterMap = {};
  for (const [voterId, reaction] of Object.entries(value as Record<string, unknown>)) {
    if (isValidVoterId(voterId) && isReactionType(reaction)) {
      out[voterId] = reaction;
    }
  }
  return out;
}

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === "string" && (REACTION_TYPES as readonly string[]).includes(value);
}

export function isValidVoterId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

export function likesTotal(state: ItemReactionState | ReactionCounts | undefined) {
  if (!state) return 0;
  if ("likes" in state && typeof state.likes === "number") {
    return Math.max(0, state.likes);
  }
  return REACTION_TYPES.reduce((sum, key) => sum + ((state as ReactionCounts)[key] ?? 0), 0);
}

export function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
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

export function applyOptimisticState(
  state: ItemReactionState,
  previous: ReactionType | null | undefined,
  next: ReactionType | null,
): ItemReactionState {
  const prev = previous ?? null;
  if (prev === next) return state;

  let likes = state.likes;
  if (!prev && next) likes += 1;
  else if (prev && !next) likes = Math.max(0, likes - 1);

  return {
    counts: applyReactionChange(state.counts, prev, next),
    likes,
  };
}

export function getVoterId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(VOTER_KEY);
    if (isValidVoterId(existing)) return existing;
    const id = crypto.randomUUID().replace(/[^A-Za-z0-9_-]/g, "");
    const voterId = isValidVoterId(id) ? id : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VOTER_KEY, voterId);
    return voterId;
  } catch {
    return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

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
      out[id] = normalizeState(value);
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
