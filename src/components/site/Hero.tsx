"use client";

import { useEffect, useRef } from "react";

export function Hero({
  eyebrow = "Sports creative studio · wherever the game is played",
  title = "We speak",
  accent = "fluent",
  ending = "sport.",
  lead = "A playful, motion-first studio for the brands, teams and athletes who live for the game. We turn every whistle, drop and last-minute winner into content that",
  leadBold = "hits different in the feed.",
  primary = "See the work",
  secondary = "Play something",
}: {
  eyebrow?: string;
  title?: string;
  accent?: string;
  ending?: string;
  lead?: string;
  leadBold?: string;
  primary?: string;
  secondary?: string;
} = {}) {
  return (
    <header id="top" className="relative overflow-hidden pt-[78px] pb-16">
      <div className="pointer-events-none absolute inset-0 z-0 motion-reduce:hidden" aria-hidden>
        <HeroVideo />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(8,7,14,.78),rgba(8,7,14,.52)_42%,rgba(8,7,14,.84))]"
      />
      <div className="relative z-[2] mx-auto w-full max-w-[1160px] px-[22px]">
        <span className="mb-7 inline-flex items-center gap-[9px] rounded-full border border-line bg-canvas/50 px-[15px] py-[7px] text-[13px] font-semibold text-dim">
          <span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_10px_var(--color-lime)]" />
          {eyebrow}
        </span>
        <h1 className="animate-flicker m-0 font-display text-[clamp(46px,16vw,80px)] font-black leading-[0.84] tracking-[-0.01em] uppercase motion-reduce:animate-none min-[641px]:text-[clamp(54px,13vw,168px)]">
          {title}
          <br />
          <span className="text-lime [text-shadow:0_0_24px_rgba(198,255,61,.55)]">{accent}</span>{" "}
          <span className="text-magenta [text-shadow:0_0_24px_rgba(255,60,172,.55)]">{ending}</span>
        </h1>
        <p className="mt-7 max-w-[52ch] text-[clamp(18px,2.2vw,22px)] leading-normal text-soft">
          {lead} {leadBold ? <b className="font-semibold text-ink">{leadBold}</b> : null}
        </p>
        <div className="mt-[34px] flex flex-wrap gap-[13px]">
          <a
            href="#work"
            className="inline-flex items-center rounded-lg bg-lime px-6 py-3.5 text-[15.5px] font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] transition hover:bg-[#d4ff5c] hover:shadow-[0_0_34px_rgba(198,255,61,.6)] active:translate-y-px"
          >
            {primary}
          </a>
          <a
            href="#play"
            className="inline-flex items-center rounded-lg border border-line px-6 py-3.5 text-[15.5px] font-bold text-ink transition hover:border-magenta hover:text-magenta hover:shadow-[0_0_22px_rgba(255,60,172,.3)] active:translate-y-px"
          >
            {secondary}
          </a>
        </div>
      </div>
    </header>
  );
}

function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const start = () => {
      void video.play().catch(() => {});
    };
    start();
    video.addEventListener("loadeddata", start);
    return () => video.removeEventListener("loadeddata", start);
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      {...{ "webkit-playsinline": "true" }}
    >
      <source src="/video/hero-football.mp4" type="video/mp4" />
    </video>
  );
}
