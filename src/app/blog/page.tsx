import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Sections";
import { DisplayHeading, Kick, Lead, Wrap } from "@/components/site/ui";
import { loadHome, loadPosts } from "@/sanity/content";

export const metadata: Metadata = {
  title: "Blog — SportyTadka",
  description: "Notes from the studio on match-day content, launches, stories, and playable campaigns.",
};

const toneClass = {
  lime: "text-lime",
  mag: "text-magenta",
  cyan: "text-cyan",
} as const;

export const revalidate = 60;

export default async function BlogPage() {
  const [site, posts] = await Promise.all([loadHome(), loadPosts()]);
  return (
    <>
      <Nav links={site.nav} audiences={site.audiences} />
      <main className="py-[76px]">
        <Wrap>
          <Kick tone="cyan" label="The Feed" note="Notes from the studio" />
          <DisplayHeading>Blog</DisplayHeading>
          <Lead>
            How we cut, ship, and play. Short notes on match day, launches, and the work that has
            to land while the moment is still hot.
          </Lead>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="flex flex-col gap-3 rounded-[18px] border border-line bg-elevated p-6 transition-colors hover:border-lime/40"
              >
                <span
                  className={`text-[12.5px] font-bold tracking-[0.14em] uppercase ${toneClass[post.tone]}`}
                >
                  {post.category}
                </span>
                <h2 className="font-display text-[clamp(28px,4vw,40px)] leading-[0.92] font-black uppercase">
                  {post.title}
                </h2>
                <p className="m-0 text-[15.5px] leading-normal text-soft">{post.excerpt}</p>
                <span className="mt-auto pt-2 text-sm text-dimmer">
                  {post.date} · {post.readTime}
                </span>
              </Link>
            ))}
          </div>
        </Wrap>
      </main>
      <Footer />
    </>
  );
}
