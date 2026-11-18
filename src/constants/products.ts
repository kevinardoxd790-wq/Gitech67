import { Product } from "@/types";
import { PromoCode } from "@/constants/promoCodes";

/**
 * Dynamic Bluetooth discount: rotates every 2 days, max 15%.
 * Returns the discount percentage (0 means no discount active).
 */
export function getBluetoothDynamicDiscount(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const period = Math.floor(dayOfYear / 2);
  // Cycle: on, off, on (higher), off, on (max), off
  const cycle = [10, 0, 12, 0, 15, 0];
  return cycle[period % cycle.length];
}

export const WHATSAPP_NUMBER = "50376299724";

// Shipping logic:
// All products & prices → free in all 6 main zones (including Salvador del Mundo) + Colonia Escalón ($1.50)
export interface ShippingZone {
  name: string;
  cost: number; // 0 = free, > 0 = extra cost
  note?: string;
}

export function getShippingZones(_total: number = 0, _totalItems: number = 0): ShippingZone[] {
  return [
    { name: "Salvador del Mundo (Gasolinera Texaco)", cost: 0 },
    { name: "Galerías Escalón", cost: 0 },
    { name: "Torre Futura", cost: 0 },
    { name: "75 Av. Norte (Gasolinera)", cost: 0 },
    { name: "Redondel Masferrer", cost: 0 },
    { name: "Redondel Luceiro", cost: 0 },
    { name: "Colonia Escalón", cost: 1.5 },
  ];
}

export function getShippingLabel(_total: number = 0, _totalItems: number = 0): string {
  return "¡Envío GRATIS en todas las zonas (incluye Salvador del Mundo) sin mínimo de compra!";
}

