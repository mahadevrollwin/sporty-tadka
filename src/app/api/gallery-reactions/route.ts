import { NextResponse } from "next/server";
import { isReactionType } from "@/lib/gallery-reactions";
import { commitReaction, loadReactionCounts } from "@/lib/reaction-store";

export async function GET() {
  try {
    const counts = await loadReactionCounts();
    return NextResponse.json(
      { counts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ counts: {} });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const itemId = typeof record.itemId === "string" ? record.itemId.trim().slice(0, 120) : "";
  if (!itemId) {
    return NextResponse.json({ error: "Missing item." }, { status: 400 });
  }

  const reaction =
    record.reaction === null ? null : isReactionType(record.reaction) ? record.reaction : undefined;
  if (reaction === undefined) {
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
  }

  const previous =
    record.previous === null || record.previous === undefined
      ? null
      : isReactionType(record.previous)
        ? record.previous
        : null;

  try {
    const counts = await commitReaction({ itemId, reaction, previous });
    return NextResponse.json({ ok: true, counts });
  } catch {
    return NextResponse.json({ error: "Could not save reaction." }, { status: 500 });
  }
}
