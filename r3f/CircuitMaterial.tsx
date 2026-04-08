//@ts-nocheck
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { debugIngest } from "@/lib/debugIngest";

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

/** Lower = fewer face cells, draw calls, and per-material lighting work (was 5 → 150 meshes). */
const CIRCUIT_FACE_GRID = 4;

const EMISSIVE_START_BASE = 0.3;
const EMISSIVE_START_SPREAD = 1.7;
const MOVEMENT_START_BASE = 0.5;
const MOVEMENT_START_SPREAD = 7.5;
const GLOW_START_BASE = 3.0;
const GLOW_START_SPREAD = 7.0;

type BehaviorKind = "static" | "rare" | "normal" | "frequent";

function behaviorConfigFor(behavior: BehaviorKind) {
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
}

function normalToRotation(
  normal: [number, number, number],
): [number, number, number] {
  if (normal[2] === 1) return [0, 0, 0];
  if (normal[2] === -1) return [0, Math.PI, 0];
  if (normal[1] === 1) return [-Math.PI / 2, 0, 0];
  if (normal[1] === -1) return [Math.PI / 2, 0, 0];
  if (normal[0] === 1) return [0, Math.PI / 2, 0];
  if (normal[0] === -1) return [0, -Math.PI / 2, 0];
  return [0, 0, 0];
}

type CircuitCellDef = {
  basePosition: [number, number, number];
  normal: [number, number, number];
  seed: number;
  behavior: BehaviorKind;
  canGlow: boolean;
  audioMode: "low" | "high" | "none";
  initTimes: {
    emissiveStart: number;
    movementStart: number;
    glowStart: number;
  };
  behaviorConfig: ReturnType<typeof behaviorConfigFor>;
  rotation: [number, number, number];
};

function tickOneCell(
  def: CircuitCellDef,
  anim: CellAnimationState,
  time: number,
  dt: number,
  lowFreq: number,
  highFreq: number,
  lightMode: boolean,
  mesh: THREE.Mesh | null,
  mat: THREE.MeshLambertMaterial | null,
  hasInitialized: boolean,
): boolean {
  const { initTimes, behaviorConfig, behavior, canGlow, seed, audioMode } = def;

  const canShowEmissive = time >= initTimes.emissiveStart;
  const canMove = time >= initTimes.movementStart;
  const canGlowNow = canGlow && time >= initTimes.glowStart;

  if (canShowEmissive) {
    const emissiveFadeDuration = 2.0;
    const timeSinceEmissiveStart = time - initTimes.emissiveStart;
    const targetEmissive = Math.min(
      timeSinceEmissiveStart / emissiveFadeDuration,
      1.0,
    );
    const emissiveSmoothFactor = 1 - Math.exp(-3 * dt);
    anim.emissiveIntensity = THREE.MathUtils.lerp(
      anim.emissiveIntensity,
      targetEmissive,
      emissiveSmoothFactor,
    );
  }

  let nextHasInit = hasInitialized;
  if (canMove && !hasInitialized) {
    nextHasInit = true;
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

    if (
      canGlowNow &&
      shouldExtrude &&
      seededRandom(seed + time * 300) > 0.3
    ) {
      anim.isGlowing = true;
    }
  }

  anim.currentExtrude = THREE.MathUtils.lerp(
    anim.currentExtrude,
    anim.targetExtrude,
    0.06,
  );

  if (anim.isGlowing) {
    const targetGlow = anim.currentExtrude > 0.02 ? 1.0 : 0;
    anim.glowIntensity = THREE.MathUtils.lerp(
      anim.glowIntensity,
      targetGlow,
      0.04,
    );
    if (anim.glowIntensity < 0.01) {
      anim.isGlowing = false;
      anim.glowIntensity = 0;
    }
  }

  const audioIntensity =
    audioMode === "low" ? lowFreq : audioMode === "high" ? highFreq : 0;
  const audioDisplacement =
    anim.currentExtrude > 0.02 ? audioIntensity * 0.14 : 0;
  const totalExtrude = anim.currentExtrude + audioDisplacement;

  if (mesh) {
    mesh.position.set(
      def.basePosition[0] + def.normal[0] * totalExtrude,
      def.basePosition[1] + def.normal[1] * totalExtrude,
      def.basePosition[2] + def.normal[2] * totalExtrude,
    );
  }

  if (mat) {
    const isMoving =
      Math.abs(anim.currentExtrude - anim.targetExtrude) > 0.005;
    const extrudeRatio = anim.currentExtrude / 0.2;
    const baseIntensity =
      behavior === "static" ? 0.05 : 0.1 + extrudeRatio * 0.4;
    const movingBoost = isMoving ? 0.3 : 0;
    const audioGlow = anim.currentExtrude > 0.02 ? audioIntensity * 0.22 : 0;
    const bootFade = Math.max(0.7, anim.emissiveIntensity);

    let er = 0;
    let eg = 0;
    let eb = 0;
    if (lightMode) {
      const glowBoost = anim.glowIntensity * 1.2;
      const totalIntensity =
        (baseIntensity + movingBoost + glowBoost + audioGlow) * bootFade;
      er = (0.02 + glowBoost * 0.25) * totalIntensity;
      eg = (0.12 + glowBoost * 0.75) * totalIntensity;
      eb = (0.08 + glowBoost * 0.5) * totalIntensity;
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
      er = (0.01 + glowBoost * 0.12) * baseIntensityWithBoost;
      eg =
        greenAccent * baseIntensityWithBoost + glowBoost * 0.38 * bootFade;
      eb = (0.01 + glowBoost * 0.18) * baseIntensityWithBoost;
    }
    const cache = mat.userData as {
      _emR?: number;
      _emG?: number;
      _emB?: number;
    };
    const eps = 0.0025;
    if (
      cache._emR === undefined ||
      Math.abs(cache._emR - er) > eps ||
      Math.abs((cache._emG ?? 0) - eg) > eps ||
      Math.abs((cache._emB ?? 0) - eb) > eps
    ) {
      mat.emissive.setRGB(er, eg, eb);
      cache._emR = er;
      cache._emG = eg;
      cache._emB = eb;
    }
  }

  return nextHasInit;
}

