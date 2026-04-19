"use client";

import type { Opponent } from "@/types";
import { Cinzel } from "next/font/google";
import Image from "next/image";
import { BiLoaderAlt } from "react-icons/bi";
import css from "./GameLoader.module.scss";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });

interface GameLoaderProps {
  opponent: Opponent | null;
}

export function GameLoader({ opponent }: GameLoaderProps) {
  return (
    <div className={css.overlay}>
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
