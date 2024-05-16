import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
export function LightModeToggle({
  lightMode,
  setLightMode,
  className = "",
}: any) {
  return (
    <button
      className={`flex items-center gap-8 text-4xl py-2 px-4 bg-[#1d1d1d50] rounded-full ${className}`}
      onClick={() => {
        setLightMode(!lightMode);
        localStorage.setItem("lightMode", JSON.stringify(!lightMode));
      }}
    >
      <SunIcon width={24} height={24} />
      <MoonIcon width={24} height={24} />
      <div
        className={`absolute h-full w-1/2 bg-[#ffffff50] top-0 left-0 rounded-full flex items-center justify-center ease-in-out duration-300  ${
          lightMode ? "transform translate-x-0" : "transform translate-x-full"
        }`}
      />
    </button>
  );
}
