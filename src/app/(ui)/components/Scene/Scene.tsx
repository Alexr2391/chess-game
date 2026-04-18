"use client";
import GlobalLight from "@/app/(ui)/lights/GlobalLight/GlobalLight";
import {
  PIECE_DEFINITIONS,
  PROMO_DEFINITIONS,
} from "@/app/(ui)/meshes/Pieces/constants";
import type {
  CapturedPiece,
  CapturedState,
  ColorChecked,
  GameStatus,
  Opponent,
  PendingPromotion,
  PromotionPiece,
} from "@/types";
import { BOARD_ROTATION_Z, worldToBoard } from "@/utils/boardConstants";
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
import { Room } from "../../meshes/Room/Room";
import ChessTable from "../../meshes/Table/Table";
import Board from "../Board/Board";
import { CameraIntro } from "../CameraIntro/CameraIntro";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { DragHandler } from "../DragHandler/DragHandler";
import { EvalScore } from "../EvalScore/EvalScore";
import { GameModal } from "../GameModal/GameModal";
import { LoadingFallback } from "../LoadingFallback/LoadingFallback";
import { OpponentPicker } from "../OpponentPicker/OpponentPicker";
import { OpponentHUD } from "../OpponentHUD/OpponentHUD";
import { OPPONENT_DEPTH } from "../OpponentPicker/constants";
import { PromotionModal } from "../PromotionModal/PromotionModal";
import { ThinkingOverlay } from "../ThinkingOverlay/ThinkingOverlay";

