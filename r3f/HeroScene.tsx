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
  });

  return (
    <>
      <ambientLight intensity={0.95} />
      <pointLight
        position={[0, 0, 2]}
        intensity={lightMode ? 10 : 100}
        ref={mouseLightRef}
        color={"white"}
        scale={0.1}
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
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={lightMode ? "#50C878" : "#1e1e1e"} />
      </mesh>

      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={lightMode ? "#50C878" : "#1e1e1e"} />
      </mesh>

      <fog attach="fog" args={["#ffffff", 0, 15]} />
    </>
  );
}
