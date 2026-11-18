import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { CatalogProvider } from "@/hooks/useCatalog";
import Navbar from "@/components/layout/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import AiAssistantWidget from "@/components/features/AiAssistantWidget";
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
  const isAdmin = location.pathname.startsWith("/admin");
  const isPerfumes = location.pathname === "/perfumes";

  const wrapperClass = isAdmin
    ? "min-h-screen bg-dark-900 text-white font-montserrat"
    : isPerfumes
      ? "min-h-screen bg-[#FAF0EC] text-[#3B0815] font-montserrat"
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
        <CartProvider>
          <AppShell />
        </CartProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
