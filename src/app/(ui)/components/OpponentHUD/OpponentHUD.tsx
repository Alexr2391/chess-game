"use client";

import type { Opponent } from "@/types";
import { Cinzel } from "next/font/google";
import Image from "next/image";
import {
  OPPONENT_ELO,
  OPPONENT_QUOTE,
  OPPONENTS,
} from "../OpponentPicker/constants";
import css from "./OpponentHUD.module.scss";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });

interface OpponentHUDProps {
  opponent: Opponent;
  playerColor: "w" | "b";
}

export function OpponentHUD({ opponent, playerColor }: OpponentHUDProps) {
  const data = OPPONENTS.find((o) => o.id === opponent)!;
  const opponentColor = playerColor === "w" ? "Black" : "White";

  return (
    <div className={css.hud}>
      <div className={css.portrait}>
        <Image
          src={`/images/${opponent}.webp`}
          alt={data.name}
          fill
          sizes="100px"
          className={css.image}
        />
      </div>
      <p className={css.quote}>&quot;{OPPONENT_QUOTE[opponent]}&ldquo;</p>
      <div className={css.info}>
        <span className={`${css.label} ${cinzel.className}`}>Opponent</span>
        <span className={`${css.name} ${cinzel.className}`}>{data.name}</span>
        <span className={`${css.elo} ${cinzel.className}`}>
          ELO {OPPONENT_ELO[opponent]}
        </span>
        <div className={css.divider} />
        <span className={`${css.color} ${cinzel.className}`}>Plays</span>
        <div className={css.pieceWrap}>
          <Image
            src={`/images/${opponentColor.toLowerCase()}_piece.webp`}
            alt={`${opponentColor} piece`}
            width={75}
            height={75}
            className={`${css.piece} ${css.pieceLeft}`}
          />
          <Image
            src={`/images/${opponentColor.toLowerCase()}_piece.webp`}
            alt={`${opponentColor} piece`}
            width={75}
            height={75}
            className={`${css.piece} ${css.pieceRight}`}
          />
        </div>
      </div>
    </div>
  );
}
