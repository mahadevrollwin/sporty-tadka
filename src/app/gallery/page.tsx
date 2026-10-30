import type { Metadata } from "next";
import { Suspense } from "react";
import { Gallery } from "@/components/site/Gallery";
import { loadGallery, loadHome } from "@/sanity/content";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Sections";
import { DisplayHeading, Kick, Lead, Wrap } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Gallery — SportyTadka",
  description:
    "Stills and motion from the SportyTadka studio — match-day cuts, launch films, and campaign frames.",
};

export const revalidate = 60;

export default async function GalleryPage() {
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
          <Suspense fallback={null}>
            <Gallery images={gallery.images} videos={gallery.videos} />
          </Suspense>
        </Wrap>
      </main>
      <Footer />
    </>
  );
}
