//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MouseLight } from "./MouseLight";
import * as THREE from "three";
export function HeroScene({ lightMode }: any) {
  const { camera } = useThree();
  const meshRef = useRef();
  const spotRef = useRef();
  const backgroundRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      const speed = 0.005 + (0.01 * window.scrollY) / 500;

      // box1
      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = -window.scrollY / 500;
      camera.position.z = 5 + window.scrollY / 900;
      spotRef.current.position.z = -3 + window.scrollY / 110;
      spotRef.current.position.y = -window.scrollY / 150;
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
        intensity={150}
        scale={2}
        color={lightMode ? "lime" : "white"}
      />
      <mesh position={[0, 0, -1]} ref={backgroundRef}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={lightMode ? "#50C878" : "#1e1e1e"} />
      </mesh>

      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={lightMode ? "#50C878" : "#1e1e1e"} />
      </mesh>

      <fog attach="fog" args={["#ffffff", 0, 15]} />
    </>
  );
}
