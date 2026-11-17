import { Product } from "@/types";
import { Coordinates } from "@/hooks/useCart";
import { WHATSAPP_NUMBER } from "@/constants/products";

interface SafeWhatsAppParams {
  items: { product: Product; quantity: number }[];
  address: string;
  coordinates?: Coordinates | null;
  selectedZone?: string;
  shippingCost?: number | null;
  subtotal?: number;
  totalWithShipping?: number;
}

/**
 * Genera de forma segura el enlace de WhatsApp estructurando el resumen del pedido,
 * el total fijo y las coordenadas exactas del marcador de Google Maps seleccionado.
 */
export function generarEnlaceWhatsAppSeguro(params: SafeWhatsAppParams): string {
  try {
    const lines = params.items.map(({ product, quantity }) => {
      const price = Number(product.price);
      return `• ${product.name} x${quantity} — $${(price * quantity).toFixed(2)}`;
    });

    const computedSubtotal =
      params.subtotal ??
      params.items.reduce(
        (sum, { product, quantity }) => sum + Number(product.price) * quantity,
        0
      );

    let msg = `Hola GoTech! 👋\n\n🧾 *Mi Pedido:*\n${lines.join("\n")}`;
    msg += `\n\n💰 Subtotal: $${computedSubtotal.toFixed(2)}`;

    if (
      params.selectedZone &&
      params.shippingCost !== null &&
      params.shippingCost !== undefined
    ) {
      msg += `\n🚚 Envío (${params.selectedZone}): ${
        params.shippingCost === 0
          ? "GRATIS"
          : `$${params.shippingCost.toFixed(2)}`
      }`;
      const finalAmount =
        params.totalWithShipping ?? computedSubtotal + params.shippingCost;
      msg += `\n✅ *Total: $${finalAmount.toFixed(2)}*`;
    }

    if (params.address && params.address.trim()) {
      msg += `\n\n📍 Dirección: ${params.address.trim()}`;
    }

    // Agrega coordenadas exactas del marcador de Google Maps si fueron seleccionadas
    if (
      params.coordinates &&
      Number.isFinite(params.coordinates.lat) &&
      Number.isFinite(params.coordinates.lng)
    ) {
      const lat = params.coordinates.lat.toFixed(6);
      const lng = params.coordinates.lng.toFixed(6);
      msg += `\n🗺️ Coordenadas GPS: ${lat}, ${lng}`;
      msg += `\n📌 Pin Google Maps: https://maps.google.com/?q=${lat},${lng}`;
    }

    msg += `\n\n¿Pueden confirmar el pedido?`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  } catch {
    // Respaldo seguro si falla el armado del mensaje
    return `https://wa.me/${WHATSAPP_NUMBER}`;
  }
}
