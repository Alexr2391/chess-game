"use client";

import css from "./ColorPicker.module.scss";

type Props = {
  onSelect: (color: "w" | "b") => void;
};

export function ColorPicker({ onSelect }: Props) {
  return (
    <div className={css.container}>
      <h1 className={css.title}>Choose your side</h1>
      <div className={css.buttons}>
        <button className={`${css.btn} ${css.white}`} onClick={() => onSelect("w")}>
          White
        </button>
        <button className={`${css.btn} ${css.black}`} onClick={() => onSelect("b")}>
          Black
        </button>
      </div>
    </div>
  );
}
