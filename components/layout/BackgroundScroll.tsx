import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function BackgroundScroll({
  lightMode,
  audioData,
  audioActive,
  onReady,
}: {
  lightMode: boolean;
  audioData: Uint8Array;
  audioActive: boolean;
  onReady?: () => void;
}) {
  const hasCalledReady = useRef(false);

  useEffect(() => {
    if (!hasCalledReady.current && onReady) {
      // Small delay to allow canvas to fully render
      const timer = setTimeout(() => {
        hasCalledReady.current = true;
        onReady();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [onReady]);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-[-2] w-screen h-screen"
        style={{
          backgroundColor: "#0a0a0d",
        }}
      >
        <Canvas flat shadows>
          <HeroScene
            lightMode={lightMode}
            audioData={audioData}
            audioActive={audioActive}
          />
        </Canvas>
      </div>
    </>
  );
}
