import { calculatePiecePos } from "@/utils/calculatePiecePos";
import { Move } from "chess.js";
import { PulsingHighlight } from "./PulsingHighlight";

interface BoardHighlightsProps {
  legalMoves: Move[];
  attackedSquares?: string[];
}

export const BoardHighlights = ({
  legalMoves,
  attackedSquares,
}: BoardHighlightsProps) => {
  return legalMoves.map((move) => {
    const isCapture = move.isCapture() || move.isEnPassant();
    const isRisky = attackedSquares?.includes(move.to) ?? false;
    const color = isCapture ? "yellow" : isRisky ? "red" : "green";
    const position = calculatePiecePos(move.to, 0.001);

    return (
      <PulsingHighlight
        key={move.to}
        position={position}
        color={color}
        isCapture={isCapture}
      />
    );
  });
};
