import { Bot, Sparkles, MessageSquare } from "lucide-react";
import { openAiAssistant } from "@/lib/aiBridge";

/**
 * Banner llamativo y estético de llamada a la acción (CTA) para abrir el asistente de IA.
 */
export default function AiHelpBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-white border border-[#DCE7F8] rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_28px_rgba(0,68,180,0.08)] ${className}`}
    >
      {/* Subtle cobalt diagonal corner detail */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-6 w-20 h-20 opacity-15"
      >
        <div className="w-2.5 h-24 bg-[#0057FF] rotate-[38deg] inline-block mr-2" />
        <div className="w-2.5 h-24 bg-[#00A3FF] rotate-[38deg] inline-block" />
      </div>

      <div className="relative z-10 flex items-center gap-3.5 text-center sm:text-left">
        <div className="w-11 h-11 rounded-2xl bg-[#EAF2FF] border border-[#BFD7FF] flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-[#0057FF]" />
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0057FF]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0057FF]">
              Asistente Virtual GoTech
            </span>
          </div>
          <p className="font-montserrat font-extrabold text-sm sm:text-base text-[#0B172A]">
            ¿Necesitas ayuda? Consulta con la IA
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openAiAssistant()}
        className="relative z-10 btn-gotech shrink-0 flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
      >
        <MessageSquare className="w-4 h-4" />
        Abrir Asistente IA
      </button>
    </div>
  );
}
