import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { PerfumeGender } from "@/hooks/usePerfumeZone";
import { PerfumeCardPalette } from "@/constants/perfumePalettes";

const LOOP_DURATION_SECONDS = 2 * 60 * 60; // Ciclo de 2 horas en bucle

function formatTwoDigits(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

/**
 * Barra superior no invasiva de Oferta Flash con temporizador digital en bucle (HH:MM:SS),
 * con transición suave por opacidad entre GoTech normal (azul), Perfumes Hombre (verde lujo),
 * Perfumes Mujer (rosado lujo), detalle de perfume específico y KNAS admin.
 */
export default function FlashOfferBar({
  isPerfumeTheme = false,
  perfumeGender = "hombre",
  activePerfumePalette = null,
  isAdminTheme = false,
}: {
  isPerfumeTheme?: boolean;
  perfumeGender?: PerfumeGender;
  activePerfumePalette?: PerfumeCardPalette | null;
  isAdminTheme?: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    try {
      const epochSeconds = Math.floor(Date.now() / 1000);
      return LOOP_DURATION_SECONDS - (epochSeconds % LOOP_DURATION_SECONDS);
    } catch {
      return LOOP_DURATION_SECONDS;
    }
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      try {
        setSecondsLeft((prev) => (prev <= 1 ? LOOP_DURATION_SECONDS : prev - 1));
      } catch {
        // Respaldo seguro
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const hasDetailPalette = !isAdminTheme && Boolean(activePerfumePalette);
  const isPerfumeHombre =
    !isAdminTheme && !hasDetailPalette && isPerfumeTheme && perfumeGender === "hombre";
  const isPerfumeMujer =
    !isAdminTheme && !hasDetailPalette && isPerfumeTheme && perfumeGender === "mujer";

  return (
    <div
      className={`relative w-full h-7 flex items-center justify-center px-3 text-[11px] font-semibold overflow-hidden border-b transition-colors duration-700 ease-in-out ${
        isAdminTheme
          ? "border-neon-cyan/30 text-white"
          : activePerfumePalette
            ? activePerfumePalette.detailFlashBorder
            : isPerfumeMujer
              ? "border-[#F7B9D4]/45 text-[#FFF7FA]"
              : isPerfumeHombre
                ? "border-[#D4AF37]/40 text-[#F7FBF9]"
                : "border-[#0044CC] text-white"
      }`}
    >
      {/* Cross-fading gradient backdrops for smooth section transition */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0077FF] transition-opacity duration-700 ease-in-out ${
          !isAdminTheme && !isPerfumeTheme && !hasDetailPalette ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r from-[#042417] via-[#0B4A31] to-[#042417] transition-opacity duration-700 ease-in-out ${
          isPerfumeHombre ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r from-[#781542] via-[#A62660] to-[#781542] transition-opacity duration-700 ease-in-out ${
          isPerfumeMujer ? "opacity-100" : "opacity-0"
        }`}
      />
      {activePerfumePalette && !isAdminTheme && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${activePerfumePalette.detailFlashGradient} transition-opacity duration-700 ease-in-out opacity-100`}
        />
      )}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r from-dark-900 via-neon-blue/25 to-dark-900 transition-opacity duration-700 ease-in-out ${
          isAdminTheme ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex items-center gap-2 whitespace-nowrap min-w-0 max-w-full">
        <Zap
          className={`w-3.5 h-3.5 shrink-0 animate-pulse transition-colors duration-700 ease-in-out ${
            isAdminTheme
              ? "text-neon-cyan"
              : activePerfumePalette
                ? activePerfumePalette.detailFlashIcon
                : isPerfumeMujer
                  ? "text-[#FFD8E8]"
                  : isPerfumeHombre
                    ? "text-[#E8CF8E]"
                    : "text-[#D4ECFF]"
          }`}
        />
        <span
          className={`truncate transition-colors duration-700 ease-in-out ${
            isAdminTheme
              ? "text-white/90"
              : activePerfumePalette
                ? activePerfumePalette.detailFlashText
                : isPerfumeMujer
                  ? "font-playfair tracking-wide text-[#FFF5F9]"
                  : isPerfumeHombre
                    ? "font-playfair tracking-wide text-[#F5FAF7]"
                    : "text-white"
          }`}
        >
          {isPerfumeTheme || hasDetailPalette
            ? `COLECCIÓN PERFUMES · ${
                perfumeGender === "mujer" ? "Mujer" : "Hombre"
              } · Envío gratis hoy en San Salvador`
            : "OFERTA FLASH · Stock disponible para entrega hoy en San Salvador"}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] tracking-wider shrink-0 transition-all duration-700 ease-in-out ${
            isAdminTheme
              ? "font-orbitron font-black text-neon-cyan bg-dark-800/90 border border-neon-cyan/40"
              : activePerfumePalette
                ? activePerfumePalette.detailFlashClock
                : isPerfumeMujer
                  ? "font-playfair font-bold text-[#FFF0F6] bg-[#5C0E32]/80 border border-[#F7B9D4]/50"
                  : isPerfumeHombre
                    ? "font-playfair font-bold text-[#F5E7BC] bg-[#042417]/85 border border-[#D4AF37]/50"
                    : "font-montserrat font-extrabold text-[#00349A] bg-white/95 border border-white/60"
          }`}
        >
          {formatTwoDigits(hours)}:{formatTwoDigits(minutes)}:
          {formatTwoDigits(seconds)}
        </span>
      </div>
    </div>
  );
}
