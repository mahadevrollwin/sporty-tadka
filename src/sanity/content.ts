import { createClient } from "next-sanity";
import { posts, type BlogPost, type BlogTone } from "@/content/blog";
import {
  galleryImages,
  galleryVideos,
  type GalleryImage,
  type GallerySpan,
  type GalleryVideo,
} from "@/content/gallery";
import { logos, marqueeItems, navLinks, services, stats, verticals, work } from "@/content/home";
import { apiVersion, dataset, projectId } from "./env";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

const workTiles: Record<string, { catClass: string; tileClass: string }> = {
  lime: {
    catClass: "text-lime",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_0%_100%,rgba(198,255,61,.28),transparent_60%),var(--color-panel)] hover:shadow-[0_0_40px_rgba(198,255,61,.22)]",
  },
  mag: {
    catClass: "text-magenta",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_100%_0%,rgba(255,60,172,.3),transparent_60%),var(--color-panel)] hover:shadow-[0_0_40px_rgba(255,60,172,.22)]",
  },
  cyan: {
    catClass: "text-cyan",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_0%_0%,rgba(51,230,255,.26),transparent_60%),var(--color-panel)] hover:shadow-[0_0_40px_rgba(51,230,255,.2)]",
  },
  yellow: {
    catClass: "text-yellow",
    tileClass:
      "bg-[radial-gradient(120%_120%_at_100%_100%,rgba(255,228,94,.26),transparent_60%),var(--color-panel)]",
  },
  mix: {
    catClass: "text-magenta",
    tileClass:
      "bg-[radial-gradient(130%_120%_at_50%_0%,rgba(255,60,172,.22),rgba(198,255,61,.14)_60%,transparent_75%),var(--color-panel)]",
  },
};

const audienceStyle: Record<string, { dot: string; hover: string }> = {
  lime: { dot: "bg-lime", hover: "hover:border-lime hover:shadow-[0_0_18px_rgba(198,255,61,.3)]" },
  mag: { dot: "bg-magenta", hover: "hover:border-magenta hover:shadow-[0_0_18px_rgba(255,60,172,.3)]" },
  cyan: { dot: "bg-cyan", hover: "hover:border-cyan hover:shadow-[0_0_18px_rgba(51,230,255,.3)]" },
  yellow: { dot: "bg-yellow", hover: "hover:border-yellow" },
};

const statClass: Record<string, string> = {
  lime: "text-lime",
  mag: "text-magenta",
  cyan: "text-cyan",
  yellow: "text-yellow",
};

export type RichSpan = { text: string; bold: boolean };

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    ending: string;
    lead: string;
    leadBold: string;
    primary: string;
    secondary: string;
  };
  about: {
    heading: string;
    headingAccent: string;
    dek: string;
    body: RichSpan[][];
  };
  nav: { href: string; label: string }[];
  marquee: string[];
  work: {
    num: string;
    cat: string;
    title: string;
    copy: string;
    catClass: string;
    tileClass: string;
  }[];
  services: {
    n: string;
    title: string;
    headlineLead: string;
    headlineAccent: string;
    copy: string;
  }[];
  audiences: { label: string; dot: string; hover: string }[];
  stats: { value: string; label: string; valueClass: string }[];
  logos: string[];
  phoneVideoIds: string[];
};

const localHome: HomeContent = {
  hero: {
    eyebrow: "Sports creative studio · wherever the game is played",
    title: "We speak",
    accent: "fluent",
    ending: "sport.",
    lead: "A playful, motion-first studio for the brands, teams and athletes who live for the game. We turn every whistle, drop and last-minute winner into content that",
    leadBold: "hits different in the feed.",
    primary: "See the work",
    secondary: "Play something",
  },
  about: {
    heading: "If it moves,",
    headingAccent: "we make it move louder.",
    dek: "Motion-first by default. Playful on purpose. Fast when it counts.",
    body: [
      [
        { text: "We're a crew of ", bold: false },
        { text: "full-time fans and full-service creatives", bold: true },
        {
          text: ". We grew up screaming at screens, arguing over replays and re-editing highlights in our heads — so making sports content isn't a service line for us, it's the whole point.",
          bold: false,
        },
      ],
      [
        { text: "We work with brands and teams ", bold: false },
        { text: "anywhere the game is played", bold: true },
        {
          text: ". Different sports, different time zones, same obsession: making moments people can't scroll past.",
          bold: false,
        },
      ],
    ],
  },
  nav: navLinks.map((link) => ({ href: link.href, label: link.label })),
  marquee: [...marqueeItems],
  work: work.map((item) => ({ ...item })),
  services: services.map((item) => ({ ...item })),
  audiences: verticals.map((item) => ({ ...item })),
  stats: stats.map((item) => ({ ...item })),
  logos: [...logos],
  phoneVideoIds: [
    "cr7-last-dance-vertical",
    "born-from-fire-vertical",
    "forever-thalapathy-vertical",
    "john-cena-retirement",
    "born-from-fire-wide",
  ],
};

