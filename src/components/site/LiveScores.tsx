"use client";

import { useEffect, useRef, useState } from "react";

type Status = "live" | "finished" | "upcoming";

type Fixture = {
  id: string;
  league: string;
  home: string;
  away: string;
  home_logo: string | null;
  away_logo: string | null;
  home_score: string | null;
  away_score: string | null;
  status: Status;
  status_text: string;
  time: string;
  competition: string;
  url: string;
  batting: "home" | "away" | null;
  sets: { home: string; away: string }[] | null;
};

type Player = {
  name?: string;
  number?: number | null;
  position?: string | null;
  captain?: boolean;
  rating?: string | null;
};

type Lineups = {
  home_formation?: string | null;
  away_formation?: string | null;
  confirmed?: boolean;
  home_xi?: Player[] | null;
  away_xi?: Player[] | null;
  home_subs?: Player[] | null;
  away_subs?: Player[] | null;
};

type Incident = {
  time?: number | string;
  type?: string;
  side?: string;
  player?: string;
  player_in?: string;
  player_out?: string;
  home_score?: number;
  away_score?: number;
  is_goal?: boolean;
  is_sub?: boolean;
};

type Batter = {
  name: string;
  howOut: string;
  runs: string;
  balls: string;
  fours: string;
  sixes: string;
  strikeRate: string;
  active: string;
};

type Bowler = {
  name: string;
  figures: string;
  economy: string;
};

type Innings = {
  team: string;
  label: string;
  score: string;
  batting: Batter[];
  bowling: Bowler[];
  yetToBat: string[];
};

type CommentaryItem = {
  over: string;
  title: string;
  text: string;
};

type MatchDetailData = {
  summary?: string | null;
  note?: string | null;
  innings?: Innings[];
  commentary?: CommentaryItem[];
  incidents?: Incident[] | null;
  lineups?: Lineups | null;
};

type MatchPayload = {
  match?: MatchDetailData & Fixture;
};

type ScoresPayload = {
  matches?: Fixture[];
  updated?: string;
};

const sports = [
  { id: "cricket", label: "Cricket" },
  { id: "football", label: "Football" },
  { id: "basketball", label: "Basketball" },
  { id: "tennis", label: "Tennis" },
] as const;

type Sport = (typeof sports)[number]["id"];

const filters = ["All", "Live", "Results", "Upcoming"] as const;
type Filter = (typeof filters)[number];

const chips = ["bg-lime text-pitch", "bg-magenta text-white", "bg-cyan text-pitch", "bg-yellow text-pitch"];

function matchesFilter(match: Fixture, filter: Filter) {
  if (filter === "Live") return match.status === "live";
  if (filter === "Results") return match.status === "finished";
  if (filter === "Upcoming") return match.status === "upcoming";
  return true;
}

function scoreText(value: string | null) {
  if (value == null || value === "" || value === "-") return "—";
  return value;
}

function kickoff(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Time to be confirmed";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusLine(match: Fixture) {
  if (match.status === "upcoming") {
    if (match.status_text === "Not started" || match.status_text === "Abnormal") return kickoff(match.time);
    return match.status_text;
  }
  return match.status_text || (match.status === "finished" ? "Full time" : "Live");
}

function battingSide(match: Fixture) {
  if (match.status !== "live") return null;
  return match.batting;
}

function playersOf(value: Player[] | null | undefined) {
  return (value ?? []).filter((player) => player.name);
}

function incidentText(incident: Incident) {
  if (incident.is_sub || incident.type === "Substitution") {
    const incoming = incident.player_in || "Player on";
    const outgoing = incident.player_out ? ` for ${incident.player_out}` : "";
    return `${incoming}${outgoing}`;
  }
  const name = incident.player?.trim();
  const kind = incident.type || "Event";
  return name ? `${kind} · ${name}` : kind;
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function hasScore(match: Fixture) {
  return [match.home_score, match.away_score].some((value) => value != null && value !== "" && value !== "-");
}

function sortMatches(matches: Fixture[]) {
  const rank = (match: Fixture) => {
    if (hasScore(match) && match.status === "live") return 0;
    if (hasScore(match)) return 1;
    if (match.status === "live") return 2;
    if (match.status === "upcoming") return 3;
    return 4;
  };
  return [...matches].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    const aTime = new Date(a.time).getTime();
    const bTime = new Date(b.time).getTime();
    if (hasScore(a) && a.status !== "live") return bTime - aTime;
    return aTime - bTime;
  });
}

