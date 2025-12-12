//@ts-nocheck
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface CellAnimationState {
  targetExtrude: number;
  currentExtrude: number;
  nextChangeTime: number;
  isGlowing: boolean;
  glowIntensity: number;
  emissiveIntensity: number;
}

// 4-stage boot sequence timing (in seconds)
// Stage 1: Static cube, no emissive (0-0.3s)
// Stage 2: Emissive starts appearing gradually (0.3-2s)
// Stage 3: Protrusions begin (0.5-8s, staggered - like GitHub commits)
// Stage 4: Glowing protrusions activate (3-10s, staggered)
const EMISSIVE_START_BASE = 0.3;
const EMISSIVE_START_SPREAD = 1.7;
const MOVEMENT_START_BASE = 0.5;
const MOVEMENT_START_SPREAD = 7.5;
const GLOW_START_BASE = 3.0;
const GLOW_START_SPREAD = 7.0;

// Single animated cell tile - optimized with refs instead of state
function CellTile({
  basePosition,
  normal,
  size,
  seed,
  lightMode,
  behavior,
  canGlow,
  lowFreqRef,
  highFreqRef,
  audioMode,
}: {
  basePosition: [number, number, number];
  normal: [number, number, number];
  size: number;
  seed: number;
  lightMode: boolean;
  behavior: "static" | "rare" | "normal" | "frequent";
  canGlow: boolean;
  lowFreqRef: React.MutableRefObject<number>;
  highFreqRef: React.MutableRefObject<number>;
  audioMode: "low" | "high" | "none";
}) {
  const meshRef = useRef<THREE.Mesh>();
  const materialRef = useRef<THREE.MeshStandardMaterial>();

  // Staggered start times based on seed for gradual 4-stage initialization
  const initTimes = useMemo(() => {
    const emissiveStart =
      EMISSIVE_START_BASE + seededRandom(seed + 888) * EMISSIVE_START_SPREAD;
    const movementStart =
      MOVEMENT_START_BASE + seededRandom(seed + 999) * MOVEMENT_START_SPREAD;
    const glowStart =
      GLOW_START_BASE + seededRandom(seed + 777) * GLOW_START_SPREAD;
    return { emissiveStart, movementStart, glowStart };
  }, [seed]);

  // Use refs instead of state for animation values
  const animState = useRef<CellAnimationState>({
    targetExtrude: 0,
    currentExtrude: 0,
    nextChangeTime: 99999,
    isGlowing: false,
    glowIntensity: 0,
    emissiveIntensity: 0,
  });

  const behaviorConfig = useMemo(() => {
    switch (behavior) {
      case "static":
        return { moveChance: 0, maxExtrude: 0, minWait: 99999, maxWait: 99999 };
      case "rare":
        return { moveChance: 0.3, maxExtrude: 0.08, minWait: 3, maxWait: 8 };
      case "normal":
        return { moveChance: 0.5, maxExtrude: 0.15, minWait: 1, maxWait: 4 };
      case "frequent":
        return { moveChance: 0.7, maxExtrude: 0.2, minWait: 0.5, maxWait: 2 };
    }
  }, [behavior]);

  // Track if cell has been initialized
  const hasInitialized = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const anim = animState.current;

    // Clamp delta to avoid huge jumps on tab switch
    const dt = Math.min(delta, 0.1);

    // Stage checks
    const canShowEmissive = time >= initTimes.emissiveStart;
    const canMove = time >= initTimes.movementStart;
    const canGlowNow = canGlow && time >= initTimes.glowStart;

    // Gradually fade in emissive intensity
    if (canShowEmissive) {
      const emissiveFadeDuration = 2.0;
      const timeSinceEmissiveStart = time - initTimes.emissiveStart;
      const targetEmissive = Math.min(
        timeSinceEmissiveStart / emissiveFadeDuration,
        1.0
      );
      const emissiveSmoothFactor = 1 - Math.exp(-3 * dt);
      anim.emissiveIntensity = THREE.MathUtils.lerp(
        anim.emissiveIntensity,
        targetEmissive,
        emissiveSmoothFactor
      );
    }

    // Initialize nextChangeTime once movement is allowed
    if (canMove && !hasInitialized.current) {
      hasInitialized.current = true;
      anim.nextChangeTime = time + seededRandom(seed) * 1.0;
    }

    if (canMove && time > anim.nextChangeTime && behavior !== "static") {
      const shouldExtrude =
        seededRandom(seed + time * 100) < behaviorConfig.moveChance;
      anim.targetExtrude = shouldExtrude
        ? 0.02 + seededRandom(seed + time * 50) * behaviorConfig.maxExtrude
        : 0;
      anim.nextChangeTime =
        time +
        behaviorConfig.minWait +
        seededRandom(seed + time * 200) *
          (behaviorConfig.maxWait - behaviorConfig.minWait);

      // Only allow glow after glow delay (stage 4)
      if (
        canGlowNow &&
        shouldExtrude &&
        seededRandom(seed + time * 300) > 0.3
      ) {
        anim.isGlowing = true;
      }
    }

    // Original smooth lerp factors for smoother animation
    anim.currentExtrude = THREE.MathUtils.lerp(
      anim.currentExtrude,
      anim.targetExtrude,
      0.06
    );

    // Fade glow based on extrusion - glow fades as cell retracts
    if (anim.isGlowing) {
      const targetGlow = anim.currentExtrude > 0.02 ? 1.0 : 0;
      anim.glowIntensity = THREE.MathUtils.lerp(
        anim.glowIntensity,
        targetGlow,
        0.04
      );
      if (anim.glowIntensity < 0.01) {
        anim.isGlowing = false;
        anim.glowIntensity = 0;
      }
    }

    // Audio displacement
    const lowFreq = lowFreqRef.current;
    const highFreq = highFreqRef.current;
    const audioIntensity =
      audioMode === "low" ? lowFreq : audioMode === "high" ? highFreq : 0;
    const audioDisplacement =
      anim.currentExtrude > 0.02 ? audioIntensity * 0.35 : 0;
    const totalExtrude = anim.currentExtrude + audioDisplacement;

    if (meshRef.current) {
      meshRef.current.position.set(
        basePosition[0] + normal[0] * totalExtrude,
        basePosition[1] + normal[1] * totalExtrude,
        basePosition[2] + normal[2] * totalExtrude
      );
    }

    // Animate emissive based on movement, glow state, and audio
    // Modulated by emissiveIntensity for gradual fade-in during boot sequence
    if (materialRef.current) {
      const isMoving =
        Math.abs(anim.currentExtrude - anim.targetExtrude) > 0.005;
      const extrudeRatio = anim.currentExtrude / 0.2;
      const baseIntensity =
        behavior === "static" ? 0.05 : 0.1 + extrudeRatio * 0.4;
      const movingBoost = isMoving ? 0.3 : 0;
      const audioGlow = anim.currentExtrude > 0.02 ? audioIntensity * 0.5 : 0;

      // Apply boot sequence fade-in (subtle, doesn't override color balance)
      const bootFade = Math.max(0.7, anim.emissiveIntensity);

      if (lightMode) {
        const glowBoost = anim.glowIntensity * 1.2;
        const totalIntensity =
          (baseIntensity + movingBoost + glowBoost + audioGlow) * bootFade;
        materialRef.current.emissive.setRGB(
          (0.02 + glowBoost * 0.25) * totalIntensity,
          (0.12 + glowBoost * 0.75) * totalIntensity,
          (0.08 + glowBoost * 0.5) * totalIntensity
        );
      } else {
        const glowBoost = anim.glowIntensity * 1.6;
        const greenAccent = anim.isGlowing
          ? 0.6 * anim.glowIntensity
          : isMoving
          ? 0.08
          : extrudeRatio > 0.1
          ? 0.04
          : 0;
        const baseIntensityWithBoost = (baseIntensity + movingBoost) * bootFade;
        materialRef.current.emissive.setRGB(
          (0.01 + glowBoost * 0.12) * baseIntensityWithBoost,
          greenAccent * baseIntensityWithBoost + glowBoost * 0.38 * bootFade,
          (0.01 + glowBoost * 0.18) * baseIntensityWithBoost
        );
      }
    }
  });

  const rotation = useMemo(() => {
    if (normal[2] === 1) return [0, 0, 0];
    if (normal[2] === -1) return [0, Math.PI, 0];
    if (normal[1] === 1) return [-Math.PI / 2, 0, 0];
    if (normal[1] === -1) return [Math.PI / 2, 0, 0];
    if (normal[0] === 1) return [0, Math.PI / 2, 0];
    if (normal[0] === -1) return [0, -Math.PI / 2, 0];
    return [0, 0, 0];
  }, [normal]);

  const gapMultiplier = behavior === "static" ? 0.98 : 0.88;

  return (
    <mesh ref={meshRef} position={basePosition} rotation={rotation as any}>
      <boxGeometry args={[size * gapMultiplier, size * gapMultiplier, 0.04]} />
      <meshStandardMaterial
        ref={materialRef}
        color={lightMode ? "#040404" : "#080808"}
        emissive={lightMode ? "#0a2520" : "#000000"}
        emissiveIntensity={1}
        metalness={0.92}
        roughness={0.2}
      />
    </mesh>
  );
}

