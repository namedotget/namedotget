import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { LightModeToggle } from "../LightModeToggle";
import { BackgroundScroll } from "./BackgroundScroll";
import { Footer } from "./Footer";

export function Layout({ children }: any) {
  const [lightMode, setLightMode] = useState(true);

  useEffect(() => {
    //set light mode from local storage
    const storedLightMode = JSON.parse(
      localStorage.getItem("lightMode") as string
    );
    if (storedLightMode != null) setLightMode(storedLightMode);
  }, []);
  return (
    <>
      <BackgroundScroll lightMode={lightMode} />
      <LightModeToggle
        className="absolute right-[5%] top-[15%] md:top-[5%]"
        lightMode={lightMode}
        setLightMode={setLightMode}
      />
      {children}
      <Footer />
      <Toaster />
    </>
  );
}
