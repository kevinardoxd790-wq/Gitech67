import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Truck, ArrowRight, Search } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
import { WHATSAPP_NUMBER } from "@/constants/products";

const PERFUME_TITLE_LETTERS = "PERFUMES".split("");

type GenderFilter = "todos" | "mujer" | "hombre";

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
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("todos");
  const [search, setSearch] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

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

      // Gradual atmospheric transition from dark tech into warm blush-burgundy
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
      genderFilter === "todos" ||
      (genderFilter === "mujer" && catLower.includes("mujer")) ||
      (genderFilter === "hombre" && catLower.includes("hombre"));
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
      className="relative overflow-hidden text-[#3B0815] bg-[#FAF0EC]"
    >
      {/* Band 1: Gradual Entrance + Velvet Burgundy Stage for Crisp Light Ivory Typography */}
      <div
        className={`relative overflow-hidden ${
          standalone ? "pt-12 pb-20 sm:pt-16 sm:pb-24" : "pt-24 pb-24 sm:pt-32 sm:pb-28"
        }`}
        style={{
          background: standalone
            ? "linear-gradient(180deg, #4D0819 0%, #6E0F27 56%, #B96D7E 82%, #EED6CE 93%, #FAF0EC 100%)"
            : "linear-gradient(180deg, #EEF4FF 0%, #D6B2BE 15%, #7A102B 36%, #5B0A1E 60%, #9E3B55 78%, #EED6CE 92%, #FAF0EC 100%)",
        }}
      >
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

        {/* Scroll-reactive subtle warm rose/champagne glow behind the light letters */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 w-[780px] max-w-[130vw] h-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 224, 214, 0.22) 0%, rgba(168, 42, 74, 0.28) 50%, transparent 75%)",
            opacity: 0.35 + enterProgress * 0.65,
            transform: `translate3d(-50%, calc(-50% + ${
              parallaxOffset * 28
            }px), 0) scale(${0.94 + enterProgress * 0.12})`,
          }}
        />

        {/* Rising & Floating Letters Editorial Centerpiece (Always Crisp Light Ivory over Velvet Burgundy) */}
        <div
          className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-5"
          style={{
            transform: `translate3d(0, ${parallaxOffset * -12}px, 0)`,
          }}
        >
          {/* Minimalist Flacon Emblem + Eyebrow */}
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
              className="w-10 h-10 text-[#FFE8E0]"
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
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] sm:tracking-[0.34em] text-[#FFE0D6]">
              Boutique GoTech · Colección Exclusiva
            </p>
          </div>

          {/* Highlighted Rising + Floating Letters (Single-line on mobile & desktop, luminous ivory) */}
          <h2
            aria-label="PERFUMES"
            className="font-playfair font-black text-[clamp(2rem,8.8vw,5.25rem)] tracking-[0.11em] sm:tracking-[0.18em] leading-none select-none flex items-center justify-center flex-nowrap whitespace-nowrap gap-x-0.5 sm:gap-x-2"
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
                    className="perfume-float-letter text-[#FFF9F6]"
                    style={{
                      animationDelay: `${idx * 0.16}s`,
                      animationDuration: `${3.8 + (idx % 3) * 0.45}s`,
                      textShadow:
                        "0 6px 26px rgba(24, 2, 8, 0.55), 0 0 22px rgba(255, 224, 214, 0.28)",
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </h2>

          {/* Hairline Editorial Subtitle */}
          <div
            className="flex items-center justify-center gap-3 sm:gap-4 pt-1"
            style={{
              opacity: clamp01(0.22 + letterRise * 0.78),
              transform: `translate3d(0, ${(1 - letterRise) * 48}px, 0)`,
            }}
          >
            <span
              aria-hidden="true"
              className="h-px w-10 sm:w-24 bg-gradient-to-r from-transparent to-[#FFE0D6]/75"
            />
            <p className="font-playfair italic font-medium text-lg sm:text-2xl tracking-wider text-[#FFF1EC]">
              Aroma que deja huella
            </p>
            <span
              aria-hidden="true"
              className="h-px w-10 sm:w-24 bg-gradient-to-l from-transparent to-[#FFE0D6]/75"
            />
          </div>
        </div>
      </div>

      {/* Band 2: Luminous Blush-Marble Catalog Surface (Guaranteed Contrast for Dark Burgundy Text) */}
      <div className="bg-gradient-to-b from-[#FAF0EC] via-[#FDF8F6] to-[#F4E4DF]">
        <div
          className={`max-w-7xl mx-auto px-4 lg:px-8 space-y-10 ${
            standalone ? "pt-4 pb-14 md:pb-16" : "pt-4 pb-16 md:pb-20"
          }`}
        >
          {/* Floating Section Header + Interactive Gender Filter Bar */}
          <div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5CEC6] pb-6"
            style={{
              opacity: clamp01(0.35 + letterRise * 0.65),
              transform: `translate3d(0, ${(1 - letterRise) * 28}px, 0)`,
            }}
          >
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8B1A35]">
              Boutique GoTech · Fragancias Seleccionadas
            </p>
            <h3 className="font-playfair font-bold text-3xl md:text-4xl text-[#4D0819] tracking-tight">
              Perfumes para Mujer y Hombre
            </h3>
            <p className="text-sm text-[#6B4A52] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Eau de Toilette 60 ml</span>
              <span aria-hidden="true">·</span>
              <span>Aroma de larga duración</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#5B0A1E]">
                Envío gratis en San Salvador (incluye Salvador del Mundo)
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {standalone && (
              <div className="relative">
                <Search className="w-4 h-4 text-[#8B1A35]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar fragancia..."
                  className="w-full sm:w-52 bg-white border border-[#DFC5BC] rounded-xl pl-9 pr-3.5 py-2 text-sm text-[#3B0815] placeholder-[#9D7880] focus:outline-none focus:border-[#7A102B]"
                />
              </div>
            )}

            <div
              className="inline-flex items-center p-1 bg-[#EFE0DA] border border-[#E2C8BF] rounded-xl"
              role="tablist"
              aria-label="Filtrar perfumes por género"
            >
              {(
                [
                  { id: "todos", label: `Todos (${perfumeProducts.length})` },
                  { id: "mujer", label: `Mujer (${mujerCount})` },
                  { id: "hombre", label: `Hombre (${hombreCount})` },
                ] as const
              ).map((tab) => {
                const active = genderFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setGenderFilter(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? "bg-[#5B0A1E] text-[#FFF8F6] shadow-sm"
                        : "text-[#6D3846] hover:text-[#3B0815]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop 4-Column Perfume Grid (NO numeric stock shown to customers) */}
        {filtered.length === 0 ? (
          <div className="bg-white/85 border border-[#E5CEC6] rounded-2xl py-16 px-6 text-center">
            <p className="font-playfair text-xl font-bold text-[#4D0819] mb-2">
              No encontramos fragancias con ese filtro
            </p>
            <p className="text-sm text-[#6B4A52] mb-4">
              Prueba seleccionando otra categoría o limpia el buscador.
            </p>
            <button
              type="button"
              onClick={() => {
                setGenderFilter("todos");
                setSearch("");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#5B0A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7A102B] transition-colors"
            >
              Ver todos los perfumes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const inCart = items.find((i) => i.product.id === product.id);
              const isHombre = product.category.toLowerCase().includes("hombre");
              const fixedPrice = Number(product.price);

              return (
                <article
                  key={product.id}
                  className="group bg-white border border-[#E6D1CA] rounded-2xl overflow-hidden shadow-[0_8px_28px_rgba(77,8,25,0.06)] hover:shadow-[0_16px_40px_rgba(77,8,25,0.13)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  <Link
                    to={`/producto/${product.id}`}
                    className="block relative aspect-square overflow-hidden bg-[#F9EFEA]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-[#3B0815]/55 flex items-center justify-center">
                        <span className="text-white font-playfair font-bold text-lg uppercase tracking-widest">
                          Agotado
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8B1A35] mb-1.5">
                      <span>{isHombre ? "Caballero" : "Dama"}</span>
                      <span aria-hidden="true">·</span>
                      <span>60 ml</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-700"
                            : "text-emerald-700"
                        }
                      >
                        {product.stock === 0 ? "Agotado" : "Disponible"}
                      </span>
                    </div>

                    <Link to={`/producto/${product.id}`}>
                      <h3 className="font-playfair font-bold text-lg text-[#360612] leading-snug mb-2 group-hover:text-[#8B1A35] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#6B4A52] leading-relaxed mb-4 line-clamp-2">
                      {product.features[0] || product.description}
                    </p>

                    <div className="mt-auto pt-3 border-t border-[#F2E3DE] space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-playfair font-bold text-2xl text-[#4D0819] tabular-nums">
                          ${fixedPrice.toFixed(2)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <Truck className="w-3.5 h-3.5" />
                          Envío gratis
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => product.stock > 0 && addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
                          product.stock === 0
                            ? "bg-[#EFE4E0] text-[#9E8088] cursor-not-allowed"
                            : inCart
                              ? "bg-[#F5E6E1] border border-[#5B0A1E] text-[#5B0A1E] hover:bg-[#5B0A1E] hover:text-white"
                              : "bg-[#5B0A1E] text-[#FFF8F6] hover:bg-[#7A102B] shadow-[0_6px_18px_rgba(91,10,30,0.22)]"
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

        {/* Editorial Desktop Footer Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/90 border border-[#E5CEC6] rounded-2xl px-6 py-5 shadow-[0_10px_28px_rgba(77,8,25,0.06)]">
          <div className="text-center md:text-left">
            <p className="font-playfair font-bold text-lg text-[#4D0819]">
              Aroma que deja huella · Entrega hoy en San Salvador
            </p>
            <p className="text-xs text-[#6B4A52] mt-0.5">
              Envío gratis en Salvador del Mundo (Gasolinera Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Masferrer y Luceiro.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hola GoTech! Quisiera consultar por los perfumes disponibles ($7.00)."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#5B0A1E] hover:bg-[#7A102B] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Consultar por WhatsApp
            </a>
            {standalone ? (
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#C9A89D] text-[#4D0819] hover:bg-[#F5E7E2] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Ver catálogo tech <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/perfumes"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#C9A89D] text-[#4D0819] hover:bg-[#F5E7E2] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Abrir sección Perfumes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Band 3: Smooth Gradual Exit Back to Bright Ice-Blue GoTech Canvas */}
      {!standalone && (
        <div
          aria-hidden="true"
          className="h-24 w-full"
          style={{
            background:
              "linear-gradient(180deg, #F4E4DF 0%, #ECDCE6 45%, #EAF1FB 78%, #F4F8FF 100%)",
          }}
        />
      )}
    </section>
  );
}
