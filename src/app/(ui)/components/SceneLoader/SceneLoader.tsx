"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("../Scene/Scene"), { ssr: false });

export const SceneLoader = () => {
  return <Scene />;
};
