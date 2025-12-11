//@ts-nocheck
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Simplex noise for fluid effect
const noise3D = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const FluidMaterial = shaderMaterial(
  {
    uTime: 0,
    uVelocity: 0,
    uDirection: 1,
    uBallX: 0,
    uLightMode: true,
    uColor: new THREE.Color("#181818"),
    uEmissive: new THREE.Color("#1a5040"),
  },
  // Vertex shader
  `
    uniform float uTime;
    uniform float uVelocity;
    uniform float uDirection;
    uniform float uBallX;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    ${noise3D}
    
    void main() {
      vNormal = normal;
      vPosition = position;
      
      vec3 pos = position;
      
      // Idle wobble
      float idleWobble = snoise(pos * 3.0 + uTime * 0.8) * 0.005;
      
      // Velocity-based slosh (trailing behind movement direction)
      float velocityEffect = abs(uVelocity) * 5.0;
      float sloshPhase = uTime * 4.0 + pos.x * uDirection * 3.0;
      float slosh = sin(sloshPhase) * velocityEffect * 0.15;
      
      // Secondary wave for more organic movement
      float secondaryWave = sin(uTime * 6.0 + pos.y * 4.0) * velocityEffect * 0.06;
      slosh += secondaryWave;
      
      // Directional squash/stretch
      float stretch = 1.0 + velocityEffect * 0.25;
      float squash = 1.0 - velocityEffect * 0.15;
      pos.x *= stretch;
      pos.y *= squash;
      pos.z *= squash;
      
      // Apply noise displacement along normal
      float displacement = idleWobble + slosh;
      pos += normal * displacement;
      
      // Clamp to stay within capsule bounds
      // Capsule radius = 0.18, we use 0.155 for margin
      // Ball center moves between -0.35 and 0.35
      float maxRadius = 0.155;
      float localX = pos.x;
      float localYZ = length(pos.yz);
      
      // Clamp YZ radius
      if (localYZ > maxRadius) {
        pos.yz = normalize(pos.yz) * maxRadius;
      }
      
      // Clamp X within capsule (half-length is ~0.53 from center)
      float maxX = 0.50 - uBallX * uDirection * 0.1;
      pos.x = clamp(pos.x, -0.18, 0.18);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      vNormal = normalMatrix * normal;
      vPosition = pos;
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform bool uLightMode;
    uniform vec3 uColor;
    uniform vec3 uEmissive;
    uniform float uVelocity;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      // Fresnel for rim glow
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
      
      // Pulsing glow
      float pulse = sin(uTime * 2.0) * 0.2 + 1.0;
      float velocityGlow = abs(uVelocity) * 1.5;
      
      vec3 ambient = uColor * 0.4;
      vec3 diffuse = uColor * diff * 0.6;
      vec3 emissiveColor = uEmissive * (2.0 + fresnel * 1.5 + velocityGlow) * pulse;
      
      vec3 finalColor = ambient + diffuse + emissiveColor;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ FluidMaterial });

function FluidBall({
  position,
  velocity,
  direction,
  lightMode,
}: {
  position: number;
  velocity: number;
  direction: number;
  lightMode: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>();
  const materialRef = useRef<any>();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uVelocity = velocity;
      materialRef.current.uDirection = direction;
      materialRef.current.uBallX = position;
      materialRef.current.uLightMode = lightMode;
      materialRef.current.uColor = lightMode
        ? new THREE.Color("#1a1a1a")
        : new THREE.Color("#0e0e0e");
      materialRef.current.uEmissive = lightMode
        ? new THREE.Color("#2a8065")
        : new THREE.Color("#18c050");
    }
  });

  return (
    <mesh ref={meshRef} position={[position, 0, 0.08]}>
      <sphereGeometry args={[0.17, 64, 64]} />
      <fluidMaterial ref={materialRef} />
    </mesh>
  );
}

function ToggleScene({
  lightMode,
  setLightMode,
}: {
  lightMode: boolean;
  setLightMode: (value: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>();
  const trackMaterialRef = useRef<THREE.MeshStandardMaterial>();

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [ballPosition, setBallPosition] = useState(lightMode ? -0.35 : 0.35);
  const [velocity, setVelocity] = useState(0);
  const [scale, setScale] = useState(1);

  const targetPosition = lightMode ? -0.35 : 0.35;
  const direction = lightMode ? -1 : 1;

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Ball slide animation with velocity tracking
    const prevPos = ballPosition;
    const newPos = THREE.MathUtils.lerp(ballPosition, targetPosition, 0.04);
    const newVelocity = newPos - prevPos;
    setBallPosition(newPos);
    setVelocity(newVelocity);

    // Click bounce animation
    const targetScale = clicked ? 1.12 : hovered ? 1.04 : 1;
    const newScale = THREE.MathUtils.lerp(scale, targetScale, 0.15);
    setScale(newScale);
    if (clicked && Math.abs(newScale - 1.12) < 0.01) {
      setClicked(false);
    }

    // Subtle group tilt on hover
    if (groupRef.current) {
      const tiltX = hovered ? Math.sin(time * 2) * 0.03 : 0;
      const tiltY = hovered ? Math.cos(time * 2) * 0.03 : 0;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        tiltX,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        tiltY,
        0.1
      );
      groupRef.current.scale.setScalar(newScale);
    }

    // Track glow
    if (trackMaterialRef.current) {
      const trackPulse = Math.sin(time * 1.5) * 0.1 + 1;
      const trackGlow = (hovered ? 0.5 : 0.2) * trackPulse;
      if (lightMode) {
        trackMaterialRef.current.emissive.setRGB(
          0.03 * trackGlow,
          0.12 * trackGlow,
          0.08 * trackGlow
        );
      } else {
        trackMaterialRef.current.emissive.setRGB(
          0.02 * trackGlow,
          0.08 * trackGlow,
          0.05 * trackGlow
        );
      }
    }
  });

  const handleClick = () => {
    setClicked(true);
    setLightMode(!lightMode);
    localStorage.setItem("lightMode", JSON.stringify(!lightMode));
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 3]} intensity={1.2} />
      <pointLight
        position={[0, 0, 2]}
        intensity={1.8}
        color={lightMode ? "#50c8a0" : "#308060"}
        distance={5}
      />

      <group
        ref={groupRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={handleClick}
      >
        {/* Track */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
          <meshStandardMaterial
            ref={trackMaterialRef}
            color={lightMode ? "#0c0c0c" : "#060606"}
            emissive="#0a2018"
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>

        {/* Fluid ball */}
        <FluidBall
          position={ballPosition}
          velocity={velocity}
          direction={direction}
          lightMode={lightMode}
        />
      </group>

      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.05}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function ToggleMesh({
  lightMode,
  setLightMode,
}: {
  lightMode: boolean;
  setLightMode: (value: boolean) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = isMobile ? 160 : 220;
  const height = isMobile ? 80 : 120;

  return (
    <div
      className="fixed"
      style={{
        top: isMobile ? -10 : -20,
        right: isMobile ? -30 : -40,
        width,
        height,
        zIndex: 99999,
      }}
    >
      <Canvas
        flat
        camera={{ position: [0, 0, 1.2], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <ToggleScene lightMode={lightMode} setLightMode={setLightMode} />
      </Canvas>
    </div>
  );
}
