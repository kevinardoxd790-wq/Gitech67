import { Product } from "@/types";
import { Coordinates } from "@/hooks/useCart";
import { WHATSAPP_NUMBER } from "@/constants/products";
import {
  AiShippingQuote,
  CoverageEstimate,
  calcularCoberturaEnvioSeguro,
  formatEnvioUsd,
} from "@/lib/deliveryCoverage";

interface SafeWhatsAppParams {
  items: { product: Product; quantity: number }[];
  address: string;
  coordinates?: Coordinates | null;
  selectedZone?: string;
  shippingCost?: number | null;
  subtotal?: number;
  totalWithShipping?: number;
  coverageEstimate?: CoverageEstimate | null;
  aiQuote?: AiShippingQuote | null;
}

/**
 * Genera de forma segura el enlace de WhatsApp estructurando el resumen del pedido,
 * el total fijo, la ubicación del cliente y la cobertura/envío aproximado por km.
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

    let coverage: CoverageEstimate | null = null;
    try {
      coverage =
        params.coverageEstimate ??
        calcularCoberturaEnvioSeguro(params.coordinates, params.address);
    } catch {
      coverage = null;
    }

    const effectiveShippingUsd = coverage?.isFreeZone
      ? 0
      : params.aiQuote && Number.isFinite(params.aiQuote.shippingPriceUsd)
        ? params.aiQuote.shippingPriceUsd
        : coverage?.estimatedShippingUsd ?? null;

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
    } else if (coverage) {
      if (coverage.isFreeZone) {
        msg += `\n🚚 Envío (${coverage.freeZoneName || "Punto con envío gratis"}): GRATIS`;
        msg += `\n✅ *Total: $${computedSubtotal.toFixed(2)}*`;
      } else if (coverage.withinCoverage && effectiveShippingUsd !== null) {
        msg += `\n🚚 Envío estimado (${coverage.distanceKm.toFixed(
          2
        )} km): ~${formatEnvioUsd(
          effectiveShippingUsd
        )} USD (es una estimación, precio final a acordar en WhatsApp)`;
        const approxTotal = computedSubtotal + effectiveShippingUsd;
        msg += `\n✅ *Total estimado: ~${
          Number.isInteger(approxTotal)
            ? `$${approxTotal}`
            : `$${approxTotal.toFixed(2)}`
        }*`;
      } else {
        msg += `\n🚚 Envío (${coverage.distanceKm.toFixed(
          2
        )} km): No se puede hacer el envío (consulta en WhatsApp)`;
        msg += `\n✅ *Total productos: $${computedSubtotal.toFixed(2)}*`;
      }
    }

    const trimmedAddress = params.address ? params.address.trim() : "";
    const isRawCoordsAddress = /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(
      trimmedAddress
    );

    if (trimmedAddress && !isRawCoordsAddress) {
      msg += `\n\n📍 Ubicación del cliente: ${trimmedAddress}`;
    }

    if (coverage) {
      msg += `\n📏 Distancia calculada: ${coverage.distanceKm.toFixed(2)} km`;
      msg += `\n📡 Cobertura: ${coverage.statusLabel}`;
      if (
        params.selectedZone &&
        params.shippingCost !== null &&
        params.shippingCost !== undefined
      ) {
        if (coverage.isFreeZone) {
          msg += `\n💵 Punto con envío GRATIS`;
        } else if (coverage.withinCoverage && effectiveShippingUsd !== null) {
          msg += `\n💵 Estimación por km: ~${formatEnvioUsd(
            effectiveShippingUsd
          )} USD (es una estimación, precio final a acordar en WhatsApp)`;
        } else {
          msg += `\n💵 Estado por km: No se puede hacer el envío (consulta en WhatsApp)`;
        }
      }
    }

    const hasValidCoords =
      Boolean(params.coordinates) &&
      Number.isFinite(params.coordinates?.lat) &&
      Number.isFinite(params.coordinates?.lng);

    if (hasValidCoords && params.coordinates) {
      const lat = params.coordinates.lat.toFixed(6);
      const lng = params.coordinates.lng.toFixed(6);
      if (!trimmedAddress || isRawCoordsAddress) {
        msg += "\n";
      }
      msg += `\n📌 Google Maps: https://maps.google.com/?q=${lat},${lng}`;
      msg += `\n🚗 Waze: https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else if (trimmedAddress) {
      if (isRawCoordsAddress) {
        msg += "\n";
      }
      msg += `\n📌 Google Maps: https://maps.google.com/?q=${encodeURIComponent(
        trimmedAddress
      )}`;
      msg += `\n🚗 Waze: https://waze.com/ul?q=${encodeURIComponent(
        trimmedAddress
      )}&navigate=yes`;
    }

    msg +=
      !params.selectedZone && coverage
        ? coverage.isFreeZone
          ? `\n\n¿Pueden confirmar el pedido?`
          : coverage.withinCoverage
            ? `\n\n¿Pueden confirmar el pedido y acordar el precio final del envío?`
            : `\n\nSupera los 5 km de cobertura; ¿pueden confirmar si es posible realizar el envío?`
        : `\n\n¿Pueden confirmar el pedido?`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  } catch {
    // Respaldo seguro si falla el armado del mensaje
    return `https://wa.me/${WHATSAPP_NUMBER}`;
  }
}
