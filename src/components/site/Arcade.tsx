"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { recordScore } from "@/lib/record-score";
import { loadBest, saveBest, useBest } from "@/lib/scores";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Phase = "idle" | "wait" | "go" | "foul" | "done";

const phaseText: Record<Phase, string> = {
  idle: "text-ink",
  wait: "text-magenta",
  go: "text-pitch",
  foul: "text-[#ff8a5c]",
  done: "text-lime",
};

const phaseWash: Record<Phase, string> = {
  idle: "bg-canvas/55",
  wait: "bg-[#2a0f22]/78",
  go: "bg-lime/88",
  foul: "bg-[#3a1206]/82",
  done: "bg-[#0c1204]/72",
};

export function GameStage({
  src,
  wash = "bg-canvas/55",
  className = "",
  contentClassName = "",
  children,
  as: Tag = "div",
  ...props
}: {
  src: string;
  wash?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  as?: "div" | "button";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Tag
      className={`relative flex min-h-[270px] flex-1 overflow-hidden rounded-[14px] ${className}`}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
      />
      <span aria-hidden className={`pointer-events-none absolute inset-0 ${wash}`} />
      <span
        className={`relative z-[1] flex w-full flex-1 flex-col items-center justify-center gap-3 px-[22px] py-[22px] text-center ${contentClassName}`}
      >
        {children}
      </span>
    </Tag>
  );
}

function GameMeta({ label, best }: { label: string; best: string }) {
  return (
    <div className="flex justify-between border-t border-line-soft pt-3 text-[13px] text-dim">
      <span>{label}</span>
      <span>
        Best <b className="font-display text-base text-cyan">{best}</b>
      </span>
    </div>
  );
}

export function ReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lightsOn, setLightsOn] = useState(0);
  const [lightsVisible, setLightsVisible] = useState(false);
  const [headline, setHeadline] = useState("Tap to start");
  const [detail, setDetail] = useState("Reflex test — wait for green, then tap fast.");
  const best = useBest("st_react");
  const phaseRef = useRef<Phase>("idle");
  const startRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  function stopTimers() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }

  function setPhaseNow(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function go() {
    setPhaseNow("go");
    setLightsVisible(false);
    setHeadline("TAP!");
    setDetail("Now! Now! Now!");
    startRef.current = Date.now();
  }

  function arm() {
    setPhaseNow("wait");
    setHeadline("Wait for green…");
    setDetail("Don't jump early.");
    setLightsVisible(true);
    setLightsOn(0);
    let step = 0;
    intervalRef.current = window.setInterval(() => {
      step += 1;
      setLightsOn(step);
      if (step >= 5) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        timeoutRef.current = window.setTimeout(go, randomBetween(400, 2600));
      }
    }, 320);
  }

  function finish() {
    const ms = Date.now() - startRef.current;
    setPhaseNow("done");
    setHeadline(`${ms} ms`);
    const verdict =
      ms < 220 ? "Elite reflexes! 🔥" : ms < 300 ? "Sharp." : ms < 400 ? "Solid." : "Warming up…";
    setDetail(`${verdict} Tap to replay.`);
    const stored = loadBest("st_react");
    if (stored == null || ms < stored) saveBest("st_react", ms);
    void recordScore({ game: "reaction", score: ms, remember: true });
  }

  function foul() {
    stopTimers();
    setPhaseNow("foul");
    setLightsVisible(false);
    setHeadline("False start! 🚩");
    setDetail("Too soon. Tap to reset.");
  }

  function reset() {
    setPhaseNow("idle");
    setLightsVisible(false);
    setHeadline("Tap to start");
    setDetail("Reflex test — wait for green, then tap fast.");
  }

  function tap() {
    const current = phaseRef.current;
    if (current === "idle" || current === "done") arm();
    else if (current === "wait") foul();
    else if (current === "go") finish();
    else if (current === "foul") reset();
  }

  return (
    <>
      <GameStage
        as="button"
        type="button"
        aria-live="polite"
        src="/images/games/reaction.png"
        wash={phaseWash[phase]}
        onClick={tap}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            tap();
          }
        }}
        className={`cursor-pointer border-0 font-sans transition-colors ${phaseText[phase]}`}
      >
        <span className={`flex gap-3 ${lightsVisible ? "" : "hidden"}`}>
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`h-6 w-6 rounded-full ${
                index < lightsOn
                  ? "bg-magenta shadow-[0_0_16px_var(--color-magenta)]"
                  : "bg-white/12 shadow-[inset_0_0_0_2px_rgba(255,255,255,.15)]"
              }`}
            />
          ))}
        </span>
        <span className="font-display text-[clamp(38px,7vw,64px)] leading-[0.88] font-black uppercase">
          {headline}
        </span>
        <span className="max-w-[26ch] text-[15px] opacity-90">{detail}</span>
      </GameStage>
      <GameMeta label="Reaction time" best={best == null ? "—" : `${best} ms`} />
    </>
  );
}

