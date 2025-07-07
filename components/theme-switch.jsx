"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

const ThemSwitch = () => {
  const { theme, setTheme } = useTheme();

  return theme === "dark" ? (
    <button
      onClick={() => setTheme("light")}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-950 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <SunIcon />
    </button>
  ) : (
    <button
      onClick={() => setTheme("dark")}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-950 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <MoonIcon />
    </button>
  );
};

export default ThemSwitch;
