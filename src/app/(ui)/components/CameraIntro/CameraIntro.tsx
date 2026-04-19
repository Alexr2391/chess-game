"use client";

import { BOARD_ROTATION_Z } from "@/utils/boardConstants";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CameraProps {
  playerColor: "w" | "b";
  ready: boolean;
  onComplete: () => void;
}

const BEHIND_DISTANCE = 2 * Math.SQRT2;

const dir = new THREE.Vector2(
  Math.cos(BOARD_ROTATION_Z - Math.PI / 4),
  Math.sin(BOARD_ROTATION_Z - Math.PI / 4),
).multiplyScalar(BEHIND_DISTANCE);

const TARGET = new THREE.Vector3(dir.x, dir.y, 0);
const START_POS = new THREE.Vector3(0, 5, 14);
const LOOK_AT = new THREE.Vector3(0, 0, 0);

export function CameraIntro({ playerColor, ready, onComplete }: CameraProps) {
  const { camera } = useThree();
  const done = useRef(false);

  useEffect(() => {
    camera.position.copy(START_POS);
    done.current = false;
  }, [playerColor, camera]);

  useFrame(() => {
    if (!ready || done.current) return;
    camera.position.lerp(TARGET, 0.06);
    camera.lookAt(LOOK_AT);

    if (camera.position.distanceTo(TARGET) < 0.05) {
      camera.position.copy(TARGET);
      done.current = true;
      onComplete();
    }
  });

  return null;
}
