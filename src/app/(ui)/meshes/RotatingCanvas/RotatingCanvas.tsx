import type { PromotionPiece } from "@/types";
import { Canvas } from "@react-three/fiber";
import RotatingPiece from "../RotatingPiece/RotatingPiece";

interface RotatingCanvasProps {
  playerColor: "w" | "b";
  piece: PromotionPiece;
}

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

export default function RotatingCanvas({
  playerColor,
  piece,
}: RotatingCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 0.7], fov: 45 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 5]} intensity={1.2} />
      <RotatingPiece nodeName={GLB_NODE[playerColor][piece]} />
    </Canvas>
  );
}
