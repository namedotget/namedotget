import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { LightModeToggle } from "../LightModeToggle";
import { BackgroundScroll } from "./BackgroundScroll";
import { Footer } from "./Footer";

export function Layout({ children }: any) {
  const [lightMode, setLightMode] = useState(true);

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
      <BackgroundScroll lightMode={lightMode} />
      <LightModeToggle
        className="absolute right-[5%] top-[18%] md:top-[5%] md:top-[5%]"
        lightMode={lightMode}
        setLightMode={setLightMode}
      />
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
