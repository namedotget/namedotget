//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export function HeroScene() {
  const { camera } = useThree();
  const meshRef = useRef();
  const spotRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      const speed = 0.005 + (0.01 * window.scrollY) / 500;

      // box1
      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = -window.scrollY / 500;
      camera.position.z = 5 + window.scrollY / 900;
      spotRef.current.position.z = -3 + window.scrollY / 100;
      spotRef.current.position.y = -window.scrollY / 100;
    }
  });

  return (
    <>
      <ambientLight intensity={0.95} />
      <spotLight position={[0, 0, 4]} penumbra={1} intensity={70} scale={2} />
      <spotLight
        ref={spotRef}
        position={[0, 0, 10]}
        penumbra={0.75}
        intensity={500}
        scale={2}
        color={"yellow"}
      />
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#50C878" />
      </mesh>

      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#50C878" />
      </mesh>
    </>
  );
}
