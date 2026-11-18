import { Link } from "react-router-dom";
import { Zap, Truck, Tag, ChevronRight, Star } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/features/ProductCard";
import GotechBackdrop from "@/components/GotechBackdrop";
import { WHATSAPP_NUMBER, isPerfumeProduct } from "@/constants/products";

export default function Offers() {
  const { products: ALL_PRODUCTS } = useCatalog();
  const PRODUCTS = ALL_PRODUCTS.filter((p) => !isPerfumeProduct(p));
  const freeShippingProducts = PRODUCTS;
  const bluetoothProduct =
    PRODUCTS.find((p) => p.id === "bluetooth-5-0") ?? PRODUCTS[0];

  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-[#F4F8FF] text-[#0B172A]">
      <GotechBackdrop />

      {/* Header */}
      <section className="relative z-10 py-14 bg-white/85 backdrop-blur-sm border-b border-[#DCE7F8]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-[#0057FF]" />
            <span className="badge-gotech text-xs">DESTACADOS DE LA TIENDA</span>
          </div>
          <h1 className="font-montserrat font-black italic text-4xl md:text-5xl text-[#0B172A] mb-3">
            ⚡ <span className="text-[#0057FF]">Destacados</span> GoTech
          </h1>
          <p className="text-[#4D607D] text-base sm:text-lg max-w-xl mx-auto">
            Precios fijos transparentes y envío gratis en San Salvador. ¡Compra hoy!
          </p>
        </div>
      </section>

      {/* Bluetooth Spotlight */}
      {bluetoothProduct && (
        <section className="relative z-10 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative card-gotech overflow-hidden border-2 border-[#0057FF]/35">
              {/* Top-right cobalt corner slashes */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 z-20 w-24 h-24 overflow-hidden"
              >
                <div className="absolute top-3 -right-4 w-28 h-3 bg-gradient-to-r from-[#0044CC] to-[#0095FF] rotate-45" />
                <div className="absolute top-8 -right-6 w-28 h-2 bg-gradient-to-r from-[#0057FF] to-[#00B8FF] rotate-45 opacity-90" />
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 p-8">
                <div className="relative shrink-0">
                  <div className="w-56 h-56 flex items-center justify-center bg-gradient-to-b from-[#F9FBFF] to-[#EDF4FF] border border-[#DCE7F8] rounded-2xl overflow-hidden relative p-4">
                    <img
                      src={bluetoothProduct.image}
                      alt={bluetoothProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain animate-float"
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-full uppercase shadow-md">
                    🔥 TOP VENTA
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-2">
                    ⭐ Producto Estrella
                  </p>
                  <h2 className="font-montserrat font-black text-2xl md:text-3xl text-[#0B172A] mb-3">
                    {bluetoothProduct.name}
                  </h2>
                  <p className="text-[#4D607D] mb-4 text-sm leading-relaxed max-w-md">
                    {bluetoothProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6 max-w-sm mx-auto lg:mx-0">
                    {[
                      "Bluetooth 5.0 CSR",
                      "Plug & Play",
                      "Hasta 20m alcance",
                      "Certificación BQB",
                    ].map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-[#243652] font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0057FF] shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 justify-center lg:justify-start mb-5">
                    <div>
                      <span className="font-montserrat font-black text-4xl text-[#0057FF] tabular-nums">
                        ${Number(bluetoothProduct.price).toFixed(2)}
                      </span>
                      <p className="text-emerald-700 text-xs font-bold mt-0.5">
                        🚚 Envío gratis en San Salvador
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Link
                      to={`/producto/${bluetoothProduct.id}`}
                      className="btn-gotech inline-flex items-center gap-2 px-6 py-3 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Comprar ahora
                    </Link>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hola GoTech! Quiero el ${bluetoothProduct.name} — $${Number(
                          bluetoothProduct.price
                        ).toFixed(2)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gotech-outline inline-flex items-center gap-2 px-6 py-3 text-sm"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>

                <div className="shrink-0 text-center hidden lg:block">
                  <div className="bg-[#F4F8FF] border border-[#DCE7F8] rounded-2xl p-5">
                    <div className="flex gap-0.5 justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                    <p className="font-montserrat font-black text-2xl text-[#0B172A]">
                      4.9
                    </p>
                    <p className="text-[#546885] text-xs font-semibold">
                      +120 ventas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Free Shipping Banner */}
      <section className="relative z-10 py-8 bg-gradient-to-r from-[#00349A] via-[#0057FF] to-[#0077FF] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-montserrat font-black text-white text-lg">
                🚚 ENVÍOS GRATIS SIN MÍNIMO DE COMPRA
              </p>
              <p className="text-white/85 text-sm">
                Envío gratis para todos los productos en todas las zonas (incluye Salvador del Mundo)
              </p>
            </div>
            <Link
              to="/envios"
              className="bg-white text-[#0057FF] hover:bg-[#EAF2FF] font-bold rounded-full shrink-0 text-xs flex items-center gap-1 px-5 py-2.5 transition-colors shadow-sm"
            >
              Ver zonas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* All featured products */}
      <section className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2.5 h-6 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
              <span className="w-2.5 h-6 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
            </div>
            <h2 className="font-montserrat font-black italic text-2xl text-[#0B172A]">
              Todos con{" "}
              <span className="text-[#0057FF]">Envío Disponible</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {freeShippingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
