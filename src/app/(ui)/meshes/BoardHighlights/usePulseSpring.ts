import { useSpring } from "@react-spring/three";

const PULSE_CONFIG = { duration: 1000 };

export function usePulseSpring() {
  return useSpring({
    from: { opacity: 0.3, scale: 0.5 },
    to: { opacity: 0.7, scale: 0.9 },
    loop: { reverse: true },
    config: PULSE_CONFIG,
  });
}
