import { SQUARE_SIZE } from "@/utils/boardConstants";

type Props = { position: [number, number, number] };

export function CheckHighlight({ position }: Props) {
  return (
    <mesh position={position}>
      <planeGeometry args={[SQUARE_SIZE, SQUARE_SIZE]} />
      <meshStandardMaterial color="red" transparent opacity={0.55} side={2} depthWrite={false} />
    </mesh>
  );
}
