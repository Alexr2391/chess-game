"use client";

import { COLOR, GAMESTATUS, type ColorChecked, type GameStatus } from "@/types";
import css from "./GameModal.module.scss";

interface GameModalProps {
  gameStatus: GameStatus;
  checkedColor: ColorChecked;
  onPlayAgain: () => void;
  onClose: () => void;
}

const { CHECK, CHECKMATE, DRAW, PLAYING, STALEMATE } = GAMESTATUS;

export function GameModal({
  gameStatus,
  checkedColor,
  onPlayAgain,
  onClose,
}: GameModalProps) {
  if (gameStatus === PLAYING) return null;

  const isTerminal =
    gameStatus === CHECKMATE || gameStatus === DRAW || gameStatus === STALEMATE;

  const { WHITE } = COLOR;

  const message = () => {
    if (gameStatus === CHECK)
      return `${checkedColor === WHITE ? "White" : "Black"} is in check!`;
    if (gameStatus === CHECKMATE)
      return `${checkedColor === WHITE ? "White" : "Black"} is checkmated. ${checkedColor === WHITE ? "Black" : "White"} wins!`;
    if (gameStatus === STALEMATE) return "Stalemate — it's a draw!";
    if (gameStatus === DRAW) return "Draw!";
    return null;
  };

  return (
    <div className={css.overlay} onClick={isTerminal ? undefined : onClose}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        <p className={css.message}>{message()}</p>
        {isTerminal && (
          <div className={css.buttons}>
            <button
              className={`${css.btn} ${css.primary}`}
              onClick={onPlayAgain}
            >
              Play Again
            </button>
            <button className={`${css.btn} ${css.secondary}`} onClick={onClose}>
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
