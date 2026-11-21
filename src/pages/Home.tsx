import { Link } from "react-router-dom";
import {
  Zap,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  Headphones,
  Bluetooth,
  HardDrive,
  Gamepad2,
  Bike,
  Car,
  Sparkles,
} from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/features/ProductCard";
import ProductOfTheDay from "@/components/features/ProductOfTheDay";
import DeliveryScheduler from "@/components/features/DeliveryScheduler";
import AiHelpBanner from "@/components/features/AiHelpBanner";
import BrandLogo from "@/components/BrandLogo";
import GotechBackdrop from "@/components/GotechBackdrop";
import PerfumesSection from "@/components/features/PerfumesSection";
import { WHATSAPP_NUMBER, isPerfumeProduct } from "@/constants/products";

const CATEGORY_CARDS = [
  { name: "Bluetooth", icon: Bluetooth },
  { name: "Memorias", icon: HardDrive },
  { name: "Controles", icon: Gamepad2 },
  { name: "Accesorios Moto", icon: Bike },
  { name: "Accesorios Auto", icon: Car },
];

export default function Home() {
  const { products: ALL_PRODUCTS } = useCatalog();
  const PRODUCTS = ALL_PRODUCTS.filter((p) => !isPerfumeProduct(p));
  const bluetoothProduct =
    PRODUCTS.find((p) => p.id === "bluetooth-5-0") ?? PRODUCTS[0];

  return (
    <div className="pt-16 bg-[#F4F8FF] text-[#0B172A]">
      {/* ── HERO + AI BANNER (WHITE & COBALT GEOMETRIC REFERENCE CANVAS) ── */}
      <section className="relative overflow-hidden border-b border-[#DCE7F8]">
        <GotechBackdrop showWatermark />

        {/* AI Help Banner */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-5">
          <AiHelpBanner />
        </div>

        {/* Hero Main Stage */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
            <div className="lg:col-span-7">
              {/* Eyebrow with rule */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.22em] text-[#334663]">
                  Tecnología a tu alcance
                </span>
                <span className="h-0.5 w-16 sm:w-24 bg-[#0057FF]" />
              </div>

              {/* Headline */}
              <h1 className="font-montserrat font-black italic text-4xl sm:text-5xl md:text-6xl leading-[1.06] text-[#0B172A] mb-4 tracking-tight">
                GoTech{" "}
                <span className="block">
                  Siempre <span className="text-[#0057FF]">contigo</span>
                </span>
              </h1>

              <p className="text-[#334663] text-base sm:text-lg max-w-xl mb-7 leading-relaxed">
                Los mejores dispositivos y accesorios tech en El Salvador con la
                calidad que mereces.{" "}
                <span className="text-[#0057FF] font-bold">
                  Compra en menos de 1 minuto por WhatsApp.
                </span>
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <Link
                  to="/catalogo"
                  className="btn-gotech inline-flex items-center gap-2 text-sm sm:text-base px-7 py-3.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar ahora
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gotech-outline inline-flex items-center gap-2 text-sm sm:text-base px-6 py-3"
                >
                  💬 Escribir al WhatsApp
                </a>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 sm:gap-8">
                {[
                  {
                    icon: "🚚",
                    label: "Envío Gratis",
                    sub: "San Salvador sin mínimo",
                  },
                  {
                    icon: "⚡",
                    label: "Compra Rápida",
                    sub: "En menos de 1 minuto",
                  },
                  {
                    icon: "🟢",
                    label: "Stock disponible",
                    sub: "Entrega el mismo día",
                  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className="text-[#0B172A] font-bold text-xs sm:text-sm">
                        {s.label}
                      </p>
                      <p className="text-[#546885] text-[11px]">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Right Showcase Card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              {bluetoothProduct && (
                <Link
                  to={`/producto/${bluetoothProduct.id}`}
                  className="relative group w-full max-w-[380px] bg-white/95 border border-[#D8E6FB] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,68,180,0.14)] hover:shadow-[0_24px_56px_rgba(0,68,180,0.20)] transition-all duration-300 overflow-hidden"
                >
                  {/* Top-right cobalt corner slash */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 right-0 w-24 h-24 overflow-hidden"
                  >
                    <div className="absolute top-3 -right-4 w-28 h-3 bg-gradient-to-r from-[#0044CC] to-[#0095FF] rotate-45" />
                    <div className="absolute top-8 -right-6 w-28 h-2 bg-gradient-to-r from-[#0057FF] to-[#00B8FF] rotate-45 opacity-90" />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#0057FF] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      🔥 Más Vendido
                    </span>
                    <span className="text-[#0057FF] text-[11px] font-bold uppercase tracking-wider">
                      Producto Estrella
                    </span>
                  </div>

                  <div className="bg-gradient-to-b from-[#F9FBFF] to-[#EDF4FF] rounded-2xl p-5 flex items-center justify-center aspect-[4/3] mb-4">
                    <img
                      src={bluetoothProduct.image}
                      alt={bluetoothProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 animate-float"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[#0B172A] font-extrabold text-base truncate">
                        {bluetoothProduct.name}
                      </p>
                      <p className="text-emerald-700 text-xs font-semibold">
                        🚚 Envío gratis hoy
                      </p>
                    </div>
                    <span className="font-montserrat font-black text-2xl text-[#0057FF] shrink-0">
                      ${Number(bluetoothProduct.price).toFixed(2)}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* ── // CATEGORÍAS CARD STRIP (REFERENCE MATCH) ── */}
          <div className="mt-12 bg-white/95 border border-[#DCE7F8] rounded-2xl p-5 sm:p-6 shadow-[0_14px_36px_rgba(0,68,180,0.08)]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1" aria-hidden="true">
                  <span className="w-2 h-5 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
                  <span className="w-2 h-5 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
                </div>
                <h2 className="font-montserrat font-black italic text-lg sm:text-xl text-[#0B172A]">
                  Categorías
                </h2>
              </div>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-1 text-[#0057FF] font-bold text-xs sm:text-sm hover:gap-2 transition-all"
              >
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {CATEGORY_CARDS.map(({ name, icon: Icon }) => (
                <Link
                  key={name}
                  to="/catalogo"
                  className="flex flex-col items-center justify-center gap-2 bg-[#F8FAFF] hover:bg-white border border-[#E2ECFA] hover:border-[#0057FF] rounded-xl py-3.5 px-3 text-center transition-all duration-200 shadow-[0_4px_12px_rgba(0,68,180,0.04)] hover:shadow-[0_8px_20px_rgba(0,87,255,0.12)] group"
                >
                  <Icon className="w-6 h-6 text-[#0B172A] group-hover:text-[#0057FF] transition-colors" />
                  <span className="text-xs font-bold text-[#0B172A] group-hover:text-[#0057FF] transition-colors">
                    {name}
                  </span>
                </Link>
              ))}
              <a
                href="#perfumes"
                className="flex flex-col items-center justify-center gap-2 bg-[#EDF7F2] hover:bg-[#E0F0E8] border border-[#C5DFD1] hover:border-[#0B4A31] rounded-xl py-3.5 px-3 text-center transition-all duration-200 group"
              >
                <Sparkles className="w-6 h-6 text-[#0B4A31]" />
                <span className="font-playfair text-xs font-bold text-[#063020]">
                  Perfumes
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <section className="bg-white border-b border-[#DCE7F8] py-3.5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 overflow-hidden">
          <div className="flex gap-12 animate-[marquee_22s_linear_infinite] whitespace-nowrap">
            {[
              "🔥 DISPONIBLE HOY",
              "🚚 ENVÍO GRATIS en zonas seleccionadas",
              "⚡ COMPRA RÁPIDA por WhatsApp",
              "🟢 STOCK INMEDIATO",
              "🔵 Bluetooth 5.0 — $9.50",
              "📺 Control TCL — $10.00",
              "💾 MicroSD 128GB — $12.00",
              "💾 MicroSD 64GB — $8.50",
              "🔒 Candado Moto — $7.00",
              "🎮 Control Universal — $7.00",
              "🚗 Soporte Auto 360° — $5.00",
              "🏍️ Soporte Moto Premium — $8.50",
            ].map((t, i) => (
              <span
                key={i}
                className="text-[#0057FF] font-bold text-xs sm:text-sm uppercase tracking-widest shrink-0"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL CATALOG (// Productos destacados / Todos los Productos) ── */}
      <section id="catalogo" className="relative pt-14 sm:pt-16 pb-5 sm:pb-7 overflow-hidden">
        <GotechBackdrop />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1" aria-hidden="true">
                  <span className="w-2.5 h-6 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
                  <span className="w-2.5 h-6 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
                </div>
                <h2 className="font-montserrat font-black italic text-2xl sm:text-3xl md:text-4xl text-[#0B172A]">
                  Productos <span className="text-[#0057FF]">destacados</span>
                </h2>
                <div className="hidden sm:block flex-1 h-px bg-[#B7D1F9] ml-2" />
              </div>
              <p className="text-[#4D607D] text-sm">
                {PRODUCTS.length} productos disponibles · Entrega el mismo día en
                San Salvador
              </p>
            </div>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1 text-[#0057FF] font-bold text-sm hover:gap-2 transition-all"
            >
              Buscar / Filtrar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PERFUMES BOUTIQUE SECTION (PRESERVED WITH SMOOTH LIGHT->BURGUNDY TRANSITION) ── */}
      <PerfumesSection />

      {/* ── PRODUCT OF THE DAY ── */}
      <ProductOfTheDay />

      <div className="gotech-divider" />

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#DCE7F8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2 h-5 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
              <span className="w-2 h-5 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
            </div>
            <h2 className="font-montserrat font-black italic text-2xl sm:text-3xl text-[#0B172A]">
              ¿Cómo <span className="text-[#0057FF]">comprar?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: "🔍",
                title: "Elige tu producto",
                desc: "Navega el catálogo y selecciona el accesorio que necesitas.",
              },
              {
                step: "02",
                icon: "💬",
                title: "Escríbenos por WhatsApp",
                desc: "Agrega al carrito, selecciona tu zona y envía tu pedido listo.",
              },
              {
                step: "03",
                icon: "🚀",
                title: "Recibe tu pedido",
                desc: "Coordinamos la entrega en tu zona. ¡Mismo día disponible!",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#F8FAFF] border border-[#DCE7F8] rounded-2xl p-6 text-center hover:border-[#0057FF]/45 hover:shadow-[0_12px_28px_rgba(0,68,180,0.09)] transition-all"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#D4E3FA] mb-4 shadow-sm">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="font-montserrat text-[#0057FF]/25 text-4xl font-black mb-1">
                  {item.step}
                </div>
                <h3 className="text-[#0B172A] font-extrabold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-[#4D607D] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERY SCHEDULER ── */}
      <DeliveryScheduler />

      {/* ── TRUST STRIP & DELIVERY PREVIEW (MATCHING REFERENCE IMAGE) ── */}
      <section className="relative py-14 overflow-hidden bg-gotech-canvas border-t border-[#DCE7F8]">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="bg-white border border-[#DCE7F8] rounded-2xl p-7 md:p-10 shadow-[0_12px_32px_rgba(0,68,180,0.08)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="badge-gotech mb-3">🚚 Envíos Gratis</p>
              <h2 className="font-montserrat font-black italic text-2xl md:text-3xl text-[#0B172A] mb-2">
                Entregamos en{" "}
                <span className="text-[#0057FF]">San Salvador</span>
              </h2>
              <p className="text-[#4D607D] text-sm sm:text-base leading-relaxed max-w-lg">
                Envío gratis para todos los productos en todas las zonas,
                incluyendo Salvador del Mundo, sin mínimo ni límite de precio.
              </p>
            </div>
            <Link
              to="/envios"
              className="btn-gotech-outline shrink-0 inline-flex items-center gap-2"
            >
              Ver zonas de entrega <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3-Column Trust Bar matching Reference Bottom Card */}
          <div className="bg-white border border-[#DCE7F8] rounded-2xl px-6 py-5 shadow-[0_10px_28px_rgba(0,68,180,0.07)] grid grid-cols-1 sm:grid-cols-3 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E3ECFA]">
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 sm:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0057FF]" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#0B172A]">
                  Compra Segura
                </p>
                <p className="text-xs text-[#546885]">Tus datos protegidos</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start sm:pl-6 gap-3 pt-4 sm:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#0057FF]" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#0B172A]">
                  Envíos en San Salvador
                </p>
                <p className="text-xs text-[#546885]">Entrega el mismo día</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start sm:pl-6 gap-3 pt-4 sm:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-[#0057FF]" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#0B172A]">
                  Soporte Directo
                </p>
                <p className="text-xs text-[#546885]">Atención por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DARK NAVY GEOMETRIC GOTECH FOOTER RIBBON (REFERENCE MATCH) ── */}
      <footer className="relative bg-[#050E24] text-white overflow-hidden border-t-4 border-[#0057FF]">
        {/* Cobalt angled stripes matching reference footer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-36 bg-gradient-to-tr from-[#00349A]/60 to-[#0095FF]/30 -skew-x-12 -translate-x-12"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-36 bg-gradient-to-bl from-[#0057FF]/45 to-transparent -skew-x-12 translate-x-12"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <BrandLogo variant="compact" tone="dark" />
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/75 font-semibold">
              <Link
                to="/ofertas"
                className="hover:text-[#57B8FF] transition-colors"
              >
                🔥 Ofertas
              </Link>
              <Link
                to="/catalogo"
                className="hover:text-[#57B8FF] transition-colors"
              >
                Catálogo
              </Link>
              <Link
                to="/perfumes"
                className="hover:text-[#57B8FF] transition-colors"
              >
                Perfumes
              </Link>
              <Link
                to="/envios"
                className="hover:text-[#57B8FF] transition-colors"
              >
                Envíos
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57B8FF] transition-colors"
              >
                WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-white/50 text-xs">
                © 2026 GoTech SV · San Salvador
              </p>
              <Link
                to="/admin"
                className="text-white/15 hover:text-white/40 text-[10px] font-mono tracking-widest transition-colors duration-300"
                title=""
              >
                KNAS
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
