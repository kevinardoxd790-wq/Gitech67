import { useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { CatalogProvider } from "@/hooks/useCatalog";
import Navbar from "@/components/layout/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import AiAssistantWidget from "@/components/features/AiAssistantWidget";
import {
  PerfumeThemeProvider,
  usePerfumeTheme,
} from "@/hooks/usePerfumeZone";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import DeliveryInfo from "@/pages/DeliveryInfo";
import AdminPanel from "@/pages/AdminPanel";
import Offers from "@/pages/Offers";
import Perfumes from "@/pages/Perfumes";
import NotFound from "@/pages/NotFound";

function AppShell() {
  const location = useLocation();
  const { perfumeGender, activePerfumePalette } = usePerfumeTheme();
  const isAdmin = location.pathname.startsWith("/admin");
  const isPerfumes = location.pathname === "/perfumes";

  useLayoutEffect(() => {
    if (location.hash) {
      const targetId = location.hash.slice(1);
      window.setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 60);
      return;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.hash]);

  const wrapperClass = isAdmin
    ? "min-h-screen bg-dark-900 text-white font-montserrat"
    : activePerfumePalette
      ? `min-h-screen ${activePerfumePalette.detailShellBg} font-montserrat transition-colors duration-700`
      : isPerfumes
        ? perfumeGender === "mujer"
          ? "min-h-screen bg-[#FFF1F6] text-[#5C0E32] font-montserrat transition-colors duration-700"
          : "min-h-screen bg-[#EEF7F2] text-[#063020] font-montserrat transition-colors duration-700"
        : "min-h-screen bg-[#F4F8FF] text-[#0B172A] font-montserrat";

  return (
    <div className={wrapperClass}>
      <Navbar />
      <div className="h-7" aria-hidden="true" />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/perfumes" element={<Perfumes />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/envios" element={<DeliveryInfo />} />
          <Route path="/ofertas" element={<Offers />} />
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <AdminPanel />
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AiAssistantWidget />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <PerfumeThemeProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </PerfumeThemeProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
