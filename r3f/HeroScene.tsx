//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export function HeroScene() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      const speed = 0.005 + (0.01 * window.scrollY) / 200;

      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = -window.scrollY / 500;
    }
  });

  return (
    <>
      <ambientLight intensity={0.95} />
      <spotLight position={[0, 0, 1]} penumbra={1} intensity={1} />

      <mesh ref={meshRef}>
        <boxGeometry />
        <meshStandardMaterial color="#50C878" />
      </mesh>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#50C878" />
      </mesh>
    </>
  );
}
