import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Truck, ArrowRight, Search } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";
import { WHATSAPP_NUMBER } from "@/constants/products";
import { getPerfumeCardPalette } from "@/constants/perfumePalettes";

const MUJER_HERO_IMG =
  "/src/assets/images/perfume_hero_mujer_1795232269310.jpg";
const HOMBRE_HERO_IMG =
  "/src/assets/images/perfume_hero_hombre_1795232269618.jpg";

interface PerfumesSectionProps {
  standalone?: boolean;
}

export default function PerfumesSection({
  standalone = false,
}: PerfumesSectionProps) {
  const { products } = useCatalog();
  const { items, addToCart } = useCart();
  const { perfumeGender, setPerfumeGender } = usePerfumeTheme();
  const [search, setSearch] = useState("");
  const [heroImgFailed, setHeroImgFailed] = useState<{
    mujer?: boolean;
    hombre?: boolean;
  }>({});

  const isMujer = perfumeGender === "mujer";

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

  const scrollToCatalog = () => {
    const el = document.getElementById("perfumes-catalogo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="perfumes"
      className={`relative scroll-mt-16 overflow-hidden transition-colors duration-700 ease-in-out ${
        isMujer
          ? "text-[#3B101C] bg-[#FDF2F0]"
          : "text-[#0D2016] bg-[#F7F5EE]"
      }`}
    >

      {/* Band 1: Full-Bleed Photographic Luxury Campaign Hero */}
      <div className="relative w-full overflow-hidden bg-[#12070B]">
        {/* Fallback Luxury Gradient Canvas if image fails */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle at 75% 45%, #D96889 0%, #8C1338 45%, #4A051A 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background:
              "radial-gradient(circle at 75% 45%, #1F5134 0%, #0A2416 48%, #040F09 100%)",
          }}
        />

        {/* Cross-fading Hero Photography */}
        {!heroImgFailed.mujer && (
          <img
            src={MUJER_HERO_IMG}
            alt="Colección Femenina de Perfumes GoTech"
            referrerPolicy="no-referrer"
            onError={() =>
              setHeroImgFailed((prev) => ({ ...prev, mujer: true }))
            }
            className={`absolute inset-0 w-full h-full object-cover object-[78%_center] sm:object-center transition-all duration-700 ease-in-out select-none pointer-events-none ${
              isMujer ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
            }`}
          />
        )}
        {!heroImgFailed.hombre && (
          <img
            src={HOMBRE_HERO_IMG}
            alt="Colección Masculina de Perfumes GoTech"
            referrerPolicy="no-referrer"
            onError={() =>
              setHeroImgFailed((prev) => ({ ...prev, hombre: true }))
            }
            className={`absolute inset-0 w-full h-full object-cover object-[78%_center] sm:object-center transition-all duration-700 ease-in-out select-none pointer-events-none ${
              isMujer ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
            }`}
          />
        )}

        {/* Measured Contrast Scrims so left typography remains >7:1 legible */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, rgba(72, 6, 26, 0.84) 0%, rgba(102, 11, 40, 0.62) 42%, rgba(102, 11, 40, 0.14) 70%, transparent 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background:
              "linear-gradient(90deg, rgba(3, 15, 9, 0.88) 0%, rgba(7, 27, 16, 0.65) 44%, rgba(7, 27, 16, 0.14) 72%, transparent 100%)",
          }}
        />

        {/* Hero Typography Overlay (Left Campaign Stack) */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 min-h-[340px] sm:min-h-[430px] lg:min-h-[520px] flex items-center">
          <div className="w-[78%] sm:w-[60%] md:w-[56%] lg:w-[52%] flex flex-col items-center text-center">
            {/* Top Hairline Eyebrow */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
              <span
                aria-hidden="true"
                className="flex-1 max-w-[72px] h-px bg-gradient-to-r from-transparent to-[#E3C57E]/90"
              />
              <span className="font-montserrat text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.34em] text-[#F9EED7] whitespace-nowrap">
                Boutique GoTech
              </span>
              <span
                aria-hidden="true"
                className="flex-1 max-w-[72px] h-px bg-gradient-to-l from-transparent to-[#E3C57E]/90"
              />
            </div>

            {/* COLECCIÓN */}
            <p className="mt-2.5 sm:mt-3 font-bodoni uppercase font-medium text-base sm:text-2xl lg:text-[26px] tracking-[0.32em] text-[#FFFDF9]/95 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
              Colección
            </p>

            {/* Cross-fading FEMENINA / MASCULINA Main Display Title */}
            <div className="relative mt-0.5 sm:mt-1 w-full flex items-center justify-center">
              <h2
                aria-hidden={!isMujer}
                className={`font-luxury uppercase font-normal text-[clamp(2.1rem,5.9vw,4.75rem)] leading-[0.98] tracking-[0.04em] text-white drop-shadow-[0_6px_22px_rgba(0,0,0,0.5)] transition-all duration-700 ease-in-out whitespace-nowrap ${
                  isMujer
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none select-none"
                }`}
              >
                Femenina
              </h2>
              <h2
                aria-hidden={isMujer}
                className={`absolute inset-0 flex items-center justify-center font-luxury uppercase font-normal text-[clamp(2.1rem,5.9vw,4.75rem)] leading-[0.98] tracking-[0.04em] text-white drop-shadow-[0_6px_22px_rgba(0,0,0,0.5)] transition-all duration-700 ease-in-out whitespace-nowrap ${
                  !isMujer
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none select-none"
                }`}
              >
                Masculina
              </h2>
            </div>

            {/* Cross-fading Subtitle with Hairlines */}
            <div className="mt-2.5 sm:mt-3.5 flex items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md">
              <span
                aria-hidden="true"
                className="flex-1 max-w-[56px] h-px bg-gradient-to-r from-transparent to-[#E3C57E]/85"
              />
              <div className="relative inline-flex items-center justify-center">
                <span
                  aria-hidden={!isMujer}
                  className={`font-montserrat text-[10px] sm:text-xs font-medium uppercase tracking-[0.28em] text-[#F6E9CE] whitespace-nowrap transition-all duration-700 ease-in-out ${
                    isMujer
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-1.5 pointer-events-none select-none"
                  }`}
                >
                  Perfumes para Mujer
                </span>
                <span
                  aria-hidden={isMujer}
                  className={`absolute inset-0 flex items-center justify-center font-montserrat text-[10px] sm:text-xs font-medium uppercase tracking-[0.28em] text-[#F6E9CE] whitespace-nowrap transition-all duration-700 ease-in-out ${
                    !isMujer
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1.5 pointer-events-none select-none"
                  }`}
                >
                  Perfumes para Hombre
                </span>
              </div>
              <span
                aria-hidden="true"
                className="flex-1 max-w-[56px] h-px bg-gradient-to-l from-transparent to-[#E3C57E]/85"
              />
            </div>

            {/* Luxury Gold-Bordered Pill CTA with Smooth Cross-fading Fill */}
            <button
              type="button"
              onClick={scrollToCatalog}
              className={`relative overflow-hidden mt-5 sm:mt-7 inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border text-[11px] sm:text-xs font-montserrat font-medium uppercase tracking-[0.26em] text-[#FFFDF8] whitespace-nowrap shrink-0 transition-all duration-700 ease-in-out active:scale-[0.98] ${
                isMujer
                  ? "border-[#DFC078] shadow-[0_0_0_2px_rgba(62,4,21,0.45),inset_0_0_0_1px_rgba(246,223,163,0.4),0_10px_28px_rgba(0,0,0,0.38)]"
                  : "border-[#CEAF6C] shadow-[0_0_0_2px_rgba(3,15,9,0.5),inset_0_0_0_1px_rgba(230,206,146,0.35),0_10px_28px_rgba(0,0,0,0.45)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 bg-[#5D0721]/90 hover:bg-[#7A0C2D] transition-opacity duration-700 ease-in-out ${
                  isMujer ? "opacity-100" : "opacity-0"
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute inset-0 bg-[#061C10]/90 hover:bg-[#0E311E] transition-opacity duration-700 ease-in-out ${
                  isMujer ? "opacity-0" : "opacity-100"
                }`}
              />
              <span className="relative z-10">Descubre tu aroma</span>
              <ArrowRight className="relative z-10 w-3.5 h-3.5 text-[#EED597]" />
            </button>
          </div>
        </div>
      </div>

      {/* Band 2: Smooth Cross-fading Warm Blush Cream (Mujer) / Warm Alabaster Ivory (Hombre) */}
      <div className="relative">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(180deg, #FDF2F0 0%, #FFF8F6 50%, #F9E5E1 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isMujer ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background:
              "linear-gradient(180deg, #F7F5EE 0%, #FAF9F4 50%, #EDEAE0 100%)",
          }}
        />

        <div className="relative z-10">
          {/* Centered Luxury Segmented Toggle flanked by subtle hairlines */}
          <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-8 pb-2">
            <div className="flex items-center justify-center gap-3 sm:gap-6">
              <span
                aria-hidden="true"
                className={`hidden sm:block flex-1 max-w-[140px] h-px transition-colors duration-700 ease-in-out ${
                  isMujer ? "bg-[#C99B89]/60" : "bg-[#3F4D44]/40"
                }`}
              />

              {/* Smoothly sliding luxury capsule toggle */}
              <div
                className={`relative grid grid-cols-2 items-center p-1 rounded-full border transition-all duration-700 ease-in-out shadow-[0_4px_18px_rgba(0,0,0,0.06)] ${
                  isMujer
                    ? "bg-[#FDF8F4] border-[#C8A158]"
                    : "bg-[#FBF9F2] border-[#B6985A]"
                }`}
                role="tablist"
                aria-label="Seleccionar colección Hombre o Mujer"
              >
                {/* Sliding active pill backdrop */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isMujer
                      ? "translate-x-full shadow-[0_4px_14px_rgba(142,16,54,0.34)]"
                      : "translate-x-0 shadow-[0_4px_14px_rgba(10,36,22,0.34)]"
                  }`}
                >
                  <span
                    className={`absolute inset-0 bg-gradient-to-r from-[#071D12] via-[#0F311F] to-[#17422B] transition-opacity duration-500 ease-in-out ${
                      isMujer ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute inset-0 bg-gradient-to-r from-[#6A0A26] via-[#9D173F] to-[#BD2854] transition-opacity duration-500 ease-in-out ${
                      isMujer ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </span>

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
                      className={`relative z-10 font-luxury font-normal px-5 sm:px-9 py-2 sm:py-2.5 rounded-full text-sm sm:text-lg tracking-wide transition-colors duration-500 ease-in-out whitespace-nowrap shrink-0 text-center ${
                        active
                          ? "text-[#FFFDF9]"
                          : isMujer
                            ? "text-[#2A181C] hover:text-[#8E1036]"
                            : "text-[#19261E] hover:text-[#0B2819]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <span
                aria-hidden="true"
                className={`hidden sm:block flex-1 max-w-[140px] h-px transition-colors duration-700 ease-in-out ${
                  isMujer ? "bg-[#C99B89]/60" : "bg-[#3F4D44]/40"
                }`}
              />
            </div>
          </div>

          {/* Catalog Grid Container */}
          <div
            id="perfumes-catalogo"
            className={`max-w-7xl mx-auto px-4 lg:px-8 space-y-8 scroll-mt-24 ${
              standalone ? "pt-6 pb-14 md:pb-16" : "pt-6 pb-16 md:pb-20"
            }`}
          >
            {/* Editorial Collection Subheader + Search with Smooth Cross-fading Typography */}
            <div
              className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5 transition-colors duration-700 ease-in-out ${
                isMujer ? "border-[#EBD0C9]" : "border-[#D7D0BE]"
              }`}
            >
              <div className="relative">
                <h3
                  aria-hidden={!isMujer}
                  className={`font-luxury font-normal text-3xl sm:text-4xl lg:text-[44px] leading-[1.06] tracking-[0.015em] text-[#3B101C] transition-all duration-700 ease-in-out ${
                    isMujer
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none select-none"
                  }`}
                >
                  Perfumes para Mujer
                </h3>
                <h3
                  aria-hidden={isMujer}
                  className={`absolute inset-0 font-luxury font-normal text-3xl sm:text-4xl lg:text-[44px] leading-[1.06] tracking-[0.015em] text-[#0D2016] transition-all duration-700 ease-in-out ${
                    !isMujer
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 pointer-events-none select-none"
                  }`}
                >
                  Perfumes para Hombre
                </h3>
              </div>

              {standalone && (
                <div className="relative shrink-0">
                  <Search
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-700 ease-in-out ${
                      isMujer ? "text-[#8E1036]/75" : "text-[#0F3822]/75"
                    }`}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar fragancia..."
                    className={`w-full sm:w-56 bg-white border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none transition-colors duration-700 ease-in-out ${
                      isMujer
                        ? "border-[#EBD0C9] text-[#3B101C] placeholder-[#A47A84] focus:border-[#8E1036]"
                        : "border-[#D7D0BE] text-[#0D2016] placeholder-[#728277] focus:border-[#0B2819]"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Perfume Grid with Smooth Staggered Reveal on Collection Switch */}
            {filtered.length === 0 ? (
              <div
                key={`empty-${perfumeGender}`}
                className={`perfume-card-reveal bg-white/95 border rounded-2xl py-16 px-6 text-center transition-colors duration-700 ease-in-out ${
                  isMujer ? "border-[#EBD0C9]" : "border-[#D7D0BE]"
                }`}
              >
                <p
                  className={`font-luxury font-normal text-2xl mb-2 transition-colors duration-700 ${
                    isMujer ? "text-[#3B101C]" : "text-[#0D2016]"
                  }`}
                >
                  No encontramos fragancias con ese filtro
                </p>
                <p
                  className={`text-sm mb-4 transition-colors duration-700 ${
                    isMujer ? "text-[#7E4A56]" : "text-[#4A5D52]"
                  }`}
                >
                  Prueba limpiando el buscador o cambiando entre Hombre y Mujer.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={`font-luxury font-normal px-6 py-2.5 rounded-full text-white text-sm tracking-wider transition-colors duration-500 ${
                    isMujer
                      ? "bg-[#8E1036] hover:bg-[#AA1B46]"
                      : "bg-[#0B2819] hover:bg-[#144029]"
                  }`}
                >
                  Mostrar colección
                </button>
              </div>
            ) : (
              <div
                key={perfumeGender}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {filtered.map((product, idx) => {
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
                      style={{ animationDelay: `${Math.min(idx, 7) * 55}ms` }}
                      className={`perfume-card-reveal group border rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all duration-500 flex flex-col ${cardPalette.card}`}
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
                            <span className="text-white font-luxury font-normal text-lg uppercase tracking-widest">
                              Agotado
                            </span>
                          </div>
                        )}
                      </Link>

                      <div className="p-5 flex-1 flex flex-col">
                        <div
                          className={`flex items-center gap-2 font-montserrat text-[10px] font-medium uppercase tracking-[0.18em] mb-1.5 transition-colors duration-700 ${cardPalette.eyebrow}`}
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
                            className={`font-luxury font-normal text-lg sm:text-[19px] leading-snug tracking-[0.01em] mb-2 transition-colors duration-500 ${cardPalette.title}`}
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
                              className={`font-luxury font-normal text-2xl tabular-nums transition-colors duration-700 ${cardPalette.price}`}
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
                            onClick={() =>
                              product.stock > 0 && addToCart(product)
                            }
                            disabled={product.stock === 0}
                            className={`font-bodoni w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold tracking-wide transition-all duration-500 ${
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
              className={`flex flex-col md:flex-row items-center justify-between gap-4 bg-white/95 border rounded-2xl px-6 py-5 transition-all duration-700 ease-in-out ${
                isMujer
                  ? "border-[#EBD0C9] shadow-[0_10px_28px_rgba(142,16,54,0.07)]"
                  : "border-[#D7D0BE] shadow-[0_10px_28px_rgba(11,40,25,0.07)]"
              }`}
            >
              <div className="text-center md:text-left">
                <p
                  className={`font-luxury font-normal text-xl tracking-[0.015em] transition-colors duration-700 ease-in-out ${
                    isMujer ? "text-[#3B101C]" : "text-[#0D2016]"
                  }`}
                >
                  Aroma que deja huella · Entrega hoy en San Salvador
                </p>
                <p
                  className={`font-cormorant text-base font-medium mt-0.5 transition-colors duration-700 ease-in-out ${
                    isMujer ? "text-[#7E4A56]" : "text-[#4A5D52]"
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
                  className={`relative overflow-hidden font-bodoni px-5 py-2.5 rounded-full text-white text-sm font-bold tracking-wide transition-all duration-700 ease-in-out border ${
                    isMujer
                      ? "border-[#C8A158]/50 bg-[#8E1036] hover:bg-[#AA1B46]"
                      : "border-[#B6985A]/50 bg-[#0B2819] hover:bg-[#144029]"
                  }`}
                >
                  Consultar por WhatsApp
                </a>
                {standalone ? (
                  <Link
                    to="/catalogo"
                    className={`font-bodoni inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-bold tracking-wide transition-colors duration-700 ease-in-out ${
                      isMujer
                        ? "border-[#DFB7AE] text-[#3B101C] hover:bg-[#FDF2F0]"
                        : "border-[#C6BEA8] text-[#0D2016] hover:bg-[#F7F5EE]"
                    }`}
                  >
                    Ver catálogo tech <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/perfumes"
                    className={`font-bodoni inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-bold tracking-wide transition-colors duration-700 ease-in-out ${
                      isMujer
                        ? "border-[#DFB7AE] text-[#3B101C] hover:bg-[#FDF2F0]"
                        : "border-[#C6BEA8] text-[#0D2016] hover:bg-[#F7F5EE]"
                    }`}
                  >
                    Abrir sección Perfumes <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Band 3: Smooth Cross-fading Gradual Exit Back to Normal Light-Blue GoTech Catalog */}
      {!standalone && (
        <div
          className="relative h-24 w-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isMujer ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(180deg, #F9E5E1 0%, #F4E9F1 48%, #EDF2FC 78%, #F4F8FF 100%)",
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isMujer ? "opacity-0" : "opacity-100"
            }`}
            style={{
              background:
                "linear-gradient(180deg, #EDEAE0 0%, #ECEFF3 48%, #EDF3FC 78%, #F4F8FF 100%)",
            }}
          />
        </div>
      )}
    </section>
  );
}
