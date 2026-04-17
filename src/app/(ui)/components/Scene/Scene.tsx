"use client";
import GlobalLight from "@/app/(ui)/lights/GlobalLight/GlobalLight";
import { PIECE_DEFINITIONS } from "@/app/(ui)/meshes/Pieces/constants";
import type { CapturedPiece, CapturedState } from "@/types";
import { positionToSquare } from "@/utils/positionToSquare";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Chess, Move, Square } from "chess.js";
import { Suspense, useEffect, useRef, useState } from "react";
import { BoardHighlights } from "../../meshes/BoardHighlights/BoardHighlights";
import Pieces from "../../meshes/Pieces";
import Board from "../Board/Board";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { DragHandler } from "../DragHandler/DragHandler";
import { LoadingFallback } from "../LoadingFallback/LoadingFallback";

export default function Scene() {
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);

  const [squareToNode, setSquareToNode] = useState<Record<string, string>>(() =>
    Object.fromEntries(PIECE_DEFINITIONS.map((p) => [p.square, p.nodeName])),
  );
  console.log(squareToNode);
  const [capturedPieces, setCapturedPieces] = useState<CapturedState>({
    black: [],
    white: [],
  });
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
    console.log("chess graph", chess.current?.ascii());
  }, [squareToNode]);

  useEffect(() => {
    console.log("captured Array", capturedPieces);
  }, [capturedPieces]);

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
    const pieceColor = PIECE_DEFINITIONS.find(
      (p) => p.nodeName === nodeName,
    )?.color;
    const turnColor = pieceColor === "white" ? "w" : "b";
    if (turnColor !== chess.current.turn() || turnColor !== playerColor) return;
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

  const addToCapturedList = (nodeName: string) => {
    const capturedPiece = PIECE_DEFINITIONS.find(
      (p) => p.nodeName === nodeName,
    );
    if (!capturedPiece) return;

    setCapturedPieces((prev) => {
      let newEntry: CapturedPiece;
      let newObject: CapturedState = { ...prev };

      if (capturedPiece?.color === "black") {
        newEntry = {
          nodeName: capturedPiece.nodeName,
          slot: prev.black.length,
        };
        newObject = { ...prev, black: [...prev.black, newEntry] };
      }

      if (capturedPiece?.color === "white") {
        newEntry = {
          nodeName: capturedPiece.nodeName,
          slot: prev.white.length,
        };
        newObject = { ...prev, white: [...prev.white, newEntry] };
      }

      return newObject;
    });
  };

  const onDragMove = (position: [number, number, number]) => {
    const flip = playerColor === "b" ? -1 : 1;
    const local: [number, number, number] = [
      position[0] * flip,
      -position[2] * flip,
      0,
    ];
    dragPositionRef.current = local;
    setDragPosition(local);
  };
  const onDragEnd = () => {
    const pos = dragPositionRef.current;
    let enPassantCapture: string | null;
    if (pos) {
      const toSquare = positionToSquare(pos);
      const isLegal = legalMovesRef.current.some((m) => m.to === toSquare);
      const fromSquare = dragFromSquareRef.current;
      if (isLegal && fromSquare) {
        const movement = chess.current.move({
          from: fromSquare as Square,
          to: toSquare as Square,
        });

        if (movement.isEnPassant()) {
          const prevNum = movement.from[1];
          const newTile = movement.to[0];

          enPassantCapture = `${newTile}${prevNum}`;
          if (enPassantCapture) {
            addToCapturedList(squareToNode[enPassantCapture]);
          }
        }
        if (movement.isCapture() && !movement.isEnPassant()) {
          addToCapturedList(squareToNode[toSquare]);
        }

        setSquareToNode((prev) => {
          const next = { ...prev };

          const nodeName = prev[fromSquare];

          delete next[fromSquare];
          if (enPassantCapture) {
            delete next[enPassantCapture];
          }
          if (movement.isCapture() && !movement.isEnPassant()) {
            delete next[toSquare];
          }
          if (movement.isKingsideCastle()) {
            if (movement.color === "w") {
              const newRookPos = prev["h1"];
              delete next["h1"];
              next["f1"] = newRookPos;
            } else {
              const newRookPos = prev["h8"];
              delete next["h8"];
              next["f8"] = newRookPos;
            }
          }
          if (movement.isQueensideCastle()) {
            if (movement.color === "w") {
              const newRookPos = prev["a1"];
              delete next["a1"];
              next["d1"] = newRookPos;
            } else {
              const newRookPos = prev["a8"];
              delete next["a8"];
              next["d8"] = newRookPos;
            }
          }
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
  if (!playerColor) return <ColorPicker onSelect={setPlayerColor} />;

  return (
    <Canvas
      style={{ height: "100dvh", width: "100dvw" }}
      onPointerUp={() => onDragEnd()}
    >
      <GlobalLight />
      <Suspense fallback={<LoadingFallback />}>
        <group rotation={[-Math.PI / 2, 0, playerColor === "b" ? Math.PI : 0]}>
          <Board />
          <Pieces
            dragPosition={dragPosition}
            selectedNodeName={selectedNodeName}
            pieceSquares={squareToNode}
            capturedPieces={capturedPieces}
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
