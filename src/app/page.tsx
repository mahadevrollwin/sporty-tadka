import { Nav } from "@/components/site/Nav";
import { LiveScores } from "@/components/site/LiveScores";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { About, Clients, Contact, Footer, Services, Stats, Verticals, Work } from "@/components/site/Sections";
import { Play } from "@/components/site/Play";
import { loadGallery, loadHome } from "@/sanity/content";

export const revalidate = 60;

export default async function Home() {
  const [site, gallery] = await Promise.all([loadHome(), loadGallery()]);
  const phoneVideos = site.phoneVideoIds.flatMap((id) => {
    const video = gallery.videos.find((item) => item.id === id);
    return video ? [video] : [];
  });

  return (
    <>
      <Nav links={site.nav} audiences={site.audiences} />
      <LiveScores />
      <Hero
        eyebrow={site.hero.eyebrow}
        title={site.hero.title}
        accent={site.hero.accent}
        ending={site.hero.ending}
        lead={site.hero.lead}
        leadBold={site.hero.leadBold}
        primary={site.hero.primary}
        secondary={site.hero.secondary}
      />
      <Marquee items={site.marquee} />
      <About
        heading={site.about.heading}
        headingAccent={site.about.headingAccent}
        dek={site.about.dek}
        body={site.about.body}
        videos={phoneVideos}
      />
      <Work items={site.work} />
      <Services items={site.services} />
      <Verticals items={site.audiences} />
      <Play />
      <Stats items={site.stats} />
      <Clients names={site.logos} />
      <Contact />
      <Footer />
    </>
  );
}
