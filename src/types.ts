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
