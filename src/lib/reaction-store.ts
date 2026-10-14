import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  applyReactionChange,
  emptyCounts,
  isReactionType,
  normalizeCounts,
  type ReactionCounts,
  type ReactionType,
  type ReactionsMap,
} from "@/lib/gallery-reactions";
import { getCollection } from "@/lib/mongo";

const file = path.join(process.cwd(), "data", "gallery-reactions.json");

async function readFileStore(): Promise<ReactionsMap> {
  try {
    const stored: unknown = JSON.parse(await readFile(file, "utf8"));
    if (!stored || typeof stored !== "object") return {};
    const out: ReactionsMap = {};
    for (const [id, value] of Object.entries(stored as Record<string, unknown>)) {
      out[id] = normalizeCounts(value);
    }
    return out;
  } catch {
    return {};
  }
}

async function writeFileStore(map: ReactionsMap) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(map, null, 2));
}

export async function loadReactionCounts(): Promise<ReactionsMap> {
  const collection = await getCollection("gallery_reactions").catch(() => null);
  if (collection) {
    const docs = await collection.find({}).toArray();
    const out: ReactionsMap = {};
    for (const doc of docs) {
      const id = typeof doc.itemId === "string" ? doc.itemId : null;
      if (!id) continue;
      out[id] = normalizeCounts(doc.counts);
    }
    return out;
  }
  return readFileStore();
}

export async function loadItemCounts(itemId: string): Promise<ReactionCounts> {
  const collection = await getCollection("gallery_reactions").catch(() => null);
  if (collection) {
    const doc = await collection.findOne({ itemId });
    return normalizeCounts(doc?.counts);
  }
  const map = await readFileStore();
  return map[itemId] ?? emptyCounts();
}

export async function commitReaction(input: {
  itemId: string;
  reaction: ReactionType | null;
  previous?: ReactionType | null;
}): Promise<ReactionCounts> {
  const previous = isReactionType(input.previous) ? input.previous : null;
  const next = input.reaction;
  if (previous === next) {
    return loadItemCounts(input.itemId);
  }

  const collection = await getCollection("gallery_reactions").catch(() => null);
  if (collection) {
    const existing = await collection.findOne({ itemId: input.itemId });
    const counts = applyReactionChange(normalizeCounts(existing?.counts), previous, next);
    await collection.updateOne(
      { itemId: input.itemId },
      { $set: { itemId: input.itemId, counts, updatedAt: new Date() } },
      { upsert: true },
    );
    return counts;
  }

  const map = await readFileStore();
  const counts = applyReactionChange(map[input.itemId] ?? emptyCounts(), previous, next);
  map[input.itemId] = counts;
  await writeFileStore(map);
  return counts;
}
