import type { Piece } from "../types";

export const CapturedChessPiece = ({
  geometry,
  material,
  position,
  scale,
}: Piece) => {
  return (
    <mesh {...{ geometry, material, position, scale }} rotation-z={Math.PI} />
  );
};
