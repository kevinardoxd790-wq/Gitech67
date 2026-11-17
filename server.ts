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

interface BundleItemInput {
  id: string;
  name: string;
  tagline: string;
  bundlePrice: number;
}

interface HistoryItemInput {
  role: "user" | "assistant";
  text: string;
}

const AI_TIMEOUT_MS = 8500;

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
      const bundles: BundleItemInput[] = Array.isArray(body.bundles)
        ? body.bundles.slice(0, 20)
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
              ? ` | ${p.description.trim().slice(0, 120)}`
              : "";
          return `${p.index}. [${p.id}] ${p.name} — $${Number(p.price).toFixed(2)} (stock: ${p.stock}, ${p.category})${desc}`;
        })
        .join("\n");

      const bundlesText = bundles
        .map(
          (b) =>
            `- ${b.name} (${b.tagline.slice(0, 90)}) — $${Number(b.bundlePrice).toFixed(2)}`
        )
        .join("\n");

      const systemInstruction = `Asistente virtual exclusivo de GoTech SV (tienda tech en San Salvador).
Responde en español claro, directo y amable (máximo 3 oraciones).

LÍMITE ESTRICTO DE TEMAS:
- Atiende SOLO consultas sobre catálogo GoTech, precios, stock, combos, envíos en San Salvador, carrito y soporte/problemas o reembolsos de compras GoTech.
- PROHIBIDO responder historia (ej. Cristóbal Colón), geografía, tareas escolares, ciencia o cultura general. Para temas ajenos, declina cortésmente y devuelve "acciones": [].

PRECIOS FIJOS (SIN CUPONES NI DESCUENTOS):
- Todos los precios y envíos son fijos. Nunca menciones ni ofrezcas cupones, códigos o descuentos.

POLÍTICA DE REEMBOLSOS, GARANTÍA Y PROBLEMAS:
- Si el cliente pide reembolso, devolución, cambio, garantía o reporta que un producto salió malo/defectuoso/dañado o tiene un problema con su compra:
  Responde indicando exactamente que puede consultar al 76299724 sobre algún problema o reembolso que quiera, tomando en cuenta que el producto va a ser revisado para verificar si fue manipulado o defectuoso y que el empaque debe estar intacto, e invítalo a elegir si desea ir a WhatsApp o quedarse en la tienda.
  Además incluye en acciones: [{ "tipo": "opciones_reembolso" }].

CATÁLOGO REAL:
${catalogText || "Sin productos."}

COMBOS:
${bundlesText || "Sin combos."}

ENVÍOS FIJOS:
- >= $9.00: gratis en 6 zonas (Salvador del Mundo, Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer, Redondel Luceiro). Colonia Escalón: $1.50 extra.
- $5.00–$8.99: gratis en Torre Futura y 75 Av. Norte. Colonia Escalón: $1.50 extra.

FORMATO JSON OBLIGATORIO:
{ "respuesta": "...", "acciones": [...] }
- Solo existen 3 acciones posibles: "agregar" (con "productoId" real del catálogo y "cantidad" >= 1), "abrir_carrito" y "opciones_reembolso".
- REGLA CRÍTICA DE ACCIONES: Si el cliente solo pregunta precio, stock, características, envíos o saluda (sin pedir explícitamente agregar/comprar/llevar), devuelve SIEMPRE "acciones": [].
- Incluye "agregar" ÚNICAMENTE cuando el usuario pida explícitamente agregar, añadir, comprar o llevar un producto al carrito.
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      let response;
      try {
        response = await ai.models.generateContent({
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

      const rawText = (response.text ?? "").trim();
      const parsed = JSON.parse(rawText);

      // Filtra acciones permitidas en el servidor como capa adicional de seguridad
      const safeActions = Array.isArray(parsed?.acciones)
        ? parsed.acciones.filter(
            (a: { tipo?: unknown }) =>
              a &&
              typeof a === "object" &&
              (a.tipo === "agregar" ||
                a.tipo === "abrir_carrito" ||
                a.tipo === "opciones_reembolso")
          )
        : [];

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
      console.error("Error en /api/ai/chat:", error);
      return res.status(isAbort ? 504 : 502).json({
        error: isAbort
          ? "La consulta tardó demasiado."
          : "No se pudo procesar la consulta con Gemini.",
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
