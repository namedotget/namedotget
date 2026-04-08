import { Toaster } from "react-hot-toast";
import { createContext, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Footer } from "./Footer";
import { useAudioAnalyzer } from "@/lib/useAudioAnalyzer";
import { LoadingScreen } from "@/components/LoadingScreen";

/** Mirrors `body.light-mode` for consumers that should not depend on DOM mutation observers. */
export const LightModeContext = createContext(true);

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

function MusicButton({
  isPlaying,
  onStartMusic,
}: {
  isPlaying: boolean;
  onStartMusic: () => void;
}) {
  return (
    <div
      className={[
        "pointer-events-auto max-w-[min(calc(100vw-5rem),22rem)] transition-opacity duration-1000",
        isPlaying ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      role="region"
      aria-label="Background audio"
      style={{
        background: "rgba(0, 0, 0, 0.42)",
        backdropFilter: "blur(16px) saturate(120%)",
        WebkitBackdropFilter: "blur(16px) saturate(120%)",
        border: "1px solid rgba(80, 200, 120, 0.26)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.42), inset 0 1px 0 rgba(130, 235, 185, 0.12)",
      }}
    >
      <button
        type="button"
        onClick={onStartMusic}
        aria-label="Start background music"
        className="home-text-xf flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--home-text-accent)_88%,#c8c8c8)] transition-[transform,color] duration-300 hover:text-[var(--home-text-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--home-text-accent)] active:scale-[0.98] md:px-5 md:py-3 md:text-sm md:tracking-[0.14em]"
      >
        <span className="text-[var(--home-text-accent)]" aria-hidden>
          {">"}
        </span>
        <span className="motion-safe:animate-pulse text-[var(--home-text-accent)]">
          music
        </span>
      </button>
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
    <LightModeContext.Provider value={lightMode}>
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
          !isPlaying ? "pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]" : "",
        ].join(" ")}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {children}
          {router.pathname !== "/" && <Footer />}
        </div>
      </div>
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[92000] flex justify-center px-4"
        style={{
          paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <MusicButton isPlaying={isPlaying} onStartMusic={startAudio} />
      </div>
      <Toaster
        position="bottom-center"
        containerStyle={{
          bottom:
            "max(5.25rem, calc(4.25rem + env(safe-area-inset-bottom, 0px)))",
        }}
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
    </LightModeContext.Provider>
  );
}
