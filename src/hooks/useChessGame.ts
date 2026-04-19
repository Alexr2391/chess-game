"use client";

import {
  OPPONENT_DEPTH,
  OPPONENT_SKILL,
} from "@/app/(ui)/components/OpponentPicker/constants";
import {
  PIECE_DEFINITIONS,
  PROMO_DEFINITIONS,
  type SOUND_EFFECTS,
} from "@/constants";
import {
  COLOR,
  GAMESTATUS,
  type CapturedPiece,
  type CapturedState,
  type ColorChecked,
  type GameStatus,
  type Opponent,
  type PendingPromotion,
  type PromotionPiece,
} from "@/types";
import { worldToBoard } from "@/utils/boardConstants";
import { buildSquareToNode } from "@/utils/buildSquareToNode";
import { positionToSquare } from "@/utils/positionToSquare";
import {
  createStockfishWorker,
  getBestMove,
  getEval,
} from "@/utils/stockfishWorker";
import { Chess, Move, Square } from "chess.js";
import { useEffect, useRef, useState } from "react";

const { BLACK, WHITE } = COLOR;
const { CHECK, CHECKMATE, DRAW, PLAYING, STALEMATE } = GAMESTATUS;

export function useChessGame({
  playerColor,
  opponent,
  onPieceMove,
  onPlayVoiceLine,
}: {
  playerColor: "w" | "b" | null;
  opponent: Opponent | null;
  onPieceMove: () => void;
  onPlayVoiceLine: (
    type: keyof typeof SOUND_EFFECTS,
    character: Opponent | null,
  ) => void;
}) {
  const chess = useRef(new Chess());
  const squareToNodeRef = useRef<Record<string, string>>(buildSquareToNode());
  const dragPositionRef = useRef<[number, number, number] | null>(null);
  const legalMovesRef = useRef<Move[]>([]);
  const dragFromSquareRef = useRef<string | null>(null);
  const stockfishRef = useRef<Worker | null>(null);
  const evalWorkerRef = useRef<Worker | null>(null);

  const [squareToNode, setSquareToNode] =
    useState<Record<string, string>>(buildSquareToNode);
  const [capturedPieces, setCapturedPieces] = useState<CapturedState>({
    black: [],
    white: [],
  });
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameStatus, setGameStatus] = useState<GameStatus>(PLAYING);
  const [checkedColor, setCheckedColor] = useState<ColorChecked>(null);
  const [checkedSquares, setCheckedSquares] = useState<string[]>([]);
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<
    [number, number, number] | null
  >(null);
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [evalScore, setEvalScore] = useState(0);

  useEffect(() => {
    stockfishRef.current = createStockfishWorker();
    evalWorkerRef.current = createStockfishWorker();
    return () => {
      stockfishRef.current?.terminate();
      evalWorkerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!selectedNodeName) return;
    const currentSquare = Object.entries(squareToNode).find(
      ([, nodeName]) => nodeName === selectedNodeName,
    )?.[0];
    const moves = chess.current.moves({
      square: currentSquare as Square,
      verbose: true,
    });
    setLegalMoves(moves);
    legalMovesRef.current = moves;
  }, [selectedNodeName, squareToNode]);

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
      const attackerColor = color === WHITE ? "b" : "w";
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
    const squares = currentSquareToNode ?? squareToNode;
    if (chess.current.isCheckmate()) {
      const color = activeColor === "b" ? BLACK : (WHITE as ColorChecked);
      if (playerColor === activeColor) {
        onPlayVoiceLine("winning", opponent);
      }
      setGameStatus(CHECKMATE);
      setCheckedColor(color);
      setCheckedSquares(computeCheckedSquares(color, squares));
    } else if (chess.current.isDraw() || chess.current.isStalemate()) {
      setGameStatus(DRAW);
      setCheckedColor(null);
      setCheckedSquares([]);
    } else if (chess.current.isCheck()) {
      const color = activeColor === "b" ? BLACK : (WHITE as ColorChecked);
      setGameStatus(CHECK);
      setCheckedColor(color);
      setCheckedSquares(computeCheckedSquares(color, squares));
    } else {
      setGameStatus(PLAYING);
      setCheckedColor(null);
      setCheckedSquares([]);
    }
  };

  const addToCapturedList = (nodeName: string) => {
    const capturedPiece = PIECE_DEFINITIONS.find(
      (p) => p.nodeName === nodeName,
    );
    if (!capturedPiece) return;
    setCapturedPieces((prev) => {
      let newEntry: CapturedPiece;
      let next: CapturedState = { ...prev };
      if (capturedPiece.color === BLACK) {
        newEntry = {
          nodeName: capturedPiece.nodeName,
          slot: prev.black.length,
        };
        next = { ...prev, black: [...prev.black, newEntry] };
      }
      if (capturedPiece.color === WHITE) {
        newEntry = {
          nodeName: capturedPiece.nodeName,
          slot: prev.white.length,
        };
        next = { ...prev, white: [...prev.white, newEntry] };
      }
      return next;
    });
  };

  const applyMove = (
    from: Square,
    to: Square,
    promotion?: string,
  ): Record<string, string> => {
    const movement = chess.current.move({ from, to, promotion });
    const next = { ...squareToNodeRef.current };
    const nodeName = next[from];

    if (movement.isEnPassant()) {
      const enPassantCapture = `${movement.to[0]}${movement.from[1]}`;
      if (next[enPassantCapture]) {
        addToCapturedList(next[enPassantCapture]);
        delete next[enPassantCapture];
      }
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
    setCurrentTurn(chess.current.turn());
    return next;
  };

  const triggerStockFish = () => {
    setIsThinking(true);
    const fen = chess.current.fen();
    getBestMove(
      stockfishRef.current!,
      fen,
      opponent ? OPPONENT_DEPTH[opponent] : 8,
      (score) => setEvalScore(playerColor === "w" ? -score : score),
      opponent ? OPPONENT_SKILL[opponent] : 10,
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

  const onPieceSelect = (nodeName: string) => {
    if (
      gameStatus === CHECKMATE ||
      gameStatus === DRAW ||
      gameStatus === STALEMATE
    )
      return;
    const pieceColor = PIECE_DEFINITIONS.find(
      (p) => p.nodeName === nodeName,
    )?.color;
    const turnColor = pieceColor === WHITE ? "w" : "b";
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
        onPieceMove();
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

  const reset = () => {
    const fresh = buildSquareToNode();
    squareToNodeRef.current = fresh;
    setSquareToNode(fresh);
    setCapturedPieces({ black: [], white: [] });
    setCurrentTurn("w");
    setGameStatus(PLAYING);
    setCheckedColor(null);
    setCheckedSquares([]);
    setSelectedNodeName(null);
    setLegalMoves([]);
    setIsDragging(false);
    setDragPosition(null);
    setPendingPromotion(null);
    setIsThinking(false);
    setEvalScore(0);
    chess.current = new Chess();
    dragPositionRef.current = null;
    legalMovesRef.current = [];
    dragFromSquareRef.current = null;
  };

  return {
    chess,
    squareToNode,
    capturedPieces,
    currentTurn,
    gameStatus,
    checkedColor,
    checkedSquares,
    selectedNodeName,
    legalMoves,
    isDragging,
    dragPosition,
    pendingPromotion,
    isThinking,
    evalScore,
    triggerStockFish,
    onPieceSelect,
    onDeselect,
    onDragMove,
    onDragEnd,
    onPromotionSelect,
    reset,
  };
}
