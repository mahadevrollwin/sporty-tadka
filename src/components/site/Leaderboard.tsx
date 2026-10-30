"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { games, type GameId } from "@/content/home";
import {
  formatScore,
  gameRules,
  type LeaderboardPayload,
} from "@/lib/game-scores";
import {
  peekPendingScore,
  readPlayerName,
  recordScore,
  rememberPlayer,
  syncScamScores,
  takePendingScore,
} from "@/lib/record-score";

type Tab = "all" | GameId;

function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardPayload | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ game: GameId; score: number } | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stored = readPlayerName();
    setName(stored);
    setDraft(stored);
    setPending(peekPendingScore());

    let ignore = false;
    async function load() {
      try {
        const response = await fetch("/api/games");
        if (!response.ok) throw new Error("load");
        const payload = (await response.json()) as LeaderboardPayload;
        if (!ignore) {
          setData(payload);
          setNotice("");
        }
      } catch {
        if (!ignore) setNotice("Couldn't load the leaderboard.");
      }
    }

    void load();
    void syncScamScores(localStorage.getItem("scam-alert-players"));

    const onScores = () => void load();
    const onPlayer = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      if (typeof next !== "string") return;
      setName(next);
      setDraft(next);
    };
    const onNeed = (event: Event) => {
      const detail = (event as CustomEvent<{ game: GameId; score: number }>).detail;
      if (!detail) return;
      setPending(detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "scam-alert-players") void syncScamScores(event.newValue);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as { source?: string; game?: string; score?: number } | null;
      if (payload?.source !== "sporty-tadka" || payload.game !== "rapid" || typeof payload.score !== "number") return;
      void recordScore({ game: "rapid", score: payload.score, remember: true }).then((result) => {
        if (result === "failed") setNotice("That Star Crush score didn't save.");
      });
    };

    window.addEventListener("st-scores", onScores);
    window.addEventListener("st-player", onPlayer);
    window.addEventListener("st-need-name", onNeed);
    window.addEventListener("storage", onStorage);
    window.addEventListener("message", onMessage);
    return () => {
      ignore = true;
      window.removeEventListener("st-scores", onScores);
      window.removeEventListener("st-player", onPlayer);
      window.removeEventListener("st-need-name", onNeed);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    const saved = rememberPlayer(draft);
    if (!saved) return;
    setName(saved);
    const waiting = takePendingScore() ?? pending;
    setPending(null);
    if (!waiting) return;
    const result = await recordScore({ game: waiting.game, score: waiting.score, name: saved, remember: true });
    if (result === "failed" || result === "offline") setNotice("That score didn't save.");
  }

  const board = data?.boards.find((item) => item.game === tab);
  const status = data?.status;

  return (
    <div id="leaderboard" className="mt-[18px] rounded-[18px] border border-line bg-elevated p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-[12.5px] font-bold tracking-[0.14em] text-dim uppercase">Leaderboard</p>
          <h3 className="m-0 mt-1 font-display text-[clamp(28px,4vw,40px)] leading-none font-black uppercase">
            The board
          </h3>
        </div>
        <form onSubmit={saveName} className="flex w-full max-w-xs gap-2">
          <label className="sr-only" htmlFor="player-name">
            Nickname
          </label>
          <input
            id="player-name"
            value={draft}
            maxLength={20}
            placeholder="Your nickname"
            onChange={(event) => setDraft(event.target.value)}
            className={`min-w-0 flex-1 rounded-lg border bg-panel px-3 py-2 text-sm text-ink outline-none ${
              pending && !name ? "border-lime" : "border-line focus:border-lime"
            }`}
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-lime px-3 py-2 text-sm font-bold text-pitch hover:bg-[#d4ff5c]"
          >
            {name ? "Update" : "Save"}
          </button>
        </form>
      </div>

      {pending && !name && (
        <p className="m-0 mt-3 text-sm text-lime">
          Add a nickname to save your {formatScore(pending.game, pending.score)}{" "}
          {gameRules.find((rule) => rule.id === pending.game)?.label} score.
        </p>
      )}
      {notice && <p className="m-0 mt-3 text-sm text-magenta">{notice}</p>}
      {status === "unconfigured" && (
        <p className="m-0 mt-3 text-sm text-dim">The leaderboard isn&apos;t connected to the database yet.</p>
      )}
      {status === "unreachable" && (
        <p className="m-0 mt-3 text-sm text-dim">The score database didn&apos;t respond. Plays still count on this browser.</p>
      )}
      {status === "ready" && data?.plays === 0 && (
        <p className="m-0 mt-3 text-sm text-dim">No scores yet. Finish a game to take the first spot.</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(
          [
            ["Plays", data?.plays ?? 0],
            ["Players", data?.players ?? 0],
            ["Points", data?.points ?? 0],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-panel px-3 py-3">
            <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-dimmer uppercase">{label}</p>
            <p className="m-0 mt-1 font-display text-[clamp(22px,3vw,32px)] leading-none font-black text-lime tabular-nums">
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Leaderboard games">
        <TabButton selected={tab === "all"} onClick={() => setTab("all")}>
          All
        </TabButton>
        {games.map((game) => (
          <TabButton key={game.id} selected={tab === game.id} onClick={() => setTab(game.id)}>
            {game.emoji} {game.label}
          </TabButton>
        ))}
      </div>

      {tab === "all" ? (
        <ol className="m-0 mt-3 list-none p-0">
          {(data?.recent ?? []).length === 0 && (
            <li className="py-4 text-sm text-dim">{data ? "Nothing on the board yet." : "Loading scores…"}</li>
          )}
          {data?.recent.map((row, index) => (
            <li
              key={`${row.createdAt}-${row.name}-${index}`}
              className="grid grid-cols-[minmax(0,1.4fr)_minmax(5.5rem,0.9fr)_minmax(4.5rem,0.7fr)] items-center gap-x-3 border-t border-line-soft py-2.5 text-sm sm:grid-cols-[minmax(0,1.6fr)_minmax(6.5rem,0.9fr)_minmax(5rem,0.7fr)_minmax(4rem,0.55fr)]"
            >
              <span className="min-w-0 truncate font-semibold">{row.name}</span>
              <span className="truncate text-dim">
                {gameRules.find((rule) => rule.id === row.game)?.label}
              </span>
              <span className="text-right font-display text-base font-black text-lime tabular-nums">
                {formatScore(row.game, row.score)}
              </span>
              <span className="hidden text-right text-dimmer sm:inline">{ago(row.createdAt)}</span>
            </li>
          ))}
        </ol>
      ) : (
        board && (
          <div className="mt-3">
            <p className="m-0 text-sm text-dim">
              {board.plays.toLocaleString()} plays
              {board.best != null && ` · best ${formatScore(board.game, board.best)}`}
              {board.better === "high" && board.plays > 0 && ` · ${board.total.toLocaleString()} total`}
            </p>
            <ol className="m-0 list-none p-0">
              {board.rows.length === 0 && <li className="py-4 text-sm text-dim">No scores in this game yet.</li>}
              {board.rows.map((row, index) => (
                <li key={row.name} className="flex items-center gap-3 border-t border-line-soft py-2.5">
                  <span className="w-6 font-display text-lg font-black text-dimmer">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{row.name}</span>
                  <span className="text-xs text-dimmer">{row.plays} plays</span>
                  <span className="font-display text-lg font-black text-lime tabular-nums">
                    {formatScore(board.game, row.score)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )
      )}
    </div>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-bold ${
        selected ? "bg-lime text-pitch" : "bg-panel text-dim hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
