import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function BackgroundScroll({
  lightMode,
  audioActive,
  onReady,
}: {
  lightMode: boolean;
  audioActive: boolean;
  onReady?: () => void;
}) {
  const hasCalledReady = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      if (!hasCalledReady.current && onReadyRef.current) {
        hasCalledReady.current = true;
        onReadyRef.current();
      }
    }, 1200);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-[-2] w-screen h-screen"
        style={{
          backgroundColor: "#0a0a0d",
        }}
      >
        <Canvas
          flat
          dpr={[1, 2]}
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            stencil: false,
            alpha: false,
          }}
          onCreated={({ gl, scene, camera }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            if (typeof gl.compile === "function") {
              gl.compile(scene, camera);
            }
            const signalReady = () => {
              if (!hasCalledReady.current && onReadyRef.current) {
                hasCalledReady.current = true;
                onReadyRef.current();
              }
            };
            requestAnimationFrame(() => requestAnimationFrame(signalReady));
          }}
        >
          <HeroScene lightMode={lightMode} audioActive={audioActive} />
        </Canvas>
      </div>
    </>
  );
}
