import { Link } from "react-router-dom";
import { ShoppingCart, CheckCircle, Zap } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
import { isPerfumeProduct } from "@/constants/products";

function getDayName() {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return days[new Date().getDay()];
}

function formatDate() {
  return new Date().toLocaleDateString("es-SV", {
    day: "numeric",
    month: "long",
  });
}

export default function ProductOfTheDay() {
  const { products: ALL_PRODUCTS } = useCatalog();
  const PRODUCTS = ALL_PRODUCTS.filter((p) => !isPerfumeProduct(p));
  const { addToCart, items } = useCart();
  if (PRODUCTS.length === 0) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const product = PRODUCTS[dayOfYear % PRODUCTS.length];
  const inCart = items.find((i) => i.product.id === product.id);
  const fixedPrice = Number(product.price);

  return (
    <section className="py-16 sm:py-20 bg-gotech-canvas relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Double-slash Header matching Reference Image */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-6 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
            <span className="w-2.5 h-6 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
          </div>
          <h2 className="font-montserrat font-black italic text-2xl sm:text-3xl text-[#0B172A]">
            Producto del <span className="text-[#0057FF]">Día</span>
          </h2>
          <div className="hidden sm:block flex-1 h-px bg-[#C7DAFA] ml-2" />
          <span className="badge-gotech text-[11px]">
            ⭐ {getDayName()} {formatDate()}
          </span>
        </div>

        {/* Card */}
        <div className="card-gotech overflow-hidden relative">
          {/* Corner slashes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 z-20 w-20 h-20 overflow-hidden"
          >
            <div className="absolute top-3 -right-3 w-24 h-3 bg-gradient-to-r from-[#0044CC] to-[#0095FF] rotate-45" />
            <div className="absolute top-8 -right-5 w-24 h-2 bg-gradient-to-r from-[#0057FF] to-[#00B8FF] rotate-45 opacity-90" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative bg-gradient-to-br from-[#F8FBFF] via-[#EEF5FF] to-[#E6F0FF] flex items-center justify-center p-8 min-h-[300px]">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="relative z-10 max-h-64 w-full object-contain animate-float drop-shadow-[0_14px_24px_rgba(0,68,180,0.18)]"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-[#0057FF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {product.badge}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-[#0057FF]/10 animate-pulse" />
              </div>
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-center">
              <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h3 className="font-montserrat font-extrabold text-2xl md:text-3xl text-[#0B172A] mb-3 leading-tight">
                {product.name}
              </h3>
              <p className="text-[#4D607D] text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Features (first 3) */}
              <ul className="space-y-2 mb-6">
                {product.features.slice(0, 3).map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-[#243652]"
                  >
                    <CheckCircle className="w-4 h-4 text-[#0057FF] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Fixed Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-montserrat font-black text-4xl text-[#0057FF] tabular-nums">
                  ${fixedPrice.toFixed(2)}
                </span>
                <span className="text-[#6B7E9E] text-sm font-semibold">USD</span>
              </div>

              {/* Availability (exact stock hidden from customers) */}
              <div className="mb-5">
                {product.stock === 0 ? (
                  <span className="text-red-600 text-sm font-bold">
                    Agotado por el momento
                  </span>
                ) : (
                  <span className="text-emerald-700 text-sm font-bold">
                    Disponible hoy · Envío gratis en San Salvador
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => product.stock > 0 && addToCart(product)}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm font-bold tracking-wide transition-all ${
                    product.stock === 0
                      ? "bg-[#E6ECF5] text-[#8394AE] cursor-not-allowed"
                      : inCart
                        ? "bg-[#EAF2FF] border-2 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF] hover:text-white"
                        : "btn-gotech py-3.5"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {inCart
                    ? `En carrito (${inCart.quantity})`
                    : "Agregar al carrito"}
                </button>
                <Link
                  to={`/producto/${product.id}`}
                  className="flex-1 btn-gotech-outline flex items-center justify-center gap-2 py-3.5 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
