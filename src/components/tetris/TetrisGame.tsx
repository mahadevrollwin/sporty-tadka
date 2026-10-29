"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GameStage } from "@/components/site/Arcade";
import { recordScore, rememberPlayer } from "@/lib/record-score";
import { useBest } from "@/lib/scores";
import { Block, BoardShape, SHAPES } from "./types";
import { useTetris } from "./useTetris";
import "./tetris.css";

function Cell({ type }: { type: string }) {
  return <div className={`st-cell st-${type}`} />;
}

function Board({ currentBoard }: { currentBoard: BoardShape }) {
  return (
    <div className="select-none rounded-2xl border border-line bg-panel p-1.5 shadow-[0_0_32px_rgba(198,255,61,.14)]">
      {currentBoard.map((row, rowIndex) => (
        <div className="st-row" key={rowIndex}>
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} type={cell} />
          ))}
        </div>
      ))}
    </div>
  );
}

function UpcomingBlocks({ upcomingBlocks }: { upcomingBlocks: Block[] }) {
  return (
    <div className="flex flex-row-reverse gap-4 sm:flex-col-reverse sm:gap-3">
      {upcomingBlocks.map((block, blockIndex) => {
        const shape = SHAPES[block].shape.filter((row) => row.some((cell) => cell));
        return (
          <div key={blockIndex}>
            {shape.map((row, rowIndex) => (
              <div key={rowIndex} className="st-row">
                {row.map((isSet, cellIndex) => (
                  <div
                    key={`${blockIndex}-${rowIndex}-${cellIndex}`}
                    className={`st-cell ${isSet ? `st-${block}` : "st-Empty"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function pressKey(key: string, type: "keydown" | "keyup") {
  document.dispatchEvent(new KeyboardEvent(type, { key }));
}

function TetrisPlayfield() {
  const [playerName, setPlayerName] = useState("");
  const [draft, setDraft] = useState("");
  const [lastScore, setLastScore] = useState<number | null>(null);
  const best = useBest("tetrisScore");
  const nameRef = useRef("");

  const handleGameOver = useCallback((finalScore: number) => {
    setLastScore(finalScore);
    setDraft(nameRef.current);
    setPlayerName("");
    void recordScore({ game: "tetris", score: finalScore, name: nameRef.current, remember: true });
  }, []);

  const { board, startGame, isPlaying, score, upcomingBlocks } = useTetris(handleGameOver);

  function begin(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    nameRef.current = trimmed;
    rememberPlayer(trimmed);
    setDraft(trimmed);
    setPlayerName(trimmed);
    setLastScore(null);
    startGame();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-dim">
        <span>
          Best <b className="font-display text-lg text-cyan">{best ?? "—"}</b>
        </span>
        {isPlaying && (
          <span>
            Score <b className="font-display text-lg text-lime">{score}</b>
          </span>
        )}
        {playerName && <span className="text-ink">{playerName}</span>}
      </div>

      {playerName === "" ? (
        <form
          className="flex w-full max-w-xs flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            begin(draft);
          }}
        >
          {lastScore != null && (
            <p className="m-0 text-center text-soft">
              Game over — <b className="text-ink">{lastScore}</b>
            </p>
          )}
          <label htmlFor="tetris-name" className="text-sm font-semibold text-dim">
            Enter your nickname
          </label>
          <input
            id="tetris-name"
            value={draft}
            maxLength={12}
            onChange={(event) => setDraft(event.target.value)}
            className="rounded-lg border border-line bg-panel px-4 py-2.5 text-ink outline-none focus:border-lime"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-lime px-4 py-3 font-bold text-pitch hover:bg-[#d4ff5c]"
          >
            Start game
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Board currentBoard={board} />
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold tracking-[0.14em] text-dimmer uppercase">Next</span>
            {isPlaying && <UpcomingBlocks upcomingBlocks={upcomingBlocks} />}
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="grid w-full max-w-sm grid-cols-4 gap-2 sm:hidden">
          {(
            [
              ["ArrowLeft", "◀"],
              ["ArrowUp", "↻"],
              ["ArrowRight", "▶"],
              ["ArrowDown", "▼"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="cursor-pointer rounded-lg border border-line bg-panel py-3 font-bold text-ink"
              onPointerDown={(event) => {
                event.preventDefault();
                pressKey(key, "keydown");
              }}
              onPointerUp={() => pressKey(key, "keyup")}
              onPointerLeave={() => pressKey(key, "keyup")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <p className="m-0 hidden text-center text-xs text-dimmer sm:block">
        Arrow keys move. Up rotates. Down drops.
      </p>
    </div>
  );
}

export function TetrisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tetris"
        className="relative max-h-[95vh] w-full max-w-[760px] overflow-auto rounded-[22px] border border-line bg-canvas px-4 py-5 shadow-[0_0_40px_rgba(198,255,61,.15)] sm:px-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="m-0 font-display text-3xl font-black uppercase">
            <span className="text-lime">Tetris</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-dim hover:text-ink"
          >
            Close
          </button>
        </div>
        <TetrisPlayfield />
      </div>
    </div>,
    document.body,
  );
}

export function TetrisLaunch({ onPlay }: { onPlay: () => void }) {
  const best = useBest("tetrisScore");
  return (
    <>
      <GameStage src="/images/games/tetris.png" wash="bg-canvas/58" contentClassName="gap-4 px-6 py-8">
        <span className="font-display text-[clamp(38px,7vw,64px)] leading-[0.88] font-black uppercase">
          Tetris
        </span>
        <p className="m-0 max-w-[36ch] text-[15px] text-soft">
          Stack the blocks and clear lines. Opens in a popup so the board has room to fall.
        </p>
        <button
          type="button"
          onClick={onPlay}
          className="cursor-pointer rounded-lg bg-lime px-6 py-3.5 font-bold text-pitch shadow-[0_0_26px_rgba(198,255,61,.4)] hover:bg-[#d4ff5c]"
        >
          Play Tetris
        </button>
      </GameStage>
      <div className="flex justify-between border-t border-line-soft pt-3 text-[13px] text-dim">
        <span>Lines and drops</span>
        <span>
          Best <b className="font-display text-base text-cyan">{best ?? "—"}</b>
        </span>
      </div>
    </>
  );
}
