const OPEN_AI_EVENT = "gotech:open-ai-assistant";

/**
 * Abre el chat flotante del asistente de IA desde cualquier banner o botón de la tienda.
 */
export function openAiAssistant(): void {
  try {
    window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT));
  } catch {
    // Aislamiento seguro
  }
}

/**
 * Suscribe un listener para abrir el chat flotante de IA.
 */
export function onOpenAiAssistant(handler: () => void): () => void {
  try {
    window.addEventListener(OPEN_AI_EVENT, handler);
    return () => {
      try {
        window.removeEventListener(OPEN_AI_EVENT, handler);
      } catch {
        // Ignorar errores al desmontar
      }
    };
  } catch {
    return () => {};
  }
}
