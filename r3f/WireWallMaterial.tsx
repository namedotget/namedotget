//@ts-nocheck
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useImperativeHandle } from "react";
import * as THREE from "three";

const WireWallShaderMaterial = shaderMaterial(
  {
    uTime: 0,
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
    uniform float uTime;
    uniform float uModeBlend;
    
    varying vec2 vUv;
    varying vec4 vScreenPos;
    
    // Horizontal wire with glow and soft ends
    float wire(vec2 uv, float y, float xStart, float xEnd, float time, float speed, float phase) {
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
      
      // Animated pulse
      float pulse = sin(uv.x * 8.0 - time * speed + phase) * 0.5 + 0.5;
      pulse = pow(pulse, 6.0);
      
      return (glow * pulse * 0.5 + core * 0.3) * edgeFade;
    }
    
    // Vertical wire with glow and soft ends
    float wireV(vec2 uv, float x, float yStart, float yEnd, float time, float speed, float phase) {
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
      
      // Animated pulse
      float pulse = sin(uv.y * 10.0 - time * speed + phase) * 0.5 + 0.5;
      pulse = pow(pulse, 6.0);
      
      return (glow * pulse * 0.5 + core * 0.3) * edgeFade;
    }
    
    void main() {
      // Screen-space UV
      vec2 uv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
      
      vec3 baseColor = vec3(10.0 / 255.0, 10.0 / 255.0, 13.0 / 255.0);
      
      float brush = fract(sin(uv.y * 800.0) * 43758.5453);
      brush = brush * 0.0015;
      vec3 metal = baseColor + vec3(brush);
      
      metal *= 0.992 + uv.y * 0.012;
      
      // === WIRE NETWORK (realistic cable routing) ===
      float totalGlow = 0.0;
      
      // Top cable run (horizontal bus along top)
      totalGlow += wire(uv, 0.92, 0.0, 0.7, uTime, 1.8, 0.0);
      totalGlow += wire(uv, 0.88, 0.0, 0.5, uTime, 2.0, 1.0);
      
      // Bottom cable run (horizontal bus along bottom)
      totalGlow += wire(uv, 0.08, 0.3, 1.0, uTime, 1.6, 2.0);
      totalGlow += wire(uv, 0.12, 0.4, 1.0, uTime, 2.2, 3.0);
      
      // Mid horizontal (data bus)
      totalGlow += wire(uv, 0.5, 0.1, 0.9, uTime, 1.4, 4.0);
      
      // Vertical drops from top bus
      totalGlow += wireV(uv, 0.18, 0.5, 0.92, uTime, 2.0, 0.5);
      totalGlow += wireV(uv, 0.42, 0.5, 0.88, uTime, 1.7, 1.5);
      totalGlow += wireV(uv, 0.65, 0.5, 0.92, uTime, 2.3, 2.5);
      
      // Vertical risers from bottom bus
      totalGlow += wireV(uv, 0.55, 0.08, 0.5, uTime, 1.9, 3.5);
      totalGlow += wireV(uv, 0.78, 0.12, 0.5, uTime, 2.1, 4.5);
      
      // Edge runs
      totalGlow += wireV(uv, 0.05, 0.2, 0.8, uTime, 1.5, 5.0);
      totalGlow += wireV(uv, 0.95, 0.3, 0.9, uTime, 1.8, 5.5);
      
      // Clamp glow
      totalGlow = clamp(totalGlow, 0.0, 1.0);
      
      vec3 glowDark = vec3(0.314, 0.784, 0.471);
      vec3 glowLight = vec3(0.07, 0.3, 0.24);
      vec3 glowColor = mix(glowDark, glowLight, uModeBlend);
      
      vec3 color = metal;
      color = mix(color, glowColor, totalGlow * 0.7);
      color += glowColor * totalGlow * 0.35;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ WireWallShaderMaterial });

const MODE_BLEND_LAMBDA = 10;

export const WireWall = forwardRef(function WireWall(
  { lightMode }: { lightMode: boolean },
  ref
) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const modeBlend = useRef(lightMode ? 1 : 0);

  useImperativeHandle(ref, () => materialRef.current);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const dt = Math.min(delta, 0.1);
    const target = lightMode ? 1 : 0;
    const t = 1 - Math.exp(-MODE_BLEND_LAMBDA * dt);
    modeBlend.current = THREE.MathUtils.lerp(modeBlend.current, target, t);
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uModeBlend.value = modeBlend.current;
  });

  return <wireWallShaderMaterial ref={materialRef} />;
});
