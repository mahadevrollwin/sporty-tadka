export type ScoreStatus = "live" | "finished" | "upcoming";

export type ScoreFixture = {
  id: string;
  league: string;
  home: string;
  away: string;
  home_logo: string | null;
  away_logo: string | null;
  home_score: string | null;
  away_score: string | null;
  status: ScoreStatus;
  status_text: string;
  time: string;
  competition: string;
  url: string;
  batting: "home" | "away" | null;
  sets: { home: string; away: string }[] | null;
};

export type Batter = {
  name: string;
  howOut: string;
  runs: string;
  balls: string;
  fours: string;
  sixes: string;
  strikeRate: string;
  active: string;
};

export type Bowler = {
  name: string;
  figures: string;
  economy: string;
};

export type Innings = {
  team: string;
  label: string;
  score: string;
  batting: Batter[];
  bowling: Bowler[];
  yetToBat: string[];
};

export type CommentaryItem = {
  over: string;
  title: string;
  text: string;
};

export type ScorePlayer = {
  name?: string;
  number?: number | null;
  position?: string | null;
  captain?: boolean;
};

export type ScoreLineups = {
  home_formation?: string | null;
  away_formation?: string | null;
  confirmed?: boolean;
  home_xi?: ScorePlayer[] | null;
  away_xi?: ScorePlayer[] | null;
  home_subs?: ScorePlayer[] | null;
  away_subs?: ScorePlayer[] | null;
};

