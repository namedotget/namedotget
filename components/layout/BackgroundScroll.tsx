import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export default function BackgroundScroll({
  lightMode,
  audioData,
  isPlaying,
  onReady,
  onStartMusic,
}: {
  lightMode: boolean;
  audioData: Uint8Array;
  isPlaying: boolean;
  onReady?: () => void;
  onStartMusic: () => void;
}) {
  const router = useRouter();
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
          backgroundColor: lightMode ? "#383a42" : "#0a0a0d",
        }}
      >
        <Canvas flat shadows>
          <HeroScene lightMode={lightMode} audioData={audioData} />
        </Canvas>
      </div>
      <div className="flex flex-col h-[100vh]">
        <div className="w-full flex flex-col items-center px-4 md:px-0">
          <button
            className="text-[180%] md:text-[300%] font-bold text-center mt-6 md:mt-8 font-sans"
            onClick={() => router.push("/")}
          >
            <span className="px-1.5 md:px-2 bg-[#50C878]">name</span>.get
          </button>
          <p className="text-xs md:text-sm opacity-80 mt-2 md:mt-3 tracking-wide text-center">
            Full-Stack Engineer / AI Systems / Web3 / Founder
          </p>
          <p className="text-xs md:text-sm max-w-sm md:max-w-md text-center mt-3 md:mt-4 opacity-70 leading-relaxed">
            I build products end-to-end, from iOS apps to DAOs, from AI
            pipelines to pixel-art worlds, from local hardware clusters to
            planet-scale React apps.
          </p>
        </div>
      </div>
      <button
        onClick={onStartMusic}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-20 font-mono text-sm px-4 py-2 rounded-lg transition-all duration-1000 cursor-pointer hover:scale-105 ${
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
