//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { CircuitBox } from "./CircuitMaterial";
import { WireWall } from "./WireWallMaterial";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function HeroScene({ lightMode }: any) {
  const { camera } = useThree();
  const meshRef = useRef();
  const backgroundRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      const speed = 0.005 + (0.01 * window.scrollY) / 500;

      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = -window.scrollY / 500;
      camera.position.z = 5 + window.scrollY / 900;
    }
  });

  return (
    <>
      <ambientLight intensity={lightMode ? 0.5 : 0.35} />

      {/* Main directional light */}
      <directionalLight
        position={[3, 4, 5]}
        intensity={lightMode ? 1.5 : 1}
        color={lightMode ? "#ffffff" : "#e0e0e0"}
      />

      {/* Subtle rim light for depth */}
      <pointLight
        position={[0, -3, -2]}
        intensity={lightMode ? 2 : 1.5}
        color={lightMode ? "#50c8a0" : "#308060"}
        distance={10}
      />

      <mesh position={[0, 0, -1]} ref={backgroundRef}>
        <planeGeometry args={[100, 100]} />
        <WireWall lightMode={lightMode} />
      </mesh>

      <CircuitBox lightMode={lightMode} meshRef={meshRef} />

      <EffectComposer>
        <Bloom
          intensity={isMobile ? 0.5 : 1.0}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
