export interface CapturedPiece {
  nodeName: string;
  slot: number;
}

export interface CapturedState {
  black: CapturedPiece[];
  white: CapturedPiece[];
}
