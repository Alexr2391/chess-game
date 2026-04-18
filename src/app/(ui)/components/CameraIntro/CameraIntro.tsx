"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  playerColor: "w" | "b";
  onComplete: () => void;
};

const WHITE_TARGET = new THREE.Vector3(0, 1.5, 2);
const BLACK_TARGET = new THREE.Vector3(0, 1.5, 2);
const START_POS = new THREE.Vector3(0, 10, 16);
const LOOK_AT = new THREE.Vector3(0, 0, 0);

export function CameraIntro({ playerColor, onComplete }: Props) {
  const { camera } = useThree();
  const target = playerColor === "w" ? WHITE_TARGET : BLACK_TARGET;
  const done = useRef(false);

  useEffect(() => {
    camera.position.copy(START_POS);
    done.current = false;
  }, [playerColor, camera]);

  useFrame(() => {
    if (done.current) return;
    camera.position.lerp(target, 0.06);
    camera.lookAt(LOOK_AT);

    if (camera.position.distanceTo(target) < 0.05) {
      camera.position.copy(target);
      done.current = true;
      onComplete();
    }
  });

  return null;
}