function TeamMark({ name, logo, chip }: { name: string; logo: string | null; chip: string }) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt="" className="h-7 w-7 shrink-0 rounded-md bg-panel object-contain" />
    );
  }
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px] font-black ${chip}`}>
      {initials(name)}
    </span>
  );
}

export function LiveScores() {
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [sport, setSport] = useState<Sport>("cricket");
  const [filter, setFilter] = useState<Filter>("All");
  const [matches, setMatches] = useState<Fixture[]>([]);
  const [selected, setSelected] = useState<Fixture | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const [updated, setUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/scores?sport=${sport}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Scores unavailable");
        const data = (await response.json()) as ScoresPayload;
        if (cancelled) return;
        setMatches(sortMatches(data.matches ?? []));
        setUpdated(data.updated ?? null);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    setMatches([]);
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [sport]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => setPresent(true));
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedRef.current) {
        setSelected(null);
        return;
      }
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    closeButton.current?.focus();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    const timeout = window.setTimeout(() => setPresent(false), 280);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const visible = matches.filter((match) => matchesFilter(match, filter));
  const liveCount = matches.filter((match) => match.status === "live").length;

  function showPanel() {
    setPresent(false);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="live-scores-panel"
        onClick={showPanel}
        className={`fixed top-[4.75rem] right-0 z-[70] flex cursor-pointer items-center gap-2.5 rounded-l-full border border-r-0 border-line bg-panel py-2.5 pr-3 pl-4 shadow-[-8px_0_28px_rgba(0,0,0,0.35)] ${
          open ? "pointer-events-none opacity-0" : ""
        }`}
      >
        <span className="h-2 w-2 animate-live rounded-full bg-magenta shadow-[0_0_10px_var(--color-magenta)] motion-reduce:animate-none" />
        <span className="font-display text-[15px] leading-none font-black tracking-[0.08em] text-ink uppercase">
          Scores
        </span>
        <span className="text-[12px] font-bold text-lime">{loading ? "…" : liveCount}</span>
      </button>

      {open || present ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="Close scores"
            onClick={() => setOpen(false)}
            className={`absolute inset-0 cursor-pointer bg-black/50 transition-opacity duration-300 motion-reduce:transition-none ${
              open && present ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            id="scores"
            className={`absolute inset-y-0 right-0 flex w-[min(100vw,400px)] flex-col border-l border-line bg-panel shadow-[-16px_0_48px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
              open && present ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-4">
              <span className="h-2 w-2 shrink-0 animate-live rounded-full bg-magenta shadow-[0_0_10px_var(--color-magenta)] motion-reduce:animate-none" />
              <div className="min-w-0">
                <h2 className="font-display text-[22px] leading-none font-black uppercase">Live scores</h2>
                <p className="mt-1 mb-0 text-sm text-dim">{loading ? "Loading" : `${liveCount} in play`}</p>
              </div>
              <button
                ref={closeButton}
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto cursor-pointer rounded-md px-2 py-1 text-[12.5px] font-bold tracking-[0.14em] text-lime uppercase"
              >
                Hide
              </button>
            </div>

            <div id="live-scores-panel" className="flex min-h-0 flex-1 flex-col px-4 pt-3">
              <div className="mb-3 flex flex-col gap-2">
                <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sports.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={sport === item.id}
                      onClick={() => {
                        setSport(item.id);
                        setSelected(null);
                      }}
                      className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold tracking-wide uppercase ${
                        sport === item.id ? "bg-magenta text-white" : "bg-elevated text-dim hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filters.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={filter === item}
                      onClick={() => setFilter(item)}
                      className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold tracking-wide uppercase ${
                        filter === item ? "bg-lime text-pitch" : "bg-elevated text-dim hover:text-ink"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {selected ? (
                  <MatchDetail sport={sport} match={selected} onBack={() => setSelected(null)} />
                ) : null}
                {!selected && visible.map((match, index) => {
                  const batting = battingSide(match);
                  const sides = [
                    { key: "home" as const, name: match.home, logo: match.home_logo, score: match.home_score },
                    { key: "away" as const, name: match.away, logo: match.away_logo, score: match.away_score },
                  ];
                  return (
                    <button
                      key={`${match.league}-${match.id}`}
                      type="button"
                      onClick={() => setSelected(match)}
                      aria-label={`Open ${match.home} versus ${match.away}`}
                      className="flex w-full shrink-0 cursor-pointer flex-col rounded-[14px] border border-line bg-elevated p-3.5 text-left hover:border-lime/45"
                    >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-semibold tracking-wide text-dim uppercase">
                        {match.competition}
                      </span>
                      {match.status === "live" ? (
                        <span className="rounded bg-magenta/15 px-1.5 py-0.5 text-[11px] font-black tracking-wide text-magenta">
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold tracking-wide text-dimmer uppercase">
                          {match.status === "finished" ? "Result" : "Soon"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {sides.map((side) => {
                        const active = batting === side.key;
                        return (
                          <div key={side.key} className="flex items-center gap-2.5">
                            <TeamMark name={side.name} logo={side.logo} chip={chips[(index + (side.key === "away" ? 1 : 0)) % chips.length]} />
                            <span className={`min-w-0 flex-1 truncate text-[15px] ${active ? "font-semibold text-ink" : "text-soft"}`}>
                              {side.name}
                            </span>
                            <span
                              className={`font-display text-[18px] font-extrabold tabular-nums ${active ? "text-lime" : "text-ink"}`}
                            >
                              {scoreText(side.score)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 mb-0 text-[13.5px] leading-snug text-lime">{statusLine(match)}</p>
                  </button>
                );
              })}
              {!selected && !loading && !error && visible.length === 0 && (
                <p className="m-0 py-6 text-sm text-dim">Nothing in this filter right now.</p>
              )}
              {!selected && loading && matches.length === 0 && <p className="m-0 py-6 text-sm text-dim">Loading scores…</p>}
              {!selected && error && matches.length === 0 && (
                <p className="m-0 py-6 text-sm text-dim">Scores are unavailable right now.</p>
              )}
            </div>
              <p className="mt-auto mb-0 shrink-0 border-t border-line bg-panel py-3 text-xs text-dimmer">
                {updated ? `Updated ${kickoff(updated)}.` : "Scores refresh about once a minute."}{" "}
                <a href="https://www.espn.com/" className="text-dim underline-offset-2 hover:text-ink hover:underline">
                  Scores by ESPN
                </a>
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

const positionNames: Record<string, string> = {
  G: "Goalkeeper",
  D: "Defender",
  M: "Midfielder",
  F: "Forward",
};

function positionLabel(position: string | null | undefined) {
  if (!position) return "";
  return positionNames[position] ?? position;
}

function MatchDetail({ sport, match, onBack }: { sport: Sport; match: Fixture; onBack: () => void }) {
  const backButton = useRef<HTMLButtonElement>(null);
  const [detail, setDetail] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    backButton.current?.focus();
  }, []);

  useEffect(() => {
    if (!match.id || !match.league) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/scores/match?sport=${sport}&league=${encodeURIComponent(match.league)}&id=${encodeURIComponent(match.id)}`,
        );
        if (!response.ok) throw new Error("Match details unavailable");
        const data = (await response.json()) as MatchPayload;
        if (!cancelled) {
          setDetail(data.match ?? null);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [match.id, match.league, sport]);

  const lineups = detail?.lineups;
  const innings = detail?.innings ?? [];
  const commentary = detail?.commentary ?? [];
  const incidents = [...(detail?.incidents ?? [])].sort((a, b) => Number(a.time ?? 0) - Number(b.time ?? 0));
  const squads = [
    {
      name: match.home,
      logo: match.home_logo,
      formation: lineups?.home_formation,
      xi: playersOf(lineups?.home_xi),
      subs: playersOf(lineups?.home_subs),
    },
    {
      name: match.away,
      logo: match.away_logo,
      formation: lineups?.away_formation,
      xi: playersOf(lineups?.away_xi),
      subs: playersOf(lineups?.away_subs),
    },
  ];
  const hasPlayers = squads.some((squad) => squad.xi.length > 0 || squad.subs.length > 0);
  const sets = match.sets ?? [];
  const hasDetails = innings.length > 0 || commentary.length > 0 || incidents.length > 0 || hasPlayers || sets.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <button
        ref={backButton}
        type="button"
        onClick={onBack}
        className="w-fit cursor-pointer text-[13px] font-bold tracking-[0.12em] text-lime uppercase"
      >
        ← Scores
      </button>

      <div className="rounded-[14px] border border-line bg-elevated p-3.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-semibold tracking-wide text-dim uppercase">{match.competition}</span>
          {match.status === "live" ? (
            <span className="rounded bg-magenta/15 px-1.5 py-0.5 text-[11px] font-black tracking-wide text-magenta">LIVE</span>
          ) : (
            <span className="text-[11px] font-bold tracking-wide text-dimmer uppercase">
              {match.status === "finished" ? "Result" : "Soon"}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <TeamBlock name={match.home} logo={match.home_logo} />
          <div className="text-center">
            <div className="font-display text-[28px] leading-none font-black tabular-nums">
              {scoreText(match.home_score)}
              <span className="px-1 text-dim">–</span>
              {scoreText(match.away_score)}
            </div>
          </div>
          <TeamBlock name={match.away} logo={match.away_logo} align="end" />
        </div>
        <p className="mt-3 mb-0 text-[13.5px] leading-snug text-lime">{detail?.summary || statusLine(match)}</p>
        {detail?.note ? <p className="mt-1 mb-0 text-[13px] leading-snug text-dim">{detail.note}</p> : null}
      </div>

      {loading ? <p className="m-0 text-sm text-dim">Loading game and player details…</p> : null}
      {error ? <p className="m-0 text-sm text-dim">Match details are unavailable right now.</p> : null}

      {!loading && !error && sets.length > 0 ? (
        <section>
          <h3 className="m-0 font-display text-[16px] font-black tracking-wide uppercase">Sets</h3>
          <ol className="mt-2 mb-0 flex list-none flex-col gap-1.5 p-0">
            {sets.map((set, index) => (
              <li key={index} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[14px]">
                <span className="text-right font-display text-[18px] font-black tabular-nums">{set.home}</span>
                <span className="text-[11px] font-bold tracking-wide text-dim uppercase">Set {index + 1}</span>
                <span className="font-display text-[18px] font-black tabular-nums">{set.away}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {!loading && !error && commentary.length > 0 ? (
        <section>
          <h3 className="m-0 font-display text-[16px] font-black tracking-wide uppercase">Game</h3>
          <ol className="mt-2 mb-0 flex list-none flex-col gap-2 p-0">
            {commentary.map((ball) => (
              <li key={`${ball.over}-${ball.title}`} className="rounded-xl border border-line bg-elevated px-3 py-2.5">
                <div className="flex items-baseline gap-2">
                  {ball.over ? (
                    <span className="shrink-0 font-display text-[15px] font-black text-lime tabular-nums">{ball.over}</span>
                  ) : null}
                  <span className="text-[14px] font-semibold leading-snug">{ball.title}</span>
                </div>
                {ball.text && ball.text !== ball.title ? (
                  <p className="mt-1 mb-0 text-[13px] leading-snug text-dim">{ball.text}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {!loading && !error && innings.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h3 className="m-0 font-display text-[16px] font-black tracking-wide uppercase">Players</h3>
          {innings.map((entry) => (
            <div key={`${entry.team}-${entry.label}`}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h4 className="m-0 text-[14px] font-semibold">
                  {entry.team}
                  <span className="font-normal text-dim"> · {entry.label}</span>
                </h4>
                <span className="font-display text-[16px] font-black text-lime tabular-nums">{entry.score}</span>
              </div>
              {entry.batting.length > 0 ? (
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {entry.batting.map((player) => (
                    <li key={`${entry.label}-${player.name}`} className="flex items-start justify-between gap-3 text-[14px]">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {player.name}
                          {player.active === "striker" || player.active === "non-striker" ? (
                            <span className="ml-1.5 text-[11px] font-bold tracking-wide text-magenta uppercase">
                              {player.active === "striker" ? "on strike" : "non-striker"}
                            </span>
                          ) : null}
                        </span>
                        <span className="block truncate text-[12.5px] text-dim">{player.howOut}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-display text-[16px] font-black tabular-nums">{player.runs}</span>
                        <span className="block text-[11px] text-dimmer tabular-nums">
                          {player.balls}b · {player.fours}×4 · {player.sixes}×6
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.yetToBat.length > 0 ? (
                <p className="mt-2 mb-0 text-[12.5px] leading-snug text-dim">Yet to bat: {entry.yetToBat.join(", ")}</p>
              ) : null}
              {entry.bowling.length > 0 ? (
                <ul className="mt-2 mb-0 flex list-none flex-col gap-1 border-t border-line pt-2 p-0">
                  {entry.bowling.map((player) => (
                    <li key={`${entry.label}-bowl-${player.name}`} className="flex items-center justify-between gap-3 text-[13.5px]">
                      <span className="min-w-0 truncate">{player.name}</span>
                      <span className="shrink-0 tabular-nums text-soft">
                        {player.figures}
                        {player.economy ? <span className="text-dim"> · {player.economy}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {!loading && !error && incidents.length > 0 ? (
        <section>
          <h3 className="m-0 font-display text-[16px] font-black tracking-wide uppercase">Game</h3>
          <ol className="mt-2 mb-0 flex list-none flex-col gap-2 p-0">
            {incidents.map((incident, index) => (
              <li
                key={`${incident.time}-${incident.type}-${incident.player}-${index}`}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-elevated px-3 py-2.5"
              >
                <span className="w-8 shrink-0 font-display text-[15px] font-black text-lime tabular-nums">
                  {incident.time ?? "–"}
                  {incident.time != null ? "'" : ""}
                </span>
                <span className="min-w-0 text-[14px] leading-snug text-soft">
                  <span className="font-semibold text-ink">{incident.side === "away" ? match.away : match.home}</span>
                  {" · "}
                  {incidentText(incident)}
                  {incident.is_goal && incident.home_score != null && incident.away_score != null
                    ? ` (${incident.home_score}–${incident.away_score})`
                    : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {!loading && !error && hasPlayers ? (
        <section className="flex flex-col gap-4">
          <h3 className="m-0 font-display text-[16px] font-black tracking-wide uppercase">Players</h3>
          {lineups?.confirmed === false ? <p className="m-0 text-sm text-dim">Lineup not confirmed yet.</p> : null}
          {squads.map((squad) =>
            squad.xi.length === 0 && squad.subs.length === 0 ? null : (
              <div key={squad.name}>
                <div className="mb-2 flex items-center gap-2">
                  <TeamMark name={squad.name} logo={squad.logo} chip="bg-lime text-pitch" />
                  <h4 className="m-0 min-w-0 flex-1 truncate text-[15px] font-semibold">{squad.name}</h4>
                  {squad.formation ? <span className="text-[12px] font-bold text-dim">{squad.formation}</span> : null}
                </div>
                <PlayerList title="Starting" players={squad.xi} />
                <PlayerList title="Bench" players={squad.subs} />
              </div>
            ),
          )}
        </section>
      ) : null}

      {!loading && !error && !hasDetails ? (
        <p className="m-0 text-sm text-dim">Lineups and player events aren’t published for this match yet.</p>
      ) : null}
    </div>
  );
}

function TeamBlock({
  name,
  logo,
  align = "start",
}: {
  name: string;
  logo: string | null;
  align?: "start" | "end";
}) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${align === "end" ? "items-end text-right" : "items-start"}`}>
      <TeamMark name={name} logo={logo} chip={align === "end" ? "bg-magenta text-white" : "bg-lime text-pitch"} />
      <span className="line-clamp-2 text-[13px] leading-tight font-semibold">{name}</span>
    </div>
  );
}

function PlayerList({ title, players }: { title: string; players: Player[] }) {
  if (players.length === 0) return null;
  return (
    <div className="mb-2">
      <div className="mb-1 text-[11px] font-bold tracking-[0.12em] text-dimmer uppercase">{title}</div>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {players.map((player) => (
          <li key={`${player.number}-${player.name}`} className="flex items-center gap-2 text-[14px]">
            <span className="w-6 shrink-0 text-center font-display text-[14px] font-black text-lime tabular-nums">
              {player.number ?? "–"}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {player.name}
              {player.captain ? <span className="text-dim"> (C)</span> : null}
            </span>
            <span className="shrink-0 text-[12px] text-dim">{positionLabel(player.position)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
