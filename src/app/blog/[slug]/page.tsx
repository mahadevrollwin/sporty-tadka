import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPlayer } from "@/components/site/BlogPlayer";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Sections";
import { Kick, Wrap } from "@/components/site/ui";
import { relatedPosts } from "@/content/blog";
import { loadGallery, loadHome, loadPosts } from "@/sanity/content";

const toneClass = {
  lime: "lime",
  mag: "mag",
  cyan: "cyan",
} as const;

const categoryClass = {
  lime: "text-lime",
  mag: "text-magenta",
  cyan: "text-cyan",
} as const;

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await loadPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type PostParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  const { slug } = await params;
  const posts = await loadPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) return { title: "Post — SportyTadka" };
  return {
    title: `${post.title} — SportyTadka`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PostParams) {
  const { slug } = await params;
  const [site, posts, gallery] = await Promise.all([loadHome(), loadPosts(), loadGallery()]);
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  const related = relatedPosts(post.slug, posts);
  const player = gallery.videos.find((video) => video.id === post.player);

  return (
    <>
      <Nav links={site.nav} audiences={site.audiences} />
      <main className="py-[76px]">
        <Wrap>
          <Link href="/blog" className="mb-8 inline-block text-sm font-semibold text-dim hover:text-lime">
            All posts
          </Link>
          <Kick
            tone={toneClass[post.tone]}
            label={post.category}
            note={`${post.date} · ${post.readTime}`}
          />
          <div className="grid items-start gap-8 min-[760px]:grid-cols-[minmax(0,1fr)_180px] min-[1100px]:grid-cols-[minmax(0,1fr)_220px] min-[760px]:gap-12">
            {player ? (
              <div className="w-[168px] justify-self-end min-[760px]:sticky min-[760px]:top-24 min-[760px]:order-2 min-[760px]:w-full">
                <BlogPlayer src={player.src} poster={player.poster} title={player.title} />
              </div>
            ) : null}
            <div className="min-[760px]:order-1">
              <h1 className="mb-8 max-w-[18ch] font-display text-[clamp(40px,7vw,76px)] leading-[0.9] font-black uppercase">
                {post.title}
              </h1>
              <div className="max-w-[68ch] space-y-5 text-[18px] leading-relaxed text-soft">
                {post.body.map((paragraph) => (
                  <p key={paragraph} className="m-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
          {related.length > 0 && (
            <section className="mt-16 border-t border-line pt-10" aria-labelledby="related-posts">
              <Kick tone="mag" label="Related" note="More from the feed" />
              <h2
                id="related-posts"
                className="mb-6 font-display text-[clamp(32px,5vw,52px)] leading-[0.9] font-black uppercase"
              >
                Keep reading.
              </h2>
              <div className="grid gap-4 min-[701px]:grid-cols-2 min-[1000px]:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="flex flex-col gap-3 rounded-[18px] border border-line bg-elevated p-5 transition-colors hover:border-lime/40"
                  >
                    <span
                      className={`text-[12.5px] font-bold tracking-[0.14em] uppercase ${categoryClass[item.tone]}`}
                    >
                      {item.category}
                    </span>
                    <span className="font-display text-[26px] leading-[0.95] font-black uppercase">
                      {item.title}
                    </span>
                    <p className="m-0 text-[15px] leading-normal text-soft">{item.excerpt}</p>
                    <span className="mt-auto pt-2 text-sm text-dimmer">
                      {item.date} · {item.readTime}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Wrap>
      </main>
      <Footer />
    </>
  );
}
