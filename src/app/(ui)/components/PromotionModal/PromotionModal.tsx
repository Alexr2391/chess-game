"use client";

import type { PromotionPiece } from "@/types";
import RotatingCanvas from "../../meshes/RotatingCanvas/RotatingCanvas";
import css from "./PromotionModal.module.scss";

interface PromotionalModalProps {
  playerColor: "w" | "b";
  onSelect: (piece: PromotionPiece) => void;
}

const LABELS: Record<PromotionPiece, string> = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

const PIECES: PromotionPiece[] = ["q", "r", "b", "n"];

export function PromotionModal({
  playerColor,
  onSelect,
}: PromotionalModalProps) {
  return (
    <div className={css.overlay}>
      <div className={css.modal}>
        <h3 className={css.title}>Promote Pawn</h3>
        <div className={css.cards}>
          {PIECES.map((piece) => (
            <button
              key={piece}
              className={css.card}
              onClick={() => onSelect(piece)}
            >
              <div className={css.canvasWrap}>
                <RotatingCanvas
                  piece={piece}
                  playerColor={playerColor}
                  key={piece}
                />
              </div>
              <span className={css.label}>{LABELS[piece]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