const fetchOptions = { next: { revalidate: 60 } };

export async function loadPosts(): Promise<BlogPost[]> {
  try {
    const rows = await client.fetch<unknown[]>(
      `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
        "slug": slug.current,
        title,
        excerpt,
        publishedAt,
        category,
        readTime,
        tone,
        "player": player->slug.current,
        body
      }`,
      {},
      fetchOptions,
    );
    const mapped = rows.map(toPost).filter((post) => post != null);
    return mapped.length > 0 ? mapped : posts;
  } catch {
    return posts;
  }
}

export async function loadGallery(): Promise<{ images: GalleryImage[]; videos: GalleryVideo[] }> {
  try {
    const rows = await client.fetch<unknown[]>(
      `*[_type == "galleryItem" && defined(slug.current)] | order(order asc) {
        "id": slug.current,
        kind,
        title,
        category,
        span,
        width,
        height,
        "imageUrl": image.asset->url,
        "videoUrl": video.asset->url,
        "posterUrl": poster.asset->url,
        path,
        posterPath
      }`,
      {},
      fetchOptions,
    );
    const images: GalleryImage[] = [];
    const videos: GalleryVideo[] = [];
    for (const row of rows) {
      const item = toGallery(row);
      if (!item) continue;
      if (item.type === "image") images.push(item);
      else videos.push(item);
    }
    if (images.length === 0 && videos.length === 0) {
      return { images: galleryImages, videos: galleryVideos };
    }
    return {
      images: images.length > 0 ? images : galleryImages,
      videos: videos.length > 0 ? videos : galleryVideos,
    };
  } catch {
    return { images: galleryImages, videos: galleryVideos };
  }
}

export async function loadHome(): Promise<HomeContent> {
  try {
    const row = await client.fetch<Record<string, unknown> | null>(
      `*[_id == "homePage"][0]{
        heroEyebrow, heroTitle, heroAccent, heroEnding, heroLead, heroLeadBold, heroPrimary, heroSecondary,
        aboutHeading, aboutHeadingAccent, aboutDek, aboutBody,
        nav, marquee, work, services, audiences, stats, logos,
        "phoneVideoIds": phoneVideos[]->slug.current
      }`,
      {},
      fetchOptions,
    );
    if (!row) return localHome;
    return {
      hero: {
        eyebrow: text(row.heroEyebrow, localHome.hero.eyebrow),
        title: text(row.heroTitle, localHome.hero.title),
        accent: text(row.heroAccent, localHome.hero.accent),
        ending: text(row.heroEnding, localHome.hero.ending),
        lead: text(row.heroLead, localHome.hero.lead),
        leadBold: text(row.heroLeadBold, localHome.hero.leadBold),
        primary: text(row.heroPrimary, localHome.hero.primary),
        secondary: text(row.heroSecondary, localHome.hero.secondary),
      },
      about: {
        heading: text(row.aboutHeading, localHome.about.heading),
        headingAccent: text(row.aboutHeadingAccent, localHome.about.headingAccent),
        dek: text(row.aboutDek, localHome.about.dek),
        body: paragraphs(row.aboutBody).length > 0 ? paragraphs(row.aboutBody) : localHome.about.body,
      },
      nav: mapNav(row.nav),
      marquee: stringList(row.marquee).length > 0 ? stringList(row.marquee) : localHome.marquee,
      work: mapWork(row.work),
      services: mapServices(row.services),
      audiences: mapAudiences(row.audiences),
      stats: mapStats(row.stats),
      logos: stringList(row.logos).length > 0 ? stringList(row.logos) : localHome.logos,
      phoneVideoIds: stringList(row.phoneVideoIds).length > 0 ? stringList(row.phoneVideoIds) : localHome.phoneVideoIds,
    };
  } catch {
    return localHome;
  }
}

function mapNav(value: unknown) {
  const items = objectList(value).flatMap((item) => {
    const href = text(item.href, "");
    const label = text(item.label, "");
    return href && label ? [{ href, label }] : [];
  });
  return items.length > 0 ? items : localHome.nav;
}

