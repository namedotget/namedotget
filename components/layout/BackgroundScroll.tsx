import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/router";

export function BackgroundScroll({ lightMode }: any) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-[100vh]">
      <div className="w-full flex flex-col items-center">
        <button
          className="text-[300%] font-bold text-center mt-8 font-sans"
          onClick={() => router.push("/")}
        >
          <span className="px-2 bg-[#50C878]">name</span>.get
        </button>
        <p className="text-sm opacity-80 mt-3 tracking-wide">
          Full-Stack Engineer • AI Systems Builder • Web3 &amp; Infra Developer
          • Founder
        </p>
        <p className="text-sm max-w-md text-center mt-4 opacity-70 px-4 leading-relaxed">
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
