import { NextResponse } from "next/server";
import {
  cleanKey,
  cleanName,
  cleanScore,
  gameRules,
  ruleFor,
  type GameId,
  type LeaderboardPayload,
  type LeaderRow,
  type RecentScore,
} from "@/lib/game-scores";
import { scoresCollection } from "@/lib/mongo";

export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();

function allowed(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 30) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

function emptyPayload(status: LeaderboardPayload["status"]): LeaderboardPayload {
  return {
    status,
    plays: 0,
    players: 0,
    points: 0,
    recent: [],
    boards: gameRules.map((rule) => ({
      game: rule.id,
      label: rule.label,
      emoji: rule.emoji,
      better: rule.better,
      plays: 0,
      total: 0,
      best: null,
      rows: [],
    })),
  };
}

type StoredScore = {
  game?: GameId;
  name?: string;
  score?: number;
  createdAt?: Date;
};

export async function GET() {
  const scores = scoresCollection();
  if (!scores) return NextResponse.json(emptyPayload("unconfigured"));

  try {
    const rows = (await (await scores)
      .find({}, { projection: { game: 1, name: 1, score: 1, createdAt: 1, _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(2000)
      .toArray()) as StoredScore[];

    const players = new Set<string>();
    let plays = 0;
    let points = 0;
    const recent: RecentScore[] = [];
    const grouped = new Map<string, Map<string, LeaderRow & { key: string }>>();

    for (const rule of gameRules) grouped.set(rule.id, new Map());

    for (const row of rows) {
      const rule = row.game ? ruleFor(row.game) : null;
      if (!rule || typeof row.name !== "string" || typeof row.score !== "number") continue;
      const key = row.name.toLocaleLowerCase();
      plays += 1;
      players.add(key);
      if (rule.better === "high") points += row.score;
      if (recent.length < 12 && row.createdAt instanceof Date) {
        recent.push({
          name: row.name,
          game: rule.id,
          score: row.score,
          createdAt: row.createdAt.toISOString(),
        });
      }
      const board = grouped.get(rule.id);
      if (!board) continue;
      const current = board.get(key);
      if (!current) {
        board.set(key, { key, name: row.name, score: row.score, plays: 1, total: row.score });
        continue;
      }
      current.plays += 1;
      current.total += row.score;
      const better =
        rule.better === "high" ? row.score > current.score : row.score < current.score;
      if (better) {
        current.score = row.score;
        current.name = row.name;
      }
    }

    return NextResponse.json({
      status: "ready",
      plays,
      players: players.size,
      points,
      recent,
      boards: gameRules.map((rule) => {
        const list = [...(grouped.get(rule.id)?.values() ?? [])];
        list.sort((a, b) => (rule.better === "high" ? b.score - a.score : a.score - b.score));
        const best = list[0]?.score ?? null;
        const plays = list.reduce((sum, item) => sum + item.plays, 0);
        const total = list.reduce((sum, item) => sum + item.total, 0);
        return {
          game: rule.id,
          label: rule.label,
          emoji: rule.emoji,
          better: rule.better,
          plays,
          total,
          best,
          rows: list.slice(0, 8).map(({ name, score, plays: rowPlays, total: rowTotal }) => ({
            name,
            score,
            plays: rowPlays,
            total: rowTotal,
          })),
        };
      }),
    } satisfies LeaderboardPayload);
  } catch {
    return NextResponse.json(emptyPayload("unreachable"));
  }
}

export async function POST(request: Request) {
  if (!allowed(request)) {
    return NextResponse.json({ error: "Slow down and try again." }, { status: 429 });
  }

  const scores = scoresCollection();
  if (!scores) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Check the score and try again." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Check the score and try again." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const rule = typeof record.game === "string" ? ruleFor(record.game) : null;
  const name = cleanName(record.name);
  const score = rule ? cleanScore(rule, record.score) : null;
  const key = cleanKey(record.key);
  if (!rule || !name || score == null || key === null) {
    return NextResponse.json({ error: "Check the score and try again." }, { status: 400 });
  }

  const entry = {
    game: rule.id,
    name,
    score,
    createdAt: new Date(),
    ...(key ? { idempotencyKey: key } : {}),
  };

  try {
    const collection = await scores;
    if (key) {
      await collection.updateOne(
        { idempotencyKey: key },
        { $setOnInsert: entry },
        { upsert: true },
      );
    } else {
      await collection.insertOne(entry);
    }
  } catch {
    return NextResponse.json({ error: "The score didn't save." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
