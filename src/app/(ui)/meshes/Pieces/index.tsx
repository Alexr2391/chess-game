"use client";

import type { CapturedState } from "@/types";
import { PIECE_FIT, SQUARE_SIZE } from "@/utils/boardConstants";
import { calculatePiecePos } from "@/utils/calculatePiecePos";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CapturedChessPiece } from "./CapturedChessPiece/CapturedChessPiece";
import ChessPiece from "./ChessPiece/ChessPiece";
import { PIECE_DEFINITIONS, PROMO_DEFINITIONS } from "./constants";

const ALL_PIECE_DEFS = [...PIECE_DEFINITIONS, ...PROMO_DEFINITIONS];

type PiecesProps = {
  dragPosition: [number, number, number] | null;
  selectedNodeName: string | null;
  pieceSquares: Record<string, string>;
  onPieceSelect: (nodeName: string) => void;
  selectedPiece: string | null;
  capturedPieces: CapturedState;
  onPieceCancelSelection: () => void;
};

export default function Pieces({
  pieceSquares,
  selectedPiece,
  dragPosition,
  selectedNodeName,
  capturedPieces,
  onPieceSelect,
  onPieceCancelSelection,
}: PiecesProps) {
  const { nodes } = useGLTF("/models/chess/chess-optimized-board.glb");

  const pawnMesh = nodes["Pawn001_White_Material003_0"] as THREE.Mesh;
  pawnMesh.geometry.computeBoundingBox();
  const pawnBox = pawnMesh.geometry.boundingBox!;
  const pawnWidth = pawnBox.max.x - pawnBox.min.x;
  const baseScale = (SQUARE_SIZE * PIECE_FIT) / pawnWidth;
  const { black, white } = capturedPieces;
  return (
    <group>
      {black.map(({ nodeName, slot }) => {
        const mesh = nodes[nodeName] as THREE.Mesh;
        const scale =
          baseScale *
          PIECE_DEFINITIONS.find((piece) => piece.nodeName === nodeName)!
            .scaleFactor;
        const elevation = scale;

        return (
          <CapturedChessPiece
            key={nodeName}
            geometry={mesh.geometry}
            material={mesh.material}
            position={[
              -1.5,
              slot * SQUARE_SIZE - (1 - SQUARE_SIZE / 2),
              elevation - 0.04,
            ]}
            scale={scale}
          />
        );
      })}
      {white.map(({ nodeName, slot }) => {
        const mesh = nodes[nodeName] as THREE.Mesh;
        const scale =
          baseScale *
          PIECE_DEFINITIONS.find((piece) => piece.nodeName === nodeName)!
            .scaleFactor;
        const elevation = scale;

        return (
          <CapturedChessPiece
            key={nodeName}
            geometry={mesh.geometry}
            material={mesh.material}
            position={[
              1.5,
              slot * SQUARE_SIZE - (1 - SQUARE_SIZE / 2),
              elevation - 0.04,
            ]}
            scale={scale}
          />
        );
      })}
      {ALL_PIECE_DEFS.map((piece) => {
        const glbNodeName = piece.glbNodeOverride ?? piece.nodeName;
        const mesh = nodes[glbNodeName] as THREE.Mesh;
        if (!mesh?.geometry) return null;

        const scale = baseScale * piece.scaleFactor;
        const elevation = scale;
        const currentSquare = Object.entries(pieceSquares).find(
          ([, nodeName]) => nodeName === piece.nodeName,
        )?.[0];
        if (!currentSquare) return null;

        const position =
          piece.nodeName === selectedNodeName && dragPosition
            ? ([dragPosition[0], dragPosition[1], elevation * 2] as [
                number,
                number,
                number,
              ])
            : calculatePiecePos(currentSquare, elevation);
        return (
          <ChessPiece
            key={piece.nodeName}
            type={piece.type}
            color={piece.color}
            geometry={mesh.geometry}
            material={mesh.material}
            position={position}
            scale={scale}
            onSelect={() => onPieceSelect(piece.nodeName)}
            isSelected={selectedPiece === piece.nodeName}
            onDeselect={onPieceCancelSelection}
          />
        );
      })}
    </group>
  );
}

useGLTF.preload("/models/chess/chess-optimized-board.glb");
