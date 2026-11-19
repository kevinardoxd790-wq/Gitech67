import { Coordinates } from "@/hooks/useCart";

// ============================================================================
// CONFIGURACIÓN INTERNA DE COBERTURA Y ENVÍO POR KILÓMETRO (FÁCIL DE EDITAR)
// ============================================================================
const HIDDEN_ORIGIN_COORDS: Coordinates = {
  lat: 13.7028,
  lng: -89.2367,
};

export const COBERTURA_MAXIMA_KM = 5.0; // Máximo 5 km para cobertura directa
export const TARIFA_BASE_ENVIO_USD = 0.5; // Tarifa base ajustable (en USD)
export const PRECIO_POR_KM_USD = 0.6; // Precio aproximado por kilómetro (en USD)
export const TARIFA_MINIMA_ENVIO_USD = 1; // Precio mínimo obligatorio de envío (en USD)

export interface CoverageEstimate {
  distanceKm: number;
  withinCoverage: boolean;
  maxCoverageKm: number;
  statusLabel: string;
  estimatedShippingUsd: number;
  isFreeZone?: boolean;
  freeZoneName?: string;
}

interface FreeShippingPoint {
  name: string;
  coords: Coordinates;
  keywords: string[];
  streetKeywordsForbidden?: boolean;
}

const FREE_SHIPPING_ZONE_POINTS: FreeShippingPoint[] = [
  {
    name: "Salvador del Mundo (Gasolinera Texaco)",
    coords: { lat: 13.7014, lng: -89.2244 },
    keywords: [
      "salvador del mundo",
      "texaco salvador del mundo",
      "gasolinera texaco",
      "plaza las americas",
    ],
  },
  {
    name: "Galerías Escalón",
    coords: { lat: 13.7024, lng: -89.2305 },
    keywords: [
      "galerias escalon",
      "centro comercial galerias",
      "cc galerias",
      "galerias",
    ],
  },
  {
    name: "Torre Futura",
    coords: { lat: 13.7099, lng: -89.2407 },
    keywords: ["torre futura", "world trade center", "wtc san salvador", "wtc"],
  },
  {
    name: "75 Av. Norte (Gasolinera)",
    coords: { lat: 13.7049, lng: -89.2325 },
    keywords: [
      "75 av norte",
      "75 av. norte",
      "75 avenida norte",
      "gasolinera 75",
    ],
  },
  {
    name: "Redondel Masferrer",
    coords: { lat: 13.7052, lng: -89.2484 },
    keywords: ["redondel masferrer", "plaza masferrer", "masferrer"],
    streetKeywordsForbidden: true,
  },
  {
    name: "Redondel Luceiro",
    coords: { lat: 13.7006, lng: -89.2465 },
    keywords: ["redondel luceiro", "plaza luceiro", "luceiro"],
    streetKeywordsForbidden: true,
  },
];

const PROXIMITY_OR_SURROUNDINGS_REGEX =
  /\b(cerca|cercania|cercanias|alrededor|alrededores|inmediaciones|entorno|atras|detras|frente|enfrente|junto|contiguo|vecino|par de|pasando|antes de|despues de|cuadra|cuadras|metro|metros|km|por|rumbo|hacia|camino|bajando|subiendo|esquina|arriba de|abajo de|colonia|col|residencial|res|pasaje|psje|urbanizacion|urb|reparto|comunidad|condominio|apartamento|apto|casa|local|clinica|hospital|hotel|restaurante)\b/;

/**
 * Verifica si la dirección ingresada corresponde exactamente a uno de los 6 puntos
 * con envío gratis (solo el punto exacto; cercanías o alrededores no aplican).
 */
export function matchZonaEnvioGratis(
  addressText?: string | null
): { name: string; coords: Coordinates } | null {
  try {
    if (!addressText || typeof addressText !== "string") return null;
    const normalized = addressText
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalized) return null;
    if (PROXIMITY_OR_SURROUNDINGS_REGEX.test(normalized)) {
      return null;
    }

    for (const point of FREE_SHIPPING_ZONE_POINTS) {
      const matchedKw = point.keywords.find((kw) => normalized.includes(kw));
      if (!matchedKw) continue;

      if (
        point.streetKeywordsForbidden &&
        !matchedKw.startsWith("redondel") &&
        !matchedKw.startsWith("plaza") &&
        /\b(av|avenida|prolongacion|calle|bulevar|blvd)\b/.test(normalized)
      ) {
        continue;
      }

      return { name: point.name, coords: point.coords };
    }

    return null;
  } catch {
    return null;
  }
}

function roundTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundHalfDollar(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return TARIFA_MINIMA_ENVIO_USD;
  return Math.max(
    TARIFA_MINIMA_ENVIO_USD,
    Math.round((value + Number.EPSILON) * 2) / 2
  );
}

export function formatEnvioUsd(value: number): string {
  const snapped = roundHalfDollar(value);
  return Number.isInteger(snapped) ? `$${snapped}` : `$${snapped.toFixed(2)}`;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calcula la distancia geodésica (Haversine) en kilómetros entre el punto base
 * interno oculto y la ubicación del cliente.
 */
export function calcularDistanciaDesdeOrigenKm(
  clientCoords: Coordinates
): number {
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(clientCoords.lat - HIDDEN_ORIGIN_COORDS.lat);
  const dLng = toRadians(clientCoords.lng - HIDDEN_ORIGIN_COORDS.lng);
  const lat1 = toRadians(HIDDEN_ORIGIN_COORDS.lat);
  const lat2 = toRadians(clientCoords.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return roundTwoDecimals(EARTH_RADIUS_KM * c);
}

/**
 * Calcula cobertura (límite 5 km) y precio aproximado por km de manera segura.
 * Si la dirección corresponde exactamente a un punto con envío gratis (no cercanías),
 * retorna envío GRATIS ($0). Nunca expone el punto de origen en su resultado.
 */
export function calcularCoberturaEnvioSeguro(
  clientCoords?: Coordinates | null,
  addressText?: string | null
): CoverageEstimate | null {
  try {
    const freePoint = matchZonaEnvioGratis(addressText);
    if (freePoint) {
      const refCoords =
        clientCoords &&
        Number.isFinite(clientCoords.lat) &&
        Number.isFinite(clientCoords.lng)
          ? clientCoords
          : freePoint.coords;
      const distanceKm = calcularDistanciaDesdeOrigenKm(refCoords);
      return {
        distanceKm,
        withinCoverage: true,
        maxCoverageKm: COBERTURA_MAXIMA_KM,
        statusLabel: `Envío GRATIS (${freePoint.name})`,
        estimatedShippingUsd: 0,
        isFreeZone: true,
        freeZoneName: freePoint.name,
      };
    }

    if (
      !clientCoords ||
      !Number.isFinite(clientCoords.lat) ||
      !Number.isFinite(clientCoords.lng)
    ) {
      return null;
    }

    const distanceKm = calcularDistanciaDesdeOrigenKm(clientCoords);
    const withinCoverage = distanceKm <= COBERTURA_MAXIMA_KM;
    const rawShipping =
      TARIFA_BASE_ENVIO_USD + distanceKm * PRECIO_POR_KM_USD;
    const estimatedShippingUsd = roundHalfDollar(rawShipping);

    return {
      distanceKm,
      withinCoverage,
      maxCoverageKm: COBERTURA_MAXIMA_KM,
      statusLabel: withinCoverage
        ? "Dentro de cobertura (límite 5 km)"
        : "No se puede hacer el envío (consulta en WhatsApp)",
      estimatedShippingUsd,
      isFreeZone: false,
    };
  } catch {
    return null;
  }
}

/**
 * Extrae coordenadas lat/lng de texto plano o enlaces pegados de Google Maps / Waze.
 */
export function extractCoordinatesFromInput(text: string): Coordinates | null {
  try {
    const patterns = [
      /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
      /[?&](?:q|ll)=(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/,
      /(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/,
    ];

    for (const regex of patterns) {
      const match = text.match(regex);
      if (!match) continue;
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        return { lat, lng };
      }
    }
    return null;
  } catch {
    return null;
  }
}

const SAN_SALVADOR_FALLBACK_ZONES: Array<{
  keywords: string[];
  coords: Coordinates;
}> = [
  { keywords: ["salvador del mundo", "texaco salvador del mundo"], coords: { lat: 13.7014, lng: -89.2244 } },
  { keywords: ["galerias", "galerías"], coords: { lat: 13.7024, lng: -89.2305 } },
  { keywords: ["torre futura", "world trade"], coords: { lat: 13.7099, lng: -89.2407 } },
  { keywords: ["redondel masferrer", "masferrer"], coords: { lat: 13.7052, lng: -89.2484 } },
  { keywords: ["redondel luceiro", "luceiro"], coords: { lat: 13.7006, lng: -89.2465 } },
  { keywords: ["75 av", "75 avenida"], coords: { lat: 13.7049, lng: -89.2325 } },
  { keywords: ["castor dental", "residencial escalon", "residencial escalón", "paseo general escalon", "paseo escalon", "escalon", "escalón", "el mirador", "carmen escalon"], coords: { lat: 13.7056, lng: -89.2412 } },
  { keywords: ["bambu", "bambú", "zona rosa", "san benito", "hipodromo", "hipódromo"], coords: { lat: 13.6939, lng: -89.2392 } },
  { keywords: ["la mascota", "mascota", "maquilishuat"], coords: { lat: 13.6968, lng: -89.2396 } },
  { keywords: ["san francisco", "lomas de san francisco"], coords: { lat: 13.6852, lng: -89.2298 } },
  { keywords: ["miramonte"], coords: { lat: 13.7118, lng: -89.2165 } },
  { keywords: ["miralvalle"], coords: { lat: 13.7204, lng: -89.2268 } },
  { keywords: ["metropolis", "metrópolis", "zacamil"], coords: { lat: 13.7294, lng: -89.2189 } },
  { keywords: ["san antonio abad"], coords: { lat: 13.7186, lng: -89.2358 } },
  { keywords: ["colonia medica", "colonia médica", "medica", "médica", "hospital bloom", "bloom", "layco", "la rabida", "rábida"], coords: { lat: 13.7114, lng: -89.2054 } },
  { keywords: ["flor blanca", "estadio magico", "mágico gonzález"], coords: { lat: 13.6997, lng: -89.2136 } },
  { keywords: ["metrocentro", "metrosur"], coords: { lat: 13.7061, lng: -89.2116 } },
  { keywords: ["la cima", "cima"], coords: { lat: 13.6686, lng: -89.2233 } },
  { keywords: ["los proceres", "próceres", "montserrat", "monserrat"], coords: { lat: 13.6819, lng: -89.2141 } },
  { keywords: ["ues", "universidad de el salvador", "minerva"], coords: { lat: 13.7169, lng: -89.2033 } },
  { keywords: ["uca", "universidad centroamericana", "la sultana", "sultana"], coords: { lat: 13.6811, lng: -89.2361 } },
  { keywords: ["multiplaza", "madreselva"], coords: { lat: 13.6793, lng: -89.2496 } },
  { keywords: ["las cascadas", "cascadas"], coords: { lat: 13.6798, lng: -89.2471 } },
  { keywords: ["la gran via", "gran vía", "gran via", "el espino"], coords: { lat: 13.6788, lng: -89.2537 } },
  { keywords: ["santa elena", "plaza malta", "malta"], coords: { lat: 13.6708, lng: -89.2571 } },
  { keywords: ["nuevo cuscatlan", "nuevo cuscatlán", "tuscania"], coords: { lat: 13.6486, lng: -89.2661 } },
  { keywords: ["antiguo cuscatlan", "antiguo cuscatlán"], coords: { lat: 13.6736, lng: -89.2454 } },
  { keywords: ["plaza merliot", "ciudad merliot", "merliot"], coords: { lat: 13.6776, lng: -89.2775 } },
  { keywords: ["santa tecla", "paseo el carmen", "cafetalon", "cafetalón", "las delicias"], coords: { lat: 13.6769, lng: -89.2869 } },
  { keywords: ["lourdes", "lourdes colon", "lourdes colón", "campos verdes"], coords: { lat: 13.7222, lng: -89.3652 } },
  { keywords: ["san juan opico", "opico", "ciudad versalles", "versalles"], coords: { lat: 13.8761, lng: -89.3597 } },
  { keywords: ["zaragoza", "san jose villanueva", "villanueva"], coords: { lat: 13.5894, lng: -89.2889 } },
  { keywords: ["puerto de la libertad", "la libertad", "surf city", "el tunco", "sunzal"], coords: { lat: 13.4883, lng: -89.3222 } },
  { keywords: ["san jacinto"], coords: { lat: 13.6869, lng: -89.1889 } },
  { keywords: ["centro historico", "centro histórico", "san salvador centro", "catedral", "mercado central"], coords: { lat: 13.6972, lng: -89.1914 } },
  { keywords: ["alameda roosevelt", "roosevelt"], coords: { lat: 13.6999, lng: -89.2102 } },
  { keywords: ["bulevar constitucion", "constitucion", "constitución", "la gloria"], coords: { lat: 13.7269, lng: -89.2223 } },
  { keywords: ["plaza mundo", "soyapango", "san bartolo", "prados de venecia", "unicentro soyapango"], coords: { lat: 13.7007, lng: -89.1499 } },
  { keywords: ["ilopango", "altavista", "santa lucia ilopango"], coords: { lat: 13.7017, lng: -89.1094 } },
  { keywords: ["san martin", "san martín"], coords: { lat: 13.7367, lng: -89.0544 } },
  { keywords: ["tonacatepeque", "distrito italia"], coords: { lat: 13.7811, lng: -89.1186 } },
  { keywords: ["mejicanos", "unicentro metropolis"], coords: { lat: 13.7403, lng: -89.2131 } },
  { keywords: ["ayutuxtepeque"], coords: { lat: 13.7453, lng: -89.2052 } },
  { keywords: ["cuscatancingo"], coords: { lat: 13.7364, lng: -89.1836 } },
  { keywords: ["ciudad delgado", "delgado", "paleca"], coords: { lat: 13.7242, lng: -89.1714 } },
  { keywords: ["apopa", "plaza mundo apopa", "periplaza"], coords: { lat: 13.8072, lng: -89.1792 } },
  { keywords: ["nejapa"], coords: { lat: 13.8228, lng: -89.2314 } },
  { keywords: ["quezaltepeque"], coords: { lat: 13.8353, lng: -89.2722 } },
  { keywords: ["aguilares", "guazapa"], coords: { lat: 13.9572, lng: -89.1897 } },
  { keywords: ["san marcos"], coords: { lat: 13.6589, lng: -89.1831 } },
  { keywords: ["planes de renderos", "renderos", "panchimalco"], coords: { lat: 13.6431, lng: -89.1886 } },
  { keywords: ["santo tomas", "santo tomás"], coords: { lat: 13.6406, lng: -89.1333 } },
  { keywords: ["olocuilta", "comalapa", "aeropuerto"], coords: { lat: 13.5697, lng: -89.1172 } },
  { keywords: ["santa ana", "metrocentro santa ana"], coords: { lat: 13.9942, lng: -89.5597 } },
  { keywords: ["chalchuapa"], coords: { lat: 13.9867, lng: -89.6811 } },
  { keywords: ["metapan", "metapán"], coords: { lat: 14.3339, lng: -89.445 } },
  { keywords: ["ahuachapan", "ahuachapán"], coords: { lat: 13.9214, lng: -89.845 } },
  { keywords: ["sonsonate", "acajutla", "izalco"], coords: { lat: 13.7189, lng: -89.7242 } },
  { keywords: ["chalatenango"], coords: { lat: 14.0333, lng: -88.9333 } },
  { keywords: ["cojutepeque", "cuscatlan"], coords: { lat: 13.7167, lng: -88.9333 } },
  { keywords: ["ilobasco", "sensuntepeque"], coords: { lat: 13.8417, lng: -88.85 } },
  { keywords: ["zacatecoluca"], coords: { lat: 13.5083, lng: -88.8683 } },
  { keywords: ["san vicente"], coords: { lat: 13.6333, lng: -88.7833 } },
  { keywords: ["usulutan", "usulután"], coords: { lat: 13.35, lng: -88.45 } },
  { keywords: ["san miguel", "metrocentro san miguel"], coords: { lat: 13.4833, lng: -88.1833 } },
  { keywords: ["la union", "la unión"], coords: { lat: 13.3369, lng: -87.8439 } },
  { keywords: ["san salvador"], coords: { lat: 13.6929, lng: -89.2182 } },
];

const GENERAL_SAN_SALVADOR_REF_COORDS: Coordinates = {
  lat: 13.6929,
  lng: -89.2182,
};

/**
 * Extrae el nombre de un lugar o dirección desde una consulta de chat natural
 * (ej. "¿Cuánto cuesta el envío a Santa Tecla?" -> "Santa Tecla").
 */
export function extraerDestinoDeConsulta(messageText: string): string | null {
  try {
    const cleaned = messageText
      .replace(/[¿?¡!"]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) return null;

    const coords = extractCoordinatesFromInput(cleaned);
    if (coords) {
      return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    }

    const prepMatch = cleaned.match(
      /(?:env[ií]o|entreg[ao]s?|cobertura|costo|precio|tarifa|lleg[ao]n|mandan|hasta|hacia|para|en|a)\s+(?:a|para|en|hacia|hasta)?\s*([a-záéíóúñ0-9][a-záéíóúñ0-9\s.,#-]{2,60})$/i
    );
    if (prepMatch && prepMatch[1]) {
      const candidate = prepMatch[1]
        .replace(/^(la|el|los|las|mi|tu)\s+/i, "")
        .replace(/\b(por favor|gracias|hoy|aproximado|aprox)\b/gi, "")
        .trim();
      if (
        candidate.length >= 3 &&
        !/^(mi ubicacion|mi ubicación|ubicacion|ubicación|aqui|aquí|casa|carrito|pedido)$/i.test(
          candidate
        )
      ) {
        return candidate;
      }
    }

    const normalized = cleaned
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    for (const entry of SAN_SALVADOR_FALLBACK_ZONES) {
      for (const kw of entry.keywords) {
        if (kw !== "san salvador" && normalized.includes(kw)) {
          return kw;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export interface GeocodedAddressResult {
  coords: Coordinates;
  isReferentialFallback: boolean;
}

/**
 * Resuelve texto de dirección en coordenadas { lat, lng } de forma segura
 * para centrar el mapa en el cliente y calcular siempre la cobertura de 5 km y envío.
 */
export async function geocodificarDireccionClienteConEstado(
  addressText: string
): Promise<GeocodedAddressResult | null> {
  try {
    const trimmed = addressText.trim();
    if (!trimmed) return null;

    const direct = extractCoordinatesFromInput(trimmed);
    if (direct) return { coords: direct, isReferentialFallback: false };

    const normalized = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8500);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (
            data &&
            Number.isFinite(Number(data.lat)) &&
            Number.isFinite(Number(data.lng))
          ) {
            return {
              coords: { lat: Number(data.lat), lng: Number(data.lng) },
              isReferentialFallback: false,
            };
          }
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch {
      // Continúa al respaldo local si el servicio externo falla o expira
    }

    for (const entry of SAN_SALVADOR_FALLBACK_ZONES) {
      if (entry.keywords.some((kw) => normalized.includes(kw))) {
        return { coords: entry.coords, isReferentialFallback: false };
      }
    }

    if (trimmed.length >= 3) {
      return {
        coords: GENERAL_SAN_SALVADOR_REF_COORDS,
        isReferentialFallback: true,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Resuelve texto de dirección en coordenadas { lat, lng } de forma segura
 * para centrar el mapa en el cliente y calcular siempre la cobertura de 5 km.
 */
export async function geocodificarDireccionCliente(
  addressText: string
): Promise<Coordinates | null> {
  const result = await geocodificarDireccionClienteConEstado(addressText);
  return result ? result.coords : null;
}

export interface AiShippingQuote {
  shippingPriceUsd: number;
  driverCompensationUsd: number;
  storeMarginUsd: number;
  consumerSummary: string;
  pricingNote: string;
  model?: string;
}

export interface AiShippingQuoteResult {
  quote: AiShippingQuote | null;
  error?: string;
}

const AI_QUOTE_CACHE_KEY = "gotech_ai_shipping_quote_v4";
const memoryQuoteCache = new Map<string, AiShippingQuote>();

export function buildAiShippingCacheKey(params: {
  distanceKm: number;
  subtotal: number;
  itemCount: number;
}): string {
  return `${params.distanceKm.toFixed(2)}|${params.subtotal.toFixed(2)}|${Math.max(
    1,
    Math.round(params.itemCount)
  )}`;
}

export function getCachedAiShippingQuote(
  cacheKey: string
): AiShippingQuote | null {
  try {
    const inMem = memoryQuoteCache.get(cacheKey);
    if (inMem) return inMem;
    const raw = sessionStorage.getItem(AI_QUOTE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.key === cacheKey && parsed?.quote) {
      memoryQuoteCache.set(cacheKey, parsed.quote);
      return parsed.quote as AiShippingQuote;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCachedAiShippingQuote(
  cacheKey: string,
  quote: AiShippingQuote
): void {
  try {
    memoryQuoteCache.set(cacheKey, quote);
    sessionStorage.setItem(
      AI_QUOTE_CACHE_KEY,
      JSON.stringify({ key: cacheKey, quote })
    );
  } catch {
    // Ignora errores de almacenamiento en sesión
  }
}

/**
 * Solicita a Gemini 3.1 en el servidor un cálculo de envío equilibrado:
 * excelente precio para el consumidor, compensación justa al repartidor y ganancia operativa.
 * Nunca envía ni expone el punto de origen interno.
 */
export async function solicitarCotizacionEnvioIA(params: {
  coverage: CoverageEstimate;
  subtotal: number;
  itemCount: number;
  customerAddress?: string;
}): Promise<AiShippingQuoteResult> {
  try {
    const { coverage, subtotal, itemCount, customerAddress } = params;
    const cacheKey = buildAiShippingCacheKey({
      distanceKm: coverage.distanceKm,
      subtotal,
      itemCount,
    });

    const cached = getCachedAiShippingQuote(cacheKey);
    if (cached) {
      return { quote: cached };
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 14000);

    try {
      const response = await fetch("/api/ai/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          distanceKm: coverage.distanceKm,
          withinCoverage: coverage.withinCoverage,
          subtotal,
          itemCount,
          baseShippingUsd: coverage.estimatedShippingUsd,
          customerAddress: customerAddress?.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return {
          quote: null,
          error:
            (data && typeof data.error === "string" && data.error) ||
            "No se pudo obtener la tarifa calculada con Gemini 3.1.",
        };
      }

      const shippingPriceUsd = Number(data?.shippingPriceUsd);
      const driverCompensationUsd = Number(data?.driverCompensationUsd);
      const storeMarginUsd = Number(data?.storeMarginUsd);

      if (
        !Number.isFinite(shippingPriceUsd) ||
        !Number.isFinite(driverCompensationUsd) ||
        !Number.isFinite(storeMarginUsd) ||
        shippingPriceUsd <= 0 ||
        driverCompensationUsd <= 0 ||
        storeMarginUsd <= 0
      ) {
        return {
          quote: null,
          error: "Respuesta inválida de tarifa calculada por IA.",
        };
      }

      const snappedShipping = roundHalfDollar(shippingPriceUsd);
      const quote: AiShippingQuote = {
        shippingPriceUsd: snappedShipping,
        driverCompensationUsd: roundTwoDecimals(driverCompensationUsd),
        storeMarginUsd: roundTwoDecimals(storeMarginUsd),
        consumerSummary:
          typeof data?.consumerSummary === "string"
            ? data.consumerSummary
            : "Estimación calculada por distancia; el precio final se acuerda en WhatsApp.",
        pricingNote:
          typeof data?.pricingNote === "string"
            ? data.pricingNote
            : "Estimación por distancia a confirmar y acordar por WhatsApp.",
        model: typeof data?.model === "string" ? data.model : "gemini-3.1-flash-lite",
      };

      setCachedAiShippingQuote(cacheKey, quote);
      return { quote };
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch {
    return {
      quote: null,
      error: "No se pudo conectar con Gemini 3.1; usando estimado base por km.",
    };
  }
}
