import { renderSplash, type SplashTheme } from "./splashscreens/renderSplash";
import { useEffect, useState } from "react";

export type { SplashTheme };
export const SPLASH_KEY = "nexus-splash-theme";
export const SPLASH_ENABLED_KEY = "nexus-splash-enabled";

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const rawTheme = localStorage.getItem(SPLASH_KEY) as SplashTheme;
  const theme: SplashTheme = rawTheme || "nexus";
  const enabled = localStorage.getItem(SPLASH_ENABLED_KEY) !== "false";

  useEffect(() => {
    if (!enabled) {
      onComplete();
      return;
    }
    const exit = setTimeout(() => setVisible(false), 3000);
    const done = setTimeout(onComplete, 3600);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [onComplete, enabled]);

  if (!enabled) return null;

  return renderSplash(theme, { visible });
}
