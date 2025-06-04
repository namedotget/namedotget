//@ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
export function HeroScene({ lightMode }: any) {
  const { camera } = useThree();
  const meshRef = useRef();
  const spotRef = useRef();
  const mouseLightRef = useRef();
  const backgroundRef = useRef();
  const waterMatRef = useRef();

  const uniforms = {
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(-10, -10) },
    u_color: {
      value: new THREE.Color(lightMode ? "#50C878" : "#1e1e1e"),
    },
  };

  useEffect(() => {
    uniforms.u_color.value.set(lightMode ? "#50C878" : "#1e1e1e");
  }, [lightMode]);

  function lightFollowMouse(e) {
    //return if mobile
    if (window.innerWidth < 768) return;
    const mouseLight = mouseLightRef.current as THREE.PointLight;
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(backgroundRef.current);
    if (intersects.length > 0) {
      const { x, y } = intersects[0].point;
      mouseLight.position.set(x, y, 2);
      if (waterMatRef.current && intersects[0].uv) {
        waterMatRef.current.uniforms.u_mouse.value = intersects[0].uv;
      }
    }
  }

  useEffect(() => {
    window.addEventListener("mousemove", lightFollowMouse);
    return () => window.removeEventListener("mousemove", lightFollowMouse);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      const speed = 0.005 + (0.01 * window.scrollY) / 500;

      // box1
      meshRef.current.rotation.x += speed;
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = -window.scrollY / 500;
      camera.position.z = 5 + window.scrollY / 900;
      spotRef.current.position.z = -3 + window.scrollY / 110;
      spotRef.current.position.y = -window.scrollY / 150;
    }
    if (waterMatRef.current) {
      waterMatRef.current.uniforms.u_time.value += 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.95} />
      <pointLight
        position={[0, 0, 2]}
        intensity={lightMode ? 5 : 100}
        ref={mouseLightRef}
        color={"white"}
      />
      <spotLight
        ref={spotRef}
        position={[0, 0, 10]}
        penumbra={0.75}
        intensity={150}
        scale={2}
        color={lightMode ? "lime" : "white"}
      />
      <mesh position={[0, 0, -1]} ref={backgroundRef}>
        <planeGeometry args={[100, 100, 200, 200]} />
        <shaderMaterial
          ref={waterMatRef}
          vertexShader={`
            uniform float u_time;
            uniform vec2 u_mouse;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              vec3 pos = position;
              float dist = distance(uv, u_mouse);
              pos.z += sin(dist * 40.0 - u_time * 5.0) * 0.2 / (dist * 40.0 + 1.0);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec3 u_color;
            varying vec2 vUv;
            void main() {
              float dist = distance(vUv, u_mouse);
              float ripple = sin(dist * 40.0 - u_time * 5.0) * 0.5 + 0.5;
              vec3 color = u_color * (0.8 + 0.2 * ripple);
              gl_FragColor = vec4(color, 1.0);
            }
          `}
          uniforms={uniforms}
        />
      </mesh>

      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={lightMode ? "#50C878" : "#1e1e1e"}
          roughness={10}
        />
      </mesh>

      <fog attach="fog" args={["#ffffff", 0, 15]} />
    </>
  );
}
