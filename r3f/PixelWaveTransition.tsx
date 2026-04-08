//@ts-nocheck
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";

import {
  PIXEL_WAVE_GRID_CELLS,
  PIXEL_WAVE_BAND,
  PIXEL_WAVE_HALO,
} from "@/lib/pixelWaveConfig";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uDirection;
  uniform float uTime;
  uniform float uGrid;
  uniform float uBand;
  uniform float uHalo;
  uniform vec3 uAccent;
  varying vec2 vUv;

  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    float x = vUv.x;
    float y = vUv.y;
    float xw = mix(1.0 - x, x, step(0.0, uDirection));

    float cellY = floor(y * uGrid);
    float cellX = floor(x * uGrid);
    vec2 cellId = vec2(cellX, cellY);

    float ripple =
      sin(cellY * 0.31 + uTime * 5.2) * 0.052
      + sin(cellX * 0.12 + cellY * 0.21 + uTime * 2.75) * 0.028
      + sin((cellX + cellY) * 0.17 + uTime * 3.4) * 0.038
      + sin(cellX * 0.43 - uTime * 4.05) * sin(cellY * 0.36 + uTime * 2.15) * 0.024
      + sin(length(vec2(cellX, cellY)) * 0.11 + uTime * 2.9) * 0.018;

    float p = clamp(uProgress, 0.0, 1.0);
    // Single sweep across full progress (no return sweep in the second half).
    float edge = (1.0 - p) + ripple;
    float cover = step(edge, xw);

    float dist = abs(xw - edge);
    float inBand = 1.0 - smoothstep(0.0, uBand + 0.018, dist);
    float haloBand = 1.0 - smoothstep(uBand, uBand + uHalo + 0.07, dist);
    float pulse = 0.65 + 0.35 * sin(uTime * 9.0 + dist * 120.0);

    float fx = fract(x * uGrid);
    float fy = fract(y * uGrid);
    float voxelShade =
      mix(0.42, 1.0, fx) * mix(0.55, 1.0, 1.0 - abs(fy - 0.5) * 2.0);
    float cellHash = 0.82 + 0.36 * hash21(cellId + vec2(uTime * 0.02));

    vec3 baseDark = vec3(0.022, 0.024, 0.038);
    float gridHi = max(step(0.92, fx), step(0.92, fy)) * 0.42;

    vec3 accentSoft = mix(uAccent, vec3(1.0), 0.08);
    vec3 glowCore = accentSoft * voxelShade * cellHash * (4.2 + inBand * 8.5) * pulse;
    vec3 rim = accentSoft * inBand * (1.55 + haloBand * 0.7);
    vec3 rgb = baseDark * cover + glowCore * inBand * max(cover, 0.12);
    rgb += rim * inBand * (1.0 - cover) * 0.58;
    rgb += accentSoft * pow(inBand, 1.35) * 1.35;
    rgb += accentSoft * pow(max(inBand, 0.00001), 0.45) * haloBand * 1.1;
    rgb += accentSoft * vec3(0.45, 0.72, 1.0) * pow(haloBand, 2.5) * 0.35;
    rgb = min(rgb, vec3(4.2));
    rgb *= (1.0 - gridHi * 0.12);

    float aWave = clamp(max(cover * 0.998, max(inBand * 0.98, haloBand * 0.55)), 0.0, 0.7);

    vec2 q = vUv * 2.0 - 1.0;
    float radial = length(q);
    float outer = pow(smoothstep(0.08, 1.0, radial), 0.85);
    float env = smoothstep(0.0, 0.1, p) * smoothstep(1.0, 0.9, p);
    float veilA = clamp(outer * env * 0.72, 0.0, 0.0);
    vec3 veilRgb = vec3(0.0);

    float outA = veilA + aWave * (1.0 - veilA);
    vec3 outRgb = (veilRgb * veilA + rgb * aWave * (1.0 - veilA)) / max(outA, 0.00001);

    float tailFade = 1.0 - smoothstep(0.34, 0.97, p);
    outA *= tailFade;

    gl_FragColor = vec4(outRgb, outA);
  }
