import * as THREE from "three";

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";

export interface Piece {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  position: [number, number, number];
  scale?: number;
  square?: string;
}

export interface ChessPieceProps extends Piece {
  type: PieceType;
  color: PieceColor;
  isSelected?: boolean;
  isSelectable?: boolean;
  isCapture?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
}

export type PieceDefinition = {
  nodeName: string;
  type: PieceType;
  color: PieceColor;
  square: string | null;
  scaleFactor: number;
  glbNodeOverride?: string;
};
