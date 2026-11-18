import { MapPin, Truck, MessageCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { WHATSAPP_NUMBER } from "@/constants/products";

const freeDeliveryOver699 = [
  { name: "Salvador del Mundo", detail: "Gasolinera Texaco", icon: "⛽" },
  { name: "Galerías Escalón", detail: "Centro comercial", icon: "🏬" },
  { name: "Torre Futura", detail: "Punto de entrega", icon: "🏢" },
  { name: "75 Av. Norte", detail: "Gasolinera", icon: "⛽" },
  { name: "Redondel Masferrer", detail: "Punto de encuentro", icon: "🔵" },
  { name: "Redondel Luceiro", detail: "Punto de encuentro", icon: "🔵" },
];

const freeDeliveryFrom499 = [
  { name: "Galerías Escalón", detail: "Centro comercial", icon: "🏬" },
  { name: "Torre Futura", detail: "Punto de entrega", icon: "🏢" },
  { name: "75 Av. Norte", detail: "Gasolinera", icon: "⛽" },
  { name: "Redondel Masferrer", detail: "Punto de encuentro", icon: "🔵" },
  { name: "Redondel Luceiro", detail: "Punto de encuentro", icon: "🔵" },
];

const extraCostZones = [
  {
    name: "Salvador del Mundo (Gasolinera Texaco)",
    detail: "$1.50 solo si compras 1 producto (gratis en compras > $6.99)",
    badge: "$1.50 · 1 PROD.",
    icon: "⛽",
  },
  {
    name: "Colonia Escalón",
    detail: "Costo adicional fijo",
    badge: "+ $1.50",
    icon: "🏘️",
  },
];

export default function DeliveryInfo() {
  return (
    <div className="pt-16 min-h-screen section-grid">
      {/* Header */}
      <div className="bg-dark-800 border-b border-neon-cyan/20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mb-4">
            <Truck className="w-8 h-8 text-neon-cyan" />
          </div>
          <p className="text-neon-cyan text-sm font-bold uppercase tracking-widest mb-2">GoTech</p>
          <h1 className="font-orbitron font-black text-3xl md:text-4xl text-white mb-3">
            Envíos y Zonas
          </h1>
          <p className="text-white/50 text-base max-w-md mx-auto">
            Hacemos entregas en San Salvador. Revisa los beneficios según el monto de tu compra.
          </p>
          {/* Main meeting points highlight */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { name: "Desde $4.99: 5 zonas (sin Salvador del Mundo)", badge: "GRATIS", icon: "🚚" },
              { name: "Más de $6.99: Todas las zonas + Salvador del Mundo", badge: "GRATIS", icon: "⚡" },
              { name: "1 producto a Salvador del Mundo", badge: "$1.50", icon: "⛽" },
            ].map((z) => (
              <div key={z.name} className="flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl px-4 py-2">
                <span>{z.icon}</span>
                <span className="text-neon-cyan font-bold text-xs sm:text-sm">{z.name}</span>
                <span className="text-green-400 text-xs font-black">{z.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Compras mayores a $6.99 */}
        <div className="card-tech overflow-hidden">
          <div className="bg-neon-cyan/10 border-b border-neon-cyan/20 px-6 py-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-neon-cyan rounded-full" />
            <div>
              <h2 className="text-white font-bold text-lg">Compras mayores a $6.99</h2>
              <p className="text-green-400 text-sm font-semibold">
                🚚 Envío GRATIS en todas las zonas (incluye Salvador del Mundo)
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {freeDeliveryOver699.map((zone) => (
              <div key={zone.name} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-neon-cyan/10">
                <span className="text-2xl">{zone.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{zone.name}</p>
                  <p className="text-white/40 text-xs">{zone.detail}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">GRATIS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compras de $4.99 en adelante */}
        <div className="card-tech overflow-hidden">
          <div className="bg-blue-500/10 border-b border-neon-blue/20 px-6 py-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-neon-blue rounded-full" />
            <div>
              <h2 className="text-white font-bold text-lg">Compras de $4.99 en adelante (hasta $6.99)</h2>
              <p className="text-green-400 text-sm font-semibold">
                🚚 Envío GRATIS en todas las zonas excepto Salvador del Mundo
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {freeDeliveryFrom499.map((zone) => (
              <div key={zone.name} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-neon-cyan/10">
                <span className="text-2xl">{zone.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{zone.name}</p>
                  <p className="text-white/40 text-xs">{zone.detail}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">GRATIS</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-300/80 text-xs leading-relaxed">
                De $4.99 a $6.99 incluye gratis Galerías Escalón, Torre Futura, 75 Av. Norte, Redondel Masferrer y Redondel Luceiro (no incluye Salvador del Mundo gratis).
              </p>
            </div>
          </div>
        </div>

        {/* Costo adicional / 1 producto a Salvador del Mundo */}
        <div className="card-tech overflow-hidden">
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <div>
              <h2 className="text-white font-bold text-lg">Salvador del Mundo (1 producto) y Colonia Escalón</h2>
              <p className="text-orange-300 text-sm font-semibold">
                📍 Por $1.50 te lo llevamos al Salvador del Mundo solo si es 1 producto
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {extraCostZones.map((zone) => (
              <div key={zone.name} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-orange-500/10">
                <span className="text-2xl">{zone.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{zone.name}</p>
                  <p className="text-white/40 text-xs">{zone.detail}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <span className="text-orange-400 text-xs font-bold bg-orange-400/10 px-2 py-0.5 rounded-full">
                    {zone.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important notice */}
        <div className="card-tech p-6 border-neon-cyan/30">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-bold mb-2">Información importante</h3>
              <ul className="space-y-2 text-white/60 text-sm leading-relaxed">
                <li>• Solo realizamos entregas en las zonas indicadas arriba.</li>
                <li>• No hacemos envíos a otros departamentos fuera de San Salvador.</li>
                <li>• Para confirmar disponibilidad y coordinar entrega, contáctanos por WhatsApp.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-white/50 text-sm mb-6">¿Tienes dudas sobre tu zona? Escríbenos directamente.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar por WhatsApp
            </a>
            <Link to="/catalogo" className="btn-neon-outline flex items-center gap-2">
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
