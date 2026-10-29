"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { services } from "@/content/home";
import {
  BrandAthletesFilmsGraphic,
  BrandedGamesGraphic,
  EventsActivationsGraphic,
  ReactiveContentGraphic,
  SocialCommunityGraphic,
  SportsBrandingGraphic,
} from "./what-we-do";

const serviceGraphics: ComponentType[] = [
  ReactiveContentGraphic,
  BrandAthletesFilmsGraphic,
  SportsBrandingGraphic,
  SocialCommunityGraphic,
  BrandedGamesGraphic,
  EventsActivationsGraphic,
];

const tones = [
  {
    text: "text-lime",
    border: "border-lime text-lime",
    wash: "bg-[radial-gradient(80%_70%_at_82%_58%,rgba(198,255,61,0.2),transparent_60%)]",
  },
  {
    text: "text-magenta",
    border: "border-magenta text-magenta",
    wash: "bg-[radial-gradient(80%_70%_at_82%_58%,rgba(255,60,172,0.22),transparent_60%)]",
  },
  {
    text: "text-cyan",
    border: "border-cyan text-cyan",
    wash: "bg-[radial-gradient(80%_70%_at_82%_58%,rgba(51,230,255,0.2),transparent_60%)]",
  },
  {
    text: "text-yellow",
    border: "border-yellow text-yellow",
    wash: "bg-[radial-gradient(80%_70%_at_82%_58%,rgba(255,228,94,0.18),transparent_60%)]",
  },
  {
    text: "text-lime",
    border: "border-lime text-lime",
    wash: "bg-[radial-gradient(80%_70%_at_82%_58%,rgba(198,255,61,0.2),transparent_60%)]",
  },
  {
    text: "text-magenta",
    border: "border-magenta text-magenta",
    wash: "bg-[radial-gradient(80%_70%_at_82%_58%,rgba(255,60,172,0.22),transparent_60%)]",
  },
] as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function Services({
  items = services,
}: {
  items?: readonly {
    n: string;
    title: string;
    headlineLead: string;
    headlineAccent: string;
    copy: string;
  }[];
} = {}) {
  const steps = Math.max(1, items.length - 1);
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const render = () => {
      frame = 0;
      const pin = root.querySelector<HTMLElement>(".roster-pin");
      if (!pin || reduce.matches) {
        track.style.transform = "";
        return;
      }
      const top = root.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp((window.scrollY - top) / travel);
      const stage = progress * steps;
      const segment = Math.min(steps - 1, Math.floor(stage));
      const fraction = stage - segment;
      const transition = clamp((fraction - 0.16) / 0.68);
      const ease = transition * transition * (3 - 2 * transition);
      const position = segment + ease;
      track.style.transform = `translate3d(${-position * pin.clientWidth}px,0,0)`;
      const next = Math.round(position);
      setActive((current) => (current === next ? current : next));
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    reduce.addEventListener("change", requestRender);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reduce.removeEventListener("change", requestRender);
    };
  }, [steps]);

  function go(index: number) {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.querySelectorAll<HTMLElement>(".roster-panel")[index]?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      return;
    }
    const top = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, root.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: top + (index / steps) * travel,
      behavior: "smooth",
    });
  }

  const indexLabel = String(active + 1).padStart(2, "0");

  return (
    <section id="services" ref={rootRef} aria-label="What we do" className="roster-scroll relative bg-canvas">
      <div className="roster-pin">
        <div className="roster-chrome pointer-events-none absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-1.5 px-[22px] pt-32 text-[11px] font-semibold tracking-[0.14em] uppercase min-[761px]:flex-row min-[761px]:items-start min-[761px]:justify-between min-[761px]:pt-[88px] min-[761px]:text-[12px]">
            <span className="text-dim">
              What we do <span className="text-ink">· The full-time roster</span>
            </span>
            <span className="text-lime">Keep scrolling. Six ways in. →</span>
          </div>
        </div>

        <div ref={trackRef} className="roster-track">
          {items.map((item, index) => {
            const [number, label] = item.n.split(" · ");
            const lead = item.headlineLead;
            const accent = item.headlineAccent;
            const tone = tones[index % tones.length];
            const Graphic = serviceGraphics[index];
            return (
              <article key={item.n} className="roster-panel">
                <div aria-hidden className={`pointer-events-none absolute inset-0 ${tone.wash}`} />
                <div className="roster-body relative z-[1] mx-auto grid h-full w-full max-w-[1240px] grid-cols-1 content-center items-center gap-x-8 gap-y-5 px-[22px] pt-[120px] pb-[112px] min-[761px]:grid-cols-[minmax(17rem,0.42fr)_minmax(0,1fr)] min-[761px]:gap-x-10 min-[761px]:pt-[148px] min-[761px]:pb-[128px]">
                  <div className="roster-copy relative z-[1] min-w-0">
                    <p className="m-0 text-[12px] font-semibold tracking-[0.16em] text-dim uppercase">
                      {number} / {label}
                    </p>
                    <h2 className="mt-4 mb-0 font-display text-[clamp(44px,11vw,96px)] leading-[0.84] font-black uppercase min-[761px]:text-[clamp(52px,7.4vw,96px)]">
                      <span className="block whitespace-nowrap">{lead}</span>
                      <span className={`block whitespace-nowrap ${tone.text}`}>{accent}</span>
                    </h2>
                    <p className="mt-5 mb-0 max-w-[36ch] text-[16px] leading-normal text-soft min-[761px]:mt-7 min-[761px]:text-[17px]">
                      {item.copy}
                    </p>
                  </div>
                  {Graphic ? (
                    <div className="roster-graphic pointer-events-none relative z-[1] flex min-w-0 items-center justify-center min-[761px]:justify-end">
                      <div className="roster-graphic-frame aspect-[4/3] w-full">
                        <Graphic />
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="roster-chrome absolute inset-x-0 bottom-0 z-20 pb-7">
          <div className="mx-auto flex max-w-[1160px] items-end gap-6 px-[22px]">
            <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Services">
              {items.map((item, index) => {
                const [number, label] = item.n.split(" · ");
                const selected = index === active;
                return (
                  <button
                    key={item.n}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => go(index)}
                    className={`min-w-[7.25rem] shrink-0 border-t bg-transparent pt-4 text-left text-[13px] whitespace-nowrap transition-colors min-[761px]:min-w-0 min-[761px]:flex-1 min-[761px]:shrink ${
                      selected ? tones[index % tones.length].border : "border-white/25 text-dim hover:text-ink"
                    }`}
                  >
                    <span className="mr-2 opacity-60">{number}</span>
                    {label}
                  </button>
                );
              })}
            </div>
            <span className="shrink-0 pb-0.5 text-[12px] font-semibold tracking-[0.14em] text-dim uppercase">
              {indexLabel} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