// Inner glow layer visible through gaps
function InnerGlow({ lightMode }: { lightMode: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLightMode: { value: lightMode },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform bool uLightMode;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          
          // Pulsing glow
          float pulse = sin(uTime * 0.8) * 0.3 + 0.7;
          float pulse2 = sin(uTime * 1.2 + 2.0) * 0.2 + 0.8;
          
          // Grid pattern for inner structure
          float gridSize = 5.0;
          vec2 cellUv = fract(uv * gridSize);
          float grid = step(0.1, cellUv.x) * step(cellUv.x, 0.9) * step(0.1, cellUv.y) * step(cellUv.y, 0.9);
          
          // Traveling energy
          float energy = sin(uv.x * 20.0 - uTime * 0.6) * 0.5 + 0.5;
          energy *= sin(uv.y * 20.0 - uTime * 0.5) * 0.5 + 0.5;
          energy = smoothstep(0.3, 0.8, energy);
          
          vec3 glowColor = uLightMode 
            ? vec3(0.08, 0.35, 0.25) 
            : vec3(0.03, 0.08, 0.05);
          
          vec3 coreColor = uLightMode
            ? vec3(0.12, 0.5, 0.4)
            : vec3(0.05, 0.12, 0.08);
          
          vec3 color = glowColor * pulse * 0.35;
          color += coreColor * energy * pulse2 * 0.5;
          color *= grid;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uLightMode.value = lightMode;
    }
  });

  return (
    <mesh>
      <boxGeometry args={[1.92, 1.92, 1.92]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}

// Wire edges between cells
function WireFrame({ lightMode }: { lightMode: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLightMode: { value: lightMode },
      },
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform bool uLightMode;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          float gridSize = 5.0;
          vec2 cellUv = fract(uv * gridSize);
          
          // Wire pattern at cell edges
          float wireWidth = 0.08;
          float wire = 0.0;
          wire += smoothstep(wireWidth, 0.0, cellUv.x) + smoothstep(1.0 - wireWidth, 1.0, cellUv.x);
          wire += smoothstep(wireWidth, 0.0, cellUv.y) + smoothstep(1.0 - wireWidth, 1.0, cellUv.y);
          wire = clamp(wire, 0.0, 1.0);
          
          // Pulse along wires
          float pulse = sin(uv.x * 30.0 - uTime * 0.4) * 0.5 + 0.5;
          pulse = max(pulse, sin(uv.y * 30.0 - uTime * 0.35) * 0.5 + 0.5);
          pulse = smoothstep(0.4, 0.9, pulse);
          
          vec3 wireColor = uLightMode ? vec3(0.01, 0.018, 0.016) : vec3(0.015, 0.02, 0.018);
          vec3 glowColor = uLightMode ? vec3(0.04, 0.18, 0.14) : vec3(0.025, 0.06, 0.045);
          
          vec3 color = wireColor;
          color += glowColor * pulse * 0.6;
          
          float alpha = wire * 0.9;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uLightMode.value = lightMode;
    }
  });

  return (
    <mesh>
      <boxGeometry args={[2.01, 2.01, 2.01]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}

export function CircuitBox({
  lightMode,
  meshRef,
  lowFreqRef,
  highFreqRef,
}: {
  lightMode: boolean;
  meshRef: any;
  lowFreqRef: React.MutableRefObject<number>;
  highFreqRef: React.MutableRefObject<number>;
}) {
  const cells = useMemo(() => {
    const items: Array<{
      position: [number, number, number];
      normal: [number, number, number];
      seed: number;
      behavior: "static" | "rare" | "normal" | "frequent";
      canGlow: boolean;
      audioMode: "low" | "high" | "none";
    }> = [];

    const gridSize = 5;
    const cellSize = 2 / gridSize;
    const halfGrid = (gridSize - 1) / 2;

    const faces: Array<{
      normal: [number, number, number];
      uAxis: "x" | "y" | "z";
      vAxis: "x" | "y" | "z";
      offset: number;
    }> = [
      { normal: [0, 0, 1], uAxis: "x", vAxis: "y", offset: 1 },
      { normal: [0, 0, -1], uAxis: "x", vAxis: "y", offset: -1 },
      { normal: [0, 1, 0], uAxis: "x", vAxis: "z", offset: 1 },
      { normal: [0, -1, 0], uAxis: "x", vAxis: "z", offset: -1 },
      { normal: [1, 0, 0], uAxis: "z", vAxis: "y", offset: 1 },
      { normal: [-1, 0, 0], uAxis: "z", vAxis: "y", offset: -1 },
    ];

    faces.forEach((face, faceIdx) => {
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const u = (i - halfGrid) * cellSize;
          const v = (j - halfGrid) * cellSize;

          const pos: [number, number, number] = [0, 0, 0];

          if (face.uAxis === "x") pos[0] = u;
          if (face.uAxis === "y") pos[1] = u;
          if (face.uAxis === "z") pos[2] = u;

          if (face.vAxis === "x") pos[0] = v;
          if (face.vAxis === "y") pos[1] = v;
          if (face.vAxis === "z") pos[2] = v;

          if (face.normal[0] !== 0) pos[0] = face.offset;
          if (face.normal[1] !== 0) pos[1] = face.offset;
          if (face.normal[2] !== 0) pos[2] = face.offset;

          const seed = faceIdx * 1000 + i * 100 + j;
          const rand = seededRandom(seed);
          let behavior: "static" | "rare" | "normal" | "frequent";

          if (rand < 0.25) {
            behavior = "static";
          } else if (rand < 0.5) {
            behavior = "rare";
          } else if (rand < 0.8) {
            behavior = "normal";
          } else {
            behavior = "frequent";
          }

          const canGlow =
            behavior !== "static" && seededRandom(seed + 500) > 0.6;

          // Audio mode assignment
          const audioRand = seededRandom(seed + 777);
          const audioMode: "low" | "high" | "none" =
            audioRand < 0.25 ? "low" : audioRand < 0.5 ? "high" : "none";

          items.push({
            position: pos,
            normal: face.normal,
            seed,
            behavior,
            canGlow,
            audioMode,
          });
        }
      }
    });

    return items;
  }, []);

  const cellSize = 2 / 5;

  return (
    <group ref={meshRef}>
      <InnerGlow lightMode={lightMode} />
      <WireFrame lightMode={lightMode} />
      {cells.map((cell, idx) => (
        <CellTile
          key={idx}
          basePosition={cell.position}
          normal={cell.normal}
          size={cellSize}
          seed={cell.seed}
          lightMode={lightMode}
          behavior={cell.behavior}
          canGlow={cell.canGlow}
          lowFreqRef={lowFreqRef}
          highFreqRef={highFreqRef}
          audioMode={cell.audioMode}
        />
      ))}
    </group>
  );
}
