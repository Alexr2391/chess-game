export const BOARD_SIZE = 2
export const SQUARE_SIZE = BOARD_SIZE / 8
export const BOARD_ORIGIN = -(BOARD_SIZE / 2)
export const PIECE_FIT = 0.8

export const BOARD_ROTATION_Z = Math.PI / 2;

// Converts a world-space drag point into board-local XY coordinates.
// cos/sin of -BOARD_ROTATION_Z "undoes" the board's Z rotation so the
// drag position aligns with the board's own axes. flip mirrors for black.
export function worldToBoard(
  point: [number, number, number],
  flip: number,
): [number, number, number] {
  const cos = Math.cos(-BOARD_ROTATION_Z);
  const sin = Math.sin(-BOARD_ROTATION_Z);
  const x = point[0];
  const z = point[2];
  const localX = (cos * x - sin * -z) * flip;
  const localY = (sin * x + cos * -z) * flip;
  return [localX, localY, 0];
}