export type ScoreIncident = {
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

export type ScoreDetail = {
  summary: string | null;
  note: string | null;
  innings: Innings[];
  commentary: CommentaryItem[];
  incidents: ScoreIncident[];
  lineups: ScoreLineups | null;
};

const footballLeagues = [
  "eng.1",
  "esp.1",
  "ger.1",
  "ita.1",
  "fra.1",
  "uefa.champions",
  "uefa.europa",
  "jpn.1",
  "usa.1",
  "ind.1",
  "aus.1",
  "ned.1",
  "por.1",
  "bra.1",
  "arg.1",
  "ksa.1",
  "tur.1",
];

const basketballLeagues = ["nba", "wnba"];

export async function loadScoreboard(sport: string) {
  const matches =
    sport === "cricket"
      ? await cricketBoard()
      : sport === "football"
        ? await leagueBoards("soccer", footballLeagues)
        : sport === "basketball"
          ? await leagueBoards("basketball", basketballLeagues)
          : sport === "tennis"
            ? await tennisBoard()
            : [];

  return { matches: pickMatches(matches), updated: new Date().toISOString() };
}

export async function loadMatch(sport: string, league: string, id: string): Promise<ScoreDetail> {
  const path =
    sport === "cricket"
      ? "cricket"
      : sport === "football"
        ? "soccer"
        : sport === "basketball"
          ? "basketball"
          : sport === "tennis"
            ? "tennis"
            : "";
  if (!path) throw new Error("Unknown sport");

  const data = await getJson(
    `https://site.api.espn.com/apis/site/v2/sports/${path}/${league}/summary?event=${encodeURIComponent(id)}`,
  );
  if (sport === "cricket") return cricketDetail(data);
  return teamSportDetail(data);
}

async function cricketBoard() {
  const data = asRecord(
    await getJson("https://site.web.api.espn.com/apis/v2/scoreboard/header?sport=cricket&region=in&lang=en"),
  );
  const sports = asArray(data?.sports);
  const leagues = asArray(asRecord(sports[0])?.leagues);
  const matches: ScoreFixture[] = [];
  for (const league of leagues) {
    const row = asRecord(league);
    if (!row) continue;
    const leagueId = str(row.id);
    const competition = str(row.abbreviation) || str(row.shortName) || str(row.name) || "Cricket";
    for (const event of asArray(row.events)) {
      if (!isInternationalCricket(event)) continue;
      const fixture = fromHeaderEvent(event, "cricket", leagueId, competition);
      if (fixture) matches.push(fixture);
    }
  }
  return matches;
}

async function tennisBoard() {
  const data = asRecord(
    await getJson("https://site.web.api.espn.com/apis/v2/scoreboard/header?sport=tennis&region=us&lang=en"),
  );
  const sports = asArray(data?.sports);
  const leagues = asArray(asRecord(sports[0])?.leagues);
  const matches: ScoreFixture[] = [];
  const now = Date.now();
  for (const league of leagues) {
    const row = asRecord(league);
    if (!row) continue;
    const leagueId = str(row.slug) || str(row.abbreviation).toLowerCase();
    const competition = str(row.abbreviation) || str(row.name) || "Tennis";
    for (const event of asArray(row.events)) {
      const record = asRecord(event);
      const when = Date.parse(str(record?.date));
      const state = str(record?.status);
      const recent = Number.isNaN(when) || (when > now - 2 * 86400000 && when < now + 2 * 86400000);
      if (state !== "in" && !recent) continue;
      const fixture = fromHeaderEvent(event, "tennis", leagueId, competition);
      if (fixture) matches.push(fixture);
    }
  }
  return matches;
}

async function leagueBoards(sportPath: string, slugs: string[]) {
  const boards = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return asRecord(await getJson(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/${slug}/scoreboard`));
      } catch {
        return null;
      }
    }),
  );
  const matches: ScoreFixture[] = [];
  for (const board of boards) {
    if (!board) continue;
    const league = asRecord(asArray(board.leagues)[0]);
    const slug = str(league?.slug);
    const competition = str(league?.abbreviation) || str(league?.name) || slug;
    for (const event of asArray(board.events)) {
      const fixture = fromScoreboardEvent(event, slug, competition);
      if (fixture) matches.push(fixture);
    }
  }
  return matches;
}

function isInternationalCricket(event: unknown) {
  const row = asRecord(event);
  if (!row) return false;
  const intlClass = str(asRecord(row.class)?.internationalClassId);
  if (intlClass && intlClass !== "0") return true;
  const sides = asArray(row.competitors).map((item) => asRecord(item)).filter((item) => item != null);
  return sides.length >= 2 && sides.every((side) => side.isNational === true);
}

function fromHeaderEvent(event: unknown, sport: string, league: string, competition: string) {
  const row = asRecord(event);
  if (!row) return null;
  const competitors = asArray(row.competitors).map((item) => asRecord(item)).filter((item) => item != null);
  const home = competitors.find((item) => item.homeAway === "home") ?? competitors[0];
  const away = competitors.find((item) => item.homeAway === "away") ?? competitors[1];
  if (!home || !away) return null;

  const full = asRecord(row.fullStatus);
  const type = asRecord(full?.type);
  const state = str(row.status) || str(type?.state);
  const status = toStatus(state);
  const summary = str(full?.summary);
  const longSummary = str(full?.longSummary);
  const battingId = str(full?.battingTeamId);
  const batting = battingId && battingId === str(home.id) ? "home" : battingId && battingId === str(away.id) ? "away" : null;

  return fixture({
    id: str(row.id),
    league,
    competition,
    home,
    away,
    status,
    statusText: status === "live" ? liveText(summary, longSummary) : status === "finished" ? resultText(summary, str(type?.shortDetail)) : "Not started",
    time: str(row.date),
    batting: status === "live" ? batting : null,
    sets: sport === "tennis" ? setRows(home, away) : null,
    shorten: sport === "cricket",
  });
}

function fromScoreboardEvent(event: unknown, league: string, competition: string) {
  const row = asRecord(event);
  if (!row) return null;
  const competitionRow = asRecord(asArray(row.competitions)[0]);
  const competitors = asArray(competitionRow?.competitors).map((item) => asRecord(item)).filter((item) => item != null);
  const home = competitors.find((item) => item.homeAway === "home") ?? competitors[0];
  const away = competitors.find((item) => item.homeAway === "away") ?? competitors[1];
  if (!home || !away) return null;
  const statusRow = asRecord(competitionRow?.status) ?? asRecord(row.status);
  const type = asRecord(statusRow?.type);
  const status = toStatus(str(type?.state));
  return fixture({
    id: str(row.id),
    league,
    competition,
    home,
    away,
    status,
    statusText:
      status === "live"
        ? str(type?.shortDetail) || "Live"
        : status === "finished"
          ? str(type?.shortDetail) || "Full time"
          : "Not started",
    time: str(row.date) || str(competitionRow?.date),
    batting: null,
    sets: null,
    shorten: false,
  });
}

function fixture(input: {
  id: string;
  league: string;
  competition: string;
  home: Record<string, unknown>;
  away: Record<string, unknown>;
  status: ScoreStatus;
  statusText: string;
  time: string;
  batting: "home" | "away" | null;
  sets: { home: string; away: string }[] | null;
  shorten: boolean;
}): ScoreFixture | null {
  if (!input.id || !input.league) return null;
  const homeName = teamName(input.home);
  const awayName = teamName(input.away);
  if (!homeName || !awayName) return null;
  return {
    id: input.id,
    league: input.league,
    home: homeName,
    away: awayName,
    home_logo: logoOf(input.home),
    away_logo: logoOf(input.away),
    home_score: cardScore(input.home, input.status, input.shorten),
    away_score: cardScore(input.away, input.status, input.shorten),
    status: input.status,
    status_text: input.statusText,
    time: input.time,
    competition: input.competition,
    url: `${input.league}/${input.id}`,
    batting: input.batting,
    sets: input.sets,
  };
}

function cricketDetail(data: unknown): ScoreDetail {
  const root = asRecord(data);
  const competition = asRecord(asArray(asRecord(root?.header)?.competitions)[0]);
  const competitors = asArray(competition?.competitors).map((item) => asRecord(item)).filter((item) => item != null);
  const status = asRecord(competition?.status);
  const summary = str(status?.summary) || str(asRecord(status?.type)?.shortDetail) || null;
  const toss = asArray(root?.notes)
    .map((item) => asRecord(item))
    .find((item) => item?.type === "toss");
  const periods = new Set<number>();
  for (const side of competitors) {
    for (const line of asArray(side.linescores)) {
      const period = num(asRecord(line)?.period);
      if (period) periods.add(period);
    }
  }

  const innings = [...periods]
    .sort((a, b) => a - b)
    .flatMap((period) => {
      const batting = competitors.find((side) => Boolean(asRecord(lineFor(side, period))?.isBatting));
      if (!batting) return [];
      const bowling = competitors.find((side) => side !== batting);
      const line = asRecord(lineFor(batting, period));
      const batters = playersFor(root, batting);
      const bowlers = bowling ? playersFor(root, bowling) : [];
      const battingRows = batters
        .map((player) => batterRow(player, period))
        .filter((row) => row != null)
        .sort((a, b) => a.order - b.order);
      const bowlingRows = bowlers
        .map((player) => bowlerRow(player, period))
        .filter((row) => row != null)
        .sort((a, b) => a.order - b.order);
      const batted = new Set(battingRows.map((row) => row.name));
      const yetToBat =
        line?.isCurrent === 1
          ? batters
              .map((player) => str(asRecord(asRecord(player)?.athlete)?.displayName))
              .filter((name) => name && !batted.has(name))
          : [];
      const runs = str(line?.runs);
      const wickets = str(line?.wickets);
      const overs = str(line?.overs);
      const score =
        str(line?.score) ||
        (runs ? `${runs}${wickets ? `/${wickets}` : ""}${overs ? ` (${overs} ov)` : ""}` : "");
      return [
        {
          team: teamName(batting),
          label: `${ordinal(period)} innings`,
          score,
          batting: battingRows.map(({ order: _order, ...row }) => row),
          bowling: bowlingRows.map(({ order: _order, ...row }) => row),
          yetToBat,
        },
      ];
    });

  const commentaries = asRecord(competition?.commentaries);
  const commentary = Object.values(commentaries ?? {})
    .map((item) => asRecord(item))
    .filter((item) => item != null)
    .sort((a, b) => num(b.id) - num(a.id))
    .slice(0, 12)
    .map((item) => ({
      over: overLabel(str(item.id)),
      title: plain(item.shortText),
      text: plain(item.text),
    }))
    .filter((item) => item.title || item.text);

  return {
    summary,
    note: toss ? plain(toss.text) : null,
    innings,
    commentary,
    incidents: [],
    lineups: null,
  };
}

function teamSportDetail(data: unknown): ScoreDetail {
  const root = asRecord(data);
  const competition = asRecord(asArray(asRecord(root?.header)?.competitions)[0]);
  const competitors = asArray(competition?.competitors).map((item) => asRecord(item)).filter((item) => item != null);
  const home = competitors.find((item) => item.homeAway === "home");
  const away = competitors.find((item) => item.homeAway === "away");
  const homeId = str(home?.id) || str(asRecord(home?.team)?.id);
  const awayId = str(away?.id) || str(asRecord(away?.team)?.id);
  const status = asRecord(competition?.status);
  const incidents = mergeEvents(asArray(root?.keyEvents), asArray(competition?.details))
    .map((item) => incidentFrom(item, homeId, awayId))
    .filter((item) => item != null)
    .sort((a, b) => num(a.time) - num(b.time));

  const sides = asArray(root?.rosters).map((item) => asRecord(item)).filter((item) => item != null);
  const homeRoster = sides.find((item) => item.homeAway === "home");
  const awayRoster = sides.find((item) => item.homeAway === "away");
  const homeXi = squad(homeRoster, true);
  const awayXi = squad(awayRoster, true);
  const homeSubs = squad(homeRoster, false);
  const awaySubs = squad(awayRoster, false);
  const hasLineup = homeXi.length + awayXi.length + homeSubs.length + awaySubs.length > 0;

  return {
    summary: str(asRecord(status?.type)?.detail) || str(status?.summary) || null,
    note: null,
    innings: [],
    commentary: [],
    incidents,
    lineups: hasLineup
      ? {
          home_formation: str(homeRoster?.formation) || null,
          away_formation: str(awayRoster?.formation) || null,
          confirmed: true,
          home_xi: homeXi,
          away_xi: awayXi,
          home_subs: homeSubs,
          away_subs: awaySubs,
        }
      : null,
  };
}

function mergeEvents(primary: unknown[], secondary: unknown[]) {
  const seen = new Set<string>();
  const rows: Record<string, unknown>[] = [];
  for (const item of [...primary, ...secondary]) {
    const row = asRecord(item);
    if (!row) continue;
    const type = eventLabel(row);
    const clock = str(asRecord(row.clock)?.displayValue);
    const names = people(row).join(",");
    const key = `${type}|${clock}|${names}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows;
}

function eventLabel(row: Record<string, unknown>) {
  const text = str(asRecord(row.type)?.text);
  if (row.scoringPlay === true && (!text || /^event$/i.test(text))) return "Goal";
  return text || "Event";
}

function incidentFrom(row: Record<string, unknown>, homeId: string, awayId: string): ScoreIncident | null {
  const type = eventLabel(row);
  const names = people(row);
  const teamId = str(asRecord(row.team)?.id);
  const side = teamId && teamId === awayId ? "away" : "home";
  const substitution = /sub/i.test(type) || str(asRecord(row.type)?.type) === "substitution";
  return {
    time: str(asRecord(row.clock)?.displayValue).replace(/'+$/, ""),
    type,
    side,
    player: substitution ? undefined : names[0],
    player_in: substitution ? names[0] : undefined,
    player_out: substitution ? names[1] : undefined,
    is_goal: row.scoringPlay === true || /^goal$/i.test(type),
    is_sub: substitution,
    home_score: undefined,
    away_score: undefined,
  };
}

function people(row: Record<string, unknown>) {
  const participants = asArray(row.participants).length > 0 ? asArray(row.participants) : asArray(row.athletesInvolved);
  return participants
    .map((item) => {
      const record = asRecord(item);
      return str(asRecord(record?.athlete)?.displayName) || str(record?.displayName);
    })
    .filter(Boolean);
}

function squad(side: Record<string, unknown> | undefined, starting: boolean): ScorePlayer[] {
  return asArray(side?.roster)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item != null && Boolean(item.starter) === starting)
    .map((item) => ({
      name: str(asRecord(item.athlete)?.displayName),
      number: num(item.jersey) || null,
      position: str(asRecord(item.position)?.abbreviation) || str(asRecord(asRecord(item.athlete)?.position)?.abbreviation) || null,
      captain: false,
      order: num(item.formationPlace) || 99,
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...player }) => player);
}

function playersFor(root: Record<string, unknown> | null, side: Record<string, unknown>) {
  const teamId = str(side.id) || str(asRecord(side.team)?.id);
  return asArray(root?.rosters)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item != null && str(asRecord(item.team)?.id) === teamId)
    .flatMap((item) => asArray(item.roster));
}

function lineFor(side: Record<string, unknown>, period: number) {
  return asArray(side.linescores).find((item) => num(asRecord(item)?.period) === period) ?? null;
}

function entryFor(player: unknown, period: number) {
  const row = asRecord(player);
  const block = asArray(row?.linescores).map((item) => asRecord(item)).find((item) => num(item?.period) === period);
  return asRecord(asArray(block?.linescores)[0]);
}

function statValue(entry: Record<string, unknown> | null, name: string) {
  for (const category of asArray(asRecord(entry?.statistics)?.categories)) {
    for (const stat of asArray(asRecord(category)?.stats)) {
      if (asRecord(stat)?.name === name) return str(asRecord(stat)?.displayValue);
    }
  }
  return "";
}

function batterRow(player: unknown, period: number) {
  const row = asRecord(player);
  const entry = entryFor(player, period);
  if (!row || !entry) return null;
  const faced = statValue(entry, "ballsFaced");
  const batted = statValue(entry, "batted") === "1" || num(faced) > 0;
  const active = str(row.activeName);
  if (!batted && active !== "striker" && active !== "non-striker") return null;
  const howOut = plain(asRecord(asRecord(asRecord(entry.statistics)?.batting)?.outDetails)?.shortText) || (batted ? "not out" : "");
  return {
    order: num(statValue(entry, "battingPosition")) || 99,
    name: str(asRecord(row.athlete)?.displayName),
    howOut,
    runs: statValue(entry, "runs") || "0",
    balls: faced || "0",
    fours: statValue(entry, "fours") || "0",
    sixes: statValue(entry, "sixes") || "0",
    strikeRate: statValue(entry, "strikeRate"),
    active,
  };
}

function bowlerRow(player: unknown, period: number) {
  const row = asRecord(player);
  const entry = entryFor(player, period);
  if (!row || !entry) return null;
  const balls = num(statValue(entry, "balls"));
  const wickets = statValue(entry, "wickets");
  if (balls <= 0 && num(wickets) <= 0) return null;
  const overs = statValue(entry, "overs") || "0";
  const maidens = statValue(entry, "maidens") || "0";
  const runs = statValue(entry, "conceded") || "0";
  return {
    order: num(statValue(entry, "bowlingPosition")) || 99,
    name: str(asRecord(row.athlete)?.displayName),
    figures: `${overs}-${maidens}-${runs}-${wickets || "0"}`,
    economy: statValue(entry, "economyRate"),
  };
}

function setRows(home: Record<string, unknown>, away: Record<string, unknown>) {
  const homeSets = asArray(home.linescores).map((item) => asRecord(item));
  const awaySets = asArray(away.linescores).map((item) => asRecord(item));
  const count = Math.max(homeSets.length, awaySets.length);
  const sets = [];
  for (let index = 0; index < count; index += 1) {
    const homeSet = setCell(homeSets[index]);
    const awaySet = setCell(awaySets[index]);
    if (!homeSet && !awaySet) continue;
    sets.push({ home: homeSet, away: awaySet });
  }
  return sets.length > 0 ? sets : null;
}

function setCell(line: Record<string, unknown> | null | undefined) {
  if (!line) return "";
  const score = str(line.displayValue) || str(line.setScore);
  if (!score) return "";
  const tiebreak = line.tiebreak ?? line.tieBreakScore;
  return tiebreak != null && str(tiebreak) !== "" ? `${score} (${str(tiebreak)})` : score;
}

function pickMatches(matches: ScoreFixture[]) {
  const live = matches.filter((match) => match.status === "live");
  const rest = matches
    .filter((match) => match.status !== "live")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "finished" ? 1 : -1;
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
  return [...live, ...rest].slice(0, Math.max(24, live.length));
}

function cardScore(side: Record<string, unknown>, status: ScoreStatus, shorten: boolean) {
  const raw = str(side.score).trim();
  if (!raw || raw === "-" || (status === "upcoming" && (raw === "0" || raw === "0-0"))) return null;
  if (!shorten) return raw;
  const match = raw.match(/^(\d+(?:\/\d+)?)/);
  return match ? match[1] : raw;
}

function teamName(side: Record<string, unknown>) {
  return str(side.displayName) || str(asRecord(side.team)?.displayName) || str(side.name) || str(asRecord(side.team)?.name);
}

function logoOf(side: Record<string, unknown>) {
  if (typeof side.logo === "string") return side.logo;
  const team = asRecord(side.team);
  if (typeof team?.logo === "string") return team.logo;
  const logos = asArray(team?.logos ?? side.logos);
  const href = asRecord(logos[0])?.href;
  return typeof href === "string" ? href : null;
}

function toStatus(state: string): ScoreStatus {
  if (state === "in") return "live";
  if (state === "post") return "finished";
  return "upcoming";
}

function liveText(summary: string, longSummary: string) {
  if (summary && summary !== "Live") return summary;
  return longSummary || "Live";
}

function resultText(summary: string, shortDetail: string) {
  if (summary && summary !== "Live" && summary !== "Result") return summary;
  return shortDetail || "Full time";
}

function overLabel(id: string) {
  if (!/^\d{6,}$/.test(id)) return "";
  const over = Number(id.slice(1, -3));
  const ball = Number(id.slice(-3)) / 10;
  if (!over && !ball) return "";
  return `${over}.${Number.isInteger(ball) ? ball : ball}`;
}

function ordinal(value: number) {
  const mod = value % 100;
  const suffix = mod >= 11 && mod <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[value % 10] || "th";
  return `${value}${suffix}`;
}

function plain(value: unknown) {
  return str(value)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&dagger;/g, "†")
    .replace(/\s+,/g, ",")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function str(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

async function getJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "sporty-tadka/1.0 (+https://github.com/satish837/sporty-tadka)",
    },
    next: { revalidate: 30 },
  });
  if (!response.ok) throw new Error(`ESPN ${response.status}`);
  return response.json() as Promise<unknown>;
}
