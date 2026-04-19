"use client";

import Image from "next/image";
import { AudioControls } from "../AudioControls/AudioControls";
import css from "./ColorPicker.module.scss";

type Props = {
  onSelect: (color: "w" | "b") => void;
  isAudioPlaying: boolean;
  onAudioPlay: () => void;
  onAudioPause: () => void;
};

export function ColorPicker({ onSelect, isAudioPlaying, onAudioPlay, onAudioPause }: Props) {
  return (
    <div className={css.container}>
      <Image
        src="/images/chesslords.webp"
        alt="Chesslords"
        width={200}
        height={133}
        style={{ width: "200px", height: "auto", minHeight: "1px" }}
        className={css.logo}
      />
      <div className={css.splashMenu}>
        <div className={css.titleImage} role="img" aria-label="Pick a side" />
        <div className={css.buttons}>
          <button className={`${css.btn} ${css.white}`} onClick={() => onSelect("w")}>
            <Image src="/images/white.webp" alt="White" fill sizes="300px" loading="eager" className={css.btnImage} />
          </button>
          <button className={`${css.btn} ${css.black}`} onClick={() => onSelect("b")}>
            <Image src="/images/black.webp" alt="Black" fill sizes="300px" className={css.btnImage} />
          </button>
        </div>
      </div>
      <div className={css.audioWrap}>
        <AudioControls isPlaying={isAudioPlaying} onPlay={onAudioPlay} onPause={onAudioPause} />
      </div>
    </div>
  );
}
