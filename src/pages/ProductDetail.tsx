import { useLayoutEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  ChevronLeft,
  MessageCircle,
  Truck,
  Zap,
  ShoppingCart,
} from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
import GotechBackdrop from "@/components/GotechBackdrop";
import { isPerfumeProduct } from "@/constants/products";
import { getPerfumeCardPalette } from "@/constants/perfumePalettes";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products: PRODUCTS } = useCatalog();
  const product = PRODUCTS.find((p) => p.id === id);
  const { addToCart, items, openCart } = useCart();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  if (!product) {
    return (
      <div className="pt-16 min-h-screen relative overflow-hidden bg-[#F4F8FF] text-[#0B172A] flex items-center justify-center">
        <GotechBackdrop />
        <div className="relative z-10 text-center px-4">
          <p className="text-6xl mb-4">📦</p>
          <h2 className="font-montserrat font-black text-2xl text-[#0B172A] mb-4">
            Producto no encontrado
          </h2>
          <Link to="/catalogo" className="btn-gotech inline-flex">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const isPerfume = isPerfumeProduct(product);
  const inCart = items.find((i) => i.product.id === product.id);
  const fixedPrice = Number(product.price);

  const otherProducts = PRODUCTS.filter((p) => {
    if (p.id === product.id || isPerfumeProduct(p) !== isPerfume) return false;
    if (isPerfume) {
      const currentIsHombre = product.category.toLowerCase().includes("hombre");
      const candidateIsHombre = p.category.toLowerCase().includes("hombre");
      return currentIsHombre === candidateIsHombre;
    }
    return true;
  }).slice(0, 2);

  if (isPerfume) {
    const isHombre = product.category.toLowerCase().includes("hombre");
    const isMujer = !isHombre;
    const palette = getPerfumeCardPalette(product.id, isMujer);

    return (
      <div
        className={`pt-16 min-h-screen transition-colors duration-700 ${palette.detailPageBg}`}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
          {/* Back */}
          <Link
            to="/perfumes"
            className={`font-playfair inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-8 transition-colors ${palette.detailBackLink}`}
          >
            <ChevronLeft className="w-4 h-4" /> Volver a Perfumes
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Image */}
            <div
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-700 ${palette.detailBorder} ${palette.detailShadow}`}
            >
              <div
                className={`aspect-square flex items-center justify-center relative transition-colors duration-700 ${palette.imageBg}`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.stock === 0 && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${palette.overlayBg}`}
                  >
                    <span className="text-white font-playfair font-bold text-2xl uppercase tracking-wider">
                      Agotado
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div
                className={`font-cinzel flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] mb-2 transition-colors duration-700 ${palette.eyebrow}`}
              >
                <span>
                  {isHombre ? "Fragancia para Hombre" : "Fragancia para Mujer"}
                </span>
                <span aria-hidden="true">·</span>
                <span>Eau de Toilette 60 ml</span>
              </div>

              <h1
                className={`font-playfair font-bold text-3xl md:text-4xl mb-4 leading-tight transition-colors duration-700 ${palette.price}`}
              >
                {product.name}
              </h1>

              <p
                className={`font-cormorant text-xl font-medium leading-relaxed mb-6 transition-colors duration-700 ${palette.description}`}
              >
                {product.description}
              </p>

              {/* Features */}
              <div
                className={`border rounded-2xl p-6 mb-6 transition-colors duration-700 ${palette.detailBoxBg} ${palette.detailBorder}`}
              >
                <p
                  className={`font-cinzel text-xs font-bold uppercase tracking-widest mb-4 ${palette.eyebrow}`}
                >
                  Notas y detalles
                </p>
                <ul className="space-y-3">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${palette.eyebrow}`}
                      />
                      <span className={`text-sm ${palette.detailFeatureText}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span
                  className={`font-playfair font-bold text-4xl transition-colors duration-700 ${palette.price}`}
                >
                  ${fixedPrice.toFixed(2)}
                </span>
                <span className={`text-sm font-medium ${palette.detailMuted}`}>
                  USD
                </span>
              </div>

              {/* Availability (exact stock hidden from customers) */}
              <div className="flex items-center gap-2 mb-2">
                {product.stock === 0 ? (
                  <span className="text-red-700 text-sm font-bold">
                    Agotado por el momento
                  </span>
                ) : (
                  <span className={`text-sm font-semibold ${palette.availableText}`}>
                    Disponible para entrega hoy
                  </span>
                )}
              </div>

              {/* Delivery */}
              <div
                className={`flex items-center gap-2 text-sm font-semibold mb-6 ${palette.shippingBadge}`}
              >
                <Truck className="w-4 h-4 shrink-0" />
                Envío rápido en San Salvador
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  if (product.stock > 0) {
                    addToCart(product);
                    openCart();
                  }
                }}
                disabled={product.stock === 0}
                className={`font-playfair w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-500 ${
                  product.stock === 0
                    ? palette.detailCtaDisabled
                    : inCart
                      ? palette.detailCtaInCart
                      : palette.detailCtaDefault
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {inCart
                  ? `Ver carrito (${inCart.quantity} en carrito)`
                  : "Agregar al carrito"}
              </button>

              <p className={`text-xs text-center mt-3 ${palette.detailMuted}`}>
                Agrega al carrito y coordina tu entrega en San Salvador por WhatsApp
              </p>

              {/* Trust items */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { icon: <Zap className="w-4 h-4" />, label: "Compra Rápida" },
                  { icon: <Truck className="w-4 h-4" />, label: "Entrega Hoy" },
                  { icon: <MessageCircle className="w-4 h-4" />, label: "Atención Directa" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className={`border rounded-xl p-3 text-center transition-colors duration-700 ${palette.detailBoxBg} ${palette.detailBorder}`}
                  >
                    <div className={`flex justify-center mb-1 ${palette.eyebrow}`}>
                      {b.icon}
                    </div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${palette.description}`}
                    >
                      {b.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related perfumes */}
          {otherProducts.length > 0 && (
            <div className={`mt-16 pt-10 border-t ${palette.detailBorder}`}>
              <h2
                className={`font-playfair font-bold text-2xl mb-6 ${palette.price}`}
              >
                Otras fragancias que te pueden gustar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {otherProducts.map((p) => {
                  const pIsMujer = !p.category.toLowerCase().includes("hombre");
                  const pPalette = getPerfumeCardPalette(p.id, pIsMujer);
                  return (
                    <Link
                      key={p.id}
                      to={`/producto/${p.id}`}
                      className={`border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all ${pPalette.card}`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className={`w-20 h-20 object-cover rounded-xl shrink-0 ${pPalette.imageBg}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-cinzel text-[10px] font-bold uppercase tracking-wider mb-0.5 ${pPalette.eyebrow}`}
                        >
                          {p.category}
                        </p>
                        <p
                          className={`font-playfair font-bold text-base mb-1 line-clamp-1 ${pPalette.title}`}
                        >
                          {p.name}
                        </p>
                        <p
                          className={`font-playfair font-bold text-lg ${pPalette.price}`}
                        >
                          ${Number(p.price).toFixed(2)}
                        </p>
                      </div>
                      <ChevronLeft
                        className={`w-4 h-4 rotate-180 ml-auto shrink-0 ${pPalette.eyebrow}`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-[#F4F8FF] text-[#0B172A]">
      <GotechBackdrop />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-1 text-[#0057FF] hover:text-[#00349A] text-sm font-bold uppercase tracking-wider mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="card-gotech overflow-hidden relative">
              {/* Top-right cobalt corner slashes */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 z-20 w-24 h-24 overflow-hidden"
              >
                <div className="absolute top-3 -right-4 w-28 h-3 bg-gradient-to-r from-[#0044CC] to-[#0095FF] rotate-45" />
                <div className="absolute top-8 -right-6 w-28 h-2 bg-gradient-to-r from-[#0057FF] to-[#00B8FF] rotate-45 opacity-90" />
              </div>

              <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#F9FBFF] to-[#EDF4FF] p-6 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain animate-float"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-[#0B172A]/60 flex items-center justify-center">
                    <span className="text-white font-bold text-xl uppercase tracking-wider">
                      Sin stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {product.badge && (
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-[#0057FF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-2">
              {product.category}
            </p>
            <h1 className="font-montserrat font-black text-2xl md:text-3xl text-[#0B172A] mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-[#4D607D] text-base leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features */}
            <div className="card-gotech p-5 mb-6">
              <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-4">
                Características
              </p>
              <ul className="space-y-3">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-[#0057FF] shrink-0 mt-0.5" />
                    <span className="text-[#243652] text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fixed Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-montserrat font-black text-4xl text-[#0057FF] tabular-nums">
                ${fixedPrice.toFixed(2)}
              </span>
              <span className="text-[#6B7E9E] text-sm font-semibold">USD</span>
            </div>

            {/* Availability (exact stock hidden from customers) */}
            <div className="flex items-center gap-2 mb-2">
              {product.stock === 0 ? (
                <span className="text-red-600 text-sm font-bold">
                  Agotado por el momento
                </span>
              ) : (
                <span className="text-emerald-700 text-sm font-bold">
                  Disponible para entrega hoy
                </span>
              )}
            </div>

            {/* Delivery */}
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold mb-5">
              <Truck className="w-4 h-4" />
              Envío gratis en todas las zonas (incluye Salvador del Mundo, sin mínimo)
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (product.stock > 0) {
                    addToCart(product);
                    openCart();
                  }
                }}
                disabled={product.stock === 0}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                  product.stock === 0
                    ? "bg-[#E6ECF5] text-[#8394AE] cursor-not-allowed"
                    : inCart
                      ? "bg-[#EAF2FF] border-2 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF] hover:text-white"
                      : "btn-gotech py-3.5"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {inCart
                  ? `Ver carrito (${inCart.quantity} en carrito)`
                  : "Agregar al carrito"}
              </button>
            </div>

            <p className="text-[#6B7E9E] text-xs text-center mt-3">
              Agrega al carrito y revisa el resumen antes de pedir
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: <Zap className="w-4 h-4" />, label: "Compra Rápida" },
                { icon: <Truck className="w-4 h-4" />, label: "Envío Rápido" },
                { icon: <MessageCircle className="w-4 h-4" />, label: "Soporte Directo" },
              ].map((b) => (
                <div key={b.label} className="card-gotech p-3 text-center">
                  <div className="text-[#0057FF] flex justify-center mb-1">
                    {b.icon}
                  </div>
                  <p className="text-[#334663] text-[10px] font-bold uppercase">
                    {b.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {otherProducts.length > 0 && (
          <div className="mt-20">
            <div className="gotech-divider mb-10" />
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center gap-1" aria-hidden="true">
                <span className="w-2 h-5 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
                <span className="w-2 h-5 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
              </div>
              <h2 className="font-montserrat font-black italic text-xl text-[#0B172A]">
                También te puede interesar
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  className="card-gotech p-4 flex items-center gap-4 transition-all"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 object-contain rounded-xl shrink-0 bg-[#F4F8FF] p-1.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0B172A] font-bold text-sm mb-1 line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-[#0057FF] font-black text-lg">
                      ${Number(p.price).toFixed(2)}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#0057FF] rotate-180 ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
