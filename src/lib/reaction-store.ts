import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isReactionType,
  isValidVoterId,
  normalizeState,
  normalizeVoters,
  stateFromVoters,
  type ItemReactionState,
  type ReactionType,
  type ReactionsMap,
  type VoterMap,
} from "@/lib/gallery-reactions";
import { getCollection } from "@/lib/mongo";

const file = path.join(process.cwd(), "data", "gallery-reactions.json");

type StoredItem = {
  voters: VoterMap;
};

type FileStore = Record<string, StoredItem>;

function toStoredItem(value: unknown): StoredItem {
  if (!value || typeof value !== "object") return { voters: {} };
  const record = value as Record<string, unknown>;
  if (record.voters && typeof record.voters === "object") {
    return { voters: normalizeVoters(record.voters) };
  }
  // Legacy bare counts / state without voters — start a fresh voter map.
  // Keep likes visible via empty voters until new unique votes arrive.
  return { voters: {} };
}

async function readFileStore(): Promise<FileStore> {
  try {
    const stored: unknown = JSON.parse(await readFile(file, "utf8"));
    if (!stored || typeof stored !== "object") return {};
    const out: FileStore = {};
    for (const [id, value] of Object.entries(stored as Record<string, unknown>)) {
      out[id] = toStoredItem(value);
    }
    return out;
  } catch {
    return {};
  }
}

async function writeFileStore(map: FileStore) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(map, null, 2));
}

function summarize(store: FileStore): ReactionsMap {
  const out: ReactionsMap = {};
  for (const [id, item] of Object.entries(store)) {
    out[id] = stateFromVoters(item.voters);
  }
  return out;
}

async function loadVoters(itemId: string): Promise<VoterMap> {
  const collection = await getCollection("gallery_reactions").catch(() => null);
  if (collection) {
    const doc = await collection.findOne({ itemId });
    return normalizeVoters(doc?.voters);
  }
  const map = await readFileStore();
  return map[itemId]?.voters ?? {};
}

async function saveVoters(itemId: string, voters: VoterMap): Promise<ItemReactionState> {
  const state = stateFromVoters(voters);
  const collection = await getCollection("gallery_reactions").catch(() => null);
  if (collection) {
    await collection.updateOne(
      { itemId },
      {
        $set: {
          itemId,
          voters,
          counts: state.counts,
          likes: state.likes,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    return state;
  }

  const map = await readFileStore();
  map[itemId] = { voters };
  await writeFileStore(map);
  return state;
}

export async function loadReactionCounts(): Promise<ReactionsMap> {
  const collection = await getCollection("gallery_reactions").catch(() => null);
  if (collection) {
    const docs = await collection.find({}).toArray();
    const out: ReactionsMap = {};
    for (const doc of docs) {
      const id = typeof doc.itemId === "string" ? doc.itemId : null;
      if (!id) continue;
      if (doc.voters && typeof doc.voters === "object") {
        out[id] = stateFromVoters(normalizeVoters(doc.voters));
      } else {
        out[id] = normalizeState(doc);
      }
    }
    return out;
  }
  return summarize(await readFileStore());
}

export async function commitReaction(input: {
  itemId: string;
  voterId: string;
  reaction: ReactionType | null;
}): Promise<ItemReactionState> {
  if (!isValidVoterId(input.voterId)) {
    throw new Error("Invalid voter");
  }

  const voters = { ...(await loadVoters(input.itemId)) };
  const previous = isReactionType(voters[input.voterId]) ? voters[input.voterId]! : null;
  const next = input.reaction;

  if (previous === next) {
    return stateFromVoters(voters);
  }

  if (!next) {
    delete voters[input.voterId];
  } else {
    voters[input.voterId] = next;
  }

  return saveVoters(input.itemId, voters);
}