function buildCircuitCells(audioActive: boolean): CircuitCellDef[] {
  const items: CircuitCellDef[] = [];

  const gridSize = CIRCUIT_FACE_GRID;
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
        let behavior: BehaviorKind;

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

        const audioRand = seededRandom(seed + 777);
        let audioMode: "low" | "high" | "none";
        if (audioActive) {
          if (audioRand < 0.06) audioMode = "low";
          else if (audioRand < 0.12) audioMode = "high";
          else audioMode = "none";
        } else {
          audioMode = "none";
        }

        const initTimes = {
          emissiveStart:
            EMISSIVE_START_BASE + seededRandom(seed + 888) * EMISSIVE_START_SPREAD,
          movementStart:
            MOVEMENT_START_BASE + seededRandom(seed + 999) * MOVEMENT_START_SPREAD,
          glowStart: GLOW_START_BASE + seededRandom(seed + 777) * GLOW_START_SPREAD,
        };

        items.push({
          basePosition: pos,
          normal: face.normal,
          seed,
          behavior,
          canGlow,
          audioMode,
          initTimes,
          behaviorConfig: behaviorConfigFor(behavior),
          rotation: normalToRotation(face.normal),
        });
      }
    }
  });

  return items;
}

function createInitialAnimState(): CellAnimationState {
  return {
    targetExtrude: 0,
    currentExtrude: 0,
    nextChangeTime: 99999,
    isGlowing: false,
    glowIntensity: 0,
    emissiveIntensity: 0,
  };
}

function createInnerGlowMaterial() {
  const g = `${CIRCUIT_FACE_GRID}.0`;
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLightMode: { value: true },
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
          
          float pulse = sin(uTime * 0.8) * 0.3 + 0.7;
          float pulse2 = sin(uTime * 1.2 + 2.0) * 0.2 + 0.8;
          
          float gridSize = ${g};
          vec2 cellUv = fract(uv * gridSize);
          float grid = step(0.1, cellUv.x) * step(cellUv.x, 0.9) * step(0.1, cellUv.y) * step(cellUv.y, 0.9);
          
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
}