export const PRODUCTS: Product[] = [
  {
    id: "bluetooth-5-0",
    name: "Adaptador USB Bluetooth 5.0",
    shortName: "Bluetooth 5.0",
    price: 9.50,
    stock: 8,
    image: "https://cdn-ai.onspace.ai/onspace/files/THvUj2c69krqnY28qJZzBE/1000512167.png",
    badge: "🔥 MÁS VENDIDO",
    description: "Convierte cualquier PC en Bluetooth. Certificación BQB CSR 5.0 oficial. Plug & Play sin drivers. Alcance hasta 20m.",
    features: [
      "Bluetooth 5.0 — conexión estable hasta 20m",
      "Plug & Play, sin instalación ni drivers",
      "Compatible con audífonos, bocinas y controles",
      "Para PC, laptops y computadoras de escritorio",
      "Diseño compacto y portátil",
    ],
    available: true,
    category: "Bluetooth",
  },
  {
    id: "microsd-128gb",
    name: "Memoria MicroSD 128GB MTMAX",
    shortName: "MicroSD 128GB",
    price: 10.50,
    stock: 6,
    image: "https://cdn-ai.onspace.ai/onspace/files/8QiifjmnBoEDHv6PPLFNTZ/1000512165.png",
    badge: "💾 NUEVO",
    description: "Memoria MicroSD 128GB velocidad 200MB/s. Almacena fotos, videos y archivos. Compatible con celulares, cámaras y tablets.",
    features: [
      "Alta velocidad: lectura hasta 200MB/s",
      "128GB para fotos, videos y archivos",
      "Compatible con celulares, cámaras y tablets",
      "Resistente a agua, golpes y rayones",
      "Incluye adaptador SD",
    ],
    available: true,
    category: "Memorias",
  },
  {
    id: "microsd-64gb",
    name: "Memoria MicroSD 64GB MTMAX",
    shortName: "MicroSD 64GB",
    price: 8.50,
    stock: 7,
    image: "https://cdn-ai.onspace.ai/onspace/files/LMesSYSZMRbtrf2mkJ8Jhv/1000512163.png",
    badge: "💾 NUEVO",
    description: "Memoria MicroSD 64GB velocidad 200MB/s. Perfecta para celulares, cámaras y tablets. Resistente al agua.",
    features: [
      "Alta velocidad: lectura hasta 200MB/s",
      "64GB para tus fotos, videos y archivos",
      "Compatible con celulares, cámaras y tablets",
      "Resistente a agua, golpes y rayones",
      "Incluye adaptador SD",
    ],
    available: true,
    category: "Memorias",
  },
  {
    id: "candado-moto",
    name: "Candado de Cable para Moto MasJie",
    shortName: "Candado Moto",
    price: 5.00,
    stock: 5,
    image: "https://cdn-ai.onspace.ai/onspace/files/NcVov2uKUMPvsTPCYHJswd/1000512137.png",
    badge: "🔒 SEGURIDAD",
    description: "Candado de cable de acero reforzado para moto. Combinación de 4 dígitos, sin llaves. Material anticorte y anticorrosión.",
    features: [
      "Cable de acero reforzado anticorte",
      "Combinación de 4 dígitos, sin llaves",
      "Material anticorte y anticorrosión",
      "Práctico, portátil y confiable",
      "Ideal para cualquier tipo de moto",
    ],
    available: true,
    category: "Accesorios Moto",
  },
  {
    id: "control-remoto-universal",
    name: "Control Remoto Universal LCD/LED",
    shortName: "Control Universal",
    price: 7.00,
    stock: 5,
    image: "https://cdn-ai.onspace.ai/onspace/files/6yw9h27cbTqF6zJJ3HSUVM/1000511704.png",
    badge: "📺 COMPATIBLE",
    description: "Compatible con la mayoría de TVs LCD/LED. Botones Netflix, YouTube, Prime Video. Diseño práctico e intuitivo.",
    features: [
      "Compatible con TVs LCD/LED de todas las marcas",
      "Acceso rápido a Netflix, YouTube y Prime Video",
      "Diseño práctico con botones intuitivos",
      "Calidad garantizada para uso diario",
      "Fácil de usar sin configuración",
    ],
    available: true,
    category: "Controles",
  },
  {
    id: "soporte-retrovisor",
    name: "Soporte para Auto 360° Retrovisor",
    shortName: "Soporte Auto 360°",
    price: 5.00,
    stock: 6,
    image: "https://cdn-ai.onspace.ai/onspace/files/ScCLdQsvyEKjf9Tb7GX6i9/1000512075.png",
    badge: "🚗 ROTACIÓN 360°",
    description: "Soporte de celular para espejo retrovisor con rotación 360°. Ajuste seguro y sujeción firme. Compatible con todos los smartphones.",
    features: [
      "Rotación 360° para el ángulo perfecto",
      "Ajuste seguro y sujeción firme",
      "Compatible con todos los smartphones",
      "Instalación rápida sin herramientas",
      "Material resistente y duradero",
    ],
    available: true,
    category: "Accesorios Auto",
  },
  {
    id: "soporte-moto",
    name: "Soporte Premium para Moto 50–95mm",
    shortName: "Soporte Moto",
    price: 8.50,
    stock: 7,
    image: "https://cdn-ai.onspace.ai/onspace/files/dY7DxKhGn7koBAfEkp3tJg/1000511238.png",
    badge: "🏍️ PREMIUM",
    description: "Soporte premium metálico para retrovisor de moto. Compatible 50–95mm. Diseño metálico premium resistente a cualquier terreno.",
    features: [
      "Compatible 50–95mm con todos los smartphones",
      "Diseño metálico premium resistente",
      "Ideal para GPS, música y llamadas",
      "Fácil instalación en retrovisor de moto",
      "Máxima seguridad en cualquier terreno",
    ],
    available: true,
    category: "Accesorios Moto",
  },
  {
    id: "control-tcl",
    name: "Control Remoto TCL Smart TV",
    shortName: "Control TCL",
    price: 10.00,
    stock: 3,
    image: "https://cdn-ai.onspace.ai/onspace/files/MwBcLQraNJUPLrji2LwHnH/1000511696.png",
    badge: "🟢 DISPONIBLE HOY",
    description: "Control universal para todos los modelos TCL Smart TV. Con Asistente de Google, Netflix y YouTube integrados.",
    features: [
      "Compatible con todos los modelos TCL Smart TV",
      "Asistente de Google integrado",
      "Botones directos Netflix y YouTube",
      "Diseño ergonómico e intuitivo",
      "Calidad garantizada para uso diario",
    ],
    available: true,
    category: "Controles",
  },
  {
    id: "perfume-fairyland-femme",
    name: "Perfume Fairyland Para Mujer (60 ml)",
    shortName: "Fairyland 60 ml",
    price: 7.00,
    stock: 8,
    image: "/assets/aistudio/file_00000000b81c81f5ac262cc0e2b2b1d7_4f8b72dd.png",
    badge: "🌸 MUJER · 60 ML",
    description: "Eau de Toilette Fairyland Para Mujer 60 ml (2 FL. OZ.). Aroma femenino encantador y fragancia de larga duración con calidad garantizada.",
    features: [
      "Aroma femenino dulce y envolvente",
      "Fragancia de larga duración",
      "Eau de Toilette Spray — 60 ml / 2 FL. OZ.",
      "Calidad garantizada en caja sellada",
    ],
    available: true,
    category: "Perfumes Mujer",
  },
  {
    id: "perfume-205-femme",
    name: "Perfume 205 Pour Femme Byoutfull (60 ml)",
    shortName: "205 Pour Femme 60 ml",
    price: 7.00,
    stock: 8,
    image: "/assets/aistudio/file_000000002ffc81f5b12355e82b4ad7c6_0940f529.png",
    badge: "🌸 MUJER · 60 ML",
    description: "Eau de Toilette Spray 205 Pour Femme Byoutfull 60 ml (2 FL. OZ.). Elegancia en cada detalle con aroma femenino y floral de larga duración.",
    features: [
      "Aroma femenino y floral elegante",
      "Fragancia de larga duración",
      "Eau de Toilette Spray — 60 ml / 2 FL. OZ.",
      "Calidad garantizada",
    ],
    available: true,
    category: "Perfumes Mujer",
  },
  {
    id: "perfume-221-femme",
    name: "Perfume 221 Pour Femme Byoutfull (60 ml)",
    shortName: "221 Pour Femme 60 ml",
    price: 7.00,
    stock: 8,
    image: "/assets/aistudio/file_000000001ebc81f5aa11ed2d685b209a_f969dd83.png",
    badge: "🌸 MUJER · 60 ML",
    description: "Eau de Toilette Spray 221 Pour Femme Byoutfull 60 ml (2 FL. OZ.). Elegancia en cada detalle con aroma femenino y floral seductor de larga duración.",
    features: [
      "Aroma femenino y floral sofisticado",
      "Fragancia de larga duración",
      "Eau de Toilette Spray — 60 ml / 2 FL. OZ.",
      "Calidad garantizada",
    ],
    available: true,
    category: "Perfumes Mujer",
  },
  {
    id: "perfume-michael-jordan-homme",
    name: "Perfume Michael Jordan Pour Homme (60 ml)",
    shortName: "Michael Jordan 60 ml",
    price: 7.00,
    stock: 8,
    image: "/assets/aistudio/file_00000000d78481f588739b41a880bcf4_602d02f8.png",
    badge: "🖤 HOMBRE · 60 ML",
    description: "Eau de Toilette Spray Michael Jordan Pour Homme (MBJ) 60 ml (2 FL. OZ.). Carácter, fuerza y distinción en una fragancia duradera ideal para el hombre moderno.",
    features: [
      "Carácter, fuerza y distinción",
      "Fragancia duradera ideal para el hombre moderno",
      "Eau de Toilette Spray — 60 ml / 2 FL. OZ.",
      "Calidad garantizada",
    ],
    available: true,
    category: "Perfumes Hombre",
  },
];

