import { useState } from "react";

export function LightModeToggle({
  lightMode,
  setLightMode,
  className = "",
}: any) {
  return (
    <button
      className={`flex gap-2 text-4xl px-4 py-2 bg-[#1d1d1d50] rounded-lg ${className}`}
      onClick={() => setLightMode(!lightMode)}
    >
      <p>{"◎"}</p>|<p>{"◉"}</p>
      <div
        className={`absolute h-full w-1/2 bg-[#ffffff20] top-0  ${
          lightMode ? "left-0" : "right-0"
        }`}
      />
    </button>
  );
}
