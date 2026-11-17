import { Zap, ShoppingCart, Package } from "lucide-react";
import { buildBundleWhatsAppMessage, Bundle } from "@/constants/bundles";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";

export default function BundlesSection() {
  const { products: PRODUCTS, bundles: BUNDLES } = useCatalog();
  const { address, addToCart, openCart } = useCart();

  const handleAddBundle = (bundle: Bundle) => {
    const products = bundle.productIds
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter(Boolean) as typeof PRODUCTS;
    products.forEach((p) => addToCart(p));
    openCart();
  };

  return (
    <section id="combos" className="py-20 bg-dark-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-neon-cyan" />
              <span className="badge-neon text-xs">COMBOS LISTOS</span>
            </div>
            <h2 className="font-orbitron font-black text-3xl md:text-4xl text-white">
              Arma tu <span className="text-neon-cyan glow-text">Pack</span>
            </h2>
            <p className="text-white/50 text-sm mt-2">Packs completos con todo lo que necesitas en un solo pedido.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BUNDLES.map((bundle) => {
            const bundleProducts = bundle.productIds
              .map((id) => PRODUCTS.find((p) => p.id === id))
              .filter(Boolean) as typeof PRODUCTS;

            if (bundleProducts.length === 0) return null;

            return (
              <div
                key={bundle.id}
                className="card-tech overflow-hidden group hover:border-neon-cyan/50 transition-all duration-300 flex flex-col"
              >
                {/* Top badge */}
                <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 border-b border-neon-cyan/15 px-4 py-3 flex items-center justify-between">
                  <span className="text-[11px] font-black text-neon-cyan uppercase tracking-wider">{bundle.badge}</span>
                </div>

                {/* Product images or custom bundle image */}
                <div className="relative flex items-center justify-center gap-3 px-6 py-6 bg-dark-700/40">
                  <div className="absolute inset-0 bg-glow-radial opacity-20" />
                  {bundle.image ? (
                    <img
                      src={bundle.image}
                      alt={bundle.name}
                      className="relative z-10 w-36 h-24 object-contain drop-shadow-[0_0_12px_rgba(0,207,255,0.25)]"
                    />
                  ) : (
                    bundleProducts.map((p, i) => (
                      <div key={p.id} className="relative z-10">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-24 h-24 object-contain drop-shadow-[0_0_12px_rgba(0,207,255,0.2)]"
                        />
                        {i < bundleProducts.length - 1 && (
                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
                            <span className="text-neon-cyan font-black text-sm">+</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-3xl mb-2">{bundle.emoji}</div>
                  <h3 className="font-orbitron font-black text-white text-lg mb-1">{bundle.name}</h3>
                  <p className="text-white/50 text-xs mb-4 leading-relaxed">{bundle.tagline}</p>

                  {/* Products list */}
                  <div className="space-y-1.5 mb-4">
                    {bundleProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="text-white/60 truncate mr-2">{p.shortName}</span>
                        <span className="text-white/40 shrink-0">${Number(p.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fixed Combo Pricing */}
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-orbitron font-black text-3xl text-neon-cyan glow-text">
                        ${Number(bundle.bundlePrice).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-green-400 text-xs font-black mb-4">
                      ✓ {bundle.highlight}
                    </p>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddBundle(bundle)}
                        className="btn-neon w-full flex items-center justify-center gap-2 py-3 text-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Agregar pack al carrito
                      </button>
                      <a
                        href={buildBundleWhatsAppMessage(bundle, address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-neon-outline w-full flex items-center justify-center gap-2 py-2.5 text-xs"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Pedir directo por WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
