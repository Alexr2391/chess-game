"use client";

import { animated, useSpring } from "@react-spring/three";
import { ChessPieceProps } from "../types";

export default function ChessPiece({
  geometry,
  material,
  position,
  scale,
  onSelect,
  isSelected,
  isSelectable,
}: ChessPieceProps) {
  const { animatedPosition, rotationX } = useSpring({
    animatedPosition: [
      position[0],
      position[1],
      position[2] + (isSelected ? 0.05 : 0),
    ],
    rotationX: isSelected ? 0.2 : 0,
    config: { tension: 200, friction: 20 },
  });

  return (
    <animated.mesh
      geometry={geometry}
      material={material}
      position={animatedPosition as unknown as [number, number, number]}
      rotation-x={rotationX}
      rotation-z={Math.PI}
      scale={scale}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onPointerEnter={() => {
        if (isSelectable) document.body.style.cursor = "grab";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    />
  );
}
