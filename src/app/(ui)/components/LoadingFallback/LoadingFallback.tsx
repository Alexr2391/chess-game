import { Text } from "@react-three/drei";

export const LoadingFallback = () => {
  return (
    <Text color="white" fontSize={0.5} anchorX="center" anchorY="middle">
      Loading...
    </Text>
  );
};
