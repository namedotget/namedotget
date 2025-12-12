//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo } from "react";
import { CircuitBox } from "./CircuitMaterial";
import { WireWall } from "./WireWallMaterial";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

export function HeroScene({
  lightMode,
  audioData,
}: {
  lightMode: boolean;
  audioData: Uint8Array;
}) {
  const { camera } = useThree();
  const meshRef = useRef();
  const backgroundRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const smoothedLowFreq = useRef(0);
  const smoothedHighFreq = useRef(0);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { lowFreq, highFreq } = useMemo(() => {
    if (!audioData || audioData.length === 0)
      return { lowFreq: 0, highFreq: 0 };
    // Low frequencies: first 10 bins (bass)
    const lowSlice = audioData.slice(0, 10);
    const lowSum = lowSlice.reduce((acc, val) => acc + val, 0);
    const lowFreq = lowSum / (lowSlice.length * 255);

    // High frequencies: bins 20-60 (treble/mids)
    const highSlice = audioData.slice(20, 60);
    const highSum = highSlice.reduce((acc, val) => acc + val, 0);
    const highFreq = highSum / (highSlice.length * 255);

    return { lowFreq, highFreq };
  }, [audioData]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Clamp delta to avoid jumps on tab switch
      const dt = Math.min(delta, 0.1);

      const speed = 0.005 + (0.01 * window.scrollY) / 500;

      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = -window.scrollY / 500;
      camera.position.z = 5 + window.scrollY / 900;

      // Frame-rate independent audio smoothing
      const lowSmoothFactor = 1 - Math.exp(-12 * dt);
      const highSmoothFactor = 1 - Math.exp(-15 * dt);

      smoothedLowFreq.current = THREE.MathUtils.lerp(
        smoothedLowFreq.current,
        lowFreq,
        lowSmoothFactor
      );
      smoothedHighFreq.current = THREE.MathUtils.lerp(
        smoothedHighFreq.current,
        highFreq,
        highSmoothFactor
      );
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

      <CircuitBox
        lightMode={lightMode}
        meshRef={meshRef}
        lowFreqRef={smoothedLowFreq}
        highFreqRef={smoothedHighFreq}
      />

      <EffectComposer>
        <Bloom
          intensity={isMobile ? 0.6 : 1.1}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.75}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
