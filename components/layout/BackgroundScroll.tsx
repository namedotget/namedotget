import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/router";

export function BackgroundScroll({ lightMode }: { lightMode: boolean }) {
  const router = useRouter();
  return (
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
          I build products end-to-end, from iOS apps to DAOs, from AI pipelines
          to pixel-art worlds, from local hardware clusters to planet-scale
          React apps.
        </p>
      </div>
      <div className="fixed top-0 left-0 z-[-2] w-screen h-screen">
        <Canvas flat shadows>
          <HeroScene lightMode={lightMode} />
        </Canvas>
      </div>
      <div className="w-full flex justify-center">
        <button
          className="w-[50px] text-[#00000080] relative top-[70vh] text-4xl"
          onClick={() =>
            window.scroll({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          ↓
        </button>
      </div>
    </div>
  );
}