export function TimingGame() {
  const markerRef = useRef<HTMLDivElement>(null);
  const pos = useRef(0);
  const dir = useRef(1);
  const speed = useRef(0.9);
  const ballRef = useRef(1);
  const runsRef = useRef(0);
  const doneRef = useRef(false);
  const best = useBest("st_over");
  const [ball, setBall] = useState(1);
  const [runs, setRuns] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("Stop the marker in the green for a SIX.");

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      pos.current += dir.current * speed.current;
      if (pos.current >= 100) {
        pos.current = 100;
        dir.current = -1;
      }
      if (pos.current <= 0) {
        pos.current = 0;
        dir.current = 1;
      }
      if (markerRef.current) markerRef.current.style.left = `${pos.current}%`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function scoreAt(position: number) {
    const distance = Math.abs(position - 50);
    if (distance <= 6) return 6;
    if (distance <= 14) return 4;
    if (distance <= 24) return 2;
    return 0;
  }

  function swing() {
    if (doneRef.current) {
      ballRef.current = 1;
      runsRef.current = 0;
      speed.current = 0.9;
      doneRef.current = false;
      setBall(1);
      setRuns(0);
      setDone(false);
      setMessage("Stop the marker in the green for a SIX.");
      return;
    }
    const scored = scoreAt(pos.current);
    runsRef.current += scored;
    setRuns(runsRef.current);
    setMessage(
      scored === 6 ? "SIX! 🎉" : scored === 4 ? "FOUR!" : scored === 2 ? "Two runs." : "Missed it — no run.",
    );
    if (ballRef.current >= 6) {
      doneRef.current = true;
      setDone(true);
      setMessage(`Over done — ${runsRef.current} runs! Tap to play again.`);
      const stored = loadBest("st_over");
      if (stored == null || runsRef.current > stored) saveBest("st_over", runsRef.current);
      void recordScore({ game: "timing", score: runsRef.current, remember: true });
    } else {
      ballRef.current += 1;
      setBall(ballRef.current);
      speed.current += 0.18;
    }
  }

  return (
    <>
      <GameStage src="/images/games/timing.png" wash="bg-canvas/60" contentClassName="gap-[18px]">
        <div className="text-[15px] text-dim">
          Ball <b className="mx-1 font-display text-xl text-ink">{ball}</b>/6 · Runs{" "}
          <b className="mx-1 font-display text-xl text-lime">{runs}</b>
        </div>
        <div className="relative h-14 w-full max-w-xl overflow-hidden rounded-xl border border-line bg-panel/90">
          <div className="absolute inset-y-0 right-[44%] left-[44%] bg-lime/35" />
          <div className="absolute inset-y-0 left-[36%] w-[8%] bg-yellow/22" />
          <div className="absolute inset-y-0 left-[56%] w-[8%] bg-yellow/22" />
          <div className="absolute inset-y-0 left-[26%] w-[10%] bg-magenta/16" />
          <div className="absolute inset-y-0 left-[64%] w-[10%] bg-magenta/16" />
          <div
            ref={markerRef}
            className="absolute -top-1 -bottom-1 w-1 bg-white shadow-[0_0_12px_#fff]"
          />
        </div>
        <button
          type="button"
          onClick={swing}
          className="cursor-pointer self-center rounded-lg bg-lime px-6 py-3.5 font-sans text-[15.5px] font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] hover:bg-[#d4ff5c]"
        >
          {done ? "Play again" : "Hit!"}
        </button>
        <div className="min-h-[22px] text-[15px] text-dim">{message}</div>
      </GameStage>
      <GameMeta label="Runs in one over" best={best == null ? "—" : String(best)} />
    </>
  );
}

export function RapidGame({ onPlay }: { onPlay: () => void }) {
  return (
    <GameStage src="/images/games/star-crush.png" wash="bg-canvas/58" contentClassName="gap-4 px-6 py-8">
      <span className="font-display text-[clamp(38px,7vw,64px)] leading-[0.88] font-black uppercase">
        Star Crush
      </span>
      <p className="m-0 max-w-[40ch] text-[15px] text-soft">
        Match three sports stars and build your roster. The board opens on its own.
      </p>
      <button
        type="button"
        onClick={onPlay}
        className="cursor-pointer rounded-lg bg-lime px-6 py-3.5 font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] hover:bg-[#d4ff5c]"
      >
        Play Star Crush
      </button>
    </GameStage>
  );
}

export function ScamAlertLaunch({ onPlay }: { onPlay: () => void }) {
  return (
    <GameStage src="/images/games/cricket-iq.png" wash="bg-canvas/58" contentClassName="gap-4 px-6 py-8">
      <span className="font-display text-[clamp(38px,7vw,64px)] leading-[0.88] font-black uppercase">
        Cricket IQ
      </span>
      <p className="m-0 max-w-[42ch] text-[15px] text-soft">
        Pick the right cricketer for a random question before the clock runs out. The challenge
        opens full screen.
      </p>
      <button
        type="button"
        onClick={onPlay}
        className="cursor-pointer rounded-lg bg-lime px-6 py-3.5 font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] hover:bg-[#d4ff5c]"
      >
        Play Cricket IQ
      </button>
    </GameStage>
  );
}

export function ScamAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-2">
        <span className="font-display text-2xl font-black tracking-[0.02em] uppercase">
          <span className="text-lime">Cricket</span> <span className="text-magenta">IQ</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-dim hover:text-ink"
        >
          Close
        </button>
      </div>
      <iframe title="Cricket IQ" src="/scam-alert/index.html" className="min-h-0 w-full flex-1 border-0 bg-canvas" />
    </div>,
    document.body,
  );
}

export function TechCrushModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-2">
        <span className="font-display text-2xl font-black tracking-[0.02em] uppercase">
          <span className="text-lime">Star</span> <span className="text-magenta">Crush</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-dim hover:text-ink"
        >
          Close
        </button>
      </div>
      <iframe title="Star Crush" src="/tech-crush/index.html" className="min-h-0 w-full flex-1 border-0 bg-canvas" />
    </div>,
    document.body,
  );
}
