"use client";

import type { SOUND_EFFECTS } from "@/constants";
import type { Opponent } from "@/types";
import { Cinzel } from "next/font/google";
import Image from "next/image";
import { useState } from "react";
import { AudioControls } from "../AudioControls/AudioControls";
import css from "./OpponentPicker.module.scss";
import { OPPONENTS } from "./constants";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });

interface OpponentPickerProps {
  onSelect: (opponent: Opponent) => void;
  onPending?: () => void;
  onLoaderStart?: () => void;
  isAudioPlaying: boolean;
  onAudioPlay: () => void;
  onAudioPause: () => void;
  onPlayVoiceLine: (
    effect: keyof typeof SOUND_EFFECTS,
    opponent: Opponent | null,
    cb?: (audio: HTMLAudioElement) => void,
  ) => void;
}

export function OpponentPicker({
  onSelect,
  onPending,
  onLoaderStart,
  isAudioPlaying,
  onAudioPlay,
  onAudioPause,
  onPlayVoiceLine,
}: OpponentPickerProps) {
  const [pending, setPending] = useState<Opponent | null>(null);

  const handleClick = (id: Opponent) => {
    if (pending) return;
    setPending(id);
    onPending?.();

    onPlayVoiceLine("selection", id, (audio) => {
      audio.onended = () =>
        setTimeout(() => {
          onLoaderStart?.();
          onSelect(id);
        }, 1000);
    });
  };

  const getCardClass = (id: Opponent, index: number) => {
    if (!pending) return css.card;
    if (id === pending) return `${css.card} ${css.cardSelected}`;
    const selectedIndex = OPPONENTS.findIndex((o) => o.id === pending);
    return index < selectedIndex
      ? `${css.card} ${css.cardScatterLeft}`
      : `${css.card} ${css.cardScatterRight}`;
  };

  return (
    <div className={css.overlay}>
      <div className={css.container}>
        <div
          className={css.title}
          role="img"
          aria-label="Choose your opponent"
        />
        <div className={css.cards}>
          {OPPONENTS.map((opp, i) => (
            <button
              key={opp.id}
              className={getCardClass(opp.id, i)}
              onClick={() => handleClick(opp.id)}
            >
              <div className={css.imageWrap}>
                <Image
                  src={`/images/${opp.id}.webp`}
                  alt={opp.name}
                  fill
                  sizes="220px"
                  className={css.portrait}
                />
              </div>
              <span className={`${css.name} ${cinzel.className}`}>
                {opp.name}
              </span>
              <p className={css.bio}>{opp.bio}</p>
              <span className={css.difficulty}>
                Difficulty: {opp.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={css.audioWrap}>
        <AudioControls
          isPlaying={isAudioPlaying}
          onPlay={onAudioPlay}
          onPause={onAudioPause}
        />
      </div>
    </div>
  );
}
