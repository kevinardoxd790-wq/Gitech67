import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const LOOP_DURATION_SECONDS = 2 * 60 * 60; // Ciclo de 2 horas en bucle

function formatTwoDigits(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

/**
 * Barra superior no invasiva de Oferta Flash con temporizador digital en bucle (HH:MM:SS),
 * sin cupones ni códigos promocionales.
 */
export default function FlashOfferBar() {
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
    <div className="w-full h-7 bg-gradient-to-r from-dark-900 via-neon-blue/25 to-dark-900 border-b border-neon-cyan/30 flex items-center justify-center px-3 text-[11px] font-semibold text-white overflow-hidden">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Zap className="w-3.5 h-3.5 text-neon-cyan shrink-0 animate-pulse" />
        <span className="text-white/90 truncate">
          OFERTA FLASH · Stock disponible para entrega hoy en San Salvador
        </span>
        <span className="font-orbitron font-black text-neon-cyan bg-dark-800/90 border border-neon-cyan/40 rounded px-2 py-0.5 text-[10px] tracking-wider shrink-0">
          {formatTwoDigits(hours)}:{formatTwoDigits(minutes)}:{formatTwoDigits(seconds)}
        </span>
      </div>
    </div>
  );
}