export function isPerfumeProduct(
  product?: { category?: string; id?: string } | null
): boolean {
  if (!product) return false;
  const cat = (product.category ?? "").toLowerCase();
  const id = (product.id ?? "").toLowerCase();
  return cat.includes("perfume") || id.startsWith("perfume-");
}

export function getDiscountedPrice(product: Product, dynamicDiscount?: number): number {
  const d = dynamicDiscount ?? (product.discount ?? 0);
  if (d > 0) return product.price * (1 - d / 100);
  return product.price;
}

export function buildWhatsAppMessage(product: Product, address?: string): string {
  const finalPrice = getDiscountedPrice(product);
  let msg = `Hola GoTech! 👋\n\nQuiero comprar:\n🛒 *${product.name}* — *$${finalPrice.toFixed(2)}*`;
  if (address) {
    msg += `\n\n📍 *Dirección de entrega:*\n${address}`;
  }
  msg += `\n\n¿Está disponible? ¿Cuál es el costo de envío a mi zona?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function buildCartWhatsAppMessage(
  items: { product: Product; quantity: number }[],
  address: string,
  promoCode?: PromoCode
): string {
  const lines = items.map((i) => {
    const price = getDiscountedPrice(i.product);
    return `• ${i.product.name} x${i.quantity} — $${(price * i.quantity).toFixed(2)}`;
  });
  const subtotal = items.reduce((sum, i) => sum + getDiscountedPrice(i.product) * i.quantity, 0);
  const discount = promoCode
    ? (() => {
        if (promoCode.productId) {
          const t = items.find((i) => i.product.id === promoCode.productId);
          if (!t) return 0;
          // Use fixed discount if specified
          if ((promoCode as { discountFixed?: number }).discountFixed !== undefined) {
            return (promoCode as { discountFixed?: number }).discountFixed! * t.quantity;
          }
          const ip = t.product.discount ? t.product.price * (1 - t.product.discount / 100) : t.product.price;
          return ip * t.quantity * (promoCode.discountPercent / 100);
        }
        if ((promoCode as { discountFixed?: number }).discountFixed !== undefined) {
          return (promoCode as { discountFixed?: number }).discountFixed!;
        }
        return subtotal * (promoCode.discountPercent / 100);
      })()
    : 0;
  const total = subtotal - discount;

  let msg = `Hola GoTech! 👋\n\n🛒 *Mi pedido:*\n${lines.join("\n")}`;
  if (promoCode) {
    msg += `\n\n🎁 *Código de descuento:* ${promoCode.code} (-${promoCode.discountPercent}%)`;
    msg += `\n💸 *Descuento aplicado:* -$${discount.toFixed(2)}`;
  }
  msg += `\n\n💰 *Total: $${total.toFixed(2)}*`;
  if (address) {
    msg += `\n\n📍 *Dirección de entrega:*\n${address}`;
  }
  msg += `\n\n¿Pueden confirmar disponibilidad y costo de envío?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
