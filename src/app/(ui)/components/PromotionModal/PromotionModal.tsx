"use client";

import type { PromotionPiece } from "@/types";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import css from "./PromotionModal.module.scss";

type Props = {
  playerColor: "w" | "b";
  onSelect: (piece: PromotionPiece) => void;
};

const GLB_NODE: Record<"w" | "b", Record<PromotionPiece, string>> = {
  w: {
    q: "queen001_White_Material003_0",
    r: "Rook002_White_Material003_0",
    b: "Bishop001_White_Material003_0",
    n: "Knight_White_Material003_0",
  },
  b: {
    q: "queen002_Black_Material001_0",
    r: "Rook001_Black_Material001_0",
    b: "Bishop003_Black_Material001_0",
    n: "Knight002_Black_Material001_0",
  },
};

const LABELS: Record<PromotionPiece, string> = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

function RotatingPiece({ nodeName }: { nodeName: string }) {
  const { nodes } = useGLTF("/models/chess/chess-optimized-board.glb");
  const mesh = nodes[nodeName] as THREE.Mesh;
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 1.2;
  });

  if (!mesh?.geometry) return null;

  return (
    <group ref={groupRef}>
      <mesh
        geometry={mesh.geometry}
        material={mesh.material}
        scale={0.15}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        position={[0, -0.08, 0]}
      />
    </group>
  );
}

const PIECES: PromotionPiece[] = ["q", "r", "b", "n"];

export function PromotionModal({ playerColor, onSelect }: Props) {
  return (
    <div className={css.overlay}>
      <div className={css.modal}>
        <h3 className={css.title}>Promote Pawn</h3>
        <div className={css.cards}>
          {PIECES.map((piece) => (
            <button key={piece} className={css.card} onClick={() => onSelect(piece)}>
              <div className={css.canvasWrap}>
                <Canvas camera={{ position: [0, 0.1, 0.7], fov: 45 }} gl={{ antialias: true }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[2, 3, 5]} intensity={1.2} />
                  <RotatingPiece nodeName={GLB_NODE[playerColor][piece]} />
                </Canvas>
              </div>
              <span className={css.label}>{LABELS[piece]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
