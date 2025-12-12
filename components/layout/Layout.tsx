import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Footer } from "./Footer";
import { useAudioAnalyzer } from "@/lib/useAudioAnalyzer";
import { LoadingScreen } from "@/components/LoadingScreen";

const BackgroundScroll = dynamic(
  () => import("./BackgroundScroll").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => null,
  }
);

const ToggleMesh = dynamic(
  () => import("@/r3f/ToggleMesh").then((mod) => mod.ToggleMesh),
  { ssr: false, loading: () => null }
);

export function Layout({ children }: any) {
  const [lightMode, setLightMode] = useState(true);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const { audioData, isPlaying, isMuted, startAudio, toggleMute } =
    useAudioAnalyzer();

  useEffect(() => {
    const storedLightMode = JSON.parse(
      localStorage.getItem("lightMode") as string
    );
    if (storedLightMode != null) setLightMode(storedLightMode);
  }, []);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, [lightMode]);

  return (
    <>
      <LoadingScreen isLoaded={isCanvasReady} />
      <BackgroundScroll
        lightMode={lightMode}
        audioData={audioData}
        isPlaying={isPlaying}
        onReady={() => setIsCanvasReady(true)}
        onStartMusic={startAudio}
      />
      <ToggleMesh lightMode={lightMode} setLightMode={setLightMode} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className={`fixed top-[17px] right-[115px] md:top-[22px] md:right-[160px] z-[99999] w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
          isPlaying
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4 pointer-events-none"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(80, 200, 120, 0.3)",
        }}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#50C878"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 md:w-5 md:h-5"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#50C878"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 md:w-5 md:h-5"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
      {children}
      <Footer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(29, 29, 29, 0.95)",
            backdropFilter: "blur(10px)",
            color: "#e8e8e8",
            border: "1px solid rgba(80, 200, 120, 0.2)",
            borderRadius: "8px",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#50C878",
              secondary: "#1d1d1d",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#1d1d1d",
            },
            style: {
              border: "1px solid rgba(239, 68, 68, 0.2)",
            },
          },
        }}
      />
    </>
  );
}
