"use client";

import { useCallback, useState } from "react";
import { games, type GameId } from "@/content/home";
import { TetrisLaunch, TetrisModal } from "@/components/tetris/TetrisGame";
import { DisplayHeading, Kick, Lead, Wrap } from "./ui";
import {
  RapidGame,
  ReactionGame,
  ScamAlertLaunch,
  ScamAlertModal,
  TechCrushModal,
  TimingGame,
} from "./Arcade";
import { Leaderboard } from "./Leaderboard";

export function Play() {
  const [active, setActive] = useState<GameId>("reaction");
  const [tetrisOpen, setTetrisOpen] = useState(false);
  const [crushOpen, setCrushOpen] = useState(false);
  const [scamOpen, setScamOpen] = useState(false);
  const closeTetris = useCallback(() => setTetrisOpen(false), []);
  const closeCrush = useCallback(() => setCrushOpen(false), []);
  const closeScam = useCallback(() => setScamOpen(false), []);

  return (
    <section id="play" className="relative border-y border-line bg-panel py-[76px]">
      <Wrap>
        <Kick tone="lime" label="The Locker Room" note="Because we can't help ourselves" />
        <DisplayHeading>Five games. No mercy.</DisplayHeading>
        <Lead>
          Test your reflexes, timing, and nerve. Tetris, Star Crush, and Cricket IQ each open in
          their own window.
        </Lead>
        <div className="mt-[38px] overflow-hidden rounded-[18px] border border-line bg-elevated">
          <div className="flex flex-wrap border-b border-line bg-panel" role="tablist">
            {games.map((game) => {
              const selected = game.id === active;
              return (
                <button
                  key={game.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setActive(game.id);
                    if (game.id === "tetris") setTetrisOpen(true);
                    if (game.id === "rapid") setCrushOpen(true);
                    if (game.id === "scam") setScamOpen(true);
                  }}
                  className={`min-w-[50%] flex-1 cursor-pointer border-r border-line-soft px-3.5 py-[15px] font-display text-[17px] font-extrabold tracking-[0.02em] uppercase last:border-r-0 min-[641px]:min-w-[150px] ${
                    selected ? "bg-lime text-pitch" : "bg-transparent text-dim hover:text-ink"
                  }`}
                >
                  <span className="mr-2">{game.emoji}</span>
                  {game.label}
                </button>
              );
            })}
          </div>
          <div className="flex min-h-[360px] flex-col gap-4 p-[22px]">
            {active === "reaction" && <ReactionGame />}
            {active === "timing" && <TimingGame />}
            {active === "tetris" && <TetrisLaunch onPlay={() => setTetrisOpen(true)} />}
            {active === "rapid" && <RapidGame onPlay={() => setCrushOpen(true)} />}
            {active === "scam" && <ScamAlertLaunch onPlay={() => setScamOpen(true)} />}
          </div>
        </div>
        <TetrisModal open={tetrisOpen} onClose={closeTetris} />
        <TechCrushModal open={crushOpen} onClose={closeCrush} />
        <ScamAlertModal open={scamOpen} onClose={closeScam} />
        <Leaderboard />
      </Wrap>
    </section>
  );
}
