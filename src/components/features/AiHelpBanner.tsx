import { Bot, Sparkles, MessageSquare } from "lucide-react";
import { openAiAssistant } from "@/lib/aiBridge";

/**
 * Banner llamativo y estético de llamada a la acción (CTA) para abrir el asistente de IA.
 */
export default function AiHelpBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`card-tech border border-neon-cyan/40 bg-gradient-to-r from-dark-800 via-neon-blue/15 to-dark-800 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,207,255,0.12)] ${className}`}
    >
      <div className="flex items-center gap-3.5 text-center sm:text-left">
        <div className="w-11 h-11 rounded-2xl bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-neon-cyan" />
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
              Asistente Virtual GoTech
            </span>
          </div>
          <p className="font-orbitron font-bold text-sm sm:text-base text-white">
            ¿Necesitas ayuda? Consulta con la IA
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openAiAssistant()}
        className="btn-neon shrink-0 flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
      >
        <MessageSquare className="w-4 h-4" />
        Abrir Asistente IA
      </button>
    </div>
  );
}
