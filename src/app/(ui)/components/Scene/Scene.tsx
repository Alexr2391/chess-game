"use client";
import GlobalLight from "@/app/(ui)/lights/GlobalLight/GlobalLight";
import { PIECE_DEFINITIONS } from "@/app/(ui)/meshes/Pieces/constants";
import type {
  CapturedPiece,
  CapturedState,
  ColorChecked,
  GameStatus,
} from "@/types";
import { positionToSquare } from "@/utils/positionToSquare";
import {
  createStockfishWorker,
  getBestMove,
  getEval,
} from "@/utils/stockfishWorker";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Chess, Move, Square } from "chess.js";
import { Suspense, useEffect, useRef, useState } from "react";
import { BoardHighlights } from "../../meshes/BoardHighlights/BoardHighlights";
import Pieces from "../../meshes/Pieces";
import ChessTable from "../../meshes/Table/Table";
import Board from "../Board/Board";
import { CameraIntro } from "../CameraIntro/CameraIntro";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { DragHandler } from "../DragHandler/DragHandler";
import { EvalScore } from "../EvalScore/EvalScore";
import { GameModal } from "../GameModal/GameModal";
import { LoadingFallback } from "../LoadingFallback/LoadingFallback";
import { ThinkingOverlay } from "../ThinkingOverlay/ThinkingOverlay";

export default function Scene() {
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [evalScore, setEvalScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [checkedColor, setCheckedColor] = useState<ColorChecked>(null);

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

  const updateGameStatus = () => {
    const activeColor = chess.current.turn();
    const isChecked = chess.current.isCheck();
    if (chess.current.isCheckmate()) {
      setGameStatus("checkmate");
      setCheckedColor(activeColor === "b" ? "black" : "white");
    } else if (chess.current.isDraw() || chess.current.isStalemate()) {
      setGameStatus("draw");
    } else if (isChecked) {
      setGameStatus("check");
      setCheckedColor(activeColor === "b" ? "black" : "white");
    } else {
      setGameStatus("playing");
      setCheckedColor(null);
    }
  };

  const chess = useRef(new Chess());
  const dragPositionRef = useRef<[number, number, number] | null>(null);
  const legalMovesRef = useRef<Move[]>([]);
  const dragFromSquareRef = useRef<string | null>(null);
  const stockfishRef = useRef<Worker | null>(null);
  const evalWorkerRef = useRef<Worker | null>(null);

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

  const applyMove = (from: Square, to: Square) => {
    const movement = chess.current.move({ from, to });
    let enPassantCapture: string | null = null;

    if (movement.isEnPassant()) {
      enPassantCapture = `${movement.to[0]}${movement.from[1]}`;
    }

    setSquareToNode((prev) => {
      if (enPassantCapture && prev[enPassantCapture]) {
        addToCapturedList(prev[enPassantCapture]);
      }
      if (movement.isCapture() && !movement.isEnPassant() && prev[to]) {
        addToCapturedList(prev[to]);
      }

      const next = { ...prev };
      const nodeName = prev[from];
      delete next[from];
      if (enPassantCapture) delete next[enPassantCapture];
      if (movement.isCapture() && !movement.isEnPassant()) delete next[to];
      if (movement.isKingsideCastle()) {
        //Hardcoded tile standard positions for Kingside/ Queenside rook
        if (movement.color === "w") {
          const r = prev["h1"];
          delete next["h1"];
          next["f1"] = r;
        } else {
          const r = prev["h8"];
          delete next["h8"];
          next["f8"] = r;
        }
      }
      if (movement.isQueensideCastle()) {
        if (movement.color === "w") {
          const r = prev["a1"];
          delete next["a1"];
          next["d1"] = r;
        } else {
          const r = prev["a8"];
          delete next["a8"];
          next["d8"] = r;
        }
      }
      next[to] = nodeName;
      return next;
    });
  };

  const triggerStockFish = () => {
    setIsThinking(true);
    const fen = chess.current.fen();
    console.log("current fen", chess.current.fen());
    getBestMove(stockfishRef.current!, fen, 12, (score) =>
      setEvalScore(playerColor === "w" ? -score : score),
    ).then((move) => {
      const from = move.slice(0, 2) as Square;
      const to = move.slice(2, 4) as Square;
      applyMove(from, to);
      updateGameStatus();
      setIsThinking(false);
    });
  };

  const onPlayAgain = () => {
    setGameStatus("playing");
    setCapturedPieces({ black: [], white: [] });
    setSquareToNode(
      Object.fromEntries(PIECE_DEFINITIONS.map((p) => [p.square, p.nodeName])),
    );
    setSelectedNodeName(null);
    setCheckedColor(null);
    setPlayerColor(null);
    setIntroComplete(false);
    setEvalScore(0);
    chess.current = new Chess();
    dragPositionRef.current = null;
    legalMovesRef.current = [];

    dragFromSquareRef.current = null;
  };

  useEffect(() => {
    stockfishRef.current = createStockfishWorker();
    evalWorkerRef.current = createStockfishWorker();
    return () => {
      stockfishRef.current?.terminate();
      evalWorkerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!introComplete || !playerColor) return;
    if (chess.current.turn() !== playerColor) {
      triggerStockFish();
    }
  }, [introComplete]);

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
    if (
      gameStatus === "checkmate" ||
      gameStatus === "draw" ||
      gameStatus === "stalemate"
    )
      return;
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
    if (pos) {
      const toSquare = positionToSquare(pos);
      const isLegal = legalMovesRef.current.some((m) => m.to === toSquare);
      const fromSquare = dragFromSquareRef.current;
      if (isLegal && fromSquare) {
        applyMove(fromSquare as Square, toSquare as Square);
        updateGameStatus();
        getEval(evalWorkerRef.current!, chess.current.fen(), 8).then(
          (score) => {
            setEvalScore(playerColor === "w" ? -score : score);
          },
        );
        triggerStockFish();
      }
    }
    updateGameStatus();
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
    <>
      {isThinking && <ThinkingOverlay />}
      <EvalScore score={evalScore} />
      <GameModal
        checkedColor={checkedColor}
        gameStatus={gameStatus}
        onClose={() => null}
        onPlayAgain={onPlayAgain}
      />
      <Canvas
        style={{ height: "100dvh", width: "100dvw" }}
        onPointerUp={() => onDragEnd()}
      >
        <GlobalLight />
        <Environment preset="studio" environmentIntensity={0.4} />
        <CameraIntro
          playerColor={playerColor!}
          onComplete={() => setIntroComplete(true)}
        />
        <Suspense fallback={<LoadingFallback />}>
          <group
            rotation={[-Math.PI / 2, 0, playerColor === "b" ? Math.PI : 0]}
          >
            <ChessTable />
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
        <OrbitControls enabled={introComplete && !isDragging} />
      </Canvas>
    </>
  );
}
