"use client";

import type { ColorChecked, GameStatus } from "@/types";
import css from "./GameModal.module.scss";

type Props = {
  gameStatus: GameStatus;
  checkedColor: ColorChecked;
  onPlayAgain: () => void;
  onClose: () => void;
};

export function GameModal({ gameStatus, checkedColor, onPlayAgain, onClose }: Props) {
  if (gameStatus === "playing") return null;

  const isTerminal = gameStatus === "checkmate" || gameStatus === "draw" || gameStatus === "stalemate";

  const message = () => {
    if (gameStatus === "check") return `${checkedColor === "white" ? "White" : "Black"} is in check!`;
    if (gameStatus === "checkmate") return `${checkedColor === "white" ? "White" : "Black"} is checkmated. ${checkedColor === "white" ? "Black" : "White"} wins!`;
    if (gameStatus === "stalemate") return "Stalemate — it's a draw!";
    if (gameStatus === "draw") return "Draw!";
    return null;
  };

  return (
    <div className={css.overlay} onClick={isTerminal ? undefined : onClose}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        <p className={css.message}>{message()}</p>
        {isTerminal && (
          <div className={css.buttons}>
            <button className={`${css.btn} ${css.primary}`} onClick={onPlayAgain}>
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
