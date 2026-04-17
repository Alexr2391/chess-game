import { SQUARE_SIZE } from "@/utils/boardConstants";
import { animated } from "@react-spring/three";
import { usePulseSpring } from "./usePulseSpring";

const TORUS_RADIUS = SQUARE_SIZE * 0.42;
const TORUS_TUBE = SQUARE_SIZE * 0.04;

type Props = { position: [number, number, number]; color: string };

export function PulsingRing({ position, color }: Props) {
  const { opacity, scale } = usePulseSpring();
  return (
    <animated.mesh
      position={position}
      scale={scale.to((s) => [s, s, s]) as unknown as [number, number, number]}
    >
      <ringGeometry
        args={[TORUS_RADIUS - TORUS_TUBE, TORUS_RADIUS + TORUS_TUBE, 64]}
      />
      <animated.meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={2}
        depthWrite={false}
      />
    </animated.mesh>
  );
}