`;

function SyncGlSize({ width, height }: { width: number; height: number }) {
  const setSize = useThree((s) => s.setSize);
  useEffect(() => {
    setSize(width, height, false);
  }, [width, height, setSize]);
  return null;
}

function WaveScene({
  runId,
  durationMs,
  direction,
  accentHex,
  onMid,
  onEnd,
}: {
  runId: number;
  durationMs: number;
  direction: number;
  accentHex: string;
  onMid: () => void;
  onEnd: () => void;
}) {
  const matRef = useRef(null);
  const midFired = useRef(false);
  const endFired = useRef(false);
  const t0 = useRef(0);
  const lastRunId = useRef(-1);
  const gl = useThree((s) => s.gl);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uDirection: { value: 1 },
      uTime: { value: 0 },
      uGrid: { value: PIXEL_WAVE_GRID_CELLS },
      uBand: { value: PIXEL_WAVE_BAND },
      uHalo: { value: PIXEL_WAVE_HALO },
      uAccent: { value: new THREE.Color("#50c878") },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uAccent.value.set(
      accentHex.startsWith("#") ? accentHex : `#${accentHex}`,
    );
  }, [accentHex, runId, uniforms]);

  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true, true);
  }, [runId, gl]);

  useFrame((state) => {
    if (lastRunId.current !== runId) {
      lastRunId.current = runId;
      t0.current = performance.now();
      midFired.current = false;
      endFired.current = false;
    }
    const mat = matRef.current;
    if (!mat) return;
    const elapsed = performance.now() - t0.current;
    const p = Math.min(1, elapsed / durationMs);
    mat.uniforms.uProgress.value = p;
    mat.uniforms.uDirection.value = direction;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    if (p >= 0.5 && !midFired.current) {
      midFired.current = true;
      onMid();
    }
    if (p >= 1 && !endFired.current) {
      endFired.current = true;
      onEnd();
    }
  });

  return (
    <>
      <orthographicCamera
        makeDefault
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={0.1}
        far={100}
        position={[0, 0, 10]}
      />
      <mesh position={[0, 0, 0]} frustumCulled={false} renderOrder={1000}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={matRef}
          attach="material"
          key={runId}
          transparent
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          blending={THREE.NormalBlending}
          premultipliedAlpha={false}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
}

function readViewportCssSize() {
  if (typeof window === "undefined") return { w: 1, h: 1 };
  const vv = window.visualViewport;
  return {
    w: Math.max(1, Math.round(vv?.width ?? window.innerWidth)),
    h: Math.max(1, Math.round(vv?.height ?? window.innerHeight)),
  };
}

function useViewportCssSize() {
  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? { w: 1, h: 1 } : readViewportCssSize(),
  );
  useEffect(() => {
    const apply = () => setSize(readViewportCssSize());
    apply();
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, []);
  return size;
}

type PixelWaveTransitionProps = {
  runId: number;
  active: boolean;
  direction: 1 | -1;
  accentHex: string;
  durationMs: number;
  onMid: () => void;
  onEnd: () => void;
};

/** When `active` is false, skip hooks that subscribe to resize/visualViewport (avoids idle setState churn). */
export function PixelWaveTransition(props: PixelWaveTransitionProps) {
  if (!props.active || typeof document === "undefined") return null;
  return <PixelWaveTransitionActive {...props} />;
}

function PixelWaveTransitionActive({
  runId,
  direction,
  accentHex,
  durationMs,
  onMid,
  onEnd,
}: PixelWaveTransitionProps) {
  const vp = useViewportCssSize();

  const wPx = vp.w;
  const hPx = vp.h;

  /** Body portal avoids Layout's z-10 stacking context. Explicit px size so R3F useMeasure never sees 0×0 or vw/vh rounding bugs. */
  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: wPx,
        height: hPx,
        margin: 0,
        padding: 0,
        zIndex: 100010,
        overflow: "hidden",
      }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        resize={{ debounce: 0, scroll: false }}
        onCreated={({ gl, setSize }) => {
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          setSize(wPx, hPx, false);
        }}
        style={{
          display: "block",
          width: wPx,
          height: hPx,
          touchAction: "none",
        }}
        dpr={[1, 2]}
        frameloop="always"
        camera={{ position: [0, 0, 0.2] }}
      >
        <SyncGlSize width={wPx} height={hPx} />
        <WaveScene
          runId={runId}
          durationMs={durationMs}
          direction={direction}
          accentHex={accentHex}
          onMid={onMid}
          onEnd={onEnd}
        />
      </Canvas>
    </div>,
    document.body,
  );
}
