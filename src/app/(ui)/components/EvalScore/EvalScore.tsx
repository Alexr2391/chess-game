"use client";

import css from "./EvalScore.module.scss";

interface EvalProps {
  score: number;
}

export function EvalScore({ score }: EvalProps) {
  const display = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  const color = score > 0 ? css.white : score < 0 ? css.black : css.neutral;

  return (
    <div className={css.container}>
      <span className={`${css.score} ${color}`}>{display}</span>
    </div>
  );
}
