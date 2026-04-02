import SplashNexus from "./SplashNexus";
import SplashiOS from "./SplashiOS";
import SplashWindows from "./SplashWindows";
import SplashMinimal from "./SplashMinimal";
import SplashNetflix from "./SplashNetflix";
import SplashMatrix from "./SplashMatrix";
import SplashCyberpunk from "./SplashCyberpunk";
import SplashApple from "./SplashApple";
import SplashHUD from "./SplashHUD";
import SplashAurora from "./SplashAurora";
import SplashGlitch from "./SplashGlitch";
import SplashRetro from "./SplashRetro";
import SplashTikTok from "./SplashTikTok";
import SplashNeon from "./SplashNeon";
import SplashVaporwave from "./SplashVaporwave";
import SplashGold from "./SplashGold";
import SplashFire from "./SplashFire";
import SplashIce from "./SplashIce";

export type SplashTheme =
  | "nexus"
  | "ios"
  | "windows"
  | "minimal"
  | "netflix"
  | "matrix"
  | "cyberpunk"
  | "apple"
  | "hud"
  | "aurora"
  | "glitch"
  | "retro"
  | "tiktok"
  | "neon"
  | "vaporwave"
  | "gold"
  | "fire"
  | "ice";

export function renderSplash(theme: SplashTheme, props: { visible: boolean }) {
  switch (theme) {
    case "ios":        return <SplashiOS {...props} />;
    case "windows":    return <SplashWindows {...props} />;
    case "minimal":    return <SplashMinimal {...props} />;
    case "netflix":    return <SplashNetflix {...props} />;
    case "matrix":     return <SplashMatrix {...props} />;
    case "cyberpunk":  return <SplashCyberpunk {...props} />;
    case "apple":      return <SplashApple {...props} />;
    case "hud":        return <SplashHUD {...props} />;
    case "aurora":     return <SplashAurora {...props} />;
    case "glitch":     return <SplashGlitch {...props} />;
    case "retro":      return <SplashRetro {...props} />;
    case "tiktok":     return <SplashTikTok {...props} />;
    case "neon":       return <SplashNeon {...props} />;
    case "vaporwave":  return <SplashVaporwave {...props} />;
    case "gold":       return <SplashGold {...props} />;
    case "fire":       return <SplashFire {...props} />;
    case "ice":        return <SplashIce {...props} />;
    default:           return <SplashNexus {...props} />;
  }
}
