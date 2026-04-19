"use client";

import Image from "next/image";
import css from "./AudioControls.module.scss";

interface AudioProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function AudioControls({ isPlaying, onPlay, onPause }: AudioProps) {
  return (
    <div className={css.menu}>
      <span className={css.label}>
        Audio :{" "}
        <span className={css.state}>{isPlaying ? "Playing" : "Muted"}</span>
      </span>
      <div className={css.buttons}>
        <button className={css.btn} onClick={onPlay} aria-label="Play">
          <Image
            src="/images/playbtn.webp"
            alt="Play"
            fill
            sizes="44px"
            className={css.btnImage}
          />
        </button>
        <button className={css.btn} onClick={onPause} aria-label="Pause">
          <Image
            src="/images/play_pause.webp"
            alt="Pause"
            fill
            sizes="44px"
            className={css.btnImage}
          />
        </button>
      </div>
    </div>
  );
}
