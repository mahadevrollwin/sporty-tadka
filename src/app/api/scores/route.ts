import { NextResponse } from "next/server";
import { loadScoreboard } from "@/lib/espn-scores";

const sports = new Set(["football", "basketball", "cricket", "tennis"]);

export async function GET(request: Request) {
  const sport = new URL(request.url).searchParams.get("sport") ?? "cricket";
  if (!sports.has(sport)) {
    return NextResponse.json({ error: "Unknown sport" }, { status: 400 });
  }

  try {
    const data = await loadScoreboard(sport);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Scores unavailable" }, { status: 502 });
  }
}
