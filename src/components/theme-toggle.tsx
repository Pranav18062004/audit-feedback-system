"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-11 items-center justify-center rounded-full border border-card-border bg-card px-4 text-sm font-medium text-foreground hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
      aria-label="Toggle dark mode"
    >
      Theme
    </button>
  );
}
