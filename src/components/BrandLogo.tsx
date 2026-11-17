const GOTECH_LOGO_SRC =
  "/assets/aistudio/file_00000000ecdc81f5aa8e632e814d6f2a_e58fa46a.png";

interface BrandLogoProps {
  variant?: "compact" | "hero";
  className?: string;
}

export default function BrandLogo({
  variant = "compact",
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
    <div
      className={`relative w-[172px] h-[46px] overflow-hidden flex items-center justify-center select-none ${className}`}
    >
      <img
        src={GOTECH_LOGO_SRC}
        alt="GoTech SV"
        className="w-full h-full object-cover object-center brand-logo-mask-compact"
      />
    </div>
  );
}
