"use client";
import GlobalLight from "@/app/(ui)/lights/GlobalLight/GlobalLight";
import { useAudio } from "@/hooks/useAudio";
import { useChessGame } from "@/hooks/useChessGame";
import { useSceneReady } from "@/hooks/useSceneReady";
import type { Opponent } from "@/types";
import { BOARD_ROTATION_Z } from "@/utils/boardConstants";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import Board from "../../meshes/Board/Board";
import { BoardHighlights } from "../../meshes/BoardHighlights/BoardHighlights";
import Pieces from "../../meshes/Pieces";
import { Room } from "../../meshes/Room/Room";
import ChessTable from "../../meshes/Table/Table";
import { CameraIntro } from "../CameraIntro/CameraIntro";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { DragHandler } from "../DragHandler/DragHandler";
import { EvalScore } from "../EvalScore/EvalScore";
import { GameLoader } from "../GameLoader/GameLoader";
import { GameModal } from "../GameModal/GameModal";
import { OpponentHUD } from "../OpponentHUD/OpponentHUD";
import { OpponentPicker } from "../OpponentPicker/OpponentPicker";
import { PromotionModal } from "../PromotionModal/PromotionModal";
import { ThinkingOverlay } from "../ThinkingOverlay/ThinkingOverlay";
import css from "./Scene.module.scss";

function SceneReadySignal({ onReady }: { onReady: () => void }) {
  useSceneReady(onReady);
  return null;
}

export default function Scene() {
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [gameLoaderVisible, setGameLoaderVisible] = useState(false);
  const [meshesLoaded, setMeshesLoaded] = useState(false);

  const {
    isAudioPlaying,
    handlePlay,
    handleMute,
    fadeOutLobbyMusic,
    switchToGameAudio,
    resetToLobby,
    producePieceSound,
    playVoiceLine,
  } = useAudio();

  const {
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
  } = useChessGame({
    playerColor,
    opponent,
    onPieceMove: producePieceSound,
    onPlayVoiceLine: playVoiceLine,
  });

  useEffect(() => {
    if (!meshesLoaded) return;
    const id = requestAnimationFrame(() => setGameLoaderVisible(false));
    return () => cancelAnimationFrame(id);
  }, [meshesLoaded]);

  useEffect(() => {
    if (!introComplete || !playerColor) return;
    const cleanup = switchToGameAudio();
    if (chess.current.turn() !== playerColor) triggerStockFish();
    return cleanup;
  }, [introComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPlayAgain = () => {
    resetToLobby();
    reset();
    setGameLoaderVisible(false);
    setMeshesLoaded(false);
    setIntroComplete(false);
    setPlayerColor(null);
    setOpponent(null);
  };

  if (!playerColor)
    return (
      <ColorPicker
        onSelect={setPlayerColor}
        isAudioPlaying={isAudioPlaying}
        onAudioPlay={handlePlay}
        onAudioPause={handleMute}
      />
    );

  if (!opponent)
    return (
      <OpponentPicker
        onSelect={setOpponent}
        onPending={fadeOutLobbyMusic}
        onLoaderStart={() => setGameLoaderVisible(true)}
        isAudioPlaying={isAudioPlaying}
        onAudioPlay={handlePlay}
        onAudioPause={handleMute}
      />
    );

  return (
    <>
      {gameLoaderVisible && <GameLoader opponent={opponent} />}
      {pendingPromotion && (
        <PromotionModal
          playerColor={playerColor!}
          onSelect={onPromotionSelect}
        />
      )}
      {introComplete && (
        <OpponentHUD
          opponent={opponent}
          playerColor={playerColor}
          isAudioPlaying={isAudioPlaying}
          onAudioPlay={handlePlay}
          onAudioPause={handleMute}
        />
      )}
      {isThinking && <ThinkingOverlay />}
      <EvalScore score={evalScore} />
      <GameModal
        checkedColor={checkedColor}
        gameStatus={gameStatus}
        onClose={() => null}
        onPlayAgain={onPlayAgain}
      />
      <div
        className={css.sceneWrapper}
        style={{
          opacity: gameLoaderVisible ? 0 : 1,
        }}
      >
        <Canvas className={css.canvas} onPointerUp={() => onDragEnd()}>
          <GlobalLight />
          <Environment preset="studio" environmentIntensity={0.4} />
          <CameraIntro
            playerColor={playerColor!}
            ready={!gameLoaderVisible}
            onComplete={() => setIntroComplete(true)}
          />
          <Suspense fallback={null}>
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
                playerColor={playerColor}
                currentTurn={currentTurn}
              />
              <BoardHighlights
                legalMoves={legalMoves}
                checkedSquares={checkedSquares}
              />
              <DragHandler onDragMove={onDragMove} isDragging={isDragging} />
            </group>
            <SceneReadySignal onReady={() => setMeshesLoaded(true)} />
          </Suspense>
          <OrbitControls
            enabled={introComplete && !isDragging}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>
    </>
  );
}
