import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Truck, ArrowRight, Search } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";
import { WHATSAPP_NUMBER } from "@/constants/products";
import { getPerfumeCardPalette } from "@/constants/perfumePalettes";

const PERFUME_TITLE_LETTERS = "PERFUMES".split("");

interface PerfumesSectionProps {
  standalone?: boolean;
}

interface ScrollState {
  enterProgress: number; // 0 -> 1 as section enters viewport
  letterRise: number; // 0 -> 1 just before & upon reaching Perfumes
  parallaxOffset: number; // -1 -> 1 across section scroll travel
}

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function easeOutCubic(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}

export default function PerfumesSection({
  standalone = false,
}: PerfumesSectionProps) {
  const { products } = useCatalog();
  const { items, addToCart } = useCart();
  const { perfumeGender, setPerfumeGender } = usePerfumeTheme();
  const [search, setSearch] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  const isMujer = perfumeGender === "mujer";

  const [scrollState, setScrollState] = useState<ScrollState>(() => ({
    enterProgress: standalone ? 1 : 0.15,
    letterRise: standalone ? 1 : 0,
    parallaxOffset: 0,
  }));

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (standalone || prefersReducedMotion) {
      setScrollState({
        enterProgress: 1,
        letterRise: 1,
        parallaxOffset: 0,
      });
      return;
    }

    let rafId: number | null = null;

    const updateFromScroll = () => {
      rafId = null;
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // Gradual atmospheric transition from normal GoTech into Perfumes luxury stage
      const rawEnter = (vh * 1.05 - rect.top) / (vh * 0.85);
      const enterProgress = easeOutCubic(rawEnter);

      // Letters begin rising as the user almost reaches Perfumes
      const rawRise = (vh * 0.96 - rect.top) / (vh * 0.56);
      const letterRise = easeOutCubic(rawRise);

      // Continuous position inside viewport (-1 entering from bottom -> +1 scrolling past)
      const sectionCenter = rect.top + rect.height * 0.35;
      const normalizedCenter = (vh * 0.5 - sectionCenter) / (vh * 0.85);
      const parallaxOffset = Math.max(-1, Math.min(1, normalizedCenter));

      setScrollState({
        enterProgress,
        letterRise,
        parallaxOffset,
      });
    };

    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateFromScroll);
      }
    };

    updateFromScroll();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [standalone]);

  const perfumeProducts = products.filter((p) =>
    p.category.toLowerCase().includes("perfume")
  );

  const mujerCount = perfumeProducts.filter((p) =>
    p.category.toLowerCase().includes("mujer")
  ).length;
  const hombreCount = perfumeProducts.filter((p) =>
    p.category.toLowerCase().includes("hombre")
  ).length;

  const filtered = perfumeProducts.filter((p) => {
    const catLower = p.category.toLowerCase();
    const matchesGender =
      perfumeGender === "mujer"
        ? catLower.includes("mujer")
        : catLower.includes("hombre");
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesGender && matchesSearch;
  });

  const { enterProgress, letterRise, parallaxOffset } = scrollState;

  return (
    <section
      id="perfumes"
      ref={sectionRef}
      className={`relative overflow-hidden transition-colors duration-700 ${
        isMujer
          ? "text-[#5C0E32] bg-[#FFF1F6]"
          : "text-[#063020] bg-[#EEF7F2]"
      }`}
    >
      {/* Band 1: Luxury Emerald Green (Hombre default) / Velvet Rose (Mujer) Hero Stage */}
      <div
        className={`relative overflow-hidden ${
          standalone
            ? "pt-12 pb-20 sm:pt-16 sm:pb-24"
            : "pt-24 pb-24 sm:pt-32 sm:pb-28"
        }`}
      >
        {/* Cross-fading Emerald Green Backdrop (Hombre) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background: standalone
              ? "linear-gradient(180deg, #042417 0%, #093E29 54%, #4D8A70 82%, #D7ECE2 93%, #EEF7F2 100%)"
              : "linear-gradient(180deg, #EEF4FF 0%, #B8D8CA 15%, #0B4A31 36%, #042417 60%, #1C6949 78%, #D7ECE2 92%, #EEF7F2 100%)",
          }}
        />

        {/* Cross-fading Luxury Rose Backdrop (Mujer) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: standalone
              ? "linear-gradient(180deg, #6E133D 0%, #9E245B 54%, #D97AA3 82%, #F9DCE8 93%, #FFF1F6 100%)"
              : "linear-gradient(180deg, #EEF4FF 0%, #EABBD0 15%, #A62660 36%, #6E133D 60%, #C4477E 78%, #F9DCE8 92%, #FFF1F6 100%)",
          }}
        />

        {/* Scroll-driven atmospheric veil that gradually dissolves as you enter Perfumes */}
        {!standalone && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 95% 75% at 50% 18%, rgba(244, 248, 255, 0.78), rgba(234, 242, 255, 0.65) 70%)",
              opacity: clamp01((1 - enterProgress) * 0.85),
              transform: `translate3d(0, ${parallaxOffset * -16}px, 0)`,
            }}
          />
        )}

        {/* Scroll-reactive luxury champagne glow behind the display typography */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 w-[780px] max-w-[130vw] h-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl z-0 transition-all duration-700"
          style={{
            background: isMujer
              ? "radial-gradient(circle, rgba(255, 226, 238, 0.28) 0%, rgba(194, 50, 115, 0.28) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(232, 207, 142, 0.22) 0%, rgba(20, 110, 74, 0.28) 50%, transparent 75%)",
            opacity: 0.35 + enterProgress * 0.65,
            transform: `translate3d(-50%, calc(-50% + ${
              parallaxOffset * 28
            }px), 0) scale(${0.94 + enterProgress * 0.12})`,
          }}
        />

        {/* Rising & Floating Luxury Display Centerpiece */}
        <div
          className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-5"
          style={{
            transform: `translate3d(0, ${parallaxOffset * -12}px, 0)`,
          }}
        >
          {/* Minimalist Flacon Emblem + Luxury Cinzel Eyebrow */}
          <div
            className="flex flex-col items-center gap-3"
            style={{
              opacity: clamp01(0.25 + letterRise * 0.75),
              transform: `translate3d(0, ${(1 - letterRise) * 42}px, 0)`,
            }}
          >
            <svg
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
              className={`w-10 h-10 transition-colors duration-700 ${
                isMujer ? "text-[#FFE4EF]" : "text-[#EFE1B8]"
              }`}
            >
              <rect
                x="18"
                y="6"
                width="12"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M21 12v4h6v-4"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <rect
                x="11"
                y="16"
                width="26"
                height="24"
                rx="6"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M34 9l5-2M35 13l5 1M34 5l4-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <p
              className={`font-cinzel text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] sm:tracking-[0.36em] transition-colors duration-700 ${
                isMujer ? "text-[#FFE2EE]" : "text-[#EFE1B8]"
              }`}
            >
              Boutique GoTech · Alta Perfumería
            </p>
          </div>

          {/* Highlighted Rising + Floating Luxury Letters */}
          <h2
            aria-label="PERFUMES"
            className="font-cinzel font-extrabold text-[clamp(2rem,8.4vw,5.2rem)] tracking-[0.14em] sm:tracking-[0.2em] leading-none select-none flex items-center justify-center flex-nowrap whitespace-nowrap gap-x-0.5 sm:gap-x-2"
          >
            {PERFUME_TITLE_LETTERS.map((char, idx) => {
              const staggered = clamp01(
                (letterRise - idx * 0.045) /
                  (1 - PERFUME_TITLE_LETTERS.length * 0.03)
              );
              const eased = easeOutCubic(staggered);
              const riseY = (1 - eased) * (72 + idx * 5);

              return (
                <span
                  key={`${char}-${idx}`}
                  style={{
                    opacity: clamp01(0.2 + eased * 0.8),
                    transform: `translate3d(0, ${riseY}px, 0)`,
                  }}
                >
                  <span
                    className={`perfume-float-letter transition-colors duration-700 ${
                      isMujer ? "text-[#FFF9FB]" : "text-[#FBFDFC]"
                    }`}
                    style={{
                      animationDelay: `${idx * 0.16}s`,
                      animationDuration: `${3.8 + (idx % 3) * 0.45}s`,
                      textShadow: isMujer
                        ? "0 6px 26px rgba(72, 6, 36, 0.55), 0 0 24px rgba(255, 224, 238, 0.35)"
                        : "0 6px 26px rgba(2, 24, 15, 0.65), 0 0 24px rgba(232, 207, 142, 0.32)",
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </h2>

          {/* Hairline Luxury Editorial Subtitle */}
          <div
            className="flex items-center justify-center gap-3 sm:gap-4 pt-1"
            style={{
              opacity: clamp01(0.22 + letterRise * 0.78),
              transform: `translate3d(0, ${(1 - letterRise) * 48}px, 0)`,
            }}
          >
            <span
              aria-hidden="true"
              className={`h-px w-10 sm:w-24 bg-gradient-to-r from-transparent transition-colors duration-700 ${
                isMujer ? "to-[#FFD6E7]/80" : "to-[#E8CF8E]/80"
              }`}
            />
            <p
              className={`font-cormorant italic font-semibold text-xl sm:text-3xl tracking-wider transition-colors duration-700 ${
                isMujer ? "text-[#FFF4F8]" : "text-[#F6FBF8]"
              }`}
            >
              {isMujer
                ? "Esencia femenina · Aroma que deja huella"
                : "Distinción masculina · Aroma que deja huella"}
            </p>
            <span
              aria-hidden="true"
              className={`h-px w-10 sm:w-24 bg-gradient-to-l from-transparent transition-colors duration-700 ${
                isMujer ? "to-[#FFD6E7]/80" : "to-[#E8CF8E]/80"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Band 2: Luminous Alabaster-Mint (Hombre) / Luminous Blush-Rose (Mujer) Catalog Surface */}
      <div
        className={`transition-colors duration-700 ${
          isMujer
            ? "bg-gradient-to-b from-[#FFF1F6] via-[#FFF8FB] to-[#FCE4EE]"
            : "bg-gradient-to-b from-[#EEF7F2] via-[#F7FBF9] to-[#E2F0E9]"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 lg:px-8 space-y-10 ${
            standalone ? "pt-4 pb-14 md:pb-16" : "pt-4 pb-16 md:pb-20"
          }`}
        >
          {/* Floating Section Header + Strictly 2 Gender Buttons (Hombre & Mujer) */}
          <div
            className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b pb-6 transition-colors duration-700 ${
              isMujer ? "border-[#F0C4D7]" : "border-[#C5DFD1]"
            }`}
            style={{
              opacity: clamp01(0.35 + letterRise * 0.65),
              transform: `translate3d(0, ${(1 - letterRise) * 28}px, 0)`,
            }}
          >
            <div className="space-y-2">
              <p
                className={`font-cinzel text-xs font-bold uppercase tracking-[0.24em] transition-colors duration-700 ${
                  isMujer ? "text-[#A62660]" : "text-[#0C593B]"
                }`}
              >
                {isMujer
                  ? "Boutique GoTech · Colección Femenina"
                  : "Boutique GoTech · Colección Masculina"}
              </p>
              <h3
                className={`font-playfair font-bold text-3xl md:text-4xl tracking-tight transition-colors duration-700 ${
                  isMujer ? "text-[#5C0E32]" : "text-[#063020]"
                }`}
              >
                {isMujer ? "Perfumes para Mujer" : "Perfumes para Hombre"}
              </h3>
              <p
                className={`font-cormorant text-lg font-medium flex flex-wrap items-center gap-x-2.5 gap-y-1 transition-colors duration-700 ${
                  isMujer ? "text-[#7E3B59]" : "text-[#355E4D]"
                }`}
              >
                <span>Eau de Toilette 60 ml</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {standalone && (
                <div className="relative">
                  <Search
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-700 ${
                      isMujer ? "text-[#A62660]/70" : "text-[#0C593B]/70"
                    }`}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar fragancia..."
                    className={`w-full sm:w-52 bg-white border rounded-xl pl-9 pr-3.5 py-2 text-sm focus:outline-none transition-colors duration-700 ${
                      isMujer
                        ? "border-[#F0C4D7] text-[#5C0E32] placeholder-[#B07A92] focus:border-[#A62660]"
                        : "border-[#C5DFD1] text-[#063020] placeholder-[#6B9382] focus:border-[#0B4A31]"
                    }`}
                  />
                </div>
              )}

              {/* Exclusively 2 Luxury Buttons: Hombre & Mujer */}
              <div
                className={`inline-flex items-center p-1.5 border rounded-xl transition-colors duration-700 ${
                  isMujer
                    ? "bg-[#FBE4EE] border-[#F0C2D5]"
                    : "bg-[#DFEFE7] border-[#C3DDD0]"
                }`}
                role="tablist"
                aria-label="Seleccionar colección Hombre o Mujer"
              >
                {(
                  [
                    { id: "hombre", label: `Hombre (${hombreCount})` },
                    { id: "mujer", label: `Mujer (${mujerCount})` },
                  ] as const
                ).map((tab) => {
                  const active = perfumeGender === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPerfumeGender(tab.id)}
                      className={`font-playfair px-5 py-2 rounded-lg text-sm font-bold tracking-wider transition-all duration-500 whitespace-nowrap shrink-0 ${
                        active
                          ? tab.id === "mujer"
                            ? "bg-[#A62660] text-[#FFF8FB] shadow-[0_6px_16px_rgba(166,38,96,0.28)]"
                            : "bg-[#0B4A31] text-[#F7FBF9] shadow-[0_6px_16px_rgba(11,74,49,0.28)]"
                          : isMujer
                            ? "text-[#7A3555] hover:text-[#5C0E32]"
                            : "text-[#285240] hover:text-[#063020]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Perfume Grid */}
          {filtered.length === 0 ? (
            <div
              className={`bg-white/90 border rounded-2xl py-16 px-6 text-center transition-colors duration-700 ${
                isMujer ? "border-[#F0C4D7]" : "border-[#C5DFD1]"
              }`}
            >
              <p
                className={`font-playfair text-2xl font-bold mb-2 ${
                  isMujer ? "text-[#5C0E32]" : "text-[#063020]"
                }`}
              >
                No encontramos fragancias con ese filtro
              </p>
              <p
                className={`text-sm mb-4 ${
                  isMujer ? "text-[#7E3B59]" : "text-[#355E4D]"
                }`}
              >
                Prueba limpiando el buscador o cambiando entre Hombre y Mujer.
              </p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className={`font-playfair px-6 py-2.5 rounded-xl text-white text-sm font-bold tracking-wider transition-colors ${
                  isMujer
                    ? "bg-[#A62660] hover:bg-[#C23273]"
                    : "bg-[#0B4A31] hover:bg-[#116443]"
                }`}
              >
                Mostrar colección
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((product) => {
                const inCart = items.find((i) => i.product.id === product.id);
                const isItemHombre = product.category
                  .toLowerCase()
                  .includes("hombre");
                const fixedPrice = Number(product.price);
                const cardPalette = getPerfumeCardPalette(
                  product.id,
                  !isItemHombre
                );

                return (
                  <article
                    key={product.id}
                    className={`group border rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all duration-500 flex flex-col ${cardPalette.card}`}
                  >
                    <Link
                      to={`/producto/${product.id}`}
                      className={`block relative aspect-square overflow-hidden transition-colors duration-700 ${cardPalette.imageBg}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      {product.stock === 0 && (
                        <div
                          className={`absolute inset-0 flex items-center justify-center ${cardPalette.overlayBg}`}
                        >
                          <span className="text-white font-playfair font-bold text-lg uppercase tracking-widest">
                            Agotado
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="p-5 flex-1 flex flex-col">
                      <div
                        className={`flex items-center gap-2 font-cinzel text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors duration-700 ${cardPalette.eyebrow}`}
                      >
                        <span>{isItemHombre ? "Caballero" : "Dama"}</span>
                        <span aria-hidden="true">·</span>
                        <span>60 ml</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            product.stock === 0
                              ? "text-red-700"
                              : cardPalette.availableText
                          }
                        >
                          {product.stock === 0 ? "Agotado" : "Disponible"}
                        </span>
                      </div>

                      <Link to={`/producto/${product.id}`}>
                        <h3
                          className={`font-playfair font-bold text-lg leading-snug mb-2 transition-colors ${cardPalette.title}`}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      <p
                        className={`font-cormorant text-base font-medium leading-snug mb-4 line-clamp-2 transition-colors duration-700 ${cardPalette.description}`}
                      >
                        {product.features[0] || product.description}
                      </p>

                      <div
                        className={`mt-auto pt-3 border-t space-y-3 transition-colors duration-700 ${cardPalette.divider}`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={`font-playfair font-bold text-2xl tabular-nums transition-colors duration-700 ${cardPalette.price}`}
                          >
                            ${fixedPrice.toFixed(2)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors duration-700 ${cardPalette.shippingBadge}`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Envío gratis
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => product.stock > 0 && addToCart(product)}
                          disabled={product.stock === 0}
                          className={`font-playfair w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold tracking-wide transition-all duration-500 ${
                            product.stock === 0
                              ? cardPalette.btnDisabled
                              : inCart
                                ? cardPalette.btnInCart
                                : cardPalette.btnDefault
                          }`}
                        >
                          {product.stock === 0 ? (
                            "Agotado"
                          ) : inCart ? (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              En carrito ({inCart.quantity})
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Agregar al carrito
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Luxury Editorial Footer Bar */}
          <div
            className={`flex flex-col md:flex-row items-center justify-between gap-4 bg-white/95 border rounded-2xl px-6 py-5 transition-colors duration-700 ${
              isMujer
                ? "border-[#F0C4D7] shadow-[0_10px_28px_rgba(142,29,78,0.07)]"
                : "border-[#C5DFD1] shadow-[0_10px_28px_rgba(6,48,32,0.07)]"
            }`}
          >
            <div className="text-center md:text-left">
              <p
                className={`font-playfair font-bold text-lg transition-colors duration-700 ${
                  isMujer ? "text-[#5C0E32]" : "text-[#063020]"
                }`}
              >
                Aroma que deja huella · Entrega hoy en San Salvador
              </p>
              <p
                className={`font-cormorant text-base font-medium mt-0.5 transition-colors duration-700 ${
                  isMujer ? "text-[#7E3B59]" : "text-[#355E4D]"
                }`}
              >
                Envío gratis en Salvador del Mundo (Gasolinera Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Masferrer y Luceiro.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hola GoTech! Quisiera consultar por los perfumes para ${
                    isMujer ? "mujer" : "hombre"
                  } disponibles ($7.00).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-playfair px-5 py-2.5 rounded-xl text-white text-sm font-bold tracking-wide transition-colors duration-500 ${
                  isMujer
                    ? "bg-[#A62660] hover:bg-[#C23273]"
                    : "bg-[#0B4A31] hover:bg-[#116443]"
                }`}
              >
                Consultar por WhatsApp
              </a>
              {standalone ? (
                <Link
                  to="/catalogo"
                  className={`font-playfair inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold tracking-wide transition-colors duration-500 ${
                    isMujer
                      ? "border-[#E3A9C3] text-[#5C0E32] hover:bg-[#FCE9F1]"
                      : "border-[#A9CDBB] text-[#063020] hover:bg-[#E7F3EC]"
                  }`}
                >
                  Ver catálogo tech <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  to="/perfumes"
                  className={`font-playfair inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold tracking-wide transition-colors duration-500 ${
                    isMujer
                      ? "border-[#E3A9C3] text-[#5C0E32] hover:bg-[#FCE9F1]"
                      : "border-[#A9CDBB] text-[#063020] hover:bg-[#E7F3EC]"
                  }`}
                >
                  Abrir sección Perfumes <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Band 3: Smooth Gradual Exit Back to Normal Light-Blue GoTech Catalog */}
      {!standalone && (
        <div
          aria-hidden="true"
          className="h-24 w-full transition-colors duration-700"
          style={{
            background: isMujer
              ? "linear-gradient(180deg, #FCE4EE 0%, #F4E8F4 48%, #ECF2FC 78%, #F4F8FF 100%)"
              : "linear-gradient(180deg, #E2F0E9 0%, #E5EFF4 48%, #ECF3FC 78%, #F4F8FF 100%)",
          }}
        />
      )}
    </section>
  );
}
