import { HeroScene } from "@/r3f/HeroScene";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/router";

export function BackgroundScroll({ lightMode }: any) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-[100vh]">
      <div className="w-full flex justify-center">
        <button
          className="text-[300%] font-bold text-center mt-8"
          onClick={() => router.push("/")}
        >
          <span className="px-2 bg-[#50C878]">name</span>.get
        </button>
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
