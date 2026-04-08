//@ts-nocheck
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useImperativeHandle } from "react";
import * as THREE from "three";

const WireWallShaderMaterial = shaderMaterial(
  {
    uFlow: 0,
    uModeBlend: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec4 vScreenPos;
    
    void main() {
      vUv = uv;
      vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vScreenPos = pos;
      gl_Position = pos;
    }
  `,
  // Fragment Shader
  `
    uniform float uFlow;
    uniform float uModeBlend;
    
    varying vec2 vUv;
    varying vec4 vScreenPos;

    float wirePulse(float flow, float spatial, float phase) {
      float u = sin(spatial - flow + phase) * 0.5 + 0.5;
      return mix(0.22, 1.0, u * u);
    }
    
    // Horizontal wire with glow and soft ends
    float wire(vec2 uv, float y, float xStart, float xEnd, float flow, float spatialMul, float phase) {
      float dist = abs(uv.y - y);
      
      // Soft fade at ends
      float fadeWidth = 0.08;
      float startFade = smoothstep(xStart, xStart + fadeWidth, uv.x);
      float endFade = smoothstep(xEnd, xEnd - fadeWidth, uv.x);
      float edgeFade = startFade * endFade;
      
      // Skinny wire core
      float core = smoothstep(0.002, 0.0008, dist);
      
      // Subtle glow falloff
      float glow = smoothstep(0.025, 0.0, dist);
      
      float pulse = wirePulse(flow, uv.x * spatialMul, phase);
      
      return (glow * pulse * 0.5 + core * 0.3) * edgeFade;
    }
    
    // Vertical wire with glow and soft ends
    float wireV(vec2 uv, float x, float yStart, float yEnd, float flow, float spatialMul, float phase) {
      float dist = abs(uv.x - x);
      
      // Soft fade at ends
      float fadeWidth = 0.08;
      float startFade = smoothstep(yStart, yStart + fadeWidth, uv.y);
      float endFade = smoothstep(yEnd, yEnd - fadeWidth, uv.y);
      float edgeFade = startFade * endFade;
      
      // Skinny wire core
      float core = smoothstep(0.0015, 0.0005, dist);
      
      // Subtle glow falloff
      float glow = smoothstep(0.02, 0.0, dist);
      
      float pulse = wirePulse(flow, uv.y * spatialMul, phase);
      
      return (glow * pulse * 0.5 + core * 0.3) * edgeFade;
    }
    
    void main() {
      // Screen-space UV
      vec2 uv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
      
      vec3 baseColor = vec3(10.0 / 255.0, 10.0 / 255.0, 13.0 / 255.0);
      vec3 metal = baseColor * (0.992 + uv.y * 0.012);
      
      // === WIRE NETWORK (realistic cable routing) ===
      float totalGlow = 0.0;
      
      // Top cable run (horizontal bus along top)
      totalGlow += wire(uv, 0.92, 0.0, 0.7, uFlow, 7.9, 0.0);
      totalGlow += wire(uv, 0.88, 0.0, 0.5, uFlow, 8.55, 1.12);
      
      // Bottom cable run (horizontal bus along bottom)
      totalGlow += wire(uv, 0.08, 0.3, 1.0, uFlow, 7.45, 2.08);
      totalGlow += wire(uv, 0.12, 0.4, 1.0, uFlow, 8.95, 3.21);
      
      // Mid horizontal (data bus)
      totalGlow += wire(uv, 0.5, 0.1, 0.9, uFlow, 8.1, 4.02);
      
      // Vertical drops (fewer segments = cheaper fullscreen FS)
      totalGlow += wireV(uv, 0.22, 0.5, 0.92, uFlow, 9.35, 0.58);
      totalGlow += wireV(uv, 0.55, 0.5, 0.88, uFlow, 10.2, 1.48);
      totalGlow += wireV(uv, 0.72, 0.12, 0.5, uFlow, 9.05, 4.41);
      totalGlow += wireV(uv, 0.05, 0.2, 0.8, uFlow, 10.65, 5.02);
      
      float vis = tanh(totalGlow * 0.34);
      
      vec3 glowDark = vec3(0.314, 0.784, 0.471);
      vec3 glowLight = vec3(0.07, 0.3, 0.24);
      vec3 glowColor = mix(glowDark, glowLight, uModeBlend);
      
      // Single mix avoids RGB > 1 and driver clamp pops from mix + add.
      vec3 color = mix(metal, glowColor, vis * 0.88);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ WireWallShaderMaterial });

const MODE_BLEND_LAMBDA = 10;
const TAU = Math.PI * 2;
/** rad/s; matches former ~1.6 multipliers, phase advanced in JS so sin() never sees huge floats. */
const FLOW_OMEGA = 1.62;

export const WireWall = forwardRef(function WireWall(
  { lightMode }: { lightMode: boolean },
  ref,
) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const modeBlend = useRef(lightMode ? 1 : 0);
  const flowPhaseRef = useRef(0);

  useImperativeHandle(ref, () => materialRef.current);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const dt = Math.min(delta, 0.1);
    const target = lightMode ? 1 : 0;
    const t = 1 - Math.exp(-MODE_BLEND_LAMBDA * dt);
    modeBlend.current = THREE.MathUtils.lerp(modeBlend.current, target, t);
    flowPhaseRef.current += dt * FLOW_OMEGA;
    flowPhaseRef.current = THREE.MathUtils.euclideanModulo(
      flowPhaseRef.current,
      TAU,
    );
    materialRef.current.uniforms.uFlow.value = flowPhaseRef.current;
    materialRef.current.uniforms.uModeBlend.value = modeBlend.current;
  });

  return <wireWallShaderMaterial ref={materialRef} />;
});
