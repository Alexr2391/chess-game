"use client";

import type { Opponent } from "@/types";
import { Cinzel } from "next/font/google";
import Image from "next/image";
import { BiLoaderAlt } from "react-icons/bi";
import css from "./GameLoader.module.scss";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });

interface GameLoaderProps {
  fading: boolean;
  opponent: Opponent | null;
}

export function GameLoader({ fading, opponent }: GameLoaderProps) {
  return (
    <div className={`${css.overlay}${fading ? ` ${css.fadeOut}` : ""}`}>
      {opponent && (
        <Image
          src={`/images/loading_screen_${opponent}.webp`}
          alt={opponent}
          fill
          sizes="100vw"
          className={css.splash}
          priority
        />
      )}
      <div className={css.vignette} />
      <BiLoaderAlt className={css.spinner} />
      <span className={`${css.label} ${cinzel.className}`}>
        Entering the Arena
      </span>
    </div>
  );
}
