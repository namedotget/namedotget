import { HeroScene } from "@/r3f/HeroScene";
import { Physics } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";

export function Hero({ lightMode }: any) {
  return (
    <div className="flex flex-col h-[100vh]">
      <div className="w-full">
        <h1 className="text-[300%] font-bold text-center">
          <span className="px-2 bg-[#50C878]">name</span>.get
        </h1>
        <p className="italic px-1 w-full">digital creator</p>
      </div>
      <div className="fixed top-0 left-0 z-[-2] w-screen h-screen">
        <Canvas flat shadows>
          <HeroScene lightMode={lightMode} />
        </Canvas>
      </div>
      <button
        className="text-[#00000080] relative top-[70vh] text-4xl"
        onClick={() =>
          window.scroll({ top: window.innerHeight, behavior: "smooth" })
        }
      >
        ↓
      </button>
    </div>
  );
}
