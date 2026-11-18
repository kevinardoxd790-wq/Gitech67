import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const LOOP_DURATION_SECONDS = 2 * 60 * 60; // Ciclo de 2 horas en bucle

function formatTwoDigits(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

/**
 * Barra superior no invasiva de Oferta Flash con temporizador digital en bucle (HH:MM:SS),
 * adaptada a GoTech (azul eléctrico), Perfumes (borgoña boutique) o KNAS admin.
 */
export default function FlashOfferBar({
  isPerfumeTheme = false,
  isAdminTheme = false,
}: {
  isPerfumeTheme?: boolean;
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

  return (
    <div
      className={`w-full h-7 flex items-center justify-center px-3 text-[11px] font-semibold overflow-hidden transition-colors ${
        isAdminTheme
          ? "bg-gradient-to-r from-dark-900 via-neon-blue/25 to-dark-900 border-b border-neon-cyan/30 text-white"
          : isPerfumeTheme
            ? "bg-gradient-to-r from-[#4D0819] via-[#6D1128] to-[#4D0819] border-b border-[#D8B474]/40 text-[#FFF7F4]"
            : "bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0077FF] border-b border-[#0044CC] text-white"
      }`}
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Zap
          className={`w-3.5 h-3.5 shrink-0 animate-pulse ${
            isAdminTheme
              ? "text-neon-cyan"
              : isPerfumeTheme
                ? "text-[#E7C686]"
                : "text-[#D4ECFF]"
          }`}
        />
        <span
          className={`truncate ${
            isAdminTheme
              ? "text-white/90"
              : isPerfumeTheme
                ? "text-[#FFF5F2]/95"
                : "text-white"
          }`}
        >
          {isPerfumeTheme
            ? "COLECCIÓN PERFUMES · Envío gratis hoy en San Salvador"
            : "OFERTA FLASH · Stock disponible para entrega hoy en San Salvador"}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] tracking-wider shrink-0 ${
            isAdminTheme
              ? "font-orbitron font-black text-neon-cyan bg-dark-800/90 border border-neon-cyan/40"
              : isPerfumeTheme
                ? "font-playfair font-bold text-[#FCEFD5] bg-[#360511]/80 border border-[#D8B474]/50"
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
