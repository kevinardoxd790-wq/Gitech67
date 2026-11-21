import { Coordinates } from "@/hooks/useCart";

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
  { keywords: ["salvador del mundo", "texaco"], coords: { lat: 13.7014, lng: -89.2244 } },
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

export interface GeocodedAddressResult {
  coords: Coordinates;
  isReferentialFallback: boolean;
}

/**
 * Resuelve texto de dirección en coordenadas { lat, lng }
 * para centrar el mapa interactivo de selección del cliente.
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


