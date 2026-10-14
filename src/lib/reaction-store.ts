import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isReactionType,
  isValidVoterId,
  stateFromVoters,
  type ItemReactionState,
  type ReactionType,
  type ReactionsMap,
  type VoterMap,
} from "@/lib/gallery-reactions";
import { getCollection, mongoConfigured } from "@/lib/mongo";

const file = path.join(process.cwd(), "data", "gallery-reactions.json");

type Vote = {
  itemId: string;
  voterId: string;
  reaction: ReactionType;
};

type FileStore = {
  votes: Vote[];
};

const globalStore = globalThis as unknown as {
  galleryVotesMemory?: Map<string, ReactionType>;
  galleryVotesReady?: Promise<void>;
};

function memoryKey(itemId: string, voterId: string) {
  return `${itemId}::${voterId}`;
}

function memoryMap() {
  if (!globalStore.galleryVotesMemory) {
    globalStore.galleryVotesMemory = new Map();
  }
  return globalStore.galleryVotesMemory;
}

function votersForItem(itemId: string, votes: Iterable<Vote> | Map<string, ReactionType>): VoterMap {
  const voters: VoterMap = {};
  if (votes instanceof Map) {
    const prefix = `${itemId}::`;
    for (const [key, reaction] of votes) {
      if (!key.startsWith(prefix)) continue;
      const voterId = key.slice(prefix.length);
      if (isValidVoterId(voterId) && isReactionType(reaction)) {
        voters[voterId] = reaction;
      }
    }
    return voters;
  }
  for (const vote of votes) {
    if (vote.itemId !== itemId) continue;
    if (isValidVoterId(vote.voterId) && isReactionType(vote.reaction)) {
      voters[vote.voterId] = vote.reaction;
    }
  }
  return voters;
}

function summarizeVotes(votes: Vote[]): ReactionsMap {
  const byItem = new Map<string, VoterMap>();
  for (const vote of votes) {
    if (!isValidVoterId(vote.voterId) || !isReactionType(vote.reaction)) continue;
    const current = byItem.get(vote.itemId) ?? {};
    current[vote.voterId] = vote.reaction;
    byItem.set(vote.itemId, current);
  }
  const out: ReactionsMap = {};
  for (const [itemId, voters] of byItem) {
    out[itemId] = stateFromVoters(voters);
  }
  return out;
}

function parseFileStore(stored: unknown): FileStore {
  if (!stored || typeof stored !== "object") return { votes: [] };

  const record = stored as Record<string, unknown>;

  // Current shape: { votes: Vote[] }
  if (Array.isArray(record.votes)) {
    const votes: Vote[] = [];
    for (const row of record.votes) {
      if (!row || typeof row !== "object") continue;
      const vote = row as Record<string, unknown>;
      const itemId = typeof vote.itemId === "string" ? vote.itemId : "";
      const voterId = typeof vote.voterId === "string" ? vote.voterId : "";
      const reaction = vote.reaction;
      if (!itemId || !isValidVoterId(voterId) || !isReactionType(reaction)) continue;
      votes.push({ itemId, voterId, reaction });
    }
    return { votes };
  }

  // Legacy shape: { [itemId]: { voters: { [voterId]: reaction } } }
  const votes: Vote[] = [];
  for (const [itemId, value] of Object.entries(record)) {
    if (!value || typeof value !== "object") continue;
    const voters = (value as { voters?: unknown }).voters;
    if (!voters || typeof voters !== "object") continue;
    for (const [voterId, reaction] of Object.entries(voters as Record<string, unknown>)) {
      if (!isValidVoterId(voterId) || !isReactionType(reaction)) continue;
      votes.push({ itemId, voterId, reaction });
    }
  }
  return { votes };
}

async function readFileStore(): Promise<FileStore> {
  try {
    const stored: unknown = JSON.parse(await readFile(file, "utf8"));
    return parseFileStore(stored);
  } catch {
    return { votes: [] };
  }
}

async function writeFileStore(store: FileStore) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(store, null, 2));
}

