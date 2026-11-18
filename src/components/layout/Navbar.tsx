import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { usePerfumeZone } from "@/hooks/usePerfumeZone";
import CartDrawer from "@/components/features/CartDrawer";
import FlashOfferBar from "@/components/features/FlashOfferBar";
import BrandLogo from "@/components/BrandLogo";
import { WHATSAPP_NUMBER } from "@/constants/products";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/perfumes", label: "Perfumes" },
  { href: "/#agenda", label: "Agendar Envío" },
  { href: "/envios", label: "Envíos Gratis" },
  { href: "/ofertas", label: "🔥 Ofertas" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isPerfumeTheme = usePerfumeZone();
  const isAdminTheme = location.pathname.startsWith("/admin");
  const { totalItems, openCart, cartBounce } = useCart();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <FlashOfferBar
          isPerfumeTheme={isPerfumeTheme}
          isAdminTheme={isAdminTheme}
        />
        <nav
          className={`backdrop-blur-md border-b transition-colors duration-300 ${
            isAdminTheme
              ? "bg-dark-900/95 border-neon-cyan/20"
              : isPerfumeTheme
                ? "bg-[#FAF0EC]/95 border-[#E2C8BF]"
                : "bg-white/95 border-[#DCE7F8] shadow-[0_4px_20px_rgba(0,68,180,0.06)]"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className={`flex items-center group transition-transform duration-300 hover:scale-[1.03] ${
                isPerfumeTheme
                  ? "bg-[#060D1D] rounded-xl px-2 py-0.5 border border-[#DFC5BC]"
                  : ""
              }`}
              aria-label="GoTech Inicio"
            >
              <BrandLogo
                variant="compact"
                tone={isAdminTheme || isPerfumeTheme ? "dark" : "light"}
              />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isAnchor = link.href.startsWith("/#");
                const isActive = !isAnchor && location.pathname === link.href;
                if (isAnchor) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                        isAdminTheme
                          ? "text-white/70 hover:text-neon-cyan"
                          : isPerfumeTheme
                            ? "text-[#6D3846] hover:text-[#4D0819]"
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
                    className={`text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isAdminTheme
                        ? isActive
                          ? "text-neon-cyan glow-text"
                          : "text-white/70 hover:text-neon-cyan"
                        : isPerfumeTheme
                          ? isActive
                            ? "text-[#4D0819] border-b-2 border-[#5B0A1E] pb-0.5"
                            : "text-[#6D3846] hover:text-[#4D0819]"
                          : isActive
                            ? "text-[#0057FF] border-b-2 border-[#0057FF] pb-0.5"
                            : "text-[#334663] hover:text-[#0057FF]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Cart button */}
              <button
                onClick={openCart}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 group ${
                  isAdminTheme
                    ? `bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/60 hover:shadow-neon-sm ${
                        cartBounce ? "scale-110 border-neon-cyan shadow-neon" : ""
                      }`
                    : isPerfumeTheme
                      ? `bg-white border border-[#DFC5BC] hover:border-[#5B0A1E] ${
                          cartBounce ? "scale-110 border-[#5B0A1E] shadow-md" : ""
                        }`
                      : `bg-[#F4F8FF] border border-[#CFE0FA] hover:border-[#0057FF] hover:shadow-sm ${
                          cartBounce ? "scale-110 border-[#0057FF] shadow-md" : ""
                        }`
                }`}
                aria-label="Carrito"
              >
                <ShoppingCart
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isAdminTheme
                      ? "text-neon-cyan"
                      : isPerfumeTheme
                        ? "text-[#5B0A1E]"
                        : "text-[#0057FF]"
                  } ${cartBounce ? "animate-bounce scale-125" : ""}`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isAdminTheme
                      ? "text-white/70 group-hover:text-white"
                      : isPerfumeTheme
                        ? "text-[#4D0819]"
                        : "text-[#0B172A]"
                  }`}
                >
                  Carrito
                </span>
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center ${
                      isAdminTheme
                        ? "bg-neon-cyan text-dark-900 animate-pulse-neon"
                        : isPerfumeTheme
                          ? "bg-[#5B0A1E] text-[#FFF8F6]"
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
                    ? "btn-neon text-xs px-4 py-2"
                    : isPerfumeTheme
                      ? "bg-[#5B0A1E] hover:bg-[#7A102B] text-[#FFF8F6] font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl transition-colors"
                      : "btn-gotech text-xs px-5 py-2.5 uppercase tracking-wider"
                }
              >
                WhatsApp
              </a>
            </div>

            {/* Mobile: Cart + Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={openCart}
                className={`relative p-2 transition-transform duration-300 ${
                  isAdminTheme
                    ? "text-neon-cyan"
                    : isPerfumeTheme
                      ? "text-[#5B0A1E]"
                      : "text-[#0B172A]"
                } ${cartBounce ? "scale-125" : ""}`}
                aria-label="Carrito"
              >
                <ShoppingCart
                  className={`w-5 h-5 ${cartBounce ? "animate-bounce" : ""}`}
                />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                      isAdminTheme
                        ? "bg-neon-cyan text-dark-900"
                        : isPerfumeTheme
                          ? "bg-[#5B0A1E] text-[#FFF8F6]"
                          : "bg-[#0057FF] text-white"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setOpen(!open)}
                className={`p-2 ${
                  isAdminTheme
                    ? "text-neon-cyan"
                    : isPerfumeTheme
                      ? "text-[#5B0A1E]"
                      : "text-[#0B172A]"
                }`}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {open && (
            <div
              className={`md:hidden border-t animate-fade-in ${
                isAdminTheme
                  ? "bg-dark-800 border-neon-cyan/20"
                  : isPerfumeTheme
                    ? "bg-[#FDF7F5] border-[#E2C8BF]"
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
                          : isPerfumeTheme
                            ? "border-[#E5CFC8] text-[#6D3846] hover:text-[#4D0819]"
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
                        : isPerfumeTheme
                          ? `border-[#E5CFC8] ${
                              isActive
                                ? "text-[#4D0819] font-bold"
                                : "text-[#6D3846] hover:text-[#4D0819]"
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
                    : isPerfumeTheme
                      ? "text-[#5B0A1E]"
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
