import SplashNexus from "./splashscreens/SplashNexus";
import SplashiOS from "./splashscreens/SplashiOS";
import SplashWindows from "./splashscreens/SplashWindows";
import SplashMinimal from "./splashscreens/SplashMinimal";
import SplashNetflix from "./splashscreens/SplashNetflix";
import { useEffect, useState } from "react";

export type SplashTheme = "nexus" | "ios" | "windows" | "minimal" | "netflix";
export const SPLASH_KEY = "nexus-splash-theme";
export const SPLASH_ENABLED_KEY = "nexus-splash-enabled";

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const rawTheme = localStorage.getItem(SPLASH_KEY) as SplashTheme;
  const theme: SplashTheme = rawTheme === ("matrix" as any) ? "netflix" : rawTheme || "nexus";
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

  const props = { visible };
  switch (theme) {
    case "ios": return <SplashiOS {...props} />;
    case "windows": return <SplashWindows {...props} />;
    case "minimal": return <SplashMinimal {...props} />;
    case "netflix": return <SplashNetflix {...props} />;
    default: return <SplashNexus {...props} />;
  }
}