function hydrateMemory(votes: Vote[]) {
  const map = memoryMap();
  map.clear();
  for (const vote of votes) {
    map.set(memoryKey(vote.itemId, vote.voterId), vote.reaction);
  }
}

async function ensureMemoryHydrated() {
  if (globalStore.galleryVotesReady) {
    await globalStore.galleryVotesReady;
    return;
  }
  globalStore.galleryVotesReady = (async () => {
    if (mongoConfigured()) {
      const collection = await getCollection("gallery_reaction_votes").catch(() => null);
      if (collection) {
        await collection.createIndex({ itemId: 1, voterId: 1 }, { unique: true }).catch(() => {});
        const docs = await collection.find({}).toArray();
        const votes: Vote[] = [];
        for (const doc of docs) {
          const itemId = typeof doc.itemId === "string" ? doc.itemId : "";
          const voterId = typeof doc.voterId === "string" ? doc.voterId : "";
          const reaction = doc.reaction;
          if (!itemId || !isValidVoterId(voterId) || !isReactionType(reaction)) continue;
          votes.push({ itemId, voterId, reaction });
        }
        hydrateMemory(votes);
        return;
      }
    }
    const store = await readFileStore();
    hydrateMemory(store.votes);
  })().catch(() => {
    globalStore.galleryVotesReady = undefined;
  });
  await globalStore.galleryVotesReady;
}

async function persistMemory() {
  const map = memoryMap();
  const votes: Vote[] = [];
  for (const [key, reaction] of map) {
    const split = key.indexOf("::");
    if (split <= 0) continue;
    const itemId = key.slice(0, split);
    const voterId = key.slice(split + 2);
    if (!itemId || !isValidVoterId(voterId) || !isReactionType(reaction)) continue;
    votes.push({ itemId, voterId, reaction });
  }

  if (mongoConfigured()) {
    const collection = await getCollection("gallery_reaction_votes").catch(() => null);
    if (collection) {
      // Memory is source of truth for this instance after hydrate + writes;
      // individual commits already upserted — nothing else required here.
      return;
    }
  }

  await writeFileStore({ votes });
}

export async function loadReactionCounts(): Promise<ReactionsMap> {
  await ensureMemoryHydrated();
  return summarizeVotes(
    [...memoryMap().entries()].map(([key, reaction]) => {
      const split = key.indexOf("::");
      return {
        itemId: key.slice(0, split),
        voterId: key.slice(split + 2),
        reaction,
      };
    }),
  );
}

export async function commitReaction(input: {
  itemId: string;
  voterId: string;
  reaction: ReactionType | null;
}): Promise<ItemReactionState> {
  if (!isValidVoterId(input.voterId)) {
    throw new Error("Invalid voter");
  }
  if (!input.itemId) {
    throw new Error("Invalid item");
  }

  await ensureMemoryHydrated();
  const map = memoryMap();
  const key = memoryKey(input.itemId, input.voterId);
  const previous = map.get(key) ?? null;
  const next = input.reaction;

  if (previous === next) {
    return stateFromVoters(votersForItem(input.itemId, map));
  }

  if (mongoConfigured()) {
    const collection = await getCollection("gallery_reaction_votes").catch(() => null);
    if (collection) {
      await collection.createIndex({ itemId: 1, voterId: 1 }, { unique: true }).catch(() => {});
      if (!next) {
        await collection.deleteOne({ itemId: input.itemId, voterId: input.voterId });
        map.delete(key);
      } else {
        await collection.updateOne(
          { itemId: input.itemId, voterId: input.voterId },
          {
            $set: {
              itemId: input.itemId,
              voterId: input.voterId,
              reaction: next,
              updatedAt: new Date(),
            },
          },
          { upsert: true },
        );
        map.set(key, next);
      }
      return stateFromVoters(votersForItem(input.itemId, map));
    }
  }

  if (!next) {
    map.delete(key);
  } else {
    map.set(key, next);
  }
  await persistMemory();
  return stateFromVoters(votersForItem(input.itemId, map));
}
