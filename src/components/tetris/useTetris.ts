import { useCallback, useEffect, useState } from "react";
import { loadBest, saveBest } from "@/lib/scores";
import { Block, BlockShape, BoardShape, EmptyCell, GhostBlock, SHAPES } from "./types";
import { useInterval } from "./useInterval";
import {
  BOARD_HEIGHT,
  getEmptyBoard,
  getRandomBlock,
  hasCollisions,
  useTetrisBoard,
} from "./useTetrisBoard";

enum TickSpeed {
  Normal = 800,
  Sliding = 100,
  Fast = 30,
}

const BEST_KEY = "tetrisScore";

export function useTetris(gameOverCallback: (finalScore: number) => void) {
  const [score, setScore] = useState(0);
  const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);

  const [{ board, droppingRow, droppingColumn, droppingBlock, droppingShape }, dispatchBoardState] =
    useTetrisBoard();

  function getGhostPosition(): number {
    let ghostRow = droppingRow;
    while (!hasCollisions(board, droppingShape, ghostRow + 1, droppingColumn)) {
      ghostRow++;
    }
    return ghostRow;
  }

  const startGame = useCallback(() => {
    const startingBlocks = [getRandomBlock(), getRandomBlock(), getRandomBlock()];
    setScore(0);
    setUpcomingBlocks(startingBlocks);
    setIsCommitting(false);
    setIsPlaying(true);
    setTickSpeed(TickSpeed.Normal);
    dispatchBoardState({ type: "start" });
  }, [dispatchBoardState]);

  const commitPosition = useCallback(() => {
    if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
      setIsCommitting(false);
      setTickSpeed(TickSpeed.Normal);
      return;
    }

    const newBoard = structuredClone(board) as BoardShape;
    addShapeToBoard(newBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);

    let numCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
        numCleared++;
        newBoard.splice(row, 1);
      }
    }

    const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
    const newBlock = newUpcomingBlocks.pop() as Block;
    newUpcomingBlocks.unshift(getRandomBlock());

    const newScore = score + getPoints(numCleared);
    if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
      setIsPlaying(false);
      setTickSpeed(null);
      gameOverCallback(newScore);
    } else {
      setTickSpeed(TickSpeed.Normal);
    }
    setUpcomingBlocks(newUpcomingBlocks);
    setScore(newScore);

    const stored = loadBest(BEST_KEY);
    if (stored == null || newScore > stored) saveBest(BEST_KEY, newScore);

    dispatchBoardState({
      type: "commit",
      newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
      newBlock,
    });
    setIsCommitting(false);
  }, [
    board,
    dispatchBoardState,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
    score,
    gameOverCallback,
  ]);

  const gameTick = useCallback(() => {
    if (isCommitting) {
      commitPosition();
    } else if (hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
      setTickSpeed(TickSpeed.Sliding);
      setIsCommitting(true);
    } else {
      dispatchBoardState({ type: "drop" });
    }
  }, [board, commitPosition, dispatchBoardState, droppingColumn, droppingRow, droppingShape, isCommitting]);

  useInterval(() => {
    if (!isPlaying) return;
    gameTick();
  }, tickSpeed);

  useEffect(() => {
    if (!isPlaying) return;

    let isPressingLeft = false;
    let isPressingRight = false;
    let moveIntervalID: ReturnType<typeof setTimeout> | undefined;

    const updateMovementInterval = () => {
      clearInterval(moveIntervalID);
      dispatchBoardState({
        type: "move",
        isPressingLeft,
        isPressingRight,
      });
      moveIntervalID = setInterval(() => {
        dispatchBoardState({
          type: "move",
          isPressingLeft,
          isPressingRight,
        });
      }, 300);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
      if (event.key === "ArrowDown") setTickSpeed(TickSpeed.Fast);
      if (event.key === "ArrowUp") dispatchBoardState({ type: "move", isRotating: true });
      if (event.key === "ArrowLeft") {
        isPressingLeft = true;
        updateMovementInterval();
      }
      if (event.key === "ArrowRight") {
        isPressingRight = true;
        updateMovementInterval();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") setTickSpeed(TickSpeed.Normal);
      if (event.key === "ArrowLeft") {
        isPressingLeft = false;
        updateMovementInterval();
      }
      if (event.key === "ArrowRight") {
        isPressingRight = false;
        updateMovementInterval();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearInterval(moveIntervalID);
    };
  }, [dispatchBoardState, isPlaying]);

  const renderedBoard = structuredClone(board) as BoardShape;
  if (isPlaying) {
    const ghostRow = getGhostPosition();
    addShapeToBoard(renderedBoard, droppingBlock, droppingShape, ghostRow, droppingColumn, true);
    addShapeToBoard(renderedBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);
  }

  return {
    board: renderedBoard,
    startGame,
    isPlaying,
    score,
    upcomingBlocks,
  };
}

function getPoints(numCleared: number): number {
  switch (numCleared) {
    case 0:
      return 0;
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      throw new Error("Unexpected number of rows cleared");
  }
}

function addShapeToBoard(
  board: BoardShape,
  droppingBlock: Block,
  droppingShape: BlockShape,
  droppingRow: number,
  droppingColumn: number,
  isGhost = false,
) {
  const blockType = isGhost ? (`${droppingBlock}Ghost` as GhostBlock) : droppingBlock;
  droppingShape
    .filter((row) => row.some((isSet) => isSet))
    .forEach((row: boolean[], rowIndex: number) => {
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
          board[droppingRow + rowIndex][droppingColumn + colIndex] = blockType;
        }
      });
    });
}
