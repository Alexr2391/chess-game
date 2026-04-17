"use client";

export default function GlobalLight() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 5]} intensity={1} />
    </>
  );
}
