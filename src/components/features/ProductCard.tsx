import { Link } from "react-router-dom";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const inCart = items.find((i) => i.product.id === product.id);
  const fixedPrice = Number(product.price);

  return (
    <div className="relative bg-white border border-[#E2ECFA] rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,68,180,0.08)] hover:shadow-[0_18px_38px_rgba(0,68,180,0.14)] hover:border-[#0066FF]/45 hover:-translate-y-0.5 transition-all duration-300 group animate-slide-up flex flex-col">
      {/* Signature Top-Right Diagonal Cobalt // Corner Slashes (Reference Match) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 z-20 w-16 h-16 overflow-hidden"
      >
        <div className="absolute top-2.5 -right-3 w-20 h-2.5 bg-gradient-to-r from-[#0044CC] to-[#0095FF] rotate-45 shadow-sm" />
        <div className="absolute top-7 -right-5 w-20 h-2 bg-gradient-to-r from-[#0057FF] to-[#00B8FF] rotate-45 opacity-90" />
      </div>

      {/* Image */}
      <Link
        to={`/producto/${product.id}`}
        className="block relative overflow-hidden"
      >
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#F9FBFF] to-[#EFF5FF] flex items-center justify-center relative p-3">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-[#0B172A]/55 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-white font-bold text-sm uppercase tracking-wider">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Badge (top-left) */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center bg-[#0057FF] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {product.badge}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[11px] text-[#0057FF] uppercase tracking-wider font-bold truncate">
            {product.category}
          </p>
          <span
            className={`text-[10px] font-bold uppercase shrink-0 ${
              product.stock === 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {product.stock === 0 ? "Agotado" : "Disponible"}
          </span>
        </div>

        <Link to={`/producto/${product.id}`}>
          <h3 className="text-[#0B172A] font-bold text-base leading-snug mb-2 group-hover:text-[#0057FF] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-[#546885] mb-4">
          <CheckCircle className="w-3.5 h-3.5 text-[#0057FF] shrink-0" />
          <span className="line-clamp-1">
            {product.features[0] || product.description}
          </span>
        </div>

        {/* Fixed Price + Blue Gradient CTA */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-2xl font-black text-[#0057FF] tabular-nums">
              ${fixedPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mb-3 leading-snug">
            🚚 Envío gratis en San Salvador
          </p>

          <button
            onClick={() => product.stock > 0 && addToCart(product)}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-bold tracking-wide transition-all duration-200 ${
              product.stock === 0
                ? "bg-[#E6ECF5] text-[#8394AE] cursor-not-allowed"
                : inCart
                  ? "bg-[#EAF2FF] border-2 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF] hover:text-white"
                  : "btn-gotech py-2.5"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inCart ? `En carrito (${inCart.quantity})` : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
