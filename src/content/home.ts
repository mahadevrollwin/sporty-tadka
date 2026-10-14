export const navLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "What we do" },
  { href: "/#play", label: "Play" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/#about", label: "About" },
] as const;

export const marqueeItems = [
  "Hype reels",
  "Match-day content",
  "Brand films",
  "Athlete stories",
  "Social that scores",
  "Branded games",
] as const;

export const work = [
  {
    num: "01",
    cat: "Activewear · Launch film",
    title: "Drop Day",
    copy: "A sold-out sneaker drop, hyped into a 30-second adrenaline hit.",
    catClass: "text-lime",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_0%_100%,rgba(198,255,61,.28),transparent_60%),var(--color-panel)] hover:shadow-[0_0_40px_rgba(198,255,61,.22)]",
  },
  {
    num: "02",
    cat: "Social series · Football",
    title: "Full-Time Feelings",
    copy: "Match-day emotion, cut and posted before the players hit the tunnel.",
    catClass: "text-magenta",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_100%_0%,rgba(255,60,172,.3),transparent_60%),var(--color-panel)] hover:shadow-[0_0_40px_rgba(255,60,172,.22)]",
  },
  {
    num: "03",
    cat: "Athlete · Documentary",
    title: "The Comeback",
    copy: "One injury, one season, one story worth telling in long form.",
    catClass: "text-cyan",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_0%_0%,rgba(51,230,255,.26),transparent_60%),var(--color-panel)] hover:shadow-[0_0_40px_rgba(51,230,255,.2)]",
  },
  {
    num: "04",
    cat: "Nutrition · Campaign",
    title: "Protein O'Clock",
    copy: "A supplement brand made unmissable across a full content calendar.",
    catClass: "text-yellow",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_100%_100%,rgba(255,228,94,.26),transparent_60%),var(--color-panel)]",
  },
  {
    num: "05",
    cat: "Broadcast · Motion identity",
    title: "League Nights",
    copy: "A whole broadcast look — bumpers, lower-thirds, the works.",
    catClass: "text-magenta",
    tileClass:
      "bg-[radial-gradient(130%_120%_at_50%_0%,rgba(255,60,172,.22),rgba(198,255,61,.14)_60%,transparent_75%),var(--color-panel)]",
  },
  {
    num: "06",
    cat: "Community · Activation",
    title: "Fan Cam",
    copy: "Turning the crowd into the campaign with playable, shareable UGC.",
    catClass: "text-cyan",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_0%_100%,rgba(51,230,255,.24),transparent_60%),var(--color-panel)]",
  },
] as const;

export const services = [
  {
    n: "01 · Match-day",
    title: "Reactive content",
    headlineLead: "Reactive",
    headlineAccent: "content.",
    copy: "Fast-turn edits and hype reels that ship while the moment is still hot.",
  },
  {
    n: "02 · Film",
    title: "Brand & athlete films",
    headlineLead: "Brand &",
    headlineAccent: "athlete films.",
    copy: "Documentaries and hero spots that build the myth around a team or a drop.",
  },
  {
    n: "03 · Identity",
    title: "Sports branding",
    headlineLead: "Sports",
    headlineAccent: "branding.",
    copy: "Logos, motion systems and broadcast graphics with jersey-grade polish.",
  },
  {
    n: "04 · Always-on",
    title: "Social & community",
    headlineLead: "Social &",
    headlineAccent: "community.",
    copy: "Channel strategy and daily management for brands that live in the feed.",
  },
  {
    n: "05 · Interactive",
    title: "Branded games",
    headlineLead: "Branded",
    headlineAccent: "games.",
    copy: "Playable campaigns, predictors and mini-games built on original ideas.",
  },
  {
    n: "06 · On-ground",
    title: "Events & activations",
    headlineLead: "Events &",
    headlineAccent: "activations.",
    copy: "Content engines for launches, fan zones and sponsorships — live to online.",
  },
] as const;

export const verticals = [
  {
    label: "Activewear & sportswear",
    dot: "bg-lime",
    hover: "hover:border-lime hover:shadow-[0_0_18px_rgba(198,255,61,.3)]",
  },
  {
    label: "Gyms & fitness",
    dot: "bg-magenta",
    hover: "hover:border-magenta hover:shadow-[0_0_18px_rgba(255,60,172,.3)]",
  },
  {
    label: "Sports nutrition",
    dot: "bg-cyan",
    hover: "hover:border-cyan hover:shadow-[0_0_18px_rgba(51,230,255,.3)]",
  },
  { label: "Leagues, teams & tournaments", dot: "bg-yellow", hover: "hover:border-yellow" },
  { label: "Broadcasters & sports media", dot: "bg-lime", hover: "hover:border-lime" },
  { label: "Athletes & creators", dot: "bg-magenta", hover: "hover:border-magenta" },
  { label: "Events & activations", dot: "bg-cyan", hover: "hover:border-cyan" },
] as const;

export const stats = [
  { value: "0", label: "boring edits shipped", valueClass: "text-lime" },
  { value: "∞", label: "replays and rewinds", valueClass: "text-magenta" },
  { value: "24/7", label: "living in the feed", valueClass: "text-cyan" },
  { value: "100%", label: "full-time fans", valueClass: "text-yellow" },
] as const;

export const logos = [
  "Northside FC",
  "Volt Wear",
  "Apex Fuel",
  "Iron Yard",
  "Prime Play",
  "Baseline",
  "Overtime",
  "Court Kings",
  "Fast Lane",
  "Your Logo",
] as const;

export const games = [
  { id: "reaction", label: "Reaction", emoji: "⚡" },
  { id: "timing", label: "Timing", emoji: "🏏" },
  { id: "tetris", label: "Tetris", emoji: "🧱" },
  { id: "rapid", label: "Tech Crush", emoji: "💥" },
  { id: "scam", label: "Scam Alert", emoji: "🚨" },
] as const;

export type GameId = (typeof games)[number]["id"];
