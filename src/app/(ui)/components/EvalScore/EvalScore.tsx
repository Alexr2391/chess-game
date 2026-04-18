"use client";

import css from "./EvalScore.module.scss";

type Props = {
  score: number;
};

export function EvalScore({ score }: Props) {
  const display = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  const color = score > 0 ? css.white : score < 0 ? css.black : css.neutral;

  return (
    <div className={css.container}>
      <span className={`${css.score} ${color}`}>{display}</span>
    </div>
  );
}
