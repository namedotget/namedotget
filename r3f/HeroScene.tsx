//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { CircuitBox } from "./CircuitMaterial";
import { WireWall } from "./WireWallMaterial";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import { audioSpectrumBridge } from "@/lib/audioSpectrumBridge";
import { heroMotionBridge } from "@/lib/heroMotionBridge";

export function HeroScene({
  lightMode,
  audioActive,
}: {
  lightMode: boolean;
  audioActive: boolean;
}) {
  const { camera } = useThree();
  const meshRef = useRef();
  const backgroundRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const smoothedLowFreq = useRef(0);
  const smoothedHighFreq = useRef(0);
  const motionScaleSmoothed = useRef(1);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Clamp delta to avoid jumps on tab switch
      const dt = Math.min(delta, 0.1);

      const kScale = 10;
      motionScaleSmoothed.current = THREE.MathUtils.lerp(
        motionScaleSmoothed.current,
        heroMotionBridge.targetMotionScale,
        1 - Math.exp(-kScale * dt),
      );
      const m = motionScaleSmoothed.current;

      const baseSpeed = 0.005 + (0.01 * window.scrollY) / 500;
      const speed = (audioActive ? baseSpeed * 0.32 : baseSpeed) * m;

      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = (-window.scrollY / 500) * m;
      camera.position.z = 5 + (window.scrollY / 900) * m;

      // Slower follow when audio is on (less churn, cheaper visuals)
      const lowK = audioActive ? 5 : 12;
      const highK = audioActive ? 6 : 15;
      const lowSmoothFactor = 1 - Math.exp(-lowK * dt);
      const highSmoothFactor = 1 - Math.exp(-highK * dt);

      smoothedLowFreq.current = THREE.MathUtils.lerp(
        smoothedLowFreq.current,
        audioSpectrumBridge.lowFreq,
        lowSmoothFactor,
      );
      smoothedHighFreq.current = THREE.MathUtils.lerp(
        smoothedHighFreq.current,
        audioSpectrumBridge.highFreq,
        highSmoothFactor,
      );
    }
  });

  return (
    <>
      <color attach="background" args={["#0a0a0d"]} />

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
        audioActive={audioActive}
      />

      <EffectComposer>
        <Bloom
          intensity={
            (isMobile ? 0.55 : 1.0) * (audioActive ? 0.72 : 1)
          }
          luminanceThreshold={0.42}
          luminanceSmoothing={0.6}
          mipmapBlur={!audioActive}
        />
      </EffectComposer>
    </>
  );
}
