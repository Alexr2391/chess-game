"use client";

import css from "./ThinkingOverlay.module.scss";

export function ThinkingOverlay() {
  return (
    <div className={css.container}>
      <span className={css.text}>Thinking...</span>
    </div>
  );
}
