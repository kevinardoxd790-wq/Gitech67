import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";

const BUYER_NAMES = [
  "Carlos M.",
  "Andrea R.",
  "José L.",
  "Valeria G.",
  "Diego H.",
  "Sofía P.",
];

const ZONES = [
  "Col. Escalón",
  "Torre Futura",
  "Galerías Escalón",
  "Salvador del Mundo",
  "75 Av. Norte",
  "Redondel Masferrer",
];

interface ToastItem {
  buyer: string;
  zone: string;
  productName: string;
  productImage: string;
  minutesAgo: number;
}

/**
 * Prueba social sutil: tarjetas flotantes cada 30 segundos que desaparecen solas.
 */
export default function SocialProofToasts() {
  const { products } = useCatalog();
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    let hideTimer: number | null = null;
    let index = 0;

    const showNextToast = () => {
      try {
        if (!products || products.length === 0) return;
        const product = products[index % products.length];
        const buyer = BUYER_NAMES[index % BUYER_NAMES.length];
        const zone = ZONES[index % ZONES.length];
        const minutesAgo = ((index * 3) % 14) + 2;
        index += 1;

        setToast({
          buyer,
          zone,
          productName: product.shortName || product.name,
          productImage: product.image,
          minutesAgo,
        });

        if (hideTimer) window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
          setToast(null);
        }, 5500);
      } catch {
        // Aislamiento seguro
      }
    };

    const interval = window.setInterval(showNextToast, 30000);
    return () => {
      window.clearInterval(interval);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [products]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs animate-slide-up pointer-events-auto">
      <div className="bg-dark-800/95 backdrop-blur-md border border-neon-cyan/30 rounded-2xl p-3 shadow-neon-sm flex items-center gap-3">
        <img
          src={toast.productImage}
          alt={toast.productName}
          className="w-10 h-10 rounded-xl object-cover bg-dark-700 shrink-0 border border-neon-cyan/20"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white font-semibold leading-snug truncate">
            {toast.buyer} en <span className="text-neon-cyan">{toast.zone}</span>
          </p>
          <p className="text-[11px] text-white/70 truncate flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-green-400 shrink-0" />
            Compró {toast.productName}
          </p>
          <p className="text-[10px] text-white/35 mt-0.5">
            Hace {toast.minutesAgo} min · Verificado
          </p>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Cerrar notificación"
          className="text-white/30 hover:text-white p-1 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
