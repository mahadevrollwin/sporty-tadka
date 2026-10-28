"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { work } from "@/content/home";
import { MatchdayLoop } from "./MatchdayLoop";
import { StartProjectButton } from "./LeadForm";
import { DisplayHeading, Kick, Lead, Wrap } from "./ui";

type Flip =
  | { type: "open"; num: string; dx: number; dy: number; sx: number; sy: number }
  | { type: "close"; num: string; from: DOMRect };

const motion = "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function play(el: HTMLElement, from: string, onDone?: () => void) {
  el.style.transformOrigin = "top left";
  el.style.transition = "none";
  el.style.transform = from;
  void el.offsetWidth;
  el.style.transition = motion;
  el.style.transform = "translate3d(0, 0, 0) scale(1, 1)";

  const clear = (event: TransitionEvent) => {
    if (event.propertyName !== "transform") return;
    el.style.transition = "";
    el.style.transform = "";
    el.style.transformOrigin = "";
    el.style.zIndex = "";
    onDone?.();
  };
  el.addEventListener("transitionend", clear, { once: true });
}

export function Work({
  items = work,
}: {
  items?: readonly {
    num: string;
    cat: string;
    title: string;
    copy: string;
    catClass: string;
    tileClass: string;
  }[];
} = {}) {
  const [open, setOpen] = useState<string | null>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const [frame, setFrame] = useState<{ left: number; width: number; height: number } | null>(null);
  const [pinned, setPinned] = useState(false);
  const savedScroll = useRef(0);
  const pinToken = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLDivElement>());
  const pending = useRef<Flip | null>(null);

  const expand = useCallback((num: string) => {
    const grid = gridRef.current;
    const card = cards.current.get(num);
    if (!grid || !card || open === num) return;

    const gridRect = grid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const width = gridRect.width || 1;
    const height = gridRect.height || 1;

    if (!prefersReducedMotion()) {
      pending.current = {
        type: "open",
        num,
        dx: cardRect.left - gridRect.left,
        dy: cardRect.top - gridRect.top,
        sx: cardRect.width / width,
        sy: cardRect.height / height,
      };
    }

    savedScroll.current = grid.scrollLeft;
    pinToken.current += 1;
    setPinned(true);
    setFrame({ left: grid.scrollLeft, width: grid.clientWidth, height: gridRect.height });
    setLockedHeight(gridRect.height);
    setOpen(num);
  }, [open]);

  const collapse = useCallback(() => {
    if (!open) return;
    const card = cards.current.get(open);
    if (card && !prefersReducedMotion()) {
      pending.current = { type: "close", num: open, from: card.getBoundingClientRect() };
    } else {
      setPinned(false);
    }
    setFrame(null);
    setOpen(null);
    setLockedHeight(null);
  }, [open]);

  useLayoutEffect(() => {
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    const el = cards.current.get(job.num);
    if (!el) return;

    if (job.type === "open") {
      play(el, `translate3d(${job.dx}px, ${job.dy}px, 0) scale(${job.sx}, ${job.sy})`);
      return;
    }

    const grid = gridRef.current;
    if (grid) grid.scrollLeft = savedScroll.current;
    const to = el.getBoundingClientRect();
    const sx = job.from.width / (to.width || 1);
    const sy = job.from.height / (to.height || 1);
    el.style.zIndex = "30";
    const token = pinToken.current;
    let settled = false;
    const finish = () => {
      if (settled || pinToken.current !== token) return;
      settled = true;
      if (gridRef.current) gridRef.current.scrollLeft = savedScroll.current;
      setPinned(false);
    };
    play(
      el,
      `translate3d(${job.from.left - to.left}px, ${job.from.top - to.top}px, 0) scale(${sx}, ${sy})`,
      finish,
    );
    const timer = window.setTimeout(finish, 700);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") collapse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, collapse]);

  return (
    <section id="work" className="relative py-[76px]">
      <Wrap>
        <Kick tone="lime" label="Work" note="A taste of what we ship" />
        <DisplayHeading>Content built for replays.</DisplayHeading>
        <Lead>
          Fast, loud and made to be watched twice. Swap these in for your real case studies —
          every tile is a slot for a reel or a campaign.
        </Lead>
        <div
          ref={gridRef}
          className={`relative mt-[38px] -mx-[22px] flex gap-4 px-[22px] pb-1 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:grid-cols-2 min-[641px]:px-0 min-[901px]:grid-cols-3 [&::-webkit-scrollbar]:hidden ${
            pinned
              ? "overflow-hidden"
              : "snap-x snap-mandatory overflow-x-auto min-[641px]:snap-none min-[641px]:overflow-visible"
          }`}
          style={lockedHeight ? { height: lockedHeight } : undefined}
        >
          {items.map((item) => {
            const isOpen = open === item.num;
            const hidden = open !== null && !isOpen;
            return (
              <div
                key={item.num}
                ref={(node) => {
                  if (node) cards.current.set(item.num, node);
                  else cards.current.delete(item.num);
                }}
                className={` ${
                  isOpen
                    ? "absolute z-20"
                    : "relative w-[86%] shrink-0 snap-start min-[641px]:w-auto min-[641px]:shrink"
                } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"} transition-opacity duration-300`}
                style={
                  isOpen && frame
                    ? { left: frame.left, top: 0, width: frame.width, height: frame.height }
                    : undefined
                }
              >
                {!isOpen && (
                  <button
                    type="button"
                    className="absolute inset-0 z-10 cursor-pointer rounded-[14px]"
                    aria-label={`Open ${item.title}`}
                    onClick={() => expand(item.num)}
                  />
                )}
                <div
                  className={`relative isolate flex h-full min-h-[250px] flex-col justify-end overflow-hidden rounded-[14px] border border-line p-[22px] ${item.tileClass}`}
                >
                  <span
                    className={`pointer-events-none absolute -top-3.5 -right-1.5 -z-10 font-display leading-none font-black opacity-[0.14] ${
                      isOpen ? "text-[120px] min-[641px]:text-[min(42vw,300px)]" : "text-[120px]"
                    }`}
                  >
                    {item.num}
                  </span>
                  {isOpen && item.num === "01" ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[28%] z-[5] flex items-center justify-center overflow-hidden px-3 pt-6 [container-type:size] min-[641px]:bottom-[24%] min-[641px]:px-6 min-[641px]:pt-4">
                      <div className="aspect-square w-[min(100%,100cqh,340px)] min-[641px]:w-[min(100%,100cqh,520px)] min-[901px]:w-[min(100%,100cqh,560px)]">
                        <MatchdayLoop />
                      </div>
                    </div>
                  ) : null}
                  <span className={`text-[12.5px] font-bold uppercase opacity-90 ${item.catClass}`}>
                    {item.cat}
                  </span>
                  <span
                    className={`my-1.5 font-display leading-[0.9] font-black uppercase ${
                      isOpen ? "text-[34px] min-[641px]:text-[clamp(48px,6vw,84px)]" : "text-[34px]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <p
                    className={`m-0 text-white/82 ${
                      isOpen ? "max-w-[42ch] text-sm min-[641px]:text-lg" : "max-w-[34ch] text-sm"
                    }`}
                  >
                    {item.copy}
                  </p>
                </div>
                {isOpen && (
                  <>
                    <StartProjectButton className="absolute right-4 bottom-4 z-30 inline-flex cursor-pointer items-center rounded-lg bg-lime px-4 py-2.5 text-[14px] font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] transition hover:bg-[#d4ff5c]">
                      Start a project
                    </StartProjectButton>
                    <button
                      type="button"
                      onClick={collapse}
                      className="absolute top-4 right-4 z-30 cursor-pointer rounded-lg border border-white/20 bg-black/40 px-4 py-2.5 text-[14px] font-bold text-white backdrop-blur-sm transition hover:border-white/40"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Wrap>
    </section>
  );
}