function mapWork(value: unknown) {
  const items = objectList(value).flatMap((item) => {
    const num = text(item.num, "");
    const title = text(item.title, "");
    if (!num || !title) return [];
    const style = workTiles[text(item.tone, "lime")] ?? workTiles.lime;
    return [
      {
        num,
        cat: text(item.cat, ""),
        title,
        copy: text(item.copy, ""),
        catClass: style.catClass,
        tileClass: style.tileClass,
      },
    ];
  });
  return items.length > 0 ? items : localHome.work;
}

function mapServices(value: unknown) {
  const items = objectList(value).flatMap((item) => {
    const n = text(item.n, "");
    const title = text(item.title, "");
    if (!n || !title) return [];
    return [
      {
        n,
        title,
        headlineLead: text(item.headlineLead, title),
        headlineAccent: text(item.headlineAccent, ""),
        copy: text(item.copy, ""),
      },
    ];
  });
  if (items.length === 0) return localHome.services;

  // Prefer repo headline copy so title updates in home.ts are not stuck behind stale CMS data.
  return items.map((item, index) => {
    const local =
      localHome.services.find((entry) => entry.n === item.n) ?? localHome.services[index];
    if (!local) return item;
    return {
      ...item,
      title: local.title,
      headlineLead: local.headlineLead,
      headlineAccent: local.headlineAccent,
      copy: item.copy || local.copy,
    };
  });
}

function mapAudiences(value: unknown) {
  const items = objectList(value).flatMap((item) => {
    const label = text(item.label, "");
    if (!label) return [];
    const style = audienceStyle[text(item.tone, "lime")] ?? audienceStyle.lime;
    return [{ label, dot: style.dot, hover: style.hover }];
  });
  return items.length > 0 ? items : localHome.audiences;
}

function mapStats(value: unknown) {
  const items = objectList(value).flatMap((item) => {
    const label = text(item.label, "");
    const statValue = text(item.value, "");
    if (!label || !statValue) return [];
    return [{ value: statValue, label, valueClass: statClass[text(item.tone, "lime")] ?? statClass.lime }];
  });
  return items.length > 0 ? items : localHome.stats;
}

function toPost(value: unknown): BlogPost | null {
  const row = record(value);
  if (!row) return null;
  const slug = text(row.slug, "");
  const title = text(row.title, "");
  const tone = text(row.tone, "lime");
  if (!slug || !title) return null;
  if (tone !== "lime" && tone !== "mag" && tone !== "cyan") return null;
  return {
    slug,
    title,
    excerpt: text(row.excerpt, ""),
    date: formatDate(text(row.publishedAt, "")),
    category: text(row.category, ""),
    readTime: text(row.readTime, ""),
    tone: tone as BlogTone,
    player: text(row.player, ""),
    body: paragraphs(row.body).map((paragraph) => paragraph.map((span) => span.text).join("")),
  };
}

function toGallery(value: unknown): GalleryImage | GalleryVideo | null {
  const row = record(value);
  if (!row) return null;
  const id = text(row.id, "");
  const title = text(row.title, "");
  const kind = text(row.kind, "");
  if (!id || !title || (kind !== "image" && kind !== "video")) return null;
  const span = spanOf(row.span);
  const width = numberOf(row.width) || (kind === "video" ? 1280 : 576);
  const height = numberOf(row.height) || 1024;
  if (kind === "image") {
    const src = text(row.imageUrl, "") || text(row.path, "");
    if (!src) return null;
    return { id, type: "image", src, title, category: text(row.category, ""), width, height, span };
  }
  const src = text(row.videoUrl, "") || text(row.path, "");
  const poster = text(row.posterUrl, "") || text(row.posterPath, "");
  if (!src) return null;
  return { id, type: "video", src, poster, title, category: text(row.category, ""), width, height, span };
}

function paragraphs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((block) => {
    const row = record(block);
    if (!row || row._type !== "block" || !Array.isArray(row.children)) return [];
    const spans = row.children.flatMap((child) => {
      const span = record(child);
      if (!span || typeof span.text !== "string" || !span.text) return [];
      const marks = Array.isArray(span.marks) ? span.marks : [];
      return [{ text: span.text, bold: marks.includes("strong") }];
    });
    return spans.length > 0 ? [spans] : [];
  });
}

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[Number(match[2]) - 1];
  return `${Number(match[3])} ${month} ${match[1]}`;
}

function spanOf(value: unknown): GallerySpan {
  const span = numberOf(value);
  if (span === 2 || span === 3) return span;
  return 1;
}

function objectList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    return row ? [row] : [];
  });
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberOf(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function record(value: unknown) {
  return value != null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}
