import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCatalog } from "@/hooks/useCatalog";
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";
import CartDrawer from "@/components/features/CartDrawer";
import FlashOfferBar from "@/components/features/FlashOfferBar";
import BrandLogo from "@/components/BrandLogo";
import { WHATSAPP_NUMBER, isPerfumeProduct } from "@/constants/products";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/perfumes", label: "Perfumes" },
  { href: "/#agenda", label: "Agendar Envío" },
  { href: "/envios", label: "Envíos Gratis" },
  { href: "/ofertas", label: "🔥 Ofertas" },
];

function normalizeSearchText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const {
    isPerfumeZone: isPerfumeTheme,
    perfumeGender,
    activePerfumePalette,
  } = usePerfumeTheme();
  const isPerfumeMujer = isPerfumeTheme && perfumeGender === "mujer";
  const isAdminTheme = location.pathname.startsWith("/admin");
  const detailPalette = !isAdminTheme ? activePerfumePalette : null;

  const { products } = useCatalog();
  const { totalItems, openCart, cartBounce, addToCart } = useCart();

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = normalizeSearchText(searchQuery);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return products.filter((p) => {
      const nName = normalizeSearchText(p.name);
      const nShort = normalizeSearchText(p.shortName || "");
      return nName.includes(normalizedQuery) || nShort.includes(normalizedQuery);
    });
  }, [products, normalizedQuery]);

  // Close search dropdown on outside click or Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = desktopSearchRef.current?.contains(target);
      const inMobile = mobileSearchRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        setSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchFocused(false);
        setSearchOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close menus/dropdowns on route navigation
  useEffect(() => {
    setOpen(false);
    setSearchFocused(false);
    setSearchOpenMobile(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpenMobile) {
      window.setTimeout(() => mobileInputRef.current?.focus(), 40);
    }
  }, [searchOpenMobile]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (searchResults.length === 1) {
      setSearchFocused(false);
      setSearchOpenMobile(false);
      navigate(`/producto/${searchResults[0].id}`);
      return;
    }

    const allArePerfumes =
      searchResults.length > 0 &&
      searchResults.every((p) => isPerfumeProduct(p));

    setSearchFocused(false);
    setSearchOpenMobile(false);
    if (allArePerfumes) {
      navigate("/perfumes");
    } else {
      navigate(`/catalogo?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const renderResultsDropdown = () => {
    if (!normalizedQuery || !searchFocused) return null;

    return (
      <div
        role="listbox"
        aria-label="Resultados de búsqueda"
        className={`mt-2 rounded-2xl border overflow-hidden shadow-2xl transition-colors ${
          isAdminTheme
            ? "bg-dark-800 border-neon-cyan/30 text-white"
            : detailPalette
              ? detailPalette.detailNavDropdown
              : isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-[#FFF8FB] border-[#F0C4D7] text-[#5C0E32] shadow-[0_18px_42px_rgba(142,29,78,0.20)]"
                  : "bg-[#F7FBF9] border-[#C5DFD1] text-[#063020] shadow-[0_18px_42px_rgba(6,48,32,0.20)]"
                : "bg-white border-[#CFE0FA] text-[#0B172A] shadow-[0_18px_42px_rgba(0,68,180,0.16)]"
        }`}
      >
        <div
          className={`px-3.5 py-2 border-b text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
            isAdminTheme
              ? "border-neon-cyan/20 bg-dark-700/60 text-neon-cyan"
              : detailPalette
                ? detailPalette.detailNavDropdownHead
                : isPerfumeTheme
                  ? isPerfumeMujer
                    ? "border-[#F0C4D7] bg-[#FFF1F6] text-[#A62660]"
                    : "border-[#C5DFD1] bg-[#EEF7F2] text-[#0C593B]"
                  : "border-[#E7EFFC] bg-[#F4F8FF] text-[#0057FF]"
          }`}
        >
          <span>
            {searchResults.length === 0
              ? "Sin resultados"
              : `${searchResults.length} ${
                  searchResults.length === 1 ? "producto encontrado" : "productos encontrados"
                }`}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchFocused(false);
            }}
            className="text-[10px] underline opacity-80 hover:opacity-100"
          >
            Limpiar
          </button>
        </div>

        {searchResults.length === 0 ? (
          <div className="p-5 text-center text-xs opacity-75">
            No encontramos productos que coincidan con "{searchQuery.trim()}".
          </div>
        ) : (
          <>
            <div className="max-h-72 overflow-y-auto divide-y divide-black/5">
              {searchResults.slice(0, 7).map((product) => {
                const perfume = isPerfumeProduct(product);
                return (
                  <div
                    key={product.id}
                      className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                      isAdminTheme
                        ? "hover:bg-dark-700"
                        : detailPalette
                          ? detailPalette.detailNavDropdownHover
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? "hover:bg-[#FFF1F6]"
                              : "hover:bg-[#EEF7F2]"
                            : "hover:bg-[#F4F8FF]"
                    }`}
                  >
                    <Link
                      to={`/producto/${product.id}`}
                      onClick={() => {
                        setSearchFocused(false);
                        setSearchOpenMobile(false);
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className={`w-11 h-11 rounded-xl object-cover shrink-0 border ${
                          isAdminTheme
                            ? "bg-dark-700 border-neon-cyan/20"
                            : isPerfumeTheme
                              ? isPerfumeMujer
                                ? "bg-[#FFF3F7] border-[#F0C4D7]"
                                : "bg-[#EEF7F2] border-[#C5DFD1]"
                              : "bg-[#F8FAFF] border-[#DCE7F8]"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                              perfume
                                ? product.category.toLowerCase().includes("mujer")
                                  ? "bg-[#FCE4EE] text-[#A62660]"
                                  : "bg-[#E2F0E9] text-[#0B4A31]"
                                : isAdminTheme
                                  ? "bg-neon-cyan/15 text-neon-cyan"
                                  : "bg-[#EAF2FF] text-[#0057FF]"
                            }`}
                          >
                            {product.category}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              product.stock === 0
                                ? "text-red-500"
                                : isAdminTheme
                                  ? "text-green-400"
                                  : "text-emerald-700"
                            }`}
                          >
                            {product.stock === 0 ? "Agotado" : "Disponible"}
                          </span>
                        </div>
                        <p className="text-xs font-bold truncate">
                          {product.name}
                        </p>
                        <p
                          className={`text-xs font-black tabular-nums ${
                            isAdminTheme
                              ? "text-neon-cyan"
                              : isPerfumeTheme
                                ? isPerfumeMujer
                                  ? "text-[#A62660]"
                                  : "text-[#0B4A31]"
                                : "text-[#0057FF]"
                          }`}
                        >
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>

                    {product.stock > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        title="Agregar al carrito"
                        aria-label={`Agregar ${product.name} al carrito`}
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isAdminTheme
                            ? "bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan hover:text-dark-900"
                            : detailPalette
                              ? detailPalette.detailNavCartBtn
                              : isPerfumeTheme
                                ? isPerfumeMujer
                                  ? "bg-[#A62660] text-white hover:bg-[#C23273]"
                                  : "bg-[#0B4A31] text-white hover:bg-[#116443]"
                                : "bg-[#0057FF] text-white hover:bg-[#0044CC]"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              to={
                searchResults.every((p) => isPerfumeProduct(p))
                  ? "/perfumes"
                  : `/catalogo?q=${encodeURIComponent(searchQuery.trim())}`
              }
              onClick={() => {
                setSearchFocused(false);
                setSearchOpenMobile(false);
              }}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-t transition-colors ${
                isAdminTheme
                  ? "border-neon-cyan/20 text-neon-cyan hover:bg-dark-700"
                  : detailPalette
                    ? detailPalette.detailNavDropdownFoot
                    : isPerfumeTheme
                      ? isPerfumeMujer
                        ? "border-[#F0C4D7] text-[#A62660] hover:bg-[#FFF1F6]"
                        : "border-[#C5DFD1] text-[#0B4A31] hover:bg-[#EEF7F2]"
                      : "border-[#E7EFFC] text-[#0057FF] hover:bg-[#F4F8FF]"
              }`}
            >
              {searchResults.every((p) => isPerfumeProduct(p))
                ? "Ver colección en Perfumes"
                : "Ver resultados en el catálogo"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <FlashOfferBar
          isPerfumeTheme={isPerfumeTheme}
          perfumeGender={perfumeGender}
          activePerfumePalette={detailPalette}
          isAdminTheme={isAdminTheme}
        />
        <nav
          className={`backdrop-blur-md border-b transition-all duration-700 ease-in-out ${
            isAdminTheme
              ? "bg-dark-900/95 border-neon-cyan/20"
              : detailPalette
                ? detailPalette.detailNavBg
                : isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-[#FFF1F6]/95 border-[#F0C4D7] shadow-[0_4px_20px_rgba(142,29,78,0.08)]"
                    : "bg-[#EEF7F2]/95 border-[#C5DFD1] shadow-[0_4px_20px_rgba(6,48,32,0.08)]"
                  : "bg-white/95 border-[#DCE7F8] shadow-[0_4px_20px_rgba(0,68,180,0.06)]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            {/* Logo: Same consistent GoTech logo across GoTech & Perfumes */}
            <Link
              to="/"
              className="flex items-center shrink-0 group transition-transform duration-500 ease-out hover:scale-[1.03]"
              aria-label="GoTech Inicio"
            >
              <BrandLogo
                variant="compact"
                tone={isAdminTheme ? "dark" : "light"}
              />
            </Link>

            {/* Desktop Links + Global Catalog Search Input */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-5 flex-1 justify-end">
              <div className="flex items-center gap-4 xl:gap-5">
                {navLinks.map((link) => {
                  const isAnchor = link.href.startsWith("/#");
                  const isActive = !isAnchor && location.pathname === link.href;
                  if (isAnchor) {
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`text-xs xl:text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-500 ease-in-out ${
                          isAdminTheme
                            ? "text-white/70 hover:text-neon-cyan"
                            : detailPalette
                              ? detailPalette.detailNavLink
                              : isPerfumeTheme
                                ? isPerfumeMujer
                                  ? "font-playfair text-[#7A3555] hover:text-[#5C0E32]"
                                  : "font-playfair text-[#285240] hover:text-[#063020]"
                                : "text-[#334663] hover:text-[#0057FF]"
                        }`}
                      >
                        {link.label}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`text-xs xl:text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-500 ease-in-out ${
                        isAdminTheme
                          ? isActive
                            ? "text-neon-cyan glow-text"
                            : "text-white/70 hover:text-neon-cyan"
                          : detailPalette
                            ? isActive
                              ? detailPalette.detailNavLinkActive
                              : detailPalette.detailNavLink
                            : isPerfumeTheme
                              ? isPerfumeMujer
                                ? isActive
                                  ? "font-playfair text-[#5C0E32] border-b-2 border-[#A62660] pb-0.5"
                                  : "font-playfair text-[#7A3555] hover:text-[#5C0E32]"
                                : isActive
                                  ? "font-playfair text-[#063020] border-b-2 border-[#0B4A31] pb-0.5"
                                  : "font-playfair text-[#285240] hover:text-[#063020]"
                              : isActive
                                ? "text-[#0057FF] border-b-2 border-[#0057FF] pb-0.5"
                                : "text-[#334663] hover:text-[#0057FF]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop Navbar Search Input */}
              <div ref={desktopSearchRef} className="relative w-52 xl:w-64 shrink-0">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                    className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-500 ${
                      isAdminTheme
                        ? "text-neon-cyan/70"
                        : detailPalette
                          ? detailPalette.detailNavIcon
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? "text-[#A62660]"
                              : "text-[#0B4A31]"
                            : "text-[#0057FF]"
                    }`}
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchFocused(true);
                    }}
                    placeholder="Buscar producto..."
                    aria-label="Buscar productos en todo el catálogo"
                    className={`w-full rounded-full pl-9 pr-8 py-2 text-xs font-medium border focus:outline-none transition-all duration-500 ${
                      isAdminTheme
                        ? "bg-dark-700 border-neon-cyan/30 text-white placeholder-white/40 focus:border-neon-cyan"
                        : detailPalette
                          ? detailPalette.detailNavInput
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? "bg-white border-[#F0C4D7] text-[#5C0E32] placeholder-[#B07A92] focus:border-[#A62660]"
                              : "bg-white border-[#C5DFD1] text-[#063020] placeholder-[#6B9382] focus:border-[#0B4A31]"
                            : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0B172A] placeholder-[#6B7E9E] focus:border-[#0057FF] focus:bg-white"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchFocused(false);
                      }}
                      aria-label="Limpiar búsqueda"
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${
                        isAdminTheme
                          ? "text-white/50 hover:text-white"
                          : detailPalette
                            ? detailPalette.detailNavClear
                            : isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#9F5977] hover:text-[#5C0E32]"
                                : "text-[#4D7866] hover:text-[#063020]"
                              : "text-[#6B7E9E] hover:text-[#0B172A]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {desktopSearchRef.current && (
                  <div className="absolute left-0 right-0 top-full z-50 w-80 -ml-16 xl:ml-0 xl:w-full">
                    {renderResultsDropdown()}
                  </div>
                )}
              </div>

              {/* Cart button */}
              <button
                onClick={openCart}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all duration-500 ease-in-out shrink-0 group ${
                  isAdminTheme
                    ? `bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/60 hover:shadow-neon-sm ${
                        cartBounce ? "scale-110 border-neon-cyan shadow-neon" : ""
                      }`
                    : detailPalette
                      ? `${detailPalette.detailNavCartBox} ${
                          cartBounce ? "scale-110 shadow-md" : ""
                        }`
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? `bg-white border border-[#F0C4D7] hover:border-[#A62660] ${
                              cartBounce ? "scale-110 border-[#A62660] shadow-md" : ""
                            }`
                          : `bg-white border border-[#C5DFD1] hover:border-[#0B4A31] ${
                              cartBounce ? "scale-110 border-[#0B4A31] shadow-md" : ""
                            }`
                        : `bg-[#F4F8FF] border border-[#CFE0FA] hover:border-[#0057FF] hover:shadow-sm ${
                            cartBounce ? "scale-110 border-[#0057FF] shadow-md" : ""
                          }`
                }`}
                aria-label="Carrito"
              >
                <ShoppingCart
                  className={`w-4 h-4 transition-all duration-500 ease-in-out ${
                    isAdminTheme
                      ? "text-neon-cyan"
                      : detailPalette
                        ? detailPalette.detailNavIcon
                        : isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#A62660]"
                            : "text-[#0B4A31]"
                          : "text-[#0057FF]"
                  } ${cartBounce ? "animate-bounce scale-125" : ""}`}
                />
                <span
                  className={`text-xs xl:text-sm font-semibold transition-colors duration-500 ease-in-out ${
                    isAdminTheme
                      ? "text-white/70 group-hover:text-white"
                      : detailPalette
                        ? `font-playfair ${detailPalette.price}`
                        : isPerfumeTheme
                          ? isPerfumeMujer
                            ? "font-playfair text-[#5C0E32]"
                            : "font-playfair text-[#063020]"
                          : "text-[#0B172A]"
                  }`}
                >
                  Carrito
                </span>
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500 ease-in-out ${
                      isAdminTheme
                        ? "bg-neon-cyan text-dark-900 animate-pulse-neon"
                        : detailPalette
                          ? detailPalette.detailNavCartBtn
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? "bg-[#A62660] text-[#FFF8FB]"
                              : "bg-[#0B4A31] text-[#F7FBF9]"
                            : "bg-[#0057FF] text-white shadow-sm"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  isAdminTheme
                    ? "btn-neon text-xs px-4 py-2 shrink-0 transition-all duration-500"
                    : detailPalette
                      ? `font-playfair ${detailPalette.detailNavCartBtn} font-bold tracking-wider text-xs px-4 py-2.5 rounded-full shrink-0 transition-all duration-500 ease-in-out shadow-sm`
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "font-playfair bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB] font-bold tracking-wider text-xs px-4 py-2.5 rounded-full shrink-0 transition-all duration-500 ease-in-out shadow-sm"
                          : "font-playfair bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9] font-bold tracking-wider text-xs px-4 py-2.5 rounded-full shrink-0 transition-all duration-500 ease-in-out shadow-sm"
                        : "btn-gotech text-xs px-4 py-2.5 uppercase tracking-wider shrink-0 transition-all duration-500 ease-in-out"
                }
              >
                WhatsApp
              </a>
            </div>

            {/* Tablet/Mobile: Search Toggle + Cart + Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchOpenMobile((v) => !v);
                  setSearchFocused(true);
                  setOpen(false);
                }}
                className={`p-2 rounded-xl transition-colors duration-500 ease-in-out ${
                  isAdminTheme
                    ? "text-neon-cyan hover:bg-dark-700"
                    : detailPalette
                      ? `${detailPalette.detailNavIcon} hover:bg-white/60`
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#A62660] hover:bg-white/60"
                          : "text-[#0B4A31] hover:bg-white/60"
                        : "text-[#0B172A] hover:bg-[#F4F8FF]"
                }`}
                aria-label="Buscar productos"
              >
                {searchOpenMobile ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={openCart}
                className={`relative p-2 transition-all duration-500 ease-in-out ${
                  isAdminTheme
                    ? "text-neon-cyan"
                    : detailPalette
                      ? detailPalette.detailNavIcon
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#A62660]"
                          : "text-[#0B4A31]"
                        : "text-[#0B172A]"
                } ${cartBounce ? "scale-125" : ""}`}
                aria-label="Carrito"
              >
                <ShoppingCart
                  className={`w-5 h-5 ${cartBounce ? "animate-bounce" : ""}`}
                />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-500 ease-in-out ${
                      isAdminTheme
                        ? "bg-neon-cyan text-dark-900"
                        : detailPalette
                          ? detailPalette.detailNavCartBtn
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? "bg-[#A62660] text-[#FFF8FB]"
                              : "bg-[#0B4A31] text-[#F7FBF9]"
                            : "bg-[#0057FF] text-white"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setOpen(!open);
                  setSearchOpenMobile(false);
                }}
                className={`p-2 transition-colors duration-500 ease-in-out ${
                  isAdminTheme
                    ? "text-neon-cyan"
                    : detailPalette
                      ? detailPalette.detailNavIcon
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#A62660]"
                          : "text-[#0B4A31]"
                        : "text-[#0B172A]"
                }`}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile / Tablet Expandable Global Catalog Search Bar */}
          {searchOpenMobile && (
            <div
              ref={mobileSearchRef}
              className={`lg:hidden border-t px-4 py-3 animate-fade-in ${
                isAdminTheme
                  ? "bg-dark-800 border-neon-cyan/20"
                  : detailPalette
                    ? detailPalette.detailNavMobilePanel
                    : isPerfumeTheme
                      ? isPerfumeMujer
                        ? "bg-[#FFF8FB] border-[#F0C4D7]"
                        : "bg-[#F7FBF9] border-[#C5DFD1]"
                      : "bg-white border-[#DCE7F8]"
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isAdminTheme
                      ? "text-neon-cyan"
                      : detailPalette
                        ? detailPalette.detailNavIcon
                        : isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#A62660]"
                            : "text-[#0B4A31]"
                          : "text-[#0057FF]"
                  }`}
                />
                <input
                  ref={mobileInputRef}
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Buscar productos o perfumes..."
                  aria-label="Buscar productos en todo el catálogo"
                  className={`w-full rounded-full pl-10 pr-9 py-2.5 text-sm font-medium border focus:outline-none ${
                    isAdminTheme
                      ? "bg-dark-700 border-neon-cyan/30 text-white placeholder-white/40 focus:border-neon-cyan"
                      : detailPalette
                        ? detailPalette.detailNavInput
                        : isPerfumeTheme
                          ? isPerfumeMujer
                            ? "bg-white border-[#F0C4D7] text-[#5C0E32] placeholder-[#B07A92] focus:border-[#A62660]"
                            : "bg-white border-[#C5DFD1] text-[#063020] placeholder-[#6B9382] focus:border-[#0B4A31]"
                          : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0B172A] placeholder-[#6B7E9E] focus:border-[#0057FF]"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpiar búsqueda"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${
                      isAdminTheme
                        ? "text-white/50 hover:text-white"
                        : detailPalette
                          ? detailPalette.detailNavClear
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? "text-[#9F5977] hover:text-[#5C0E32]"
                              : "text-[#4D7866] hover:text-[#063020]"
                            : "text-[#6B7E9E] hover:text-[#0B172A]"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              {renderResultsDropdown()}
            </div>
          )}

          {/* Mobile Menu */}
          {open && (
            <div
              className={`lg:hidden border-t animate-fade-in transition-colors duration-500 ease-in-out ${
                isAdminTheme
                  ? "bg-dark-800 border-neon-cyan/20"
                  : detailPalette
                    ? detailPalette.detailNavMobilePanel
                    : isPerfumeTheme
                      ? isPerfumeMujer
                        ? "bg-[#FFF8FB] border-[#F0C4D7]"
                        : "bg-[#F7FBF9] border-[#C5DFD1]"
                      : "bg-white border-[#DCE7F8] shadow-lg"
              }`}
            >
              {navLinks.map((link) => {
                const isAnchor = link.href.startsWith("/#");
                const isActive = !isAnchor && location.pathname === link.href;
                if (isAnchor) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block px-6 py-4 text-sm font-semibold uppercase tracking-wider border-b transition-colors ${
                        isAdminTheme
                          ? "border-neon-cyan/10 text-white/70 hover:text-neon-cyan"
                          : detailPalette
                            ? detailPalette.detailNavMobileLink
                            : isPerfumeTheme
                              ? isPerfumeMujer
                                ? "font-playfair border-[#F5D6E3] text-[#7A3555] hover:text-[#5C0E32]"
                                : "font-playfair border-[#D4E7DC] text-[#285240] hover:text-[#063020]"
                              : "border-[#EEF4FF] text-[#334663] hover:text-[#0057FF]"
                      }`}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={`block px-6 py-4 text-sm font-semibold uppercase tracking-wider border-b transition-colors ${
                      isAdminTheme
                        ? `border-neon-cyan/10 ${
                            isActive
                              ? "text-neon-cyan"
                              : "text-white/70 hover:text-neon-cyan"
                          }`
                        : detailPalette
                          ? `${detailPalette.detailNavMobileLink} ${
                              isActive ? "font-bold" : ""
                            }`
                          : isPerfumeTheme
                            ? isPerfumeMujer
                              ? `font-playfair border-[#F5D6E3] ${
                                  isActive
                                    ? "text-[#5C0E32] font-bold"
                                    : "text-[#7A3555] hover:text-[#5C0E32]"
                                }`
                              : `font-playfair border-[#D4E7DC] ${
                                  isActive
                                    ? "text-[#063020] font-bold"
                                    : "text-[#285240] hover:text-[#063020]"
                                }`
                            : `border-[#EEF4FF] ${
                                isActive
                                  ? "text-[#0057FF] font-bold bg-[#F4F8FF]"
                                  : "text-[#334663] hover:text-[#0057FF]"
                              }`
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-6 py-4 text-sm font-bold uppercase tracking-wider ${
                  isAdminTheme
                    ? "text-neon-cyan"
                    : detailPalette
                      ? `font-playfair ${detailPalette.detailNavIcon}`
                      : isPerfumeTheme
                        ? isPerfumeMujer
                          ? "font-playfair text-[#A62660]"
                          : "font-playfair text-[#0B4A31]"
                        : "text-[#0057FF]"
                }`}
              >
                💬 Contactar por WhatsApp
              </a>
            </div>
          )}
        </nav>
      </header>

      {/* Cart Drawer rendered here so it's above everything */}
      <CartDrawer />
    </>
  );
}
