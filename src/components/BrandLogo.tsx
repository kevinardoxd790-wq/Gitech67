const GOTECH_LOGO_SRC =
  "/assets/aistudio/file_00000000ecdc81f5aa8e632e814d6f2a_e58fa46a.png";

export type BrandAccentTone = "gotech" | "mujer" | "hombre";

interface BrandLogoProps {
  variant?: "compact" | "hero";
  tone?: "light" | "dark";
  accentTone?: BrandAccentTone;
  className?: string;
}

/**
 * Unified GoTech G-orbit vector logo used consistently across
 * the GoTech storefront, Perfumes section, footer, and admin navbar.
 * Cross-fades smoothly between GoTech Cobalt Blue, Perfumes Mujer Crimson,
 * and Perfumes Hombre Forest Emerald when inside the Perfumes zone.
 */
function GoTechVectorMark({
  tone = "light",
  accentTone = "gotech",
  className = "",
}: {
  tone?: "light" | "dark";
  accentTone?: BrandAccentTone;
  className?: string;
}) {
  const isMujer = tone === "light" && accentTone === "mujer";
  const isHombre = tone === "light" && accentTone === "hombre";
  const isDefault = !isMujer && !isHombre;

  const gPath =
    "M64 15H34L21 29v17l13 11h26l10-12H45l5-9h27L62 63H28L12 48V24L28 8h43l-7 7Z";
  const orbit1 =
    "M11 47C4 37 14 20 35 12c20-7 40-3 45 7 3 6-1 14-10 21";
  const orbit2 =
    "M78 21c6 10-4 26-26 35-20 8-40 4-44-7";

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none transition-all duration-700 ease-in-out ${className}`}
    >
      <div className="relative w-10 h-8 sm:w-11 sm:h-9 shrink-0">
        {/* Default GoTech Cobalt Blue Mark */}
        <svg
          viewBox="0 0 88 68"
          fill="none"
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full drop-shadow-[0_3px_10px_rgba(0,102,255,0.28)] transition-opacity duration-700 ease-in-out ${
            isDefault ? "opacity-100" : "opacity-0"
          }`}
        >
          <defs>
            <linearGradient id="gMarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C8FF" />
              <stop offset="52%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#0035A8" />
            </linearGradient>
            <linearGradient id="gOrbitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="100%" stopColor="#0057FF" />
            </linearGradient>
          </defs>
          <path d={gPath} fill="url(#gMarkGrad)" />
          <path
            d={orbit1}
            stroke="url(#gOrbitGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d={orbit2}
            stroke="url(#gOrbitGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>

        {/* Perfumes Mujer Crimson-Burgundy Mark */}
        <svg
          viewBox="0 0 88 68"
          fill="none"
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full drop-shadow-[0_3px_10px_rgba(142,16,54,0.28)] transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-100" : "opacity-0"
          }`}
        >
          <defs>
            <linearGradient id="gMarkMujer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B8244E" />
              <stop offset="55%" stopColor="#8E1036" />
              <stop offset="100%" stopColor="#5C0720" />
            </linearGradient>
            <linearGradient id="gOrbitMujer" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8A158" />
              <stop offset="100%" stopColor="#8E1036" />
            </linearGradient>
          </defs>
          <path d={gPath} fill="url(#gMarkMujer)" />
          <path
            d={orbit1}
            stroke="url(#gOrbitMujer)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d={orbit2}
            stroke="url(#gOrbitMujer)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>

        {/* Perfumes Hombre Forest-Emerald Mark */}
        <svg
          viewBox="0 0 88 68"
          fill="none"
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full drop-shadow-[0_3px_10px_rgba(11,40,25,0.28)] transition-opacity duration-700 ease-in-out ${
            isHombre ? "opacity-100" : "opacity-0"
          }`}
        >
          <defs>
            <linearGradient id="gMarkHombre" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1D5436" />
              <stop offset="55%" stopColor="#0D301E" />
              <stop offset="100%" stopColor="#06190F" />
            </linearGradient>
            <linearGradient id="gOrbitHombre" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B6985A" />
              <stop offset="100%" stopColor="#0D301E" />
            </linearGradient>
          </defs>
          <path d={gPath} fill="url(#gMarkHombre)" />
          <path
            d={orbit1}
            stroke="url(#gOrbitHombre)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d={orbit2}
            stroke="url(#gOrbitHombre)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span
        aria-hidden="true"
        className={`h-6 w-px transition-colors duration-700 ease-in-out ${
          tone === "dark"
            ? "bg-white/25"
            : isMujer
              ? "bg-[#E7C6BF]"
              : isHombre
                ? "bg-[#D5CEBC]"
                : "bg-[#C7D7F2]"
        }`}
      />

      <span className="font-montserrat font-black italic tracking-tight text-xl sm:text-2xl leading-none">
        <span
          className={`transition-colors duration-700 ease-in-out ${
            isMujer
              ? "text-[#1E1014]"
              : isHombre
                ? "text-[#101C15]"
                : "text-[#0066FF]"
          }`}
        >
          Go
        </span>
        <span
          className={`transition-colors duration-700 ease-in-out ${
            tone === "light"
              ? isMujer
                ? "text-[#1E1014]"
                : isHombre
                  ? "text-[#101C15]"
                  : "text-[#0B172A]"
              : "text-white"
          }`}
        >
          Tech
        </span>
      </span>
    </div>
  );
}

export default function BrandLogo({
  variant = "compact",
  tone = "light",
  accentTone = "gotech",
  className = "",
}: BrandLogoProps) {
  if (variant === "hero") {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
      >
        <div className="absolute inset-0 bg-glow-radial opacity-60 blur-2xl" />
        <img
          src={GOTECH_LOGO_SRC}
          alt="GoTech SV"
          className="relative z-10 w-full max-w-[460px] h-auto object-contain brand-logo-mask-hero animate-float"
        />
      </div>
    );
  }

  return (
    <GoTechVectorMark
      tone={tone}
      accentTone={accentTone}
      className={className}
    />
  );
}
