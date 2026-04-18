import type { Opponent } from "@/types";

export const OPPONENT_DEPTH: Record<Opponent, number> = {
  quintus: 6,
  livia: 8,
  corvus: 10,
};

export const OPPONENT_ELO: Record<Opponent, string> = {
  quintus: "~1500",
  livia: "~1800",
  corvus: "~2000",
};

export const OPPONENT_QUOTE: Record<Opponent, string> = {
  quintus: "Ah, finally a worthy challenger for a fine game… let us sit then, friend.",
  livia: "Another plebeian nobody aiming at greatness… very well, amuse me.",
  corvus: "A win without opposition is flavorless… fight me with all you can.",
};

export const OPPONENTS: {
  id: Opponent;
  name: string;
  bio: string;
  difficulty: string;
}[] = [
  {
    id: "quintus",
    name: "Quintus",
    bio: "Wise, patient and gracious senator. Skills in chess honed after years of experience, he enjoys the art of the game above all else.",
    difficulty: "Medium",
  },
  {
    id: "livia",
    name: "Livia",
    bio: "Eloquent and deceiving, Livia mastered the art of roman politics. Her tactics are insidious and her playstyle reflects her abrasive personality. Her arrogance is only matched by her winning steaks",
    difficulty: "Advanced",
  },
  {
    id: "corvus",
    name: "Corvus",
    bio: "Master tactician and cunning general, he outmanoeuvres before you've finished your first move. Defeating him will bring you glory for eternity.",
    difficulty: "Expert",
  },
];
