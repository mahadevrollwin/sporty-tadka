import { createClient } from "@sanity/client";
import { posts } from "../src/content/blog.ts";
import { galleryImages, galleryVideos } from "../src/content/gallery.ts";
import { logos, marqueeItems, navLinks, services, stats, verticals, work } from "../src/content/home.ts";

const token = process.env.SANITY_AUTH_TOKEN;
if (!token) {
  console.error("Set SANITY_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ezdgbyxv",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-10-09",
  token,
  useCdn: false,
});

const workTones = ["lime", "mag", "cyan", "yellow", "mix", "cyan"];
const months: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function isoDate(value: string) {
  const [day, month, year] = value.split(" ");
  return `${year}-${months[month]}-${day.padStart(2, "0")}`;
}

function toneFromClass(value: string) {
  if (value.includes("magenta")) return "mag";
  if (value.includes("cyan")) return "cyan";
  if (value.includes("yellow")) return "yellow";
  return "lime";
}

function block(key: string, spans: { text: string; bold?: boolean }[]) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: spans.map((span, index) => ({
      _type: "span",
      _key: `${key}-${index}`,
      text: span.text,
      marks: span.bold ? ["strong"] : [],
    })),
  };
}

const gallery = [
  ...galleryImages.map((item, order) => ({
    _id: `gallery-${item.id}`,
    _type: "galleryItem",
    title: item.title,
    slug: { _type: "slug", current: item.id },
    kind: "image",
    category: item.category,
    span: item.span,
    order,
    width: item.width,
    height: item.height,
    path: item.src,
  })),
  ...galleryVideos.map((item, order) => ({
    _id: `gallery-${item.id}`,
    _type: "galleryItem",
    title: item.title,
    slug: { _type: "slug", current: item.id },
    kind: "video",
    category: item.category,
    span: item.span,
    order: galleryImages.length + order,
    width: item.width,
    height: item.height,
    path: item.src,
    posterPath: item.poster,
  })),
];

const postDocs = posts.map((post) => ({
  _id: `post-${post.slug}`,
  _type: "post",
  title: post.title,
  slug: { _type: "slug", current: post.slug },
  excerpt: post.excerpt,
  publishedAt: isoDate(post.date),
  category: post.category,
  readTime: post.readTime,
  tone: post.tone,
  player: post.player ? { _type: "reference", _ref: `gallery-${post.player}` } : undefined,
  body: post.body.map((paragraph, index) => block(`p${index}`, [{ text: paragraph }])),
}));

const home = {
  _id: "homePage",
  _type: "homePage",
  heroEyebrow: "Sports creative studio · wherever the game is played",
  heroTitle: "We speak",
  heroAccent: "fluent",
  heroEnding: "sport.",
  heroLead:
    "A playful, motion-first studio for the brands, teams and athletes who live for the game. We turn every whistle, drop and last-minute winner into content that",
  heroLeadBold: "hits different in the feed.",
  heroPrimary: "See the work",
  heroSecondary: "Play something",
  aboutHeading: "If it moves,",
  aboutHeadingAccent: "we make it move louder.",
  aboutDek: "Motion-first by default. Playful on purpose. Fast when it counts.",
  aboutBody: [
    block("about-1", [
      { text: "We're a crew of " },
      { text: "full-time fans and full-service creatives", bold: true },
      {
        text: ". We grew up screaming at screens, arguing over replays and re-editing highlights in our heads — so making sports content isn't a service line for us, it's the whole point.",
      },
    ]),
    block("about-2", [
      { text: "We work with brands and teams " },
      { text: "anywhere the game is played", bold: true },
      {
        text: ". Different sports, different time zones, same obsession: making moments people can't scroll past.",
      },
    ]),
  ],
  nav: navLinks.map((link) => ({ _key: link.href, _type: "navLink", href: link.href, label: link.label })),
  marquee: [...marqueeItems],
  work: work.map((item, index) => ({
    _key: item.num,
    _type: "workItem",
    num: item.num,
    cat: item.cat,
    title: item.title,
    copy: item.copy,
    tone: workTones[index] ?? "lime",
  })),
  services: services.map((item) => ({
    _key: item.n,
    _type: "serviceItem",
    n: item.n,
    title: item.title,
    headlineLead: item.headlineLead,
    headlineAccent: item.headlineAccent,
    copy: item.copy,
  })),
  audiences: verticals.map((item) => ({
    _key: item.label,
    _type: "audience",
    label: item.label,
    tone: toneFromClass(item.dot),
  })),
  stats: stats.map((item) => ({
    _key: item.label,
    _type: "stat",
    value: item.value,
    label: item.label,
    tone: toneFromClass(item.valueClass),
  })),
  logos: [...logos],
  phoneVideos: [
    "cr7-last-dance-vertical",
    "born-from-fire-vertical",
    "forever-thalapathy-vertical",
    "john-cena-retirement",
    "born-from-fire-wide",
  ].map((id) => ({ _key: id, _type: "reference", _ref: `gallery-${id}` })),
};

const docs = [...gallery, ...postDocs, home];
const transaction = client.transaction();
for (const doc of docs) transaction.createOrReplace(doc);
await transaction.commit();
console.log(`Seeded ${docs.length} documents`);
