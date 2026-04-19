"use client";

import { SOUND_EFFECTS } from "@/constants";
import type { Opponent } from "@/types";
import { useEffect, useRef, useState } from "react";

export function useAudio() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const movePieceSoundRef = useRef<HTMLAudioElement>(null);
  const voiceLineRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/lobby_roman.mp3");
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;

    const start = () => {
      if (sessionStorage.getItem("_audio_pref") !== "mused") {
        audio
          .play()
          .catch((err) => console.error("Lobby sound error: ", String(err)));
        setIsAudioPlaying(true);
        sessionStorage.setItem("_audio_pref", "playing");
      }
      document.removeEventListener("pointerdown", start);
    };
    document.addEventListener("pointerdown", start);

    return () => {
      document.removeEventListener("pointerdown", start);
      audio.pause();
      [voiceLineRef, movePieceSoundRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
          ref.current.src = "";
          ref.current = null;
        }
      });
    };
  }, []);

  const playVoiceLine = (
    effect: keyof typeof SOUND_EFFECTS,
    opponent: Opponent | null,
  ) => {
    const pool = opponent ? SOUND_EFFECTS[effect]?.[opponent] : null;

    if (!pool || pool.length === 0) return;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedAudio = pool[randomIndex];

    if (!voiceLineRef.current) {
      voiceLineRef.current = new Audio();
      voiceLineRef.current.volume = 1;
      voiceLineRef.current.loop = false;
    }

    const audio = voiceLineRef.current;

    audio.pause();
    audio.currentTime = 0;

    audio.src = selectedAudio;
    audio.load();

    audio.play().catch((err) => {
      console.error("Voice line error:", String(err));
    });
  };

  const producePieceSound = () => {
    if (!movePieceSoundRef.current) {
      const moveAudio = new Audio("/audio/piece_moving.wav");
      moveAudio.loop = false;
      moveAudio.volume = 1;

      movePieceSoundRef.current = moveAudio;
    }

    const moveAudio = movePieceSoundRef.current;

    moveAudio.currentTime = 0;
    const isPlayingEnabled =
      sessionStorage.getItem("_audio_pref") === "playing";

    if (isPlayingEnabled)
      moveAudio
        .play()
        .catch((err) =>
          console.error("Piece moving sound error:", String(err)),
        );
  };

  const handlePlay = () => {
    audioRef.current?.play().catch(() => {});
    setIsAudioPlaying(true);
    sessionStorage.setItem("_audio_pref", "playing");
  };

  const handleMute = () => {
    audioRef.current?.pause();
    setIsAudioPlaying(false);
    sessionStorage.setItem("_audio_pref", "muted");
  };

  const fadeOutLobbyMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const fade = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05);
      } else {
        audio.pause();
        setIsAudioPlaying(false);
        clearInterval(fade);
      }
    }, 80);
  };

  const switchToGameAudio = () => {
    const gameAudio = new Audio("/audio/game_lounge_roman.mp3");
    gameAudio.loop = true;
    gameAudio.volume = 0.2;
    audioRef.current = gameAudio;
    if (sessionStorage.getItem("_audio_pref") !== "muted") {
      gameAudio.play().catch(() => {});
      queueMicrotask(() => setIsAudioPlaying(true));
    }
    return () => {
      gameAudio.pause();
      gameAudio.src = "";
    };
  };

  const resetToLobby = () => {
    audioRef.current?.pause();
    const lobbyAudio = new Audio("/audio/lobby_roman.mp3");
    lobbyAudio.loop = true;
    lobbyAudio.volume = 0.6;
    audioRef.current = lobbyAudio;
    setIsAudioPlaying(false);
  };

  return {
    isAudioPlaying,
    audioRef,
    producePieceSound,
    playVoiceLine,
    handlePlay,
    handleMute,
    fadeOutLobbyMusic,
    switchToGameAudio,
    resetToLobby,
  };
}
