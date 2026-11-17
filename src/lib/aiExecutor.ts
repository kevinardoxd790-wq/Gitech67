import { Product } from "@/types";

export interface AIAccion {
  tipo: string;
  productoId?: string | number;
  cantidad?: number;
}

export interface AIRespuestaJSON {
  respuesta: string;
  acciones: AIAccion[];
}

export interface EjecutorAccionesDeps {
  products: Product[];
  addToCart: (product: Product) => void;
  openCart: () => void;
  onRefundOptions?: () => void;
}

/**
 * Busca un producto real del catálogo a partir de su ID string o su índice numérico (1-based).
 */
function resolverProductoReal(
  productoId: string | number | undefined,
  products: Product[]
): Product | null {
  if (productoId === undefined || productoId === null) return null;

  // Coincidencia exacta por ID string
  const asString = String(productoId).trim();
  const exact = products.find((p) => p.id === asString);
  if (exact) return exact;

  // Coincidencia por ID numérico (1 = primer producto del catálogo)
  const asNumber = Number(productoId);
  if (
    Number.isInteger(asNumber) &&
    asNumber >= 1 &&
    asNumber <= products.length
  ) {
    return products[asNumber - 1] ?? null;
  }

  return null;
}

/**
 * Ejecuta de manera controlada y segura las acciones estructuradas enviadas por la IA:
 * - agregar: Suma el producto usando la función manual addToCart.
 * - abrir_carrito: Despliega el panel del carrito.
 * - opciones_reembolso: Muestra botones de soporte/reembolso por WhatsApp.
 * Cualquier acción inválida se ignora de forma segura sin arrojar errores.
 */
export function ejecutarAccionesIA(
  data: unknown,
  deps: EjecutorAccionesDeps
): void {
  try {
    if (!data || typeof data !== "object") return;
    const payload = data as Partial<AIRespuestaJSON>;
    if (!Array.isArray(payload.acciones)) return;

    for (const rawAccion of payload.acciones) {
      try {
        if (!rawAccion || typeof rawAccion !== "object") continue;
        const tipo =
          typeof rawAccion.tipo === "string"
            ? rawAccion.tipo.trim().toLowerCase()
            : "";

        if (tipo === "agregar") {
          const producto = resolverProductoReal(
            rawAccion.productoId,
            deps.products
          );
          if (!producto || producto.stock <= 0) continue;

          const cantidadSolicitada = Number(rawAccion.cantidad ?? 1);
          const cantidad = Number.isFinite(cantidadSolicitada)
            ? Math.max(1, Math.min(Math.floor(cantidadSolicitada), producto.stock))
            : 1;

          for (let i = 0; i < cantidad; i++) {
            deps.addToCart(producto);
          }
        } else if (tipo === "abrir_carrito") {
          deps.openCart();
        } else if (tipo === "opciones_reembolso") {
          deps.onRefundOptions?.();
        }
        // Cualquier otra acción desconocida o inválida se ignora silenciosamente
      } catch {
        // Aislamiento por acción para proteger la tienda
      }
    }
  } catch {
    // Aislamiento total de errores
  }
}
