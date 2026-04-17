import { SQUARE_SIZE } from "@/utils/boardConstants";
import { animated } from "@react-spring/three";
import { usePulseSpring } from "./usePulseSpring";

const CIRCLE_RADIUS = SQUARE_SIZE * 0.25;

type Props = { position: [number, number, number]; color: string; isCapture?: boolean };

export function PulsingHighlight({ position, color, isCapture }: Props) {
  const { opacity, scale } = usePulseSpring();

  if (isCapture) {
    return (
      <mesh position={position}>
        <planeGeometry args={[SQUARE_SIZE, SQUARE_SIZE]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={2} depthWrite={false} />
      </mesh>
    );
  }

  return (
    <animated.mesh
      position={position}
      scale={scale.to((s) => [s, s, s]) as unknown as [number, number, number]}
    >
      <circleGeometry args={[CIRCLE_RADIUS, 46]} />
      <animated.meshStandardMaterial color={color} transparent opacity={opacity} side={2} depthWrite={false} />
    </animated.mesh>
  );
}
