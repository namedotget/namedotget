//@ts-nocheck
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useImperativeHandle } from "react";
import * as THREE from "three";

const WireWallShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uLightMode: false,
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
    uniform bool uLightMode;
    
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
      
      // === DARK GUNMETAL BASE ===
      vec3 baseColor = uLightMode ? vec3(0.22, 0.23, 0.26) : vec3(0.04, 0.04, 0.05);
      
      // Subtle horizontal brushed texture
      float brush = fract(sin(uv.y * 800.0) * 43758.5453);
      brush = brush * 0.012;
      vec3 metal = baseColor + vec3(brush);
      
      // Very subtle vertical gradient
      metal *= 0.97 + uv.y * 0.06;
      
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
      
      // === GLOW COLOR ===
      vec3 glowColor = vec3(0.314, 0.784, 0.471); // #50C878
      
      // Apply glow to metal (reduced intensity)
      vec3 color = metal;
      color = mix(color, glowColor, totalGlow * 0.7);
      
      // Reduced bloom contribution
      color += glowColor * totalGlow * 0.35;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ WireWallShaderMaterial });

export const WireWall = forwardRef(function WireWall(
  { lightMode }: { lightMode: boolean },
  ref
) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useImperativeHandle(ref, () => materialRef.current);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uLightMode.value = lightMode;
    }
  });

  return <wireWallShaderMaterial ref={materialRef} />;
});
