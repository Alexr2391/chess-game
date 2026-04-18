import { useGLTF } from "@react-three/drei";

export const Room = () => {
  const { scene } = useGLTF(
    "/models/environment/environment_vr_room_baked.glb",
  );

  return <primitive object={scene} scale={5} position={[0, -1.65, -25]} />;
};

useGLTF.preload("/models/environment/environment_vr_room_baked.glb");
