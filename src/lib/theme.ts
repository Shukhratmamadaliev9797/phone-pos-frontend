export type ThemeMode = "light" | "dark" | "system";
type ThemeOrigin = { x: number; y: number };

const THEME_STORAGE_KEY = "theme_preference";

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyResolvedTheme(resolvedMode: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedMode === "dark");
}

function isReducedMotionPreferred(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(value) ? value : "system";
}

export function applyTheme(mode: ThemeMode): void {
  applyResolvedTheme(resolveTheme(mode));
}

export function setTheme(mode: ThemeMode, origin?: ThemeOrigin): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }

  if (typeof document === "undefined") {
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (
      callback: () => void,
    ) => { finished: Promise<void> };
  };

  if (!doc.startViewTransition || isReducedMotionPreferred()) {
    applyTheme(mode);
    return;
  }

  const root = document.documentElement;
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;

  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.classList.add("theme-transition");

  const transition = doc.startViewTransition(() => {
    applyResolvedTheme(resolveTheme(mode));
  });

  transition.finished.finally(() => {
    root.classList.remove("theme-transition");
    root.style.removeProperty("--theme-x");
    root.style.removeProperty("--theme-y");
  });
}

export function initTheme(): void {
  applyTheme(getStoredTheme());
}
