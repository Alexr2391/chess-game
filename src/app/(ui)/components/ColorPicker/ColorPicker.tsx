"use client";

import Image from "next/image";
import css from "./ColorPicker.module.scss";

type Props = {
  onSelect: (color: "w" | "b") => void;
};

export function ColorPicker({ onSelect }: Props) {
  return (
    <div className={css.container}>
      <Image
        src="/images/chesslords.webp"
        alt="Chesslords"
        width={200}
        height={133}
        style={{ width: "200px", height: "auto" }}
        className={css.logo}
      />
      <div className={css.splashMenu}>
        <div className={css.titleImage} role="img" aria-label="Pick a side" />
        <div className={css.buttons}>
          <button className={`${css.btn} ${css.white}`} onClick={() => onSelect("w")}>
            <Image src="/images/white.webp" alt="White" fill sizes="300px" className={css.btnImage} />
          </button>
          <button className={`${css.btn} ${css.black}`} onClick={() => onSelect("b")}>
            <Image src="/images/black.webp" alt="Black" fill sizes="300px" className={css.btnImage} />
          </button>
        </div>
      </div>
    </div>
  );
}
