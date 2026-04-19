"use client";

import { useEffect, useRef, useState } from "react";

export function useAudio() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/lobby_roman.mp3");
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;

    const start = () => {
      if (sessionStorage.getItem("_audio_pref") !== "paused") {
        audio.play().catch((err) => console.error(String(err)));
        setIsAudioPlaying(true);
        sessionStorage.setItem("_audio_pref", "playing");
      }
      document.removeEventListener("pointerdown", start);
    };
    document.addEventListener("pointerdown", start);

    return () => {
      document.removeEventListener("pointerdown", start);
      audio.pause();
    };
  }, []);

  const handlePlay = () => {
    audioRef.current?.play().catch(() => {});
    setIsAudioPlaying(true);
    sessionStorage.setItem("_audio_pref", "playing");
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsAudioPlaying(false);
    sessionStorage.setItem("_audio_pref", "paused");
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
    gameAudio.volume = 0.6;
    audioRef.current = gameAudio;
    if (sessionStorage.getItem("_audio_pref") !== "paused") {
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
    handlePlay,
    handlePause,
    fadeOutLobbyMusic,
    switchToGameAudio,
    resetToLobby,
  };
}
