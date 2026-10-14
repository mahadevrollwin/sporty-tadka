import { marqueeItems } from "@/content/home";

function Asterisk() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden
      className="block size-[0.85em] text-magenta"
    >
      <path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" />
    </svg>
  );
}

function MarqueeRow({ items }: { items: readonly string[] }) {
  return (
    <span className="inline-flex items-center gap-[45px] pr-[45px]">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-[45px]">
          <span>{item}.</span>
          <Asterisk />
        </span>
      ))}
    </span>
  );
}

export function Marquee({ items = marqueeItems }: { items?: readonly string[] } = {}) {
  return (
    <div className="relative z-[2] -mt-[calc(13px+2vw)] -mb-[2vw] w-full overflow-hidden py-[2vw]">
      <div
        aria-hidden
        className="relative -ml-[1%] w-[102%] -rotate-[1.5deg] overflow-hidden border-y border-pitch/15 bg-lime py-5 text-pitch shadow-[0_0_36px_rgba(198,255,61,.55)]"
      >
        <div className="flex w-max items-center font-display text-[27px] leading-none font-bold tracking-[0.02em] whitespace-nowrap uppercase animate-marquee motion-reduce:animate-none">
          <MarqueeRow items={items} />
          <MarqueeRow items={items} />
        </div>
      </div>
    </div>
  );
}
