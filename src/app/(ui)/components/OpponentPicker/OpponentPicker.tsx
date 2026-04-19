"use client";

import type { Opponent } from "@/types";
import Image from "next/image";
import { Cinzel } from "next/font/google";
import { useState } from "react";
import { OPPONENT_AUDIO, OPPONENTS } from "./constants";
import { AudioControls } from "../AudioControls/AudioControls";
import css from "./OpponentPicker.module.scss";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });

interface OpponentPickerProps {
  onSelect: (opponent: Opponent) => void;
  onPending?: () => void;
  isAudioPlaying: boolean;
  onAudioPlay: () => void;
  onAudioPause: () => void;
}

export function OpponentPicker({ onSelect, onPending, isAudioPlaying, onAudioPlay, onAudioPause }: OpponentPickerProps) {
  const [pending, setPending] = useState<Opponent | null>(null);

  const handleClick = (id: Opponent) => {
    if (pending) return;
    setPending(id);
    onPending?.();
    const audio = new Audio(OPPONENT_AUDIO[id]);
    audio.play().catch(() => {});
    audio.onended = () => setTimeout(() => onSelect(id), 1000);
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
        <div className={css.title} role="img" aria-label="Choose your opponent" />
        <div className={css.cards}>
          {OPPONENTS.map((o, i) => (
            <button
              key={o.id}
              className={getCardClass(o.id, i)}
              onClick={() => handleClick(o.id)}
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
      <div className={css.audioWrap}>
        <AudioControls isPlaying={isAudioPlaying} onPlay={onAudioPlay} onPause={onAudioPause} />
      </div>
    </div>
  );
}
