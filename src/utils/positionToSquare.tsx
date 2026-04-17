import { BOARD_ORIGIN, SQUARE_SIZE } from "./boardConstants";

export const positionToSquare = (
  position: [number, number, number],
): string => {
  const file = Math.floor((position[0] - BOARD_ORIGIN) / SQUARE_SIZE);
  const rank = Math.floor((position[1] - BOARD_ORIGIN) / SQUARE_SIZE);

  const clampedFile = Math.max(0, Math.min(7, file));
  const clampedRank = Math.max(0, Math.min(7, rank));
  return (
    String.fromCharCode("a".charCodeAt(0) + clampedFile) + (clampedRank + 1)
  );
};
