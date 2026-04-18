export interface CapturedPiece {
  nodeName: string;
  slot: number;
}

export interface CapturedState {
  black: CapturedPiece[];
  white: CapturedPiece[];
}

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw";
export type ColorChecked = "black" | "white" | null;
export type PromotionPiece = "q" | "r" | "b" | "n";
export type PendingPromotion = { from: string; to: string };
export type Opponent = "quintus" | "livia" | "corvus";
