"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Board() {
  const { nodes } = useGLTF("/models/chess/chess-optimized-board.glb");

  const base = nodes["Cube_Material001_0"] as THREE.Mesh;
  const emission = nodes["Cube_emissson_0"] as THREE.Mesh;

  return (
    <group>
      {base?.geometry && (
        <mesh
          geometry={base.geometry}
          material={base.material}
          rotation-z={Math.PI / 2}
        />
      )}
      {emission?.geometry && (
        <mesh
          geometry={emission.geometry}
          material={emission.material}
          rotation-z={Math.PI / 2}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/chess/chess-optimized-board.glb");
