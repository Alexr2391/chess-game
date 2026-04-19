import { PIECE_DEFINITIONS } from "@/constants";

export const buildSquareToNode = () =>
  Object.fromEntries(
    PIECE_DEFINITIONS.filter((p) => p.square).map((p) => [
      p.square!,
      p.nodeName,
    ]),
  );
