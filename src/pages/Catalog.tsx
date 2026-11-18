import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/features/ProductCard";
import AiHelpBanner from "@/components/features/AiHelpBanner";
import GotechBackdrop from "@/components/GotechBackdrop";
import { WHATSAPP_NUMBER, isPerfumeProduct } from "@/constants/products";

const BASE_CATEGORIES = [
  "Todos",
  "Bluetooth",
  "Memorias",
  "Controles",
  "Accesorios Moto",
  "Accesorios Auto",
];

export default function Catalog() {
  const { products: ALL_PRODUCTS } = useCatalog();
  const PRODUCTS = ALL_PRODUCTS.filter((p) => !isPerfumeProduct(p));
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = Array.from(
    new Set([
      ...BASE_CATEGORIES,
      ...PRODUCTS.map((p) => p.category).filter(Boolean),
    ])
  );

  const filtered = PRODUCTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "Todos" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-[#F4F8FF] text-[#0B172A]">
      <GotechBackdrop />

      {/* Header */}
      <div className="relative z-10 bg-white/85 backdrop-blur-sm border-b border-[#DCE7F8]">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2.5 h-6 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
              <span className="w-2.5 h-6 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
            </div>
            <h1 className="font-montserrat font-black italic text-3xl md:text-4xl text-[#0B172A]">
              Catálogo de <span className="text-[#0057FF]">Productos</span>
            </h1>
          </div>
          <p className="text-[#4D607D] text-sm sm:text-base">
            {PRODUCTS.length} productos disponibles · Entrega hoy en San Salvador
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* AI Help Banner */}
        <AiHelpBanner className="mb-8" />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0057FF]" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#CFE0FA] rounded-xl pl-10 pr-4 py-3 text-[#0B172A] placeholder-[#7A8CA8] text-sm focus:outline-none focus:border-[#0057FF] shadow-[0_4px_14px_rgba(0,68,180,0.05)] transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center flex-wrap gap-2">
            <Filter className="w-4 h-4 text-[#0057FF] shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#0057FF] text-white shadow-[0_6px_16px_rgba(0,87,255,0.28)]"
                    : "bg-white border border-[#CFE0FA] text-[#334663] hover:border-[#0057FF] hover:text-[#0057FF]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/90 border border-[#DCE7F8] rounded-2xl shadow-sm">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-[#4D607D] text-lg font-medium">
              No encontramos productos para "{search}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* WhatsApp promo */}
        <div className="mt-16 card-gotech p-8 text-center">
          <p className="text-3xl mb-3">💬</p>
          <h3 className="font-montserrat font-extrabold text-xl text-[#0B172A] mb-2">
            ¿No encuentras lo que buscas?
          </h3>
          <p className="text-[#4D607D] text-sm mb-6">
            Escríbenos por WhatsApp y te ayudamos a encontrar el accesorio perfecto.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gotech inline-flex items-center gap-2"
          >
            💬 Preguntar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
