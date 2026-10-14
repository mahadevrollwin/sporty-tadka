import { cleanName, ruleFor, type GameId } from "@/lib/game-scores";

const playerKey = "st_player";
const pendingKey = "st_pending";

export function readPlayerName() {
  try {
    return cleanName(localStorage.getItem(playerKey)) ?? "";
  } catch {
    return "";
  }
}

export function rememberPlayer(name: string) {
  const clean = cleanName(name);
  if (!clean) return "";
  try {
    localStorage.setItem(playerKey, clean);
  } catch {
    /* storage can be blocked */
  }
  window.dispatchEvent(new CustomEvent("st-player", { detail: clean }));
  return clean;
}

export async function recordScore(input: {
  game: GameId;
  score: number;
  name?: string;
  key?: string;
  remember?: boolean;
}) {
  const score = Math.round(input.score);
  const named = input.name != null ? cleanName(input.name) : readPlayerName();
  if (!named) {
    if (input.name != null) return "failed" as const;
    try {
      sessionStorage.setItem(pendingKey, JSON.stringify({ game: input.game, score }));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("st-need-name", { detail: { game: input.game, score } }));
    return "needs-name" as const;
  }
  if (input.remember) rememberPlayer(named);

  try {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ game: input.game, name: named, score, key: input.key }),
    });
    if (response.status === 503) return "offline" as const;
    if (!response.ok) return "failed" as const;
    window.dispatchEvent(new Event("st-scores"));
    return "saved" as const;
  } catch {
    return "failed" as const;
  }
}

export function peekPendingScore() {
  try {
    const raw = sessionStorage.getItem(pendingKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { game?: string; score?: number };
    if (!parsed.game || !ruleFor(parsed.game) || typeof parsed.score !== "number") return null;
    return { game: parsed.game as GameId, score: parsed.score };
  } catch {
    return null;
  }
}

export function takePendingScore() {
  try {
    const raw = sessionStorage.getItem(pendingKey);
    if (!raw) return null;
    sessionStorage.removeItem(pendingKey);
    const parsed = JSON.parse(raw) as { game?: string; score?: number };
    if (!parsed.game || !ruleFor(parsed.game) || typeof parsed.score !== "number") return null;
    return { game: parsed.game as GameId, score: parsed.score };
  } catch {
    return null;
  }
}

type ScamRow = { id?: string; name?: string; mobile?: string; score?: number; timestamp?: string };

const seenScam = new Set<string>();

function scamKey(row: ScamRow, score: number) {
  const id = (row.id || row.mobile || row.name || "").replace(/[^a-z0-9]/gi, "").slice(0, 24);
  const stamp = (row.timestamp || "").replace(/[^0-9]/g, "").slice(0, 14);
  if (!id || !stamp) return null;
  return `scam:${id}:${stamp}:${score}`.slice(0, 80);
}

export async function syncScamScores(raw: string | null) {
  if (!raw) return;
  let rows: ScamRow[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    rows = parsed as ScamRow[];
  } catch {
    return;
  }
  for (const row of rows) {
    const name = typeof row.name === "string" ? row.name : "";
    const score = typeof row.score === "number" ? Math.round(row.score) : 0;
    const key = scamKey(row, score);
    if (!key || score <= 0 || !cleanName(name) || seenScam.has(key)) continue;
    seenScam.add(key);
    const result = await recordScore({ game: "scam", score, name, key });
    if (result === "offline") seenScam.delete(key);
  }
}
