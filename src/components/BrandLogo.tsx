const GOTECH_LOGO_SRC =
  "/assets/aistudio/file_00000000ecdc81f5aa8e632e814d6f2a_e58fa46a.png";

interface BrandLogoProps {
  variant?: "compact" | "hero";
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Unified GoTech G-orbit vector logo used consistently across
 * the GoTech storefront, Perfumes section, footer, and admin navbar.
 */
function GoTechVectorMark({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none transition-all duration-700 ease-in-out ${className}`}
    >
      <svg
        viewBox="0 0 88 68"
        fill="none"
        aria-hidden="true"
        className="w-10 h-8 sm:w-11 sm:h-9 shrink-0 drop-shadow-[0_3px_10px_rgba(0,102,255,0.28)]"
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
        {/* Geometric G */}
        <path
          d="M64 15H34L21 29v17l13 11h26l10-12H45l5-9h27L62 63H28L12 48V24L28 8h43l-7 7Z"
          fill="url(#gMarkGrad)"
        />
        {/* Orbital ring */}
        <path
          d="M11 47C4 37 14 20 35 12c20-7 40-3 45 7 3 6-1 14-10 21"
          stroke="url(#gOrbitGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M78 21c6 10-4 26-26 35-20 8-40 4-44-7"
          stroke="url(#gOrbitGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>

      <span
        aria-hidden="true"
        className={`h-6 w-px transition-colors duration-700 ease-in-out ${
          tone === "light" ? "bg-[#C7D7F2]" : "bg-white/25"
        }`}
      />

      <span className="font-montserrat font-black italic tracking-tight text-xl sm:text-2xl leading-none">
        <span className="text-[#0066FF]">Go</span>
        <span
          className={`transition-colors duration-700 ease-in-out ${
            tone === "light" ? "text-[#0B172A]" : "text-white"
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

  return <GoTechVectorMark tone={tone} className={className} />;
}
