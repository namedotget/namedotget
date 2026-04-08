import { Toaster } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Footer } from "./Footer";
import { useAudioAnalyzer } from "@/lib/useAudioAnalyzer";
import { LoadingScreen } from "@/components/LoadingScreen";

const BackgroundScroll = dynamic(
  () => import("./BackgroundScroll").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => null,
  },
);

const ToggleMesh = dynamic(
  () => import("@/r3f/ToggleMesh").then((mod) => mod.ToggleMesh),
  { ssr: false, loading: () => null },
);

function MusicStartStrip({
  isPlaying,
  onStartMusic,
}: {
  isPlaying: boolean;
  onStartMusic: () => void;
}) {
  return (
    <div
      className={[
        "pointer-events-auto w-full border-t border-[rgba(80,200,120,0.22)] bg-[rgba(6,8,10,0.82)] backdrop-blur-md transition-opacity duration-1000",
        isPlaying ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      role="region"
      aria-label="Background audio"
    >
      <div className="mx-auto flex max-w-3xl justify-center px-4 py-2.5 md:py-3">
        <button
          type="button"
          onClick={onStartMusic}
          className="font-mono text-sm text-[#c0c0c0] transition-transform duration-300 hover:scale-[1.02] hover:text-[#e2e2e2]"
        >
          <span className="text-ndgGreen">{">"}</span>
          <span className="ml-2">click 4 </span>
          <span className="ml-1 animate-pulse text-ndgGreen">music</span>
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: any) {
  const router = useRouter();
  const [lightMode, setLightMode] = useState(true);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [mountToggleCanvas, setMountToggleCanvas] = useState(false);
  const { isPlaying, isMuted, startAudio, toggleMute } = useAudioAnalyzer();

  const onBackgroundReady = useCallback(() => {
    setIsCanvasReady(true);
  }, []);

  useEffect(() => {
    const storedLightMode = JSON.parse(
      localStorage.getItem("lightMode") as string,
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

  useEffect(() => {
    if (!isCanvasReady) return;
    let cancelled = false;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(
        () => {
          if (!cancelled) setMountToggleCanvas(true);
        },
        { timeout: 900 },
      );
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const tid = window.setTimeout(() => {
      if (!cancelled) setMountToggleCanvas(true);
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [isCanvasReady]);

  return (
    <>
      <LoadingScreen isLoaded={isCanvasReady} />
      <BackgroundScroll
        lightMode={lightMode}
        audioActive={isPlaying && !isMuted}
        onReady={onBackgroundReady}
      />
      {mountToggleCanvas ? (
        <ToggleMesh lightMode={lightMode} setLightMode={setLightMode} />
      ) : null}
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
      <div
        className={[
          "relative z-10 flex min-h-[100dvh] flex-col",
          !isPlaying ? "pb-[calc(3rem+env(safe-area-inset-bottom,0px))]" : "",
        ].join(" ")}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {children}
          {router.pathname !== "/" && <Footer />}
        </div>
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 z-[92000]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <MusicStartStrip isPlaying={isPlaying} onStartMusic={startAudio} />
      </div>
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