function createWireFrameMaterial() {
  const g = `${CIRCUIT_FACE_GRID}.0`;
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLightMode: { value: true },
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
          float gridSize = ${g};
          vec2 cellUv = fract(uv * gridSize);
          
          float wireWidth = 0.08;
          float wire = 0.0;
          wire += smoothstep(wireWidth, 0.0, cellUv.x) + smoothstep(1.0 - wireWidth, 1.0, cellUv.x);
          wire += smoothstep(wireWidth, 0.0, cellUv.y) + smoothstep(1.0 - wireWidth, 1.0, cellUv.y);
          wire = clamp(wire, 0.0, 1.0);
          
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
}

export function CircuitBox({
  lightMode,
  meshRef,
  lowFreqRef,
  highFreqRef,
  audioActive,
}: {
  lightMode: boolean;
  meshRef: any;
  lowFreqRef: React.MutableRefObject<number>;
  highFreqRef: React.MutableRefObject<number>;
  audioActive: boolean;
}) {
  const cells = useMemo(() => buildCircuitCells(audioActive), [audioActive]);

  const innerMaterial = useMemo(() => createInnerGlowMaterial(), []);
  const wireMaterial = useMemo(() => createWireFrameMaterial(), []);

  useEffect(() => {
    return () => {
      innerMaterial.dispose();
      wireMaterial.dispose();
    };
  }, [innerMaterial, wireMaterial]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshLambertMaterial | null)[]>([]);
  const animStates = useRef<CellAnimationState[]>([]);
  const hasInitialized = useRef<boolean[]>([]);

  const cellSize = 2 / CIRCUIT_FACE_GRID;
  const boxGeomDense = useMemo(
    () => new THREE.BoxGeometry(cellSize * 0.88, cellSize * 0.88, 0.04),
    [cellSize],
  );
  const boxGeomStatic = useMemo(
    () => new THREE.BoxGeometry(cellSize * 0.98, cellSize * 0.98, 0.04),
    [cellSize],
  );

  useEffect(() => {
    return () => {
      boxGeomDense.dispose();
      boxGeomStatic.dispose();
    };
  }, [boxGeomDense, boxGeomStatic]);

  useFrame((state, delta) => {
    const n = cells.length;
    if (
      animStates.current.length !== n ||
      hasInitialized.current.length !== n ||
      meshRefs.current.length !== n ||
      matRefs.current.length !== n
    ) {
      animStates.current = Array.from({ length: n }, () =>
        createInitialAnimState(),
      );
      hasInitialized.current = Array.from({ length: n }, () => false);
      meshRefs.current = new Array(n).fill(null);
      matRefs.current = new Array(n).fill(null);
    }

    const time = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);
    const lowFreq = lowFreqRef.current;
    const highFreq = highFreqRef.current;

    innerMaterial.uniforms.uTime.value = time;
    innerMaterial.uniforms.uLightMode.value = lightMode;
    wireMaterial.uniforms.uTime.value = time;
    wireMaterial.uniforms.uLightMode.value = lightMode;

    const t0 = performance.now();
    for (let i = 0; i < cells.length; i++) {
      hasInitialized.current[i] = tickOneCell(
        cells[i],
        animStates.current[i],
        time,
        dt,
        lowFreq,
        highFreq,
        lightMode,
        meshRefs.current[i],
        matRefs.current[i],
        hasInitialized.current[i],
      );
    }
    // #region agent log
    const loopMs = performance.now() - t0;
    if (process.env.NODE_ENV === "development" && loopMs > 12) {
      debugIngest("H3", "CircuitMaterial.tsx:useFrame", "cell_loop_ms", {
        loopMs: Math.round(loopMs * 10) / 10,
        cellCount: cells.length,
      });
    }
    // #endregion
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[1.92, 1.92, 1.92]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>
      <mesh>
        <boxGeometry args={[2.01, 2.01, 2.01]} />
        <primitive object={wireMaterial} attach="material" />
      </mesh>
      {cells.map((cell, idx) => (
        <mesh
          key={cell.seed}
          ref={(r) => {
            meshRefs.current[idx] = r;
          }}
          geometry={
            cell.behavior === "static" ? boxGeomStatic : boxGeomDense
          }
          position={cell.basePosition}
          rotation={cell.rotation}
        >
          <meshLambertMaterial
            ref={(r) => {
              matRefs.current[idx] = r;
            }}
            color={lightMode ? "#040404" : "#080808"}
            emissive={lightMode ? "#0a2520" : "#000000"}
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}
