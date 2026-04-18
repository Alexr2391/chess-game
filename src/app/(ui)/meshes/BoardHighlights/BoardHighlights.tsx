import { calculatePiecePos } from "@/utils/calculatePiecePos";
import { Move } from "chess.js";
import { CheckHighlight } from "./CheckHighlight";
import { PulsingHighlight } from "./PulsingHighlight";

interface BoardHighlightsProps {
  legalMoves: Move[];
  attackedSquares?: string[];
  checkedSquares?: string[];
}

export const BoardHighlights = ({
  legalMoves,
  attackedSquares,
  checkedSquares,
}: BoardHighlightsProps) => {
  const uniqueMoves = legalMoves.filter(
    (move, i, arr) => arr.findIndex((m) => m.to === move.to) === i,
  );

  return (
    <>
      {checkedSquares?.map((square) => (
        <CheckHighlight
          key={`check-${square}`}
          position={calculatePiecePos(square, 0.001)}
        />
      ))}
      {uniqueMoves.map((move) => {
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
      })}
    </>
  );
};
