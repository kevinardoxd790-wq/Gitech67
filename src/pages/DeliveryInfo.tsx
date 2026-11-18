import { MapPin, Truck, MessageCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import GotechBackdrop from "@/components/GotechBackdrop";
import { WHATSAPP_NUMBER } from "@/constants/products";

const freeDeliveryZones = [
  { name: "Salvador del Mundo", detail: "Gasolinera Texaco", icon: "⛽" },
  { name: "Galerías Escalón", detail: "Centro comercial", icon: "🏬" },
  { name: "Torre Futura", detail: "Punto de entrega", icon: "🏢" },
  { name: "75 Av. Norte", detail: "Gasolinera", icon: "⛽" },
  { name: "Redondel Masferrer", detail: "Punto de encuentro", icon: "🔵" },
  { name: "Redondel Luceiro", detail: "Punto de encuentro", icon: "🔵" },
];

const extraCostZones = [
  {
    name: "Colonia Escalón",
    detail: "Costo adicional fijo",
    badge: "+ $1.50",
    icon: "🏘️",
  },
];

export default function DeliveryInfo() {
  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-[#F4F8FF] text-[#0B172A]">
      <GotechBackdrop />

      {/* Header */}
      <div className="relative z-10 bg-white/85 backdrop-blur-sm border-b border-[#DCE7F8]">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF2FF] border border-[#BFD7FF] mb-4">
            <Truck className="w-8 h-8 text-[#0057FF]" />
          </div>
          <p className="text-[#0057FF] text-xs font-extrabold uppercase tracking-widest mb-2">
            GoTech SV
          </p>
          <h1 className="font-montserrat font-black italic text-3xl md:text-4xl text-[#0B172A] mb-3">
            Envíos y <span className="text-[#0057FF]">Zonas</span>
          </h1>
          <p className="text-[#4D607D] text-base max-w-md mx-auto">
            Hacemos entregas en San Salvador para todos nuestros productos, sin límite ni mínimo de compra.
          </p>
          {/* Main meeting points highlight */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { name: "Salvador del Mundo (Texaco)", badge: "GRATIS", icon: "⛽" },
              { name: "Todas las zonas principales", badge: "GRATIS", icon: "🚚" },
              { name: "Sin mínimo de compra", badge: "TODOS LOS PRODUCTOS", icon: "⚡" },
            ].map((z) => (
              <div
                key={z.name}
                className="flex items-center gap-2 bg-white border border-[#CFE0FA] rounded-xl px-4 py-2 shadow-sm"
              >
                <span>{z.icon}</span>
                <span className="text-[#0B172A] font-bold text-xs sm:text-sm">
                  {z.name}
                </span>
                <span className="text-emerald-700 text-xs font-black">
                  {z.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Todas las zonas gratis sin límite de precio */}
        <div className="card-gotech overflow-hidden">
          <div className="bg-[#EAF2FF] border-b border-[#DCE7F8] px-6 py-4 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#0057FF] rounded-full" />
            <div>
              <h2 className="text-[#0B172A] font-extrabold text-lg">
                Envío gratis para todos los productos
              </h2>
              <p className="text-emerald-700 text-sm font-semibold">
                🚚 Envío GRATIS sin límite de precio (incluye Salvador del Mundo)
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {freeDeliveryZones.map((zone) => (
              <div
                key={zone.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFF] border border-[#E2ECFA]"
              >
                <span className="text-2xl">{zone.icon}</span>
                <div>
                  <p className="text-[#0B172A] font-bold text-sm">{zone.name}</p>
                  <p className="text-[#546885] text-xs">{zone.detail}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    GRATIS
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2 bg-[#F4F8FF] border border-[#D4E3FA] rounded-xl p-3">
              <Info className="w-4 h-4 text-[#0057FF] shrink-0 mt-0.5" />
              <p className="text-[#334663] text-xs leading-relaxed">
                Aplica para cualquier producto del catálogo sin monto mínimo ni límite de precio en Salvador del Mundo (Gasolinera Texaco), Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer y Redondel Luceiro.
              </p>
            </div>
          </div>
        </div>

        {/* Costo adicional */}
        <div className="card-gotech overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <div>
              <h2 className="text-[#0B172A] font-extrabold text-lg">
                Zona con costo adicional
              </h2>
              <p className="text-amber-700 text-sm font-semibold">
                📍 Entrega directa en Colonia Escalón
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {extraCostZones.map((zone) => (
              <div
                key={zone.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#FFFDF9] border border-amber-200"
              >
                <span className="text-2xl">{zone.icon}</span>
                <div>
                  <p className="text-[#0B172A] font-bold text-sm">{zone.name}</p>
                  <p className="text-[#546885] text-xs">{zone.detail}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <span className="text-amber-800 text-xs font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {zone.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important notice */}
        <div className="card-gotech p-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#0057FF] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[#0B172A] font-extrabold mb-2">
                Información importante
              </h3>
              <ul className="space-y-2 text-[#4D607D] text-sm leading-relaxed">
                <li>• Solo realizamos entregas en las zonas indicadas arriba.</li>
                <li>• No hacemos envíos a otros departamentos fuera de San Salvador.</li>
                <li>• Para confirmar disponibilidad y coordinar entrega, contáctanos por WhatsApp.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-[#4D607D] text-sm mb-6">
            ¿Tienes dudas sobre tu zona? Escríbenos directamente.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gotech flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar por WhatsApp
            </a>
            <Link
              to="/catalogo"
              className="btn-gotech-outline flex items-center gap-2"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
