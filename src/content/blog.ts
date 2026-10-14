export const posts: BlogPost[] = [
  {
    slug: "match-day-before-the-whistle",
    title: "Ship the cut before the whistle",
    excerpt:
      "Match-day content dies in the tunnel. Here is how we keep a reel moving while the game is still live.",
    date: "18 Sep 2026",
    category: "Match day",
    readTime: "4 min",
    tone: "lime",
    player: "cr7-last-dance-vertical",
    body: [
      "The feed does not wait for a recap. By the time a tidy three-minute film is graded, the moment has already been clipped by someone in the stands and posted twice.",
      "We plan the cut before kickoff. A shot list, a caption bank, and one person whose only job is to pull the clip the second the roar happens. The edit is a template, not a blank timeline.",
      "That sounds less romantic than a hero film. It wins the night. The brand is in the replies while the score is still the story, and the longer piece can land the next morning for the people who want the full feeling.",
      "If your approval chain needs four people and a legal pass, you are not making match-day content. You are making a Monday morning post. Decide which one you actually want, then staff it that way.",
    ],
  },
  {
    slug: "branded-games-over-another-film",
    title: "A game people finish beats a film they skip",
    excerpt:
      "Playable campaigns hold attention that a hero spot only borrows. The trick is keeping the idea as sharp as the mechanic.",
    date: "4 Sep 2026",
    category: "Play",
    readTime: "5 min",
    tone: "mag",
    player: "born-from-fire-vertical",
    body: [
      "Most branded games fail because they are a film with a score stuck on the end. The mechanic is an afterthought, and the player can feel it in the first ten seconds.",
      "Start with the action. A tap, a swing, a match. Then write the brand into that action so the logo is the thing you are playing with, not a frame that appears when you lose.",
      "Keep the first round under a minute. People will replay a short game. They will not sit through a tutorial that explains your campaign line. The line belongs on the result screen, after they have already done the thing.",
      "We still make films. A game is the piece you hand someone when you want them to stay, score, and send it to a friend who will do the same.",
    ],
  },
  {
    slug: "the-drop-in-thirty-seconds",
    title: "Thirty seconds is a whole launch",
    excerpt:
      "A sneaker drop does not need a manifesto. It needs heat, a clock, and one image people can replay.",
    date: "21 Aug 2026",
    category: "Launch",
    readTime: "3 min",
    tone: "cyan",
    player: "forever-thalapathy-vertical",
    body: [
      "Drops are already a story. Limited pairs, a time, a queue. The film should not explain that. It should make the wait feel like the sport.",
      "We cut for the sound first. The zip, the box, the street. If the audio does not raise your shoulders, the picture will not save it. Colour comes after the rhythm is locked.",
      "One product shot, held long enough to want it. Everything else is motion around that still. End on the time, not a tagline. The tagline is what people type under the post if you got the thirty seconds right.",
    ],
  },
  {
    slug: "comeback-without-the-montage",
    title: "Tell the comeback without the montage",
    excerpt:
      "Injury stories collapse into the same slow-motion gym shots. The interesting part is the week nobody filmed.",
    date: "2 Aug 2026",
    category: "Stories",
    readTime: "6 min",
    tone: "lime",
    player: "john-cena-retirement",
    body: [
      "Every comeback film has the same middle: empty gym, ice bath, a coach saying the word belief. Audiences know the shape, so they stop listening.",
      "Ask about the Tuesday that did not make the diary. The session that went badly. The conversation in the car park. Those lines are specific, and specific is the only thing that does not look like a template.",
      "Shoot the return as a match, not a metaphor. Let the crowd and the first touch do the emotional work. Save the interview for the thing the pictures cannot say.",
      "A shorter film with one true week will outlast a twelve-minute montage of every week that looked like training.",
    ],
  },
];

export type BlogTone = "lime" | "mag" | "cyan";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  tone: BlogTone;
  player: string;
  body: string[];
};

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function relatedPosts(slug: string, source: readonly BlogPost[] = posts, limit = 3) {
  const post = source.find((item) => item.slug === slug);
  if (!post) return [];
  const rank = (item: BlogPost) => {
    if (item.category === post.category) return 0;
    if (item.tone === post.tone) return 1;
    return 2;
  };
  return source
    .filter((item) => item.slug !== slug)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}
