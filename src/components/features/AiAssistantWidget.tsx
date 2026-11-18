import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShoppingCart,
  Check,
  MessageCircle,
} from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
import { ejecutarAccionesIA, AIRespuestaJSON } from "@/lib/aiExecutor";
import { onOpenAiAssistant } from "@/lib/aiBridge";
import { Product } from "@/types";

const SUPPORT_WHATSAPP_NUMBER = "50376299724";
const REFUND_POLICY_TEXT =
  "Puedes consultar al 76299724 sobre algún problema o reembolso que quieras. Toma en cuenta que el producto va a ser revisado si fue manipulado o defectuoso, y el empaque debe estar intacto.";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actionNote?: string;
  showRefundChoices?: boolean;
  refundChoiceTaken?: "whatsapp" | "stay";
}

function isRefundOrProblemQuery(queryText: string): boolean {
  const q = queryText.toLowerCase();
  return (
    q.includes("reembolso") ||
    q.includes("rembolso") ||
    q.includes("devolucion") ||
    q.includes("devolución") ||
    q.includes("devolver") ||
    q.includes("garantia") ||
    q.includes("garantía") ||
    q.includes("defectuoso") ||
    q.includes("defecto") ||
    q.includes("dañado") ||
    q.includes("danado") ||
    q.includes("malo") ||
    q.includes("no funciona") ||
    q.includes("no sirve") ||
    q.includes("problema") ||
    q.includes("reclamo") ||
    q.includes("cambio")
  );
}

/**
 * Respaldo local silencioso si la API de Gemini tarda o no está disponible.
 * Respeta el límite estricto de rol (solo productos, stock, envíos, reembolsos y pedidos de GoTech SV)
 * y no aplica cupones ni descuentos.
 */
function generarRespuestaRespaldoLocal(
  queryText: string,
  products: Product[]
): AIRespuestaJSON {
  try {
    const q = queryText.toLowerCase().trim();
    const acciones: AIRespuestaJSON["acciones"] = [];

    // Reembolsos, devoluciones, garantía o problemas con productos
    if (isRefundOrProblemQuery(q)) {
      return {
        respuesta: REFUND_POLICY_TEXT,
        acciones: [{ tipo: "opciones_reembolso" }],
      };
    }

    const normalizeText = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ");

    const normalizedQuery = normalizeText(q);
    const wantsAdd =
      /\b(agrega|agregar|anade|anadir|pon|ponme|poner|quiero|comprar|llevo|llevar|dame|manda|necesito)\b/.test(
        normalizedQuery
      );

    // Detecta intención explícita de abrir carrito (solo si NO está pidiendo agregar un producto)
    const wantsOpenCart =
      !wantsAdd &&
      (/\b(abre|abrir|ver|mostrar|muestra|revisar|ir)\b/.test(normalizedQuery) &&
        (normalizedQuery.includes("carrito") || normalizedQuery.includes("pedido")) ||
        normalizedQuery.trim() === "carrito" ||
        normalizedQuery.includes("pagar") ||
        normalizedQuery.includes("resumen"));

    if (wantsOpenCart) {
      acciones.push({ tipo: "abrir_carrito" });
      return {
        respuesta:
          "Abro tu carrito para que revises tu pedido y opciones de envío.",
        acciones,
      };
    }

    // Consultas de envío
    if (
      !wantsAdd &&
      (q.includes("envio") || q.includes("envío") || q.includes("zona"))
    ) {
      return {
        respuesta:
          "Desde $4.99 tienes envío gratis en todas las zonas menos Salvador del Mundo (Galerías Escalón, Torre Futura, 75 Av. Norte, Masferrer y Luceiro). En compras mayores a $6.99 incluye gratis también Salvador del Mundo. Si llevas solo 1 producto, te lo llevamos a Salvador del Mundo por $1.50 (Colonia Escalón siempre $1.50).",
        acciones: [],
      };
    }

    // Busca el producto con mayor coincidencia exacta en el catálogo real (sin agregar otros artículos)
    const stopWords = new Set([
      "para",
      "de",
      "del",
      "un",
      "una",
      "unos",
      "unas",
      "el",
      "la",
      "los",
      "las",
      "con",
      "por",
      "en",
      "mi",
      "tu",
      "su",
      "al",
      "carrito",
      "agrega",
      "agregar",
      "anade",
      "anadir",
      "pon",
      "ponme",
      "poner",
      "quiero",
      "comprar",
      "llevar",
      "llevo",
      "dame",
      "necesito",
      "manda",
      "favor",
      "producto",
      "productos",
      "cuesta",
      "precio",
      "vale",
      "tienen",
      "hay",
    ]);

    const queryTokens = normalizedQuery
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w));

    let matched: Product | undefined;
    let bestScore = 0;

    for (const p of products) {
      const nName = normalizeText(p.name);
      const nShort = normalizeText(p.shortName);
      const nCat = normalizeText(p.category);
      const nDesc = normalizeText(p.description);
      let score = 0;

      if (nName.includes(normalizedQuery) || nShort.includes(normalizedQuery)) {
        score += 100;
      }

      let matchedTokenCount = 0;
      for (const tok of queryTokens) {
        let tokHit = false;
        if (nName.includes(tok)) {
          score += 12;
          tokHit = true;
        }
        if (nShort.includes(tok)) {
          score += 8;
          tokHit = true;
        }
        if (nCat.includes(tok)) {
          score += 5;
          tokHit = true;
        }
        if (nDesc.includes(tok)) {
          score += 2;
          tokHit = true;
        }
        if (tokHit) matchedTokenCount += 1;
      }

      if (queryTokens.length > 0) {
        score += Math.round((matchedTokenCount / queryTokens.length) * 30);
      }

      if (score > bestScore && matchedTokenCount > 0) {
        bestScore = score;
        matched = p;
      }
    }

    if (matched) {
      if (wantsAdd && matched.stock > 0) {
        const qtyMatch = q.match(/\b(\d+)\b/);
        const cantidad = qtyMatch
          ? Math.max(1, Math.min(Number(qtyMatch[1]), matched.stock))
          : 1;
        acciones.push({ tipo: "agregar", productoId: matched.id, cantidad });
        return {
          respuesta: `Agregué ${cantidad}x "${matched.name}" ($${Number(
            matched.price
          ).toFixed(2)} c/u) a tu carrito.`,
          acciones,
        };
      }

      return {
        respuesta: `"${matched.name}" cuesta $${Number(matched.price).toFixed(
          2
        )} (stock: ${matched.stock}). ${matched.description}`,
        acciones: [],
      };
    }

    const isStoreTopic =
      q.includes("hola") ||
      q.includes("buenas") ||
      q.includes("producto") ||
      q.includes("catalogo") ||
      q.includes("catálogo") ||
      q.includes("precio") ||
      q.includes("stock") ||
      q.includes("ayuda") ||
      q.includes("disponible") ||
      q.includes("tienen");

    if (isStoreTopic) {
      const preview = products
        .slice(0, 4)
        .map((p) => `${p.shortName} ($${Number(p.price).toFixed(2)})`)
        .join(", ");

      return {
        respuesta: `En GoTech SV tenemos disponibles: ${preview} y más en el catálogo. Dime cuál te interesa o pídeme agregarlo a tu carrito.`,
        acciones: [],
      };
    }

    // Regla absoluta de rol: rechaza temas ajenos a la tienda
    return {
      respuesta:
        "Soy exclusivamente el asistente virtual de GoTech SV. Solo atiendo consultas sobre nuestros productos, stock, envíos, reembolsos y pedidos.",
      acciones: [],
    };
  } catch {
    return {
      respuesta:
        "Solo atiendo consultas sobre productos, stock y pedidos de GoTech SV.",
      acciones: [],
    };
  }
}

