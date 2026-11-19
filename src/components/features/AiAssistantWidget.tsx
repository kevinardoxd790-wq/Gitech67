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
import {
  buildAiShippingCacheKey,
  calcularCoberturaEnvioSeguro,
  extraerDestinoDeConsulta,
  formatEnvioUsd,
  geocodificarDireccionCliente,
  getCachedAiShippingQuote,
  solicitarCotizacionEnvioIA,
} from "@/lib/deliveryCoverage";
import { Product } from "@/types";

interface DeliveryContextPayload {
  hasLocation: boolean;
  customerAddress?: string;
  distanceKm?: number;
  withinCoverage?: boolean;
  isFreeZone?: boolean;
  coverageStatus?: string;
  estimatedShippingUsd?: number;
}

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
  products: Product[],
  deliveryContext?: DeliveryContextPayload | null
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
      if (
        deliveryContext?.hasLocation &&
        typeof deliveryContext.distanceKm === "number"
      ) {
        const locPart = deliveryContext.customerAddress
          ? `Para tu ubicación (${deliveryContext.customerAddress}), `
          : "Para tu ubicación seleccionada, ";
        const kmText = `${deliveryContext.distanceKm.toFixed(2)} km`;
        if (deliveryContext.isFreeZone) {
          return {
            respuesta: `${locPart}¡el envío es GRATIS en ese punto exacto! Recuerda que el envío gratis aplica solo en el punto exacto, no en cercanías.`,
            acciones: [],
          };
        }
        if (
          deliveryContext.withinCoverage &&
          typeof deliveryContext.estimatedShippingUsd === "number"
        ) {
          const priceText = `~${formatEnvioUsd(
            deliveryContext.estimatedShippingUsd
          )} USD`;
          return {
            respuesta: `${locPart}la distancia es de ${kmText}, estás dentro de cobertura (límite 5 km) y la estimación de envío es de ${priceText}. Es una estimación y el precio final se debe acordar en WhatsApp. Además, Salvador del Mundo (Texaco), Galerías, Torre Futura, 75 Av. Norte, Masferrer y Luceiro tienen envío gratis (solo en el punto exacto).`,
            acciones: [],
          };
        }
        if (deliveryContext.withinCoverage === false) {
          return {
            respuesta: `${locPart}la distancia es de ${kmText} y supera el límite de 5 km. No se puede hacer el envío (consulta en WhatsApp).`,
            acciones: [],
          };
        }
      }

      return {
        respuesta:
          "¡El envío es GRATIS en Salvador del Mundo (Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer y Redondel Luceiro (solo en el punto exacto; cercanías no aplican)! Colonia Escalón cuesta $1.50. Para otras zonas dentro de 5 km calculamos una estimación según distancia (el precio final se acuerda en WhatsApp); si supera los 5 km, no se puede hacer el envío (consulta en WhatsApp).",
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
  const { addToCart, openCart, address, coordinates, totalPrice, totalItems } =
    useCart();

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

    let deliveryContext: DeliveryContextPayload | undefined;
    try {
      const lowerTrimmed = trimmed.toLowerCase();
      const isShippingQuery =
        lowerTrimmed.includes("envio") ||
        lowerTrimmed.includes("envío") ||
        lowerTrimmed.includes("cobertura") ||
        lowerTrimmed.includes("distancia") ||
        lowerTrimmed.includes("km") ||
        lowerTrimmed.includes("kilometro") ||
        lowerTrimmed.includes("kilómetro") ||
        lowerTrimmed.includes("ubicacion") ||
        lowerTrimmed.includes("ubicación") ||
        lowerTrimmed.includes("entrega");

      const destinationInMsg = isShippingQuery
        ? extraerDestinoDeConsulta(trimmed)
        : null;

      let targetCoords = coordinates;
      let targetAddress = address.trim();

      if (destinationInMsg) {
        const resolvedMsgCoords =
          await geocodificarDireccionCliente(destinationInMsg);
        if (resolvedMsgCoords) {
          targetCoords = resolvedMsgCoords;
          targetAddress = destinationInMsg;
        }
      } else if (!targetCoords && targetAddress) {
        const resolvedSavedCoords =
          await geocodificarDireccionCliente(targetAddress);
        if (resolvedSavedCoords) {
          targetCoords = resolvedSavedCoords;
        }
      }

      const coverage = calcularCoberturaEnvioSeguro(targetCoords, targetAddress);
      let resolvedShippingUsd = coverage?.isFreeZone
        ? 0
        : coverage?.withinCoverage
          ? coverage.estimatedShippingUsd
          : undefined;

      if (coverage && coverage.withinCoverage && !coverage.isFreeZone) {
        const cachedQuote = getCachedAiShippingQuote(
          buildAiShippingCacheKey({
            distanceKm: coverage.distanceKm,
            subtotal: totalPrice,
            itemCount: totalItems,
          })
        );
        if (cachedQuote) {
          resolvedShippingUsd = cachedQuote.shippingPriceUsd;
        } else if (isShippingQuery) {
          const quoteRes = await solicitarCotizacionEnvioIA({
            coverage,
            subtotal: totalPrice,
            itemCount: totalItems,
            customerAddress: targetAddress,
          });
          if (quoteRes.quote) {
            resolvedShippingUsd = quoteRes.quote.shippingPriceUsd;
          }
        }
      }

      if (coverage || targetAddress) {
        deliveryContext = {
          hasLocation: true,
          ...(targetAddress ? { customerAddress: targetAddress } : {}),
          ...(coverage
            ? {
                distanceKm: coverage.distanceKm,
                withinCoverage: coverage.withinCoverage,
                isFreeZone: Boolean(coverage.isFreeZone),
                coverageStatus: coverage.statusLabel,
                ...(typeof resolvedShippingUsd === "number"
                  ? { estimatedShippingUsd: resolvedShippingUsd }
                  : {}),
              }
            : {}),
        };
      }
    } catch {
      deliveryContext = undefined;
    }

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
          deliveryContext,
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
        const fallback = generarRespuestaRespaldoLocal(
          trimmed,
          products,
          deliveryContext
        );
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
          className={`w-[330px] sm:w-[360px] rounded-2xl overflow-hidden flex flex-col max-h-[75vh] animate-slide-up transition-colors duration-500 border ${
            isPerfumeTheme
              ? isPerfumeMujer
                ? "bg-[#FFF8FB] border-[#F0C4D7] text-[#5C0E32] shadow-[0_20px_50px_rgba(142,29,78,0.24)]"
                : "bg-[#F7FBF9] border-[#C5DFD1] text-[#063020] shadow-[0_20px_50px_rgba(6,48,32,0.24)]"
              : "bg-white border-[#CFE0FA] text-[#0B172A] shadow-[0_20px_50px_rgba(0,68,180,0.20)]"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-500 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-gradient-to-r from-[#8E1D4E] to-[#C23273] border-[#6E133D] text-[#FFF8FB]"
                  : "bg-gradient-to-r from-[#042417] to-[#0B4A31] border-[#042417] text-[#F7FBF9]"
                : "bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0088FF] border-[#0044CC] text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "bg-[#FFF8FB]/15 border-[#FFD6E7]/40 text-[#FFE2EE]"
                      : "bg-[#F7FBF9]/15 border-[#E8CF8E]/40 text-[#EFE1B8]"
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
                        ? "text-[#FFE2EE]/90"
                        : "text-[#EFE1B8]/90"
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
            className={`flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[220px] max-h-[340px] transition-colors duration-500 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-gradient-to-b from-[#FFF1F6] via-[#FFF8FB] to-[#FCE4EE]"
                  : "bg-gradient-to-b from-[#EEF7F2] via-[#F7FBF9] to-[#E2F0E9]"
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
                          ? "bg-[#A62660] text-[#FFF8FB] font-semibold rounded-br-sm shadow-sm"
                          : "bg-[#0B4A31] text-[#F7FBF9] font-semibold rounded-br-sm shadow-sm"
                        : "bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0088FF] text-white font-semibold rounded-br-sm shadow-sm"
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "bg-white border border-[#F0C4D7] text-[#5C0E32] rounded-bl-sm shadow-sm"
                          : "bg-white border border-[#C5DFD1] text-[#063020] rounded-bl-sm shadow-sm"
                        : "bg-white border border-[#DCE7F8] text-[#0B172A] rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actionNote && (
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold ${
                        isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#A62660]"
                            : "text-emerald-700"
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
                              ? "bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB]"
                              : "bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9]"
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
                              ? "border-[#F0C4D7] text-[#A62660] hover:bg-[#FFF1F6]"
                              : "border-[#C5DFD1] text-[#0B4A31] hover:bg-[#EEF7F2]"
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
                            ? "text-[#A62660]"
                            : "text-emerald-700"
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
                        ? "bg-white border-[#F0C4D7] text-[#A62660]"
                        : "bg-white border-[#C5DFD1] text-[#0B4A31]"
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
            className={`px-3 py-2 flex gap-1.5 overflow-x-auto border-t transition-colors duration-500 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-[#FFF1F6] border-[#F0C4D7]"
                  : "bg-[#EEF7F2] border-[#C5DFD1]"
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
                    ? "bg-white border-[#F0C4D7] hover:border-[#A62660] text-[#A62660]"
                    : "bg-white border-[#C5DFD1] hover:border-[#0B4A31] text-[#0B4A31]"
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
                    ? "bg-white border-[#F0C4D7] hover:border-[#A62660] text-[#5C0E32]"
                    : "bg-white border-[#C5DFD1] hover:border-[#0B4A31] text-[#063020]"
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
                    ? "bg-white border-[#F0C4D7] hover:border-[#A62660] text-[#5C0E32]"
                    : "bg-white border-[#C5DFD1] hover:border-[#0B4A31] text-[#063020]"
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
                    ? "bg-white border-[#F0C4D7] hover:border-[#A62660] text-[#5C0E32]"
                    : "bg-white border-[#C5DFD1] hover:border-[#0B4A31] text-[#063020]"
                  : "bg-[#F4F8FF] border-[#CFE0FA] hover:border-[#0057FF] text-[#334663]"
              }`}
            >
              <ShoppingCart
                className={`w-3 h-3 ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "text-[#A62660]"
                      : "text-[#0B4A31]"
                    : "text-[#0057FF]"
                }`}
              />{" "}
              Ver carrito
            </button>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className={`p-3 border-t flex gap-2 transition-colors duration-500 ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "border-[#F0C4D7] bg-[#FFF1F6]"
                  : "border-[#C5DFD1] bg-[#EEF7F2]"
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
                    ? "border-[#F0C4D7] text-[#5C0E32] placeholder-[#B07A92] focus:border-[#A62660]"
                    : "border-[#C5DFD1] text-[#063020] placeholder-[#6B9382] focus:border-[#0B4A31]"
                  : "border-[#CFE0FA] text-[#0B172A] placeholder-[#6B7E9E] focus:border-[#0057FF]"
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`px-3 py-2 rounded-xl flex items-center justify-center disabled:opacity-40 transition-colors ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB]"
                    : "bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9]"
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
                ? "border border-[#FFD6E7]/60 shadow-[0_10px_28px_rgba(166,38,96,0.35)]"
                : "border border-[#E8CF8E]/50 shadow-[0_10px_28px_rgba(6,48,32,0.38)]"
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
            className={`absolute inset-0 bg-gradient-to-r from-[#042417] to-[#0E593B] transition-opacity duration-700 ease-in-out ${
              isPerfumeTheme && !isPerfumeMujer ? "opacity-100" : "opacity-0"
            }`}
          />
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-gradient-to-r from-[#8E1D4E] to-[#C23273] transition-opacity duration-700 ease-in-out ${
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
