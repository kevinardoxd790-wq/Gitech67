import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CatalogItemInput {
  index: number;
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
}

interface HistoryItemInput {
  role: "user" | "assistant";
  text: string;
}

interface DeliveryContextInput {
  hasLocation?: boolean;
  customerAddress?: string;
  distanceKm?: number;
  withinCoverage?: boolean;
  coverageStatus?: string;
  estimatedShippingUsd?: number;
}

const AI_TIMEOUT_MS = 14000;

function extractJsonObject(rawText: string): Record<string, unknown> {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Respuesta JSON inválida de Gemini");
  }
}

let sharedAiClient: GoogleGenAI | null = null;
function getAiClient(apiKey: string): GoogleGenAI {
  if (!sharedAiClient) {
    sharedAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return sharedAiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Endpoint seguro y optimizado del agente IA de GoTech SV
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "Servicio de IA no configurado en el servidor.",
        });
      }

      const body = req.body ?? {};
      const userMessage =
        typeof body.message === "string" ? body.message.trim().slice(0, 800) : "";
      const catalog: CatalogItemInput[] = Array.isArray(body.catalog)
        ? body.catalog.slice(0, 50)
        : [];
      const history: HistoryItemInput[] = Array.isArray(body.history)
        ? body.history
            .slice(-6)
            .filter(
              (h: unknown): h is HistoryItemInput =>
                Boolean(h) &&
                typeof h === "object" &&
                ((h as HistoryItemInput).role === "user" ||
                  (h as HistoryItemInput).role === "assistant") &&
                typeof (h as HistoryItemInput).text === "string"
            )
        : [];

      if (!userMessage) {
        return res.status(400).json({ error: "Mensaje vacío." });
      }

      const ai = getAiClient(apiKey);

      const catalogText = catalog
        .map((p) => {
          const desc =
            typeof p.description === "string" && p.description.trim()
              ? ` | ${p.description.trim().slice(0, 70)}`
              : "";
          const availability = p.stock > 0 ? "Disponible" : "Agotado";
          return `${p.index}. [${p.id}] ${p.name} — $${Number(p.price).toFixed(2)} (${availability}, ${p.category})${desc}`;
        })
        .join("\n");

      const rawDelivery = body.deliveryContext as
        | DeliveryContextInput
        | undefined;
      let deliveryContextBlock = "";
      try {
        if (rawDelivery && rawDelivery.hasLocation) {
          const parts: string[] = [];
          if (
            typeof rawDelivery.customerAddress === "string" &&
            rawDelivery.customerAddress.trim()
          ) {
            parts.push(
              `Ubicación del cliente: ${rawDelivery.customerAddress
                .trim()
                .slice(0, 140)}`
            );
          }
          if (typeof rawDelivery.distanceKm === "number") {
            parts.push(
              `Distancia calculada: ${rawDelivery.distanceKm.toFixed(2)} km`
            );
          }
          if (typeof rawDelivery.coverageStatus === "string") {
            parts.push(
              `Estado de cobertura: ${rawDelivery.coverageStatus.slice(0, 120)}`
            );
          }
          if (typeof rawDelivery.estimatedShippingUsd === "number") {
            const snapped = Math.max(
              1,
              Math.round((rawDelivery.estimatedShippingUsd + Number.EPSILON) * 2) / 2
            );
            const cleanPrice = Number.isInteger(snapped)
              ? `$${snapped}`
              : `$${snapped.toFixed(2)}`;
            parts.push(
              `Envío aproximado calculado: ${cleanPrice} USD${
                rawDelivery.withinCoverage === false
                  ? " (referencial; fuera de cobertura directa > 5 km, coordinar por WhatsApp)"
                  : ""
              }`
            );
          }
          if (parts.length > 0) {
            deliveryContextBlock = `\n\nUBICACIÓN Y COBERTURA ACTUAL DEL CLIENTE:\n- ${parts.join(
              "\n- "
            )}`;
          }
        }
      } catch {
        deliveryContextBlock = "";
      }

      const systemInstruction = `Asistente virtual exclusivo de GoTech SV (tienda tech en San Salvador).
Responde en español claro, directo y amable (máximo 3 oraciones).

LÍMITE ESTRICTO DE TEMAS:
- Atiende SOLO consultas sobre catálogo GoTech, precios, disponibilidad, envíos en San Salvador, carrito y soporte/problemas o reembolsos de compras GoTech.
- NUNCA menciones cantidades numéricas de existencias o stock al cliente; solo indica si está Disponible o Agotado.
- NUNCA menciones ni reveles direcciones de origen internas ni puntos de salida de la tienda; comparte únicamente la información del cliente, distancia calculada, cobertura (límite 5 km) y envío aproximado.
- PROHIBIDO responder historia (ej. Cristóbal Colón), geografía, tareas escolares, ciencia o cultura general. Para temas ajenos, declina cortésmente y devuelve "acciones": [].

PRECIOS FIJOS (SIN CUPONES NI DESCUENTOS):
- Todos los precios y envíos son fijos. Nunca menciones ni ofrezcas cupones, códigos o descuentos.

POLÍTICA DE REEMBOLSOS, GARANTÍA Y PROBLEMAS:
- Si el cliente pide reembolso, devolución, cambio, garantía o reporta que un producto salió malo/defectuoso/dañado o tiene un problema con su compra:
  Responde indicando exactamente que puede consultar al 76299724 sobre algún problema o reembolso que quiera, tomando en cuenta que el producto va a ser revisado para verificar si fue manipulado o defectuoso y que el empaque debe estar intacto, e invítalo a elegir si desea ir a WhatsApp o quedarse en la tienda.
  Además incluye en acciones: [{ "tipo": "opciones_reembolso" }].

CATÁLOGO REAL:
${catalogText || "Sin productos."}

ENVÍOS Y COBERTURA:
- Envío GRATIS para todos los productos, sin mínimo ni límite de precio, en TODAS las zonas principales: Salvador del Mundo (Gasolinera Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer y Redondel Luceiro.
- Colonia Escalón: $1.50 extra.
- Para ubicación personalizada: cobertura directa hasta 5.0 km con tarifa optimizada en montos limpios de $0.50 en $0.50 (referencia desde ~$1 o $1.50 hasta ~$3.50 USD dentro de 5 km, nunca centavos sueltos como $2.25). Si supera los 5.0 km, está fuera de cobertura directa y debe coordinarse por WhatsApp.
- Si existe "UBICACIÓN Y COBERTURA ACTUAL DEL CLIENTE" abajo, DEBES responder indicando la ubicación del cliente, la distancia calculada en km, el estado de cobertura y el monto exacto del envío aproximado (en formato $1, $1.50, $2, $2.50, etc.). Si el cliente pregunta cuánto cuesta el envío sin indicar dirección, menciona las zonas gratis, Colonia Escalón ($1.50), el rango limpio por km dentro de 5 km ($1 a $3.50) e invítalo a escribir su colonia o dirección aquí mismo para calcularle su costo exacto.${deliveryContextBlock}

FORMATO JSON OBLIGATORIO:
{ "respuesta": "...", "acciones": [...] }
- Solo existen 3 acciones posibles: "agregar" (con "productoId" real del catálogo y "cantidad" >= 1), "abrir_carrito" y "opciones_reembolso".
- REGLA CRÍTICA DE ACCIONES: Si el cliente solo pregunta precio, stock, características, envíos o saluda (sin pedir explícitamente agregar/comprar/llevar/poner/dame), devuelve SIEMPRE "acciones": [].
- REGLA ESTRICTA DE PRODUCTO EXACTO: Cuando el cliente pida agregar/comprar un producto específico (por ejemplo "un soporte de moto"), busca el producto exacto en CATÁLOGO REAL (por ejemplo [soporte-moto] "Soporte Premium para Moto 50–95mm", NO lo confundas con [candado-moto] ni [soporte-retrovisor]) y agrega ÚNICAMENTE ese producto. NUNCA agregues otros productos, complementos ni sugerencias que el usuario no haya pedido explícitamente.
- Incluye "agregar" ÚNICAMENTE cuando el usuario pida explícitamente agregar, añadir, poner, dame, comprar o llevar un producto al carrito.
- Incluye "abrir_carrito" ÚNICAMENTE cuando el usuario pida ver o abrir el carrito.
- Incluye "opciones_reembolso" ÚNICAMENTE cuando pregunte por reembolso, devolución, garantía o algún problema/falla con un producto.`;

      const contents = [
        ...history.map((h) => ({
          role: h.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: h.text.slice(0, 400) }],
        })),
        {
          role: "user" as const,
          parts: [{ text: userMessage }],
        },
      ];

      const callGemini = async (timeoutMs: number) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          return await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: "application/json",
              abortSignal: controller.signal,
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  respuesta: {
                    type: Type.STRING,
                    description: "Respuesta breve y útil para el cliente.",
                  },
                  acciones: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        tipo: {
                          type: Type.STRING,
                          description:
                            "Únicamente 'agregar', 'abrir_carrito' u 'opciones_reembolso'.",
                        },
                        productoId: {
                          type: Type.STRING,
                          description: "ID string o numérico del producto real.",
                        },
                        cantidad: {
                          type: Type.INTEGER,
                          description: "Cantidad entera >= 1.",
                        },
                      },
                      required: ["tipo"],
                    },
                  },
                },
                required: ["respuesta", "acciones"],
              },
            },
          });
        } finally {
          clearTimeout(timeoutId);
        }
      };

      const startedAt = Date.now();
      let response;
      try {
        response = await callGemini(AI_TIMEOUT_MS);
      } catch (firstErr) {
        const isAbort =
          firstErr instanceof Error &&
          (firstErr.name === "AbortError" ||
            firstErr.message.toLowerCase().includes("abort"));
        const elapsed = Date.now() - startedAt;
        if (!isAbort && elapsed < 3500) {
          response = await callGemini(Math.max(4000, AI_TIMEOUT_MS - elapsed));
        } else {
          throw firstErr;
        }
      }

      const rawText = (response.text ?? "").trim();
      const parsed = extractJsonObject(rawText);

      // Filtra acciones permitidas en el servidor como capa adicional de seguridad
      const normalize = (s: unknown) =>
        String(s ?? "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/g, " ");

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
      ]);

      const queryTokens = normalize(userMessage)
        .split(/\s+/)
        .filter((t) => t.length >= 2 && !stopWords.has(t));

      const scoreCatalogItem = (item: CatalogItemInput): number => {
        const hayName = normalize(item.name);
        const hayCat = normalize(item.category);
        const hayId = normalize(item.id);
        let score = 0;
        for (const tok of queryTokens) {
          if (hayName.includes(tok)) score += 10;
          if (hayId.includes(tok)) score += 6;
          if (hayCat.includes(tok)) score += 4;
        }
        return score;
      };

      const resolveCatalogItem = (
        productoId: unknown
      ): CatalogItemInput | undefined => {
        if (productoId === undefined || productoId === null) return undefined;
        const asStr = String(productoId).trim();
        const exact = catalog.find((c) => c.id === asStr);
        if (exact) return exact;
        const asNum = Number(productoId);
        if (
          Number.isInteger(asNum) &&
          asNum >= 1 &&
          asNum <= catalog.length
        ) {
          return catalog[asNum - 1];
        }
        return undefined;
      };

      const rawActions = Array.isArray(parsed?.acciones)
        ? parsed.acciones.filter(
            (a: { tipo?: unknown }) =>
              a &&
              typeof a === "object" &&
              (a.tipo === "agregar" ||
                a.tipo === "abrir_carrito" ||
                a.tipo === "opciones_reembolso")
          )
        : [];

      const wantsMultiple =
        /\b(y|tambien|también|ademas|además|junto)\b|,|\+/i.test(userMessage);

      const addActions = rawActions.filter(
        (a: { tipo?: unknown }) => a.tipo === "agregar"
      );
      const otherActions = rawActions.filter(
        (a: { tipo?: unknown }) => a.tipo !== "agregar"
      );

      let filteredAddActions = addActions.filter(
        (a: { productoId?: unknown }) => Boolean(resolveCatalogItem(a.productoId))
      );

      if (filteredAddActions.length > 1 && !wantsMultiple && queryTokens.length > 0) {
        // Si el usuario pidió un solo producto, conserva únicamente el que mejor coincide con su solicitud
        let bestAction = filteredAddActions[0];
        let bestScore = -1;
        for (const action of filteredAddActions) {
          const item = resolveCatalogItem(action.productoId);
          const s = item ? scoreCatalogItem(item) : 0;
          if (s > bestScore) {
            bestScore = s;
            bestAction = action;
          }
        }
        filteredAddActions = [bestAction];
      }

      const safeActions = [...filteredAddActions, ...otherActions];

      return res.json({
        respuesta:
          typeof parsed?.respuesta === "string"
            ? parsed.respuesta
            : "Solo atiendo consultas sobre productos, stock y pedidos de GoTech SV.",
        acciones: safeActions,
      });
    } catch (error) {
      const isAbort =
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.toLowerCase().includes("abort"));
      if (!isAbort) {
        console.warn(
          "Aviso en /api/ai/chat:",
          error instanceof Error ? error.message : String(error)
        );
      }
      if (res.headersSent || res.writableEnded) {
        return;
      }
      return res.status(isAbort ? 504 : 502).json({
        error: isAbort
          ? "La consulta tardó demasiado."
          : "No se pudo procesar la consulta con Gemini.",
      });
    }
  });

  // Geocodificación segura para resolver direcciones del cliente en San Salvador
  app.get("/api/geocode", async (req, res) => {
    try {
      const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (!rawQ) {
        return res.status(400).json({ error: "Dirección vacía" });
      }
      const buildQuery = (text: string) =>
        text.toLowerCase().includes("salvador")
          ? text
          : `${text}, San Salvador, El Salvador`;

      const fetchNominatim = async (text: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sv&q=${encodeURIComponent(
            buildQuery(text)
          )}`;
          const geoRes = await fetch(nominatimUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent": "GoTechSV-DeliveryCalc/1.0",
              Accept: "application/json",
            },
          });
          if (!geoRes.ok) return null;
          const results = await geoRes.json();
          if (!Array.isArray(results) || results.length === 0) return null;
          const lat = Number(results[0]?.lat);
          const lng = Number(results[0]?.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return { lat, lng };
        } finally {
          clearTimeout(timeoutId);
        }
      };

      let coords = await fetchNominatim(rawQ);
      if (!coords) {
        const simplified = rawQ
          .replace(/#\s*\d+[a-z]?/gi, "")
          .replace(/\b(?:casa|pasaje|psj|block|poligono|polígono|apto|local)\s*[a-z0-9-]*/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        if (simplified && simplified !== rawQ) {
          coords = await fetchNominatim(simplified);
        }
      }

      if (!coords) {
        return res.status(404).json({ error: "Sin resultados" });
      }
      return res.json(coords);
    } catch {
      return res.status(502).json({ error: "Error de geocodificación" });
    }
  });

  // Cotización inteligente de envío con Gemini 3.1: precio atractivo al cliente, pago justo al repartidor y margen sostenible
  app.post("/api/ai/shipping-quote", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "Servicio de IA no configurado en el servidor.",
        });
      }

      const body = req.body ?? {};
      const distanceKm = Number(body.distanceKm);
      const subtotal = Number(body.subtotal ?? 0);
      const itemCount = Number(body.itemCount ?? 1);
      const withinCoverage = Boolean(body.withinCoverage);
      const baseShippingUsd = Number(body.baseShippingUsd ?? 0);
      const customerAddress =
        typeof body.customerAddress === "string"
          ? body.customerAddress.trim().slice(0, 140)
          : "";

      if (!Number.isFinite(distanceKm) || distanceKm < 0) {
        return res.status(400).json({ error: "Distancia inválida." });
      }

      const safeSubtotal =
        Number.isFinite(subtotal) && subtotal >= 0 ? subtotal : 0;
      const safeItemCount =
        Number.isFinite(itemCount) && itemCount >= 1
          ? Math.round(itemCount)
          : 1;
      const safeBase =
        Number.isFinite(baseShippingUsd) && baseShippingUsd >= 0
          ? baseShippingUsd
          : Math.round((0.5 + distanceKm * 0.6) * 100) / 100;

      const ai = getAiClient(apiKey);

      const round2 = (n: number) =>
        Math.round((n + Number.EPSILON) * 100) / 100;

      const systemInstruction = `Eres el motor de cálculo logístico y precios de envío de GoTech SV en San Salvador, El Salvador.
Debes calcular un desglose justo y equilibrado en USD considerando:
1. PRECIO EXCELENTE AL CONSUMIDOR: Tarifa competitiva, clara y atractiva para el cliente según su distancia y monto de compra, que incentive a completar el pedido sin sentirse caro.
2. COMPENSACIÓN JUSTA AL REPARTIDOR: Debe cubrir combustible, desgaste de moto/vehículo, tiempo en tráfico de San Salvador y entrega en mano (proporcional a la distancia).
3. GANANCIA SOSTENIBLE PARA LA TIENDA: Debe dejar un margen operativo positivo razonable para GoTech SV sobre el servicio de envío.

REGLAS ESTRICTAS:
- MONTO LIMPIO SIN CENTAVOS SUELTOS: "shippingPriceUsd" DEBE ser SIEMPRE un múltiplo exacto de $0.50 USD (únicamente valores como 1, 1.5, 2, 2.5, 3, 3.5, 4, etc.; PROHIBIDO usar centavos sueltos como 1.25, 1.75, 2.15 o 2.25).
- CERO cupones, códigos promocionales ni descuentos sobre los productos.
- NUNCA menciones direcciones de origen ni puntos de partida de la tienda.
- Coherencia matemática obligatoria: shippingPriceUsd = driverCompensationUsd + storeMarginUsd (todos > 0).
- Si withinCoverage es false (> 5.0 km), calcula un estimado referencial en múltiplos de $0.50 aclarando que supera los 5 km de cobertura directa y debe coordinarse por WhatsApp.
- Responde en español breve, profesional y claro.`;

      const userPrompt = JSON.stringify({
        distanceKm: round2(distanceKm),
        withinCoverage,
        maxDirectCoverageKm: 5.0,
        orderSubtotalUsd: round2(safeSubtotal),
        itemCount: safeItemCount,
        referenceBaselineUsd: round2(safeBase),
        customerZoneOrAddress: customerAddress || "Ubicación personalizada",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Calcula el costo óptimo de envío, pago al repartidor y ganancia operativa para este pedido:\n${userPrompt}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: "application/json",
            abortSignal: controller.signal,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                shippingPriceUsd: {
                  type: Type.NUMBER,
                  description:
                    "Precio final excelente para el consumidor en USD (2 decimales).",
                },
                driverCompensationUsd: {
                  type: Type.NUMBER,
                  description:
                    "Pago justo destinado al repartidor en USD (2 decimales).",
                },
                storeMarginUsd: {
                  type: Type.NUMBER,
                  description:
                    "Ganancia o margen operativo que queda para la tienda en USD (2 decimales).",
                },
                consumerSummary: {
                  type: Type.STRING,
                  description:
                    "Explicación breve y amigable para el consumidor (máx 1 oración).",
                },
                pricingNote: {
                  type: Type.STRING,
                  description:
                    "Nota breve sobre equilibrio entre consumidor, repartidor y ganancia (máx 1 oración).",
                },
              },
              required: [
                "shippingPriceUsd",
                "driverCompensationUsd",
                "storeMarginUsd",
                "consumerSummary",
                "pricingNote",
              ],
            },
          },
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const rawText = (response.text ?? "").trim();
      const parsed = extractJsonObject(rawText);

      const rawDriver = Number(parsed?.driverCompensationUsd);
      const rawMargin = Number(parsed?.storeMarginUsd);
      const rawTotal = Number(parsed?.shippingPriceUsd);

      if (
        !Number.isFinite(rawDriver) ||
        !Number.isFinite(rawMargin) ||
        !Number.isFinite(rawTotal) ||
        rawDriver <= 0 ||
        rawMargin <= 0 ||
        rawTotal <= 0
      ) {
        return res.status(502).json({
          error: "La IA devolvió montos inválidos para el cálculo de envío.",
        });
      }

      const shippingPriceUsd = Math.max(
        1,
        Math.round((rawTotal + Number.EPSILON) * 2) / 2
      );
      const ratio = rawDriver / (rawDriver + rawMargin);
      const driverCompensationUsd = round2(
        Math.max(0.5, shippingPriceUsd * ratio)
      );
      const storeMarginUsd = round2(
        Math.max(0.1, shippingPriceUsd - driverCompensationUsd)
      );

      const consumerSummary =
        typeof parsed?.consumerSummary === "string" &&
        parsed.consumerSummary.trim()
          ? parsed.consumerSummary.trim().slice(0, 180)
          : "Tarifa optimizada por distancia con entrega rápida y pago justo al repartidor.";

      const pricingNote =
        typeof parsed?.pricingNote === "string" && parsed.pricingNote.trim()
          ? parsed.pricingNote.trim().slice(0, 200)
          : "Equilibra un precio accesible para el cliente, pago justo al repartidor y margen operativo.";

      return res.json({
        shippingPriceUsd,
        driverCompensationUsd,
        storeMarginUsd,
        consumerSummary,
        pricingNote,
        model: "gemini-3.1-flash-lite",
      });
    } catch (error) {
      const isAbort =
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.toLowerCase().includes("abort"));
      if (res.headersSent || res.writableEnded) {
        return;
      }
      return res.status(isAbort ? 504 : 502).json({
        error: isAbort
          ? "El cálculo de envío con IA tardó demasiado."
          : "No se pudo calcular la tarifa optimizada con Gemini 3.1.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`GoTech SV server running on http://0.0.0.0:${port}`);
  });
}

startServer();
