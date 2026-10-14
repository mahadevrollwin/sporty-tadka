import type { ReactNode } from "react";

export function Wrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-[1] mx-auto w-full max-w-[1160px] px-[22px]">
      {children}
    </div>
  );
}

const kickTones = {
  lime: "bg-lime/14 text-lime",
  mag: "bg-magenta/14 text-magenta",
  cyan: "bg-cyan/14 text-cyan",
} as const;

export function Kick({
  tone,
  label,
  note,
}: {
  tone: keyof typeof kickTones;
  label: string;
  note: string;
}) {
  return (
    <div className="mb-5 inline-flex items-center gap-3">
      <span
        className={`rounded-[5px] px-[11px] py-1 font-display text-[15px] font-extrabold uppercase ${kickTones[tone]}`}
      >
        {label}
      </span>
      <span className="text-sm text-dim">{note}</span>
    </div>
  );
}

export function DisplayHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 font-display text-[clamp(34px,6vw,68px)] font-black uppercase leading-[0.9]">
      {children}
    </h2>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[60ch] text-[clamp(17px,2vw,20px)] leading-normal text-soft">
      {children}
    </p>
  );
}

export function Logo({ size = "text-2xl" }: { size?: string }) {
  return (
    <span className={`font-display font-black uppercase tracking-[0.02em] ${size}`}>
      <span className="text-lime [text-shadow:0_0_14px_rgba(198,255,61,.6)]">Sporty</span>
      <span className="text-magenta [text-shadow:0_0_14px_rgba(255,60,172,.6)]">Tadka</span>
    </span>
  );
}
