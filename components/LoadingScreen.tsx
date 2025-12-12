import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
}

export function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center transition-all duration-500 ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundColor: "#0a0a0d",
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      {/* Animated grid background */}
      <div
        className="absolute inset-0 loading-grid"
        style={{
          backgroundImage: `
            linear-gradient(rgba(80, 200, 120, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(80, 200, 120, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none loading-scanlines"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          )`,
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className="text-[180%] md:text-[300%] font-bold font-sans loading-logo-glow">
          <span
            className="px-1.5 md:px-2 bg-[#50C878]"
            style={{
              boxShadow: "0 0 30px rgba(80, 200, 120, 0.3)",
            }}
          >
            name
          </span>
          <span className="text-[#e8e8e8]">.get</span>
        </div>

        {/* Terminal cursor loading indicator */}
        <div className="mt-8 font-mono text-sm flex items-center">
          <span className="text-ndgGreen opacity-70">{">"}</span>
          <span className="ml-2 text-[#606060]">initializing</span>
          <span className="ml-1 w-2 h-4 bg-ndgGreen loading-cursor" />
        </div>
      </div>
    </div>
  );
}
