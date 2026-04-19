import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function useSceneReady(onReady: () => void) {
  const called = useRef(false);
  useFrame(() => {
    if (called.current) return;
    called.current = true;
    onReady();
  });
}
