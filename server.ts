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

      const systemInstruction = `Asistente virtual exclusivo de GoTech SV (tienda tech en San Salvador).
Responde en español claro, directo y amable (máximo 3 oraciones).

LÍMITE ESTRICTO DE TEMAS:
- Atiende SOLO consultas sobre catálogo GoTech, precios, disponibilidad, envíos en San Salvador, carrito y soporte/problemas o reembolsos de compras GoTech.
- NUNCA menciones cantidades numéricas de existencias o stock al cliente; solo indica si está Disponible o Agotado.
- NUNCA menciones ni reveles direcciones de origen internas ni puntos de salida de la tienda.
- PROHIBIDO responder historia (ej. Cristóbal Colón), geografía, tareas escolares, ciencia o cultura general. Para temas ajenos, declina cortésmente y devuelve "acciones": [].

PRECIOS FIJOS (SIN CUPONES NI DESCUENTOS):
- Todos los precios son fijos. Nunca menciones ni ofrezcas cupones, códigos o descuentos.

POLÍTICA DE REEMBOLSOS, GARANTÍA Y PROBLEMAS:
- Si el cliente pide reembolso, devolución, cambio, garantía o reporta que un producto salió malo/defectuoso/dañado o tiene un problema con su compra:
  Responde indicando exactamente que puede consultar al 76299724 sobre algún problema o reembolso que quiera, tomando en cuenta que el producto va a ser revisado para verificar si fue manipulado o defectuoso y que el empaque debe estar intacto, e invítalo a elegir si desea ir a WhatsApp o quedarse en la tienda.
  Además incluye en acciones: [{ "tipo": "opciones_reembolso" }].

CATÁLOGO REAL:
${catalogText || "Sin productos."}

ENVÍOS Y UBICACIÓN:
- Envío GRATIS para todos los productos, sin mínimo ni límite de precio, en TODAS las zonas principales: Salvador del Mundo (Gasolinera Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer y Redondel Luceiro.
- Colonia Escalón: $1.50 extra.
- Para cualquier otra dirección o ubicación, indícale al cliente que puede abrir el carrito, seleccionar su punto de entrega directamente en el mapa interactivo y coordinar el envío por WhatsApp (nunca calcules distancias en km ni precios estimados por km).

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

  // Geocodificación multi-capa para resolver cualquier dirección, negocio, colonia o municipio en El Salvador
  app.get("/api/geocode", async (req, res) => {
    try {
      const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (!rawQ) {
        return res.status(400).json({ error: "Dirección vacía" });
      }

      const isInsideElSalvador = (lat: number, lng: number) =>
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= 13.0 &&
        lat <= 14.55 &&
        lng >= -90.25 &&
        lng <= -87.6;

      const simplifyAddress = (text: string) =>
        text
          .replace(/#\s*\d+[a-z0-9-]*/gi, "")
          .replace(
            /\b(?:casa|pasaje|psj|block|poligono|polígono|apto|apartamento|local|lote|senda)\s*[a-z0-9-]*/gi,
            ""
          )
          .replace(/\s+/g, " ")
          .trim();

      const buildSvQuery = (text: string, preferSanSalvador = false) => {
        const lower = text.toLowerCase();
        if (lower.includes("salvador")) return text;
        return preferSanSalvador
          ? `${text}, San Salvador, El Salvador`
          : `${text}, El Salvador`;
      };

      const fetchNominatim = async (text: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sv&q=${encodeURIComponent(
            text
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
          if (!isInsideElSalvador(lat, lng)) return null;
          return { lat, lng };
        } catch {
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      const fetchPhoton = async (text: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
            text
          )}&limit=5&lat=13.7028&lon=-89.2367`;
          const geoRes = await fetch(photonUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent": "GoTechSV-DeliveryCalc/1.0",
              Accept: "application/json",
            },
          });
          if (!geoRes.ok) return null;
          const data = await geoRes.json();
          const features = Array.isArray(data?.features) ? data.features : [];
          for (const f of features) {
            const coordsArr = f?.geometry?.coordinates;
            if (!Array.isArray(coordsArr) || coordsArr.length < 2) continue;
            const lng = Number(coordsArr[0]);
            const lat = Number(coordsArr[1]);
            if (isInsideElSalvador(lat, lng)) {
              return { lat, lng };
            }
          }
          return null;
        } catch {
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      const fetchGeminiCoords = async (text: string) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5500);
        try {
          const ai = getAiClient(apiKey);
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Devuelve las coordenadas geográficas aproximadas en El Salvador para esta dirección, comercio, colonia, residencial o municipio: "${text.slice(
                      0,
                      140
                    )}". Si pertenece al Área Metropolitana de San Salvador o al interior de El Salvador, estima su latitud y longitud reales más probables dentro de El Salvador (found=true). Si es texto totalmente sin sentido no ubicable en ningún lugar real, devuelve found=false.`,
                  },
                ],
              },
            ],
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: "application/json",
              abortSignal: controller.signal,
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  found: { type: Type.BOOLEAN },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ["found", "lat", "lng"],
              },
            },
          });
          const parsed = extractJsonObject((response.text ?? "").trim());
          if (parsed?.found === true) {
            const lat = Number(parsed?.lat);
            const lng = Number(parsed?.lng);
            if (isInsideElSalvador(lat, lng)) {
              return { lat, lng };
            }
          }
          return null;
        } catch {
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      const simplified = simplifyAddress(rawQ);

      // 1. Nominatim (El Salvador general y San Salvador)
      let coords =
        (await fetchNominatim(buildSvQuery(rawQ, false))) ||
        (await fetchNominatim(buildSvQuery(rawQ, true)));
      if (!coords && simplified && simplified !== rawQ) {
        coords =
          (await fetchNominatim(buildSvQuery(simplified, false))) ||
          (await fetchNominatim(buildSvQuery(simplified, true)));
      }

      // 2. Photon OSM (muy bueno para comercios, clínicas, residenciales y calles)
      if (!coords) {
        coords =
          (await fetchPhoton(buildSvQuery(rawQ, true))) ||
          (await fetchPhoton(buildSvQuery(rawQ, false)));
      }

      // 3. Gemini 3.1 Geo-Lookup (lugares, clínicas, residenciales y municipios de El Salvador)
      if (!coords) {
        coords = await fetchGeminiCoords(rawQ);
      }

      if (!coords) {
        return res.status(404).json({ error: "Sin resultados" });
      }
      return res.json(coords);
    } catch {
      return res.status(502).json({ error: "Error de geocodificación" });
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
