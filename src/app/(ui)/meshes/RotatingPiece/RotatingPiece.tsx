import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function RotatingPiece({ nodeName }: { nodeName: string }) {
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