function summarizeExecutedActions(data: AIRespuestaJSON): string | undefined {
  if (!Array.isArray(data.acciones) || data.acciones.length === 0) {
    return undefined;
  }
  const hasAdd = data.acciones.some((a) => a?.tipo === "agregar");
  const hasOpen = data.acciones.some((a) => a?.tipo === "abrir_carrito");
  if (hasAdd && hasOpen) return "Producto agregado · Carrito abierto";
  if (hasAdd) return "Agregado al carrito";
  if (hasOpen) return "Carrito abierto";
  return undefined;
}

export default function AiAssistantWidget() {
  const { products } = useCatalog();
  const { addToCart, openCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "¡Hola! Soy el asistente de GoTech SV. Pregúntame por productos, precios, envíos, reembolsos o pídeme agregar algo a tu carrito.",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onOpenAiAssistant(() => {
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    try {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } catch {
      // Ignorar errores de scroll
    }
  }, [messages, isOpen]);

  const handleAcceptWhatsApp = (msgId: string) => {
    setMessages((prev): ChatMessage[] =>
      prev.map((m) =>
        m.id === msgId ? { ...m, refundChoiceTaken: "whatsapp" as const } : m
      )
    );
  };

  const handleStayInStore = (msgId: string) => {
    setMessages((prev): ChatMessage[] => [
      ...prev.map((m) =>
        m.id === msgId ? { ...m, refundChoiceTaken: "stay" as const } : m
      ),
      {
        id: `stay-${Date.now()}`,
        role: "assistant" as const,
        text: "Entendido, nos quedamos aquí en el chat. ¿Te puedo ayudar con algún producto o consulta del catálogo?",
      },
    ]);
  };

  const buildSupportWhatsAppUrl = () => {
    const text =
      "Hola GoTech! Quisiera consultar al 76299724 sobre un problema o reembolso de un producto. Entiendo que será revisado si fue manipulado o defectuoso y que el empaque debe estar intacto.";
    return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;
  };

  const sendMessageText = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const historyPayload = messages
      .filter((m) => m.id !== "welcome")
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Respuesta inmediata para solicitudes de reembolso / problemas sin demora innecesaria
    if (isRefundOrProblemQuery(trimmed)) {
      setMessages((prev) => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          role: "assistant",
          text: REFUND_POLICY_TEXT,
          showRefundChoices: true,
        },
      ]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);

    try {
      const catalogPayload = products.map((p, idx) => ({
        index: idx + 1,
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        description: p.description,
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          catalog: catalogPayload,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: AIRespuestaJSON = await response.json();
      if (!data || typeof data.respuesta !== "string") {
        throw new Error("Formato de respuesta inválido");
      }

      let hasRefundAction = false;
      ejecutarAccionesIA(data, {
        products,
        addToCart,
        openCart,
        onRefundOptions: () => {
          hasRefundAction = true;
        },
      });

      const responseText =
        hasRefundAction && !data.respuesta.includes("76299724")
          ? REFUND_POLICY_TEXT
          : data.respuesta;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: responseText,
          actionNote: summarizeExecutedActions(data),
          showRefundChoices: hasRefundAction,
        },
      ]);
    } catch {
      // Modo seguro silencioso: respaldo local para que la tienda nunca falle ni se congele
      try {
        const fallback = generarRespuestaRespaldoLocal(trimmed, products);
        let hasRefundAction = false;
        ejecutarAccionesIA(fallback, {
          products,
          addToCart,
          openCart,
          onRefundOptions: () => {
            hasRefundAction = true;
          },
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `f-${Date.now()}`,
            role: "assistant",
            text: fallback.respuesta,
            actionNote: summarizeExecutedActions(fallback),
            showRefundChoices: hasRefundAction,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            text: "Puedes explorar el catálogo completo y agregar tus productos directamente al carrito.",
          },
        ]);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessageText(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div className="w-[330px] sm:w-[360px] bg-dark-800 border border-neon-cyan/35 rounded-2xl shadow-neon overflow-hidden flex flex-col max-h-[75vh] animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-dark-700/80 border-b border-neon-cyan/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <p className="font-orbitron font-bold text-xs text-white flex items-center gap-1">
                  Asistente GoTech <Sparkles className="w-3 h-3 text-neon-cyan" />
                </p>
                <p className="text-[10px] text-white/45">
                  Respuestas rápidas · Productos y pedidos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              className="text-white/40 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[220px] max-h-[340px]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-btn-gradient text-dark-900 font-semibold rounded-br-sm"
                      : "bg-dark-700 border border-neon-cyan/20 text-white/90 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actionNote && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-green-400">
                      <Check className="w-3 h-3" /> {msg.actionNote}
                    </span>
                  )}
                  {msg.showRefundChoices && !msg.refundChoiceTaken && (
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      <a
                        href={buildSupportWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleAcceptWhatsApp(msg.id)}
                        className="btn-neon py-2 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Aceptar e ir a WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => handleStayInStore(msg.id)}
                        className="w-full py-1.5 px-3 rounded-xl border border-white/15 hover:border-neon-cyan/40 text-white/75 hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        No, quedarme
                      </button>
                    </div>
                  )}
                  {msg.refundChoiceTaken === "whatsapp" && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-green-400">
                      <Check className="w-3 h-3" /> Abriendo WhatsApp (76299724)
                    </span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-700 border border-neon-cyan/20 rounded-2xl px-3.5 py-2 text-xs text-neon-cyan animate-pulse">
                  Respondiendo...
                </div>
              </div>
            )}
          </div>

          {/* Quick action bar */}
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void sendMessageText("¿Qué productos tienen disponibles?")
              }
              className="shrink-0 text-[10px] bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/50 text-neon-cyan px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
            >
              📦 Ver catálogo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void sendMessageText("¿Cómo funcionan los envíos gratis?")
              }
              className="shrink-0 text-[10px] bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/50 text-white/75 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
            >
              🚚 Envíos
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendMessageText("Quiero consultar por un reembolso")}
              className="shrink-0 text-[10px] bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/50 text-white/75 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
            >
              🔄 Reembolso
            </button>
            <button
              type="button"
              onClick={openCart}
              className="shrink-0 text-[10px] bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/50 text-white/75 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
            >
              <ShoppingCart className="w-3 h-3 text-neon-cyan" /> Ver carrito
            </button>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-neon-cyan/20 bg-dark-900/60 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Agrega el Bluetooth 5.0..."
              maxLength={300}
              className="flex-1 bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-neon px-3 py-2 rounded-xl flex items-center justify-center disabled:opacity-40"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-neon rounded-full px-4 py-3 shadow-neon flex items-center gap-2 text-xs"
          aria-label="Abrir asistente de compras"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Asistente IA</span>
        </button>
      )}
    </div>
  );
}
