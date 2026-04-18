"use client";

import { useGLTF } from "@react-three/drei";

const TABLE_SCALE = 3;

export default function ChessTable() {
  const { scene } = useGLTF("/models/miscellaneous/gothic_coffee_table.glb");

  return (
    <primitive
      object={scene}
      rotation={[Math.PI / 2, 0, 0]}
      scale={TABLE_SCALE}
      position={[0, 0, -0.54 * TABLE_SCALE]}
    />
  );
}

useGLTF.preload("/models/miscellaneous/gothic_coffee_table.glb");
