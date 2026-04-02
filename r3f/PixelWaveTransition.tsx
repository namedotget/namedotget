//@ts-nocheck
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

import { PIXEL_WAVE_GRID_CELLS, PIXEL_WAVE_BAND } from "@/lib/pixelWaveConfig";

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
  uniform vec3 uAccent;
  varying vec2 vUv;

  void main() {
    float x = vUv.x;
    float y = vUv.y;
    float xw = mix(1.0 - x, x, step(0.0, uDirection));

    float cellY = floor(y * uGrid);
    float cellX = floor(x * uGrid);
    float ripple =
      sin(cellY * 0.31 + uTime * 5.0) * 0.038
      + sin(cellX * 0.12 + cellY * 0.21 + uTime * 2.6) * 0.018;

    float p = clamp(uProgress, 0.0, 1.0);
    float edge;
    float cover;

    if (p < 0.5) {
      float t = p * 2.0;
      edge = 1.0 - t + ripple;
      cover = step(edge, xw);
    } else {
      float t = (p - 0.5) * 2.0;
      edge = t + ripple;
      cover = step(edge, xw);
    }

    float dist = abs(xw - edge);
    float inBand = 1.0 - smoothstep(0.0, uBand + 0.012, dist);

    float fx = fract(x * uGrid);
    float fy = fract(y * uGrid);
    float voxelShade =
      mix(0.5, 1.0, fx) * mix(0.62, 1.0, 1.0 - abs(fy - 0.5) * 2.0);

    vec3 baseDark = vec3(0.039, 0.039, 0.051);
    float gridHi = max(step(0.94, fx), step(0.94, fy)) * 0.35;

    vec3 glowCore = uAccent * voxelShade * (3.5 + inBand * 5.0);
    vec3 rim = uAccent * inBand * 1.4;
    vec3 rgb = baseDark * cover + glowCore * inBand * max(cover, 0.15);
    rgb += rim * inBand * (1.0 - cover) * 0.45;
    rgb += uAccent * pow(inBand, 2.0) * 0.85;
    rgb = min(rgb, vec3(3.0));
    rgb *= (1.0 - gridHi * 0.15);

    float alpha = clamp(max(cover * 0.995, inBand * 0.95), 0.0, 1.0);
    gl_FragColor = vec4(rgb, alpha);
  }
`;

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
  const { gl } = useThree();

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uDirection: { value: 1 },
      uTime: { value: 0 },
      uGrid: { value: PIXEL_WAVE_GRID_CELLS },
      uBand: { value: PIXEL_WAVE_BAND },
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
        <planeGeometry args={[2, 2]} />
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

export function PixelWaveTransition({
  runId,
  active,
  direction,
  accentHex,
  durationMs,
  onMid,
  onEnd,
}: {
  runId: number;
  active: boolean;
  direction: 1 | -1;
  accentHex: string;
  durationMs: number;
  onMid: () => void;
  onEnd: () => void;
}) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90000]"
      aria-hidden
      style={{ isolation: "isolate" }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <WaveScene
          runId={runId}
          durationMs={durationMs}
          direction={direction}
          accentHex={accentHex}
          onMid={onMid}
          onEnd={onEnd}
        />
      </Canvas>
    </div>
  );
}