export default function Scene() {
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [evalScore, setEvalScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [checkedColor, setCheckedColor] = useState<ColorChecked>(null);
  const [checkedSquares, setCheckedSquares] = useState<string[]>([]);

  const buildSquareToNode = () =>
    Object.fromEntries(
      PIECE_DEFINITIONS.filter((p) => p.square).map((p) => [
        p.square!,
        p.nodeName,
      ]),
    );
  const squareToNodeRef = useRef<Record<string, string>>(buildSquareToNode());
  const [squareToNode, setSquareToNode] =
    useState<Record<string, string>>(buildSquareToNode);
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
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);

  const computeCheckedSquares = (
    color: ColorChecked,
    currentSquareToNode: Record<string, string>,
  ): string[] => {
    if (!color) return [];
    const kingDef = PIECE_DEFINITIONS.find(
      (p) => p.type === "king" && p.color === color,
    );
    const kingSquare = Object.entries(currentSquareToNode).find(
      ([, nodeName]) => nodeName === kingDef?.nodeName,
    )?.[0];
    if (!kingSquare) return [];
    try {
      const attackerColor = color === "white" ? "b" : "w";
      const parts = chess.current.fen().split(" ");
      parts[1] = attackerColor;
      const tempChess = new Chess(parts.join(" "));
      const attackerSquares = [
        ...new Set(
          tempChess
            .moves({ verbose: true })
            .filter((m) => m.to === kingSquare)
            .map((m) => m.from),
        ),
      ];
      return [kingSquare, ...attackerSquares];
    } catch {
      return [kingSquare];
    }
  };

  const updateGameStatus = (currentSquareToNode?: Record<string, string>) => {
    const activeColor = chess.current.turn();
    const isChecked = chess.current.isCheck();
    const squares = currentSquareToNode ?? squareToNode;
    if (chess.current.isCheckmate()) {
      const color = activeColor === "b" ? "black" : ("white" as ColorChecked);
      setGameStatus("checkmate");
      setCheckedColor(color);
      setCheckedSquares(computeCheckedSquares(color, squares));
    } else if (chess.current.isDraw() || chess.current.isStalemate()) {
      setGameStatus("draw");
      setCheckedColor(null);
      setCheckedSquares([]);
    } else if (isChecked) {
      const color = activeColor === "b" ? "black" : ("white" as ColorChecked);
      setGameStatus("check");
      setCheckedColor(color);
      setCheckedSquares(computeCheckedSquares(color, squares));
    } else {
      setGameStatus("playing");
      setCheckedColor(null);
      setCheckedSquares([]);
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

  const applyMove = (
    from: Square,
    to: Square,
    promotion?: string,
  ): Record<string, string> => {
    const movement = chess.current.move({ from, to, promotion });
    let enPassantCapture: string | null = null;

    if (movement.isEnPassant()) {
      enPassantCapture = `${movement.to[0]}${movement.from[1]}`;
    }

    const next = { ...squareToNodeRef.current };
    const nodeName = next[from];

    if (enPassantCapture && next[enPassantCapture]) {
      addToCapturedList(next[enPassantCapture]);
      delete next[enPassantCapture];
    }
    if (movement.isCapture() && !movement.isEnPassant() && next[to]) {
      addToCapturedList(next[to]);
      delete next[to];
    }

    delete next[from];

    if (movement.isKingsideCastle()) {
      if (movement.color === "w") {
        next["f1"] = next["h1"];
        delete next["h1"];
      } else {
        next["f8"] = next["h8"];
        delete next["h8"];
      }
    }
    if (movement.isQueensideCastle()) {
      if (movement.color === "w") {
        next["d1"] = next["a1"];
        delete next["a1"];
      } else {
        next["d8"] = next["a8"];
        delete next["a8"];
      }
    }

    if (promotion) {
      const pieceColor = PIECE_DEFINITIONS.find(
        (p) => p.nodeName === nodeName,
      )?.color;
      const typeMap: Record<string, string> = {
        q: "queen",
        r: "rook",
        b: "bishop",
        n: "knight",
      };
      const usedNames = new Set(Object.values(next));
      const slot = PROMO_DEFINITIONS.find(
        (p) =>
          p.type === typeMap[promotion] &&
          p.color === pieceColor &&
          !usedNames.has(p.nodeName),
      );
      next[to] = slot?.nodeName ?? nodeName;
    } else {
      next[to] = nodeName;
    }

    squareToNodeRef.current = next;
    setSquareToNode(next);
    return next;
  };

  const triggerStockFish = () => {
    setIsThinking(true);
    const fen = chess.current.fen();
    console.log("current fen", chess.current.fen());
    getBestMove(
      stockfishRef.current!,
      fen,
      opponent ? OPPONENT_DEPTH[opponent] : 8,
      (score) => setEvalScore(playerColor === "w" ? -score : score),
      0,
    ).then((move) => {
      if (move === "(none)") {
        setIsThinking(false);
        return;
      }
      const from = move.slice(0, 2) as Square;
      const to = move.slice(2, 4) as Square;
      const promotion = move.length > 4 ? move[4] : undefined;
      const next = applyMove(from, to, promotion);
      updateGameStatus(next);
      setIsThinking(false);
    });
  };

  const onPlayAgain = () => {
    setGameStatus("playing");
    setCapturedPieces({ black: [], white: [] });
    const fresh = buildSquareToNode();
    squareToNodeRef.current = fresh;
    setSquareToNode(fresh);
    setSelectedNodeName(null);
    setCheckedColor(null);
    setPlayerColor(null);
    setOpponent(null);
    setIntroComplete(false);
    setEvalScore(0);
    chess.current = new Chess();
    dragPositionRef.current = null;
    legalMovesRef.current = [];

    dragFromSquareRef.current = null;
    setPendingPromotion(null);
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
    const local = worldToBoard(position, flip);
    dragPositionRef.current = local;
    setDragPosition(local);
  };
  const onDragEnd = () => {
    const pos = dragPositionRef.current;
    if (pos) {
      const toSquare = positionToSquare(pos);
      const fromSquare = dragFromSquareRef.current;
      const isPromotion = legalMovesRef.current.some(
        (m) => m.to === toSquare && m.promotion,
      );
      const isLegal = legalMovesRef.current.some((m) => m.to === toSquare);

      if (isPromotion && fromSquare) {
        setPendingPromotion({ from: fromSquare, to: toSquare });
        dragPositionRef.current = null;
        legalMovesRef.current = [];
        dragFromSquareRef.current = null;
        setIsDragging(false);
        setDragPosition(null);
        setSelectedNodeName(null);
        setLegalMoves([]);
        return;
      }

      if (isLegal && fromSquare) {
        const next = applyMove(fromSquare as Square, toSquare as Square);
        updateGameStatus(next);
        getEval(evalWorkerRef.current!, chess.current.fen(), 8).then(
          (score) => {
            setEvalScore(playerColor === "w" ? -score : score);
          },
        );
        triggerStockFish();
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

  const onPromotionSelect = (piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    const next = applyMove(
      pendingPromotion.from as Square,
      pendingPromotion.to as Square,
      piece,
    );
    updateGameStatus(next);
    getEval(evalWorkerRef.current!, chess.current.fen(), 8).then((score) => {
      setEvalScore(playerColor === "w" ? -score : score);
    });
    triggerStockFish();
    setPendingPromotion(null);
  };
  if (!playerColor) return <ColorPicker onSelect={setPlayerColor} />;
  if (!opponent) return <OpponentPicker onSelect={setOpponent} />;

  return (
    <>
      {pendingPromotion && (
        <PromotionModal
          playerColor={playerColor!}
          onSelect={onPromotionSelect}
        />
      )}
      {introComplete && <OpponentHUD opponent={opponent} playerColor={playerColor} />}
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
          <Room />
          <group
            rotation={[
              -Math.PI / 2,
              0,
              (playerColor === "b" ? Math.PI : 0) + BOARD_ROTATION_Z,
            ]}
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
            <BoardHighlights
              legalMoves={legalMoves}
              checkedSquares={checkedSquares}
            />
            <DragHandler onDragMove={onDragMove} isDragging={isDragging} />
          </group>
        </Suspense>
        <OrbitControls
          enabled={introComplete && !isDragging}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </>
  );
}
