import { BOARD_ORIGIN, SQUARE_SIZE } from "./boardConstants";

export function calculatePiecePos(
  square: string,
  elevation: number = 0,
): [number, number, number] {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1]) - 1;

  const centerOffset = SQUARE_SIZE / 2;

  const x = BOARD_ORIGIN + file * SQUARE_SIZE + centerOffset;
  const y = BOARD_ORIGIN + rank * SQUARE_SIZE + centerOffset;

  return [x, y, elevation];
}
