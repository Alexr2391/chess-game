"use client";

export default function GlobalLight() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 2, 5]} intensity={0.8} />
    </>
  );
}
