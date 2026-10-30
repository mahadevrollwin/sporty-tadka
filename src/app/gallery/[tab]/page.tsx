import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/site/Gallery";
import { loadGallery, loadHome } from "@/sanity/content";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Sections";
import { DisplayHeading, Kick, Lead, Wrap } from "@/components/site/ui";

const TABS = ["images", "videos"] as const;
type GalleryTab = (typeof TABS)[number];

function isGalleryTab(value: string): value is GalleryTab {
  return TABS.includes(value as GalleryTab);
}

export const revalidate = 60;

export async function generateStaticParams() {
  return TABS.map((tab) => ({ tab }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tab: string }>;
}): Promise<Metadata> {
  const { tab } = await params;
  const label = tab === "videos" ? "Videos" : "Images";
  return {
    title: `${label} — Gallery — SportyTadka`,
    description:
      "Stills and motion from the SportyTadka studio — match-day cuts, launch films, and campaign frames.",
    alternates: {
      canonical: `/gallery/${isGalleryTab(tab) ? tab : "images"}`,
    },
  };
}

export default async function GalleryTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab: rawTab } = await params;
  if (!isGalleryTab(rawTab)) notFound();

  const [site, gallery] = await Promise.all([loadHome(), loadGallery()]);

  return (
    <>
      <Nav links={site.nav} audiences={site.audiences} />
      <main className="py-[76px]">
        <Wrap>
          <Kick tone="mag" label="Gallery" note="Stills & motion from the studio" />
          <DisplayHeading>The cut room.</DisplayHeading>
          <Lead>
            Frames that earned a second look. Campaign stills and films from launches, match days,
            and athlete stories.
          </Lead>
          <Gallery tab={rawTab} images={gallery.images} videos={gallery.videos} />
        </Wrap>
      </main>
      <Footer />
    </>
  );
}
