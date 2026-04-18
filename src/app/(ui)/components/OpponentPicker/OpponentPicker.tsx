"use client";

import type { Opponent } from "@/types";
import Image from "next/image";
import { Cinzel } from "next/font/google";
import css from "./OpponentPicker.module.scss";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });
import { OPPONENTS } from "./constants";

interface OpponentPickerProps {
  onSelect: (opponent: Opponent) => void;
}

export function OpponentPicker({ onSelect }: OpponentPickerProps) {
  return (
    <div className={css.overlay}>
      <div className={css.container}>
        <div className={css.title} role="img" aria-label="Choose your opponent" />
        <div className={css.cards}>
          {OPPONENTS.map((o) => (
            <button
              key={o.id}
              className={css.card}
              onClick={() => onSelect(o.id)}
            >
              <div className={css.imageWrap}>
                <Image
                  src={`/images/${o.id}.webp`}
                  alt={o.name}
                  fill
                  sizes="220px"
                  className={css.portrait}
                />
              </div>
              <span className={`${css.name} ${cinzel.className}`}>{o.name}</span>
              <p className={css.bio}>{o.bio}</p>
              <span className={css.difficulty}>Difficulty: {o.difficulty}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
