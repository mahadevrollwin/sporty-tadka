import Link from "next/link";
import { logos, stats, verticals } from "@/content/home";
import { AboutPhone } from "./AboutPhone";
import { StartProjectButton } from "./LeadForm";
import { DisplayHeading, Kick, Lead, Logo, Wrap } from "./ui";

export { Work } from "./Work";

export { Services } from "./Services";

export function Verticals({
  items = verticals,
}: {
  items?: readonly { label: string; dot: string; hover: string }[];
} = {}) {
  return (
    <section id="serve" className="relative py-[76px]">
      <Wrap>
        <Kick tone="cyan" label="Who we play for" note="One studio, every corner of sport" />
        <DisplayHeading>Pick your side.</DisplayHeading>
        <Lead>
          Whatever your brand&apos;s relationship to the game, there&apos;s a seat on the bench for
          you.
        </Lead>
        <div className="mt-[34px] flex flex-wrap gap-3">
          {items.map((item) => (
            <span
              key={item.label}
              className={`inline-flex items-center gap-[11px] rounded-full border border-line bg-panel px-[22px] py-3 text-base font-semibold transition hover:-translate-y-0.5 ${item.hover}`}
            >
              <i className={`h-[9px] w-[9px] rounded-full ${item.dot}`} />
              {item.label}
            </span>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

export function Stats({
  items = stats,
}: {
  items?: readonly { value: string; label: string; valueClass: string }[];
} = {}) {
  return (
    <section id="stats" className="relative py-[76px]">
      <Wrap>
        <Kick tone="mag" label="The vibe" note="How we keep score" />
        <div className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-line bg-line-soft min-[641px]:grid-cols-2 min-[901px]:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="bg-canvas px-[22px] py-[30px]">
              <div
                className={`font-display text-[clamp(40px,6vw,64px)] leading-[0.9] font-black ${item.valueClass}`}
              >
                {item.value}
              </div>
              <div className="mt-2 text-sm text-dim">{item.label}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

export function Clients({ names = logos }: { names?: readonly string[] } = {}) {
  return (
    <section id="clients" className="relative py-[76px]">
      <Wrap>
        <Kick tone="cyan" label="On the team sheet" note="Brands & teams we play with" />
        <DisplayHeading>In good company.</DisplayHeading>
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-line bg-line-soft min-[641px]:grid-cols-3 min-[901px]:grid-cols-5">
          {names.map((name) => (
            <div key={name} className="flex min-h-24 items-center justify-center bg-canvas px-4 py-[30px]">
              <span className="text-center font-display text-[19px] leading-none font-extrabold uppercase text-dimmer transition-colors hover:text-ink">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

export function About({
  heading = "If it moves,",
  headingAccent = "we make it move louder.",
  dek = "Motion-first by default. Playful on purpose. Fast when it counts.",
  body,
  videos,
}: {
  heading?: string;
  headingAccent?: string;
  dek?: string;
  body?: { text: string; bold: boolean }[][];
  videos?: { id: string; src: string; poster: string; title: string; category: string }[];
} = {}) {
  return (
    <section id="about" className="relative border-y border-line bg-panel pt-[76px] pb-[92px]">
      <Wrap>
        <Kick tone="lime" label="About" note="Who's behind the whistle" />
        <div className="mt-[30px] grid items-stretch justify-items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:justify-items-stretch">
          <div>
            <h2 className="m-0 font-display text-[clamp(32px,4vw,48px)] leading-[0.9] font-extrabold text-magenta uppercase [text-shadow:0_0_24px_rgba(255,60,172,.55)]">
              {heading}
              <br />
              {headingAccent}
            </h2>
            <p className="mt-4 mb-6 text-base text-soft">{dek}</p>
            {body && body.length > 0 ? (
              body.map((paragraph) => (
                <p key={paragraph.map((span) => span.text).join("")} className="mb-[18px] text-[clamp(18px,2vw,21px)] leading-normal text-soft last:mb-0">
                  {paragraph.map((span) =>
                    span.bold ? (
                      <b key={span.text} className="font-semibold text-ink">
                        {span.text}
                      </b>
                    ) : (
                      <span key={span.text}>{span.text}</span>
                    ),
                  )}
                </p>
              ))
            ) : (
              <>
                <p className="mb-[18px] text-[clamp(18px,2vw,21px)] leading-normal text-soft">
                  We&apos;re a crew of{" "}
                  <b className="font-semibold text-ink">full-time fans and full-service creatives</b>.
                  We grew up screaming at screens, arguing over replays and re-editing highlights in
                  our heads — so making sports content isn&apos;t a service line for us, it&apos;s the
                  whole point.
                </p>
                <p className="m-0 text-[clamp(18px,2vw,21px)] leading-normal text-soft">
                  We work with brands and teams{" "}
                  <b className="font-semibold text-ink">anywhere the game is played</b>. Different
                  sports, different time zones, same obsession: making moments people can&apos;t scroll
                  past.
                </p>
              </>
            )}
          </div>
          <AboutPhone videos={videos} />
        </div>
      </Wrap>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative py-24">
      <Wrap>
        <div className="rounded-[22px] border border-line bg-[radial-gradient(90%_120%_at_0%_0%,rgba(198,255,61,.12),transparent_55%),radial-gradient(90%_120%_at_100%_100%,rgba(255,60,172,.14),transparent_55%),var(--color-panel)] px-[clamp(30px,5vw,64px)] py-[clamp(30px,5vw,64px)] text-center">
          <h2 className="font-display text-[clamp(40px,8vw,92px)] leading-[0.9] font-black uppercase">
            Let&apos;s make
            <br />
            <span className="text-lime [text-shadow:0_0_24px_rgba(198,255,61,.55)]">
              something loud.
            </span>
          </h2>
          <p className="mx-auto mt-3.5 mb-[30px] max-w-[48ch] text-[clamp(17px,2vw,20px)] text-soft">
            Got a launch, a season, a team or a wild idea? Bring it in and we&apos;ll turn it into
            content the feed can&apos;t ignore.
          </p>
          <StartProjectButton className="inline-flex cursor-pointer items-center rounded-lg bg-lime px-[34px] py-[17px] text-[17px] font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] transition hover:bg-[#d4ff5c] hover:shadow-[0_0_34px_rgba(198,255,61,.6)]">
            Start a project
          </StartProjectButton>
        </div>
      </Wrap>
    </section>
  );
}

const footerLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "What we do" },
  { href: "/#serve", label: "Who we play for" },
  { href: "/#play", label: "Play" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line py-11 pb-10">
      <Wrap>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link href="/">
              <Logo size="text-[26px]" />
            </Link>
            <div className="mt-2.5 max-w-[34ch] text-sm text-dim">
              The sports creative studio for brands, teams and athletes — everywhere the game is
              played.
            </div>
          </div>
          <div className="flex flex-wrap gap-[22px]">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-dim hover:text-lime">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-[30px] flex flex-wrap justify-between gap-3 border-t border-line-soft pt-5 text-[13px] text-dimmer">
          <span>© {year} SportyTadka. All rights reserved.</span>
          <span>Made for the game.</span>
        </div>
      </Wrap>
    </footer>
  );
}
