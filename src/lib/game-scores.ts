import { games, type GameId } from "@/content/home";

export type { GameId };

export type ScoreDirection = "high" | "low";

export type GameRule = {
  id: GameId;
  label: string;
  emoji: string;
  better: ScoreDirection;
  min: number;
  max: number;
};

const bounds: Record<GameId, { better: ScoreDirection; min: number; max: number }> = {
  reaction: { better: "low", min: 80, max: 10000 },
  timing: { better: "high", min: 0, max: 36 },
  tetris: { better: "high", min: 0, max: 999999 },
  rapid: { better: "high", min: 0, max: 999999999 },
  scam: { better: "high", min: 1, max: 100000 },
};

export const gameRules: GameRule[] = games.map((game) => ({
  id: game.id,
  label: game.label,
  emoji: game.emoji,
  ...bounds[game.id],
}));

const byId = new Map(gameRules.map((rule) => [rule.id, rule]));

export function ruleFor(game: string): GameRule | null {
  return byId.get(game as GameId) ?? null;
}

export function cleanName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ").slice(0, 20);
  if (name.length < 2) return null;
  if (!/^[\p{L}\p{N}][\p{L}\p{N} .'-]*$/u.test(name)) return null;
  return name;
}

export function cleanScore(game: GameRule, value: unknown) {
  const score = typeof value === "number" ? value : Number.NaN;
  if (!Number.isInteger(score)) return null;
  if (score < game.min || score > game.max) return null;
  return score;
}

export function cleanKey(value: unknown) {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return null;
  if (!/^[a-z0-9:_-]{8,80}$/i.test(value)) return null;
  return value;
}

export function formatScore(game: GameId, score: number) {
  if (game === "reaction") return `${score.toLocaleString()} ms`;
  if (game === "timing") return `${score.toLocaleString()} runs`;
  return score.toLocaleString();
}

export type LeaderRow = {
  name: string;
  score: number;
  plays: number;
  total: number;
};

export type LeaderBoard = {
  game: GameId;
  label: string;
  emoji: string;
  better: ScoreDirection;
  plays: number;
  total: number;
  best: number | null;
  rows: LeaderRow[];
};

export type RecentScore = {
  name: string;
  game: GameId;
  score: number;
  createdAt: string;
};

export type LeaderboardPayload = {
  status: "ready" | "unconfigured" | "unreachable";
  plays: number;
  players: number;
  points: number;
  boards: LeaderBoard[];
  recent: RecentScore[];
};
