"use client";
import GlobalLight from "@/app/(ui)/lights/GlobalLight/GlobalLight";
import { PIECE_DEFINITIONS } from "@/app/(ui)/meshes/Cube/Pieces/constants";
import { positionToSquare } from "@/utils/positionToSquare";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Chess, Move, Square } from "chess.js";
import { Suspense, useEffect, useRef, useState } from "react";
import { BoardHighlights } from "../../meshes/BoardHighlights/BoardHighlights";
import Pieces from "../../meshes/Cube/Pieces";
import Board from "../Board/Board";
import { DragHandler } from "../DragHandler/DragHandler";
import { LoadingFallback } from "../LoadingFallback/LoadingFallback";

export default function Scene() {
  const [squareToNode, setSquareToNode] = useState<Record<string, string>>(() =>
    Object.fromEntries(PIECE_DEFINITIONS.map((p) => [p.square, p.nodeName])),
  );
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPosition, setDragPosition] = useState<
    [number, number, number] | null
  >(null);

  const chess = useRef(new Chess());
  const dragPositionRef = useRef<[number, number, number] | null>(null);
  const legalMovesRef = useRef<Move[]>([]);
  const dragFromSquareRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("chess init", chess.current?.ascii());
  }, []);

  useEffect(() => {
    if (!selectedNodeName) return;
    const currentSquare = Object.entries(squareToNode).find(
      ([, nodeName]) => nodeName === selectedNodeName,
    )?.[0];
    const legalMoves = chess.current.moves({
      square: currentSquare as Square,
      verbose: true,
    });
    setLegalMoves(legalMoves);
    legalMovesRef.current = legalMoves;
  }, [selectedNodeName, squareToNode]);

  console.log(legalMoves);

  const onPieceSelect = (nodeName: string) => {
    const fromSquare = Object.entries(squareToNode).find(
      ([, node]) => node === nodeName,
    )?.[0];
    setSelectedNodeName(nodeName);
    dragFromSquareRef.current = fromSquare ?? null;
    setIsDragging(true);
  };
  const onDeselect = () => {
    setSelectedNodeName(null);
    setLegalMoves([]);
    dragFromSquareRef.current = null;
    setIsDragging(false);
  };

  const onDragMove = (position: [number, number, number]) => {
    const local: [number, number, number] = [position[0], -position[2], 0];
    dragPositionRef.current = local;
    setDragPosition(local);
  };
  const onDragEnd = () => {
    const pos = dragPositionRef.current;
    console.log("onDragEnd fired", {
      pos,
      from: dragFromSquareRef.current,
      legalMoves: legalMovesRef.current.map((m) => m.to),
    });
    if (pos) {
      const toSquare = positionToSquare(pos);
      const isLegal = legalMovesRef.current.some((m) => m.to === toSquare);
      const fromSquare = dragFromSquareRef.current;
      console.log(
        "toSquare",
        toSquare,
        "isLegal",
        isLegal,
        "fromSquare",
        fromSquare,
      );
      if (isLegal && fromSquare) {
        chess.current.move({
          from: fromSquare as Square,
          to: toSquare as Square,
        });

        setSquareToNode((prev) => {
          const nodeName = prev[fromSquare];
          const next = { ...prev };
          delete next[fromSquare];
          next[toSquare] = nodeName;
          return next;
        });
      }
    }
    dragPositionRef.current = null;
    legalMovesRef.current = [];

    dragFromSquareRef.current = null;
    setIsDragging(false);
    setDragPosition(null);
    setSelectedNodeName(null);
    setLegalMoves([]);
  };
  return (
    <Canvas
      style={{ height: "100dvh", width: "100dvw" }}
      onPointerUp={() => onDragEnd()}
    >
      <GlobalLight />
      <Suspense fallback={<LoadingFallback />}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Board />
          <Pieces
            dragPosition={dragPosition}
            selectedNodeName={selectedNodeName}
            pieceSquares={squareToNode}
            onPieceSelect={onPieceSelect}
            onPieceCancelSelection={onDeselect}
            selectedPiece={selectedNodeName}
          />
          <BoardHighlights legalMoves={legalMoves} />
          <DragHandler onDragMove={onDragMove} isDragging={isDragging} />
        </group>
      </Suspense>
      <OrbitControls enabled={!isDragging} />
    </Canvas>
  );
}
