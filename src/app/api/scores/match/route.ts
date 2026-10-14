import { NextResponse } from "next/server";
import { loadMatch } from "@/lib/espn-scores";

const sports = new Set(["football", "basketball", "cricket", "tennis"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? "cricket";
  const league = searchParams.get("league") ?? "";
  const id = searchParams.get("id") ?? "";

  if (!sports.has(sport) || !/^[a-z0-9.-]+$/i.test(league) || !/^[a-z0-9-]+$/i.test(id)) {
    return NextResponse.json({ error: "Unknown match" }, { status: 400 });
  }

  try {
    const match = await loadMatch(sport, league, id);
    return NextResponse.json(
      { match },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch {
    return NextResponse.json({ error: "Match details unavailable" }, { status: 502 });
  }
}
