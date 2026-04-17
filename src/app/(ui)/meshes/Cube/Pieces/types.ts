import * as THREE from "three";

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";

export type ChessPieceProps = {
  type: PieceType;
  color: PieceColor;
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  position: [number, number, number];
  square?: string;
  isSelected?: boolean;
  isCapture?: boolean;
  isDragging?: boolean;
  scale?: number;
  onSelect?: () => void;
  onDeselect?: () => void;
};

export type PieceDefinition = {
  nodeName: string;
  type: PieceType;
  color: PieceColor;
  square: string;
  scaleFactor: number;
};
