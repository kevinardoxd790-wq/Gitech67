import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { CatalogProvider } from "@/hooks/useCatalog";
import Navbar from "@/components/layout/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import SocialProofToasts from "@/components/features/SocialProofToasts";
import AiAssistantWidget from "@/components/features/AiAssistantWidget";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import DeliveryInfo from "@/pages/DeliveryInfo";
import AdminPanel from "@/pages/AdminPanel";
import Offers from "@/pages/Offers";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <CartProvider>
          <div className="min-h-screen bg-dark-900 font-montserrat">
            <Navbar />
            <div className="h-7" aria-hidden="true" />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
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
            <SocialProofToasts />
            <AiAssistantWidget />
          </div>
        </CartProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
