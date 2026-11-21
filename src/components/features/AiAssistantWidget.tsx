import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";
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

    if (
      !wantsAdd &&
      (q.includes("envio") ||
        q.includes("envío") ||
        q.includes("zona") ||
        q.includes("cobertura") ||
        q.includes("distancia") ||
        q.includes("km") ||
        q.includes("kilometro") ||
        q.includes("kilómetro") ||
        q.includes("ubicacion") ||
        q.includes("ubicación"))
    ) {
      return {
        respuesta:
          "¡El envío es GRATIS en Salvador del Mundo (Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer y Redondel Luceiro (Colonia Escalón $1.50)! Para otra dirección, puedes marcar tu ubicación exacta en el mapa dentro del carrito y coordinar el envío por WhatsApp.",
        acciones: [],
      };
    }

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
      if (wantsAdd) {
        if (matched.stock <= 0) {
          return {
            respuesta: `"${matched.name}" se encuentra agotado por el momento.`,
            acciones: [],
          };
        }
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
        )} (${matched.stock > 0 ? "Disponible" : "Agotado"}). ${matched.description}`,
        acciones: [],
      };
    }

    const isStoreTopic =
      q.includes("hola") ||
      q.includes("buenas") ||
      q.includes("producto") ||
      q.includes("perfume") ||
      q.includes("fragancia") ||
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

    return {
      respuesta:
        "Soy exclusivamente el asistente virtual de GoTech SV. Solo atiendo consultas sobre nuestros productos, disponibilidad, envíos, reembolsos y pedidos.",
      acciones: [],
    };
  } catch {
    return {
      respuesta:
        "Solo atiendo consultas sobre productos, disponibilidad y pedidos de GoTech SV.",
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
  const location = useLocation();
  const { isPerfumeZone: isPerfumeTheme, perfumeGender } = usePerfumeTheme();
  const isPerfumeMujer = isPerfumeTheme && perfumeGender === "mujer";
  const isAdminTheme = location.pathname.startsWith("/admin");

  const { products } = useCatalog();
  const { addToCart, openCart, totalPrice, totalItems } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "¡Hola! Soy el asistente de GoTech SV. Pregúntame por productos, perfumes, precios, envíos, reembolsos o pídeme agregar algo a tu carrito.",
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
    const timeoutId = setTimeout(() => controller.abort(), 16000);

    try {
      const catalogPayload = products.map((p, idx) => ({
        index: idx + 1,
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock > 0 ? 1 : 0,
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

  if (isAdminTheme) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div
          className={`w-[330px] sm:w-[360px] rounded-2xl overflow-hidden flex flex-col max-h-[75vh] animate-slide-up transition-colors duration-700 border ${
            isPerfumeTheme
              ? isPerfumeMujer
                ? "bg-[#FFF9F7] border-[#EBD0C9] text-[#3B101C] shadow-[0_20px_50px_rgba(142,16,54,0.22)]"
                : "bg-[#FBF9F4] border-[#D7D0BE] text-[#0D2016] shadow-[0_20px_50px_rgba(11,40,25,0.22)]"
              : "bg-white border-[#CFE0FA] text-[#0B172A] shadow-[0_20px_50px_rgba(0,68,180,0.20)]"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-700 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-gradient-to-r from-[#650925] to-[#9D173F] border-[#50061C] text-[#FFF9F7]"
                  : "bg-gradient-to-r from-[#05180E] to-[#113722] border-[#04140B] text-[#FAF8F2]"
                : "bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0088FF] border-[#0044CC] text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "bg-[#FFF9F7]/15 border-[#DFC078]/50 text-[#F9EED7]"
                      : "bg-[#FAF8F2]/15 border-[#CEAF6C]/50 text-[#F4E6CA]"
                    : "bg-white/15 border-white/30 text-white"
                }`}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={`font-bold text-xs flex items-center gap-1 ${
                    isPerfumeTheme
                      ? "font-playfair tracking-wide text-sm text-white"
                      : "font-montserrat text-white"
                  }`}
                >
                  {isPerfumeTheme ? "Asistente Boutique" : "Asistente GoTech"}{" "}
                  <Sparkles className="w-3 h-3 opacity-90" />
                </p>
                <p
                  className={`text-[10px] ${
                    isPerfumeTheme
                      ? isPerfumeMujer
                        ? "text-[#F9EED7]/90"
                        : "text-[#F4E6CA]/90"
                      : "text-white/80"
                  }`}
                >
                  {isPerfumeTheme
                    ? `Perfumes ${isPerfumeMujer ? "Mujer" : "Hombre"} · Pedidos`
                    : "Respuestas rápidas · Productos y pedidos"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              className="text-white/75 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages canvas */}
          <div
            ref={listRef}
            className={`flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[220px] max-h-[340px] transition-colors duration-700 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-gradient-to-b from-[#FDF2F0] via-[#FFF8F6] to-[#F9E5E1]"
                  : "bg-gradient-to-b from-[#F7F5EE] via-[#FAF9F4] to-[#EDEAE0]"
                : "bg-gradient-to-b from-[#F4F8FF] via-[#F9FBFF] to-[#EEF4FF]"
            }`}
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
                      ? isPerfumeTheme
                        ? isPerfumeMujer
                          ? "bg-[#8E1036] text-[#FFF9F7] font-semibold rounded-br-sm shadow-sm"
                          : "bg-[#0B2819] text-[#FBF9F4] font-semibold rounded-br-sm shadow-sm"
                        : "bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0088FF] text-white font-semibold rounded-br-sm shadow-sm"
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "bg-white border border-[#EBD0C9] text-[#3B101C] rounded-bl-sm shadow-sm"
                          : "bg-white border border-[#D7D0BE] text-[#0D2016] rounded-bl-sm shadow-sm"
                        : "bg-white border border-[#DCE7F8] text-[#0B172A] rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actionNote && (
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold ${
                        isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#8E1036]"
                            : "text-[#0F3822]"
                          : "text-emerald-600"
                      }`}
                    >
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
                        className={`py-2 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 font-bold transition-colors ${
                          isPerfumeTheme
                            ? isPerfumeMujer
                              ? "bg-[#8E1036] hover:bg-[#AA1B46] text-[#FFF9F7]"
                              : "bg-[#0B2819] hover:bg-[#144029] text-[#FBF9F4]"
                            : "btn-gotech text-[11px] py-2"
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Aceptar e ir a WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => handleStayInStore(msg.id)}
                        className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition-colors ${
                          isPerfumeTheme
                            ? isPerfumeMujer
                              ? "border-[#EBD0C9] text-[#8E1036] hover:bg-[#FDF2F0]"
                              : "border-[#D7D0BE] text-[#0B2819] hover:bg-[#F7F5EE]"
                            : "border-[#CFE0FA] text-[#334663] hover:border-[#0057FF] hover:text-[#0057FF]"
                        }`}
                      >
                        No, quedarme
                      </button>
                    </div>
                  )}
                  {msg.refundChoiceTaken === "whatsapp" && (
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold ${
                        isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#8E1036]"
                            : "text-[#0F3822]"
                          : "text-emerald-600"
                      }`}
                    >
                      <Check className="w-3 h-3" /> Abriendo WhatsApp (76299724)
                    </span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className={`rounded-2xl px-3.5 py-2 text-xs font-semibold animate-pulse border ${
                    isPerfumeTheme
                      ? isPerfumeMujer
                        ? "bg-white border-[#EBD0C9] text-[#8E1036]"
                        : "bg-white border-[#D7D0BE] text-[#0B2819]"
                      : "bg-white border-[#DCE7F8] text-[#0057FF]"
                  }`}
                >
                  Respondiendo...
                </div>
              </div>
            )}
          </div>

          {/* Quick action bar */}
          <div
            className={`px-3 py-2 flex gap-1.5 overflow-x-auto border-t transition-colors duration-700 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-[#FDF2F0] border-[#EBD0C9]"
                  : "bg-[#F7F5EE] border-[#D7D0BE]"
                : "bg-white border-[#EAF1FC]"
            }`}
          >
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void sendMessageText(
                  isPerfumeTheme
                    ? "¿Qué perfumes tienen disponibles?"
                    : "¿Qué productos tienen disponibles?"
                )
              }
              className={`shrink-0 text-[10px] font-semibold border px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-white border-[#EBD0C9] hover:border-[#8E1036] text-[#8E1036]"
                    : "bg-white border-[#D7D0BE] hover:border-[#0B2819] text-[#0B2819]"
                  : "bg-[#F4F8FF] border-[#CFE0FA] hover:border-[#0057FF] text-[#0057FF]"
              }`}
            >
              {isPerfumeTheme ? "✨ Ver perfumes" : "📦 Ver catálogo"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void sendMessageText("¿Cómo funcionan los envíos gratis?")
              }
              className={`shrink-0 text-[10px] font-semibold border px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-white border-[#EBD0C9] hover:border-[#8E1036] text-[#3B101C]"
                    : "bg-white border-[#D7D0BE] hover:border-[#0B2819] text-[#0D2016]"
                  : "bg-[#F4F8FF] border-[#CFE0FA] hover:border-[#0057FF] text-[#334663]"
              }`}
            >
              🚚 Envíos
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendMessageText("Quiero consultar por un reembolso")}
              className={`shrink-0 text-[10px] font-semibold border px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-white border-[#EBD0C9] hover:border-[#8E1036] text-[#3B101C]"
                    : "bg-white border-[#D7D0BE] hover:border-[#0B2819] text-[#0D2016]"
                  : "bg-[#F4F8FF] border-[#CFE0FA] hover:border-[#0057FF] text-[#334663]"
              }`}
            >
              🔄 Reembolso
            </button>
            <button
              type="button"
              onClick={openCart}
              className={`shrink-0 text-[10px] font-semibold border px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-white border-[#EBD0C9] hover:border-[#8E1036] text-[#3B101C]"
                    : "bg-white border-[#D7D0BE] hover:border-[#0B2819] text-[#0D2016]"
                  : "bg-[#F4F8FF] border-[#CFE0FA] hover:border-[#0057FF] text-[#334663]"
              }`}
            >
              <ShoppingCart
                className={`w-3 h-3 ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "text-[#8E1036]"
                      : "text-[#0B2819]"
                    : "text-[#0057FF]"
                }`}
              />{" "}
              Ver carrito
            </button>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className={`p-3 border-t flex gap-2 transition-colors duration-700 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "border-[#EBD0C9] bg-[#FDF2F0]"
                  : "border-[#D7D0BE] bg-[#F7F5EE]"
                : "border-[#DCE7F8] bg-[#F4F8FF]"
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "Ej: Agrega el perfume Fairyland..."
                    : "Ej: Agrega el Dior Sauvage..."
                  : "Ej: Agrega el Bluetooth 5.0..."
              }
              maxLength={300}
              className={`flex-1 bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "border-[#EBD0C9] text-[#3B101C] placeholder-[#9B6B76] focus:border-[#8E1036]"
                    : "border-[#D7D0BE] text-[#0D2016] placeholder-[#6B7A70] focus:border-[#0B2819]"
                  : "border-[#CFE0FA] text-[#0B172A] placeholder-[#6B7E9E] focus:border-[#0057FF]"
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`px-3 py-2 rounded-xl flex items-center justify-center disabled:opacity-40 transition-colors ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-[#8E1036] hover:bg-[#AA1B46] text-[#FFF9F7]"
                    : "bg-[#0B2819] hover:bg-[#144029] text-[#FBF9F4]"
                  : "btn-gotech rounded-xl px-3 py-2"
              }`}
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
          className={`relative overflow-hidden rounded-full px-4 py-3 flex items-center gap-2 text-xs font-bold text-white transition-all duration-700 ease-in-out hover:brightness-110 active:scale-95 ${
            isPerfumeTheme
              ? isPerfumeMujer
                ? "border border-[#DFC078]/65 shadow-[0_10px_28px_rgba(142,16,54,0.35)]"
                : "border border-[#CEAF6C]/60 shadow-[0_10px_28px_rgba(11,40,25,0.40)]"
              : "border border-white/20 shadow-[0_10px_28px_rgba(0,87,255,0.35)]"
          }`}
          aria-label="Abrir asistente de compras"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0095FF] transition-opacity duration-700 ease-in-out ${
              isPerfumeTheme ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-gradient-to-r from-[#05180E] to-[#133D27] transition-opacity duration-700 ease-in-out ${
              isPerfumeTheme && !isPerfumeMujer ? "opacity-100" : "opacity-0"
            }`}
          />
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-gradient-to-r from-[#6A0A26] to-[#AD1E49] transition-opacity duration-700 ease-in-out ${
              isPerfumeMujer ? "opacity-100" : "opacity-0"
            }`}
          />
          <Bot className="relative z-10 w-4 h-4" />
          <span
            className={`relative z-10 hidden sm:inline ${
              isPerfumeTheme ? "font-playfair tracking-wide" : ""
            }`}
          >
            {isPerfumeTheme ? "Asistente Boutique" : "Asistente IA"}
          </span>
        </button>
      )}
    </div>
  );
}
