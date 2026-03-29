import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="flex items-center rounded-full border border-white/10 overflow-hidden select-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
      }}
      aria-label="Toggle language"
    >
      {(["FR", "EN"] as const).map((l) => (
        <span
          key={l}
          className="px-3 py-1 text-xs font-bold transition-all duration-200"
          style={
            lang === l
              ? {
                  background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 100%)",
                  color: "#ffffff",
                  boxShadow: "0 0 10px rgba(79,110,247,0.4)",
                }
              : {
                  color: "rgba(255,255,255,0.35)",
                }
          }
        >
          {l}
        </span>
      ))}
    </button>
  );
}
