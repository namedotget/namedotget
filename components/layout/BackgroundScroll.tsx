import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function BackgroundScroll({
  lightMode,
  audioData,
  audioActive,
  isPlaying,
  onReady,
  onStartMusic,
}: {
  lightMode: boolean;
  audioData: Uint8Array;
  audioActive: boolean;
  isPlaying: boolean;
  onReady?: () => void;
  onStartMusic: () => void;
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
      <button
        onClick={onStartMusic}
        className={`fixed bottom-8 md:bottom-4 left-1/2 -translate-x-1/2 z-20 font-mono text-sm px-4 py-2 rounded-lg transition-all duration-1000 cursor-pointer hover:scale-105 ${
          isPlaying
            ? "opacity-0 pointer-events-none translate-y-4"
            : "opacity-100"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(80, 200, 120, 0.3)",
        }}
      >
        <span className="text-ndgGreen">{">"}</span>
        <span className="ml-2 text-[#c0c0c0] text-sm">click 4 </span>
        <span className="ml-1 animate-pulse text-ndgGreen text-sm">music</span>
      </button>
    </>
  );
}
