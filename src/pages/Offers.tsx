import { Link } from "react-router-dom";
import { Zap, Truck, Tag, ChevronRight, Star } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/features/ProductCard";
import { WHATSAPP_NUMBER } from "@/constants/products";

export default function Offers() {
  const { products: PRODUCTS } = useCatalog();
  const freeShippingProducts = PRODUCTS;
  const bluetoothProduct =
    PRODUCTS.find((p) => p.id === "bluetooth-5-0") ?? PRODUCTS[0];

  return (
    <div className="pt-16 min-h-screen section-grid">
      {/* Header */}
      <section className="relative py-16 overflow-hidden bg-dark-800">
        <div className="absolute inset-0 bg-glow-radial opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-neon-cyan" />
              <span className="badge-neon text-sm">DESTACADOS DE LA TIENDA</span>
            </div>
            <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white mb-4">
              ⚡ <span className="text-neon-cyan glow-text">Destacados</span> GoTech
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Precios fijos transparentes y envío gratis en zonas seleccionadas. ¡Compra hoy!
            </p>
          </div>
        </div>
      </section>

      {/* Bluetooth Spotlight */}
      {bluetoothProduct && (
        <section className="py-12 bg-dark-900">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative card-tech overflow-hidden border-2 border-neon-cyan/50 shadow-[0_0_40px_rgba(0,207,255,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-blue/5 pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center gap-8 p-8">
                <div className="relative shrink-0">
                  <div className="w-56 h-56 flex items-center justify-center bg-dark-700 rounded-2xl overflow-hidden relative">
                    <img
                      src={bluetoothProduct.image}
                      alt={bluetoothProduct.name}
                      className="w-full h-full object-contain animate-float"
                    />
                    <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(0,207,255,0.3)_inset]" />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black text-xs px-3 py-1.5 rounded-full uppercase shadow-lg animate-pulse">
                    🔥 TOP VENTA
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <p className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2">
                    ⭐ Producto Estrella
                  </p>
                  <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white mb-3">
                    {bluetoothProduct.name}
                  </h2>
                  <p className="text-white/60 mb-4 text-sm leading-relaxed max-w-md">
                    {bluetoothProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6 max-w-sm mx-auto lg:mx-0">
                    {["Bluetooth 5.0 CSR", "Plug & Play", "Hasta 20m alcance", "Certificación BQB"].map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 justify-center lg:justify-start mb-5">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-orbitron font-black text-4xl text-neon-cyan glow-text">
                          ${Number(bluetoothProduct.price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-green-400 text-xs font-bold">🚚 Envío gratis en 6 zonas</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Link to={`/producto/${bluetoothProduct.id}`} className="btn-neon flex items-center gap-2 px-6 py-3 text-sm">
                      <Zap className="w-4 h-4" />
                      Comprar ahora
                    </Link>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hola GoTech! Quiero el ${bluetoothProduct.name} — $${Number(bluetoothProduct.price).toFixed(2)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neon-outline flex items-center gap-2 px-6 py-3 text-sm"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>

                <div className="shrink-0 text-center hidden lg:block">
                  <div className="bg-dark-700 border border-neon-cyan/20 rounded-2xl p-5">
                    <div className="flex gap-0.5 justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="font-orbitron font-black text-2xl text-white">4.9</p>
                    <p className="text-white/40 text-xs">+120 ventas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Free Shipping Banner */}
      <section className="py-8 bg-gradient-to-r from-neon-blue/20 via-dark-800 to-neon-blue/20 border-y border-neon-cyan/15">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <p className="font-orbitron font-black text-white text-lg">
                🚚 ENVÍOS GRATIS SIN MÍNIMO DE COMPRA
              </p>
              <p className="text-white/50 text-sm">
                Envío gratis para todos los productos en todas las zonas (incluye Salvador del Mundo)
              </p>
            </div>
            <Link to="/envios" className="btn-neon-outline shrink-0 text-xs flex items-center gap-1 px-4 py-2.5">
              Ver zonas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* All featured products */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <Tag className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-orbitron font-black text-2xl text-white">
              Todos con <span className="text-neon-cyan">Envío Disponible</span>
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
