import { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  MessageCircle,
  ShoppingCart,
  Truck,
  Navigation,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCart, Coordinates } from "@/hooks/useCart";
import { getShippingZones, getShippingLabel } from "@/constants/products";
import { generarEnlaceWhatsAppSeguro } from "@/lib/whatsapp";

function extractCoordinates(text: string): Coordinates | null {
  try {
    const match = text.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (!match) return null;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

export default function CartDrawer() {
  const {
    items,
    address,
    coordinates,
    setAddress,
    setLocation,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    isOpen,
    closeCart,
  } = useCart();

  const [selectedZone, setSelectedZone] = useState<string>("");
  const [zoneError, setZoneError] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [mapQuery, setMapQuery] = useState(
    coordinates
      ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
      : address.trim() || "San Salvador, El Salvador"
  );

  const zoneSectionRef = useRef<HTMLDivElement>(null);

  const shippingZones = getShippingZones(totalPrice, totalItems);
  const freeZones = shippingZones.filter((z) => z.cost === 0);
  const paidZones = shippingZones.filter((z) => z.cost > 0);
  const shippingLabel = getShippingLabel(totalPrice, totalItems);

  useEffect(() => {
    if (selectedZone && !shippingZones.some((z) => z.name === selectedZone)) {
      setSelectedZone("");
    }
  }, [selectedZone, shippingZones]);

  if (!isOpen) return null;

  const selectedZoneObj = shippingZones.find((z) => z.name === selectedZone);
  const shippingCost = selectedZoneObj?.cost ?? null;
  const totalWithShipping =
    shippingCost !== null ? totalPrice + shippingCost : totalPrice;

  const hasCustomLocation = Boolean(address.trim() || coordinates);
  const canBuyDirect = Boolean(selectedZone || hasCustomLocation);

  const toNextTier =
    totalPrice < 4.99
      ? Math.max(0.01, Number((4.99 - totalPrice).toFixed(2)))
      : totalPrice <= 6.99
        ? Math.max(0.01, Number((7.0 - totalPrice).toFixed(2)))
        : null;
  const nextTierLabel =
    totalPrice < 4.99
      ? "Envío gratis en todas las zonas (excepto Salvador del Mundo)"
      : totalPrice <= 6.99
        ? "¡Envío gratis en todas las zonas incluyendo Salvador del Mundo!"
        : null;

  function handleUseLocation() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError(
        "Tu navegador no soporta geolocalización. Escribe tu dirección y presiona Buscar mi dirección."
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const formatted = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setLocation(formatted, { lat: latitude, lng: longitude });
        setMapQuery(formatted);
        setZoneError(false);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGeoError(
          "No se pudo obtener tu ubicación. Escribe tu dirección y presiona Buscar mi dirección."
        );
      }
    );
  }

  function handleSearchAddress() {
    setGeoError("");
    const trimmed = address.trim();
    if (!trimmed) {
      setGeoError("Escribe una dirección para buscarla en el mapa.");
      return;
    }
    const parsed = extractCoordinates(trimmed);
    if (parsed) {
      setLocation(trimmed, parsed);
      setMapQuery(`${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`);
    } else {
      setLocation(trimmed, null);
      setMapQuery(`${trimmed}, San Salvador, El Salvador`);
    }
    setZoneError(false);
  }

  const buildWhatsAppLink = () =>
    generarEnlaceWhatsAppSeguro({
      items,
      address,
      coordinates,
      selectedZone:
        selectedZone ||
        (hasCustomLocation ? "Ubicación personalizada" : undefined),
      shippingCost: selectedZone ? shippingCost : null,
      subtotal: totalPrice,
      totalWithShipping,
    });

  const handleMissingSelection = () => {
    setZoneError(true);
    zoneSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&output=embed&z=15`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Single Cart Window */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-dark-800 border-l border-neon-cyan/20 shadow-neon animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neon-cyan/20 bg-dark-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-orbitron font-bold text-white text-base">
              Mi Carrito
            </h2>
            {totalItems > 0 && (
              <span className="bg-neon-cyan text-dark-900 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-white/40 hover:text-white transition-colors p-1"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-neon-cyan/40" />
            </div>
            <p className="text-white/50 text-sm">Tu carrito está vacío</p>
            <button onClick={closeCart} className="btn-neon text-sm px-6 py-2.5">
              Ver productos
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Body (Items + Zone + Custom Location Map) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Items list */}
              <div className="space-y-3">
                {items.map(({ product, quantity }) => {
                  const fixedPrice = Number(product.price);
                  return (
                    <div
                      key={product.id}
                      className="card-tech p-3 flex gap-3 items-start"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl shrink-0 bg-dark-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs leading-tight line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-neon-cyan font-black text-sm">
                            ${fixedPrice.toFixed(2)}
                          </span>
                        </div>
                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className="w-6 h-6 rounded-lg bg-dark-700 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan hover:border-neon-cyan/50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white font-bold text-sm w-5 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                            className="w-6 h-6 rounded-lg bg-dark-700 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan hover:border-neon-cyan/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-white/20 text-[10px] ml-1">
                            max {product.stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-white/60 text-xs font-bold">
                          ${(fixedPrice * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Zone Selector (Same Cart Window) */}
              <div
                ref={zoneSectionRef}
                className={`rounded-xl border bg-dark-700/50 overflow-hidden transition-colors ${
                  zoneError
                    ? "border-orange-400/70"
                    : "border-neon-cyan/20"
                }`}
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neon-cyan/10 bg-neon-cyan/5">
                  <Truck className="w-4 h-4 text-neon-cyan shrink-0" />
                  <p className="text-neon-cyan text-xs font-bold uppercase tracking-wider">
                    Elige tu zona de entrega
                  </p>
                </div>

                <div className="p-4 space-y-2.5">
                  <p className="text-white text-xs font-semibold leading-relaxed">
                    {shippingLabel}
                  </p>

                  {zoneError && (
                    <p className="text-orange-400 text-[11px] font-bold">
                      Selecciona una zona de entrega o ingresa tu ubicación personalizada.
                    </p>
                  )}

                  {/* Selectable Free Zones */}
                  {freeZones.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {freeZones.map((z) => {
                        const active = selectedZone === z.name;
                        return (
                          <button
                            key={z.name}
                            type="button"
                            onClick={() => {
                              setSelectedZone(active ? "" : z.name);
                              setZoneError(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all border ${
                              active
                                ? "border-neon-cyan bg-neon-cyan/15"
                                : "border-white/10 bg-dark-800/60 hover:border-neon-cyan/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  active
                                    ? "border-neon-cyan"
                                    : "border-white/25"
                                }`}
                              >
                                {active && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold truncate ${
                                  active ? "text-white" : "text-white/70"
                                }`}
                              >
                                {z.name}
                              </span>
                            </div>
                            <span className="text-green-400 text-[11px] font-bold shrink-0 ml-2">
                              GRATIS
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Selectable Paid Zones */}
                  {paidZones.length > 0 && (
                    <div className="space-y-1.5">
                      {paidZones.map((z) => {
                        const active = selectedZone === z.name;
                        return (
                          <button
                            key={z.name}
                            type="button"
                            onClick={() => {
                              setSelectedZone(active ? "" : z.name);
                              setZoneError(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all border ${
                              active
                                ? "border-neon-cyan bg-neon-cyan/15"
                                : "border-white/10 bg-dark-800/60 hover:border-neon-cyan/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  active
                                    ? "border-neon-cyan"
                                    : "border-white/25"
                                }`}
                              >
                                {active && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold leading-tight ${
                                  active ? "text-white" : "text-white/70"
                                }`}
                              >
                                {z.name}
                                {z.note && (
                                  <span className="block text-[10px] text-orange-300/85 font-normal">
                                    {z.note}
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className="text-orange-400 text-[11px] font-bold shrink-0 ml-2">
                              +${z.cost.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Upsell to next tier */}
                  {toNextTier !== null && (
                    <div className="mt-2 pt-3 border-t border-neon-cyan/10">
                      <span className="text-neon-cyan/70 text-[11px] font-semibold block mb-1">
                        Agrega ${toNextTier.toFixed(2)} más y desbloquea:
                      </span>
                      <p className="text-neon-cyan text-[11px] font-bold">
                        {nextTierLabel}
                      </p>
                      <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (totalPrice / (totalPrice < 4.99 ? 4.99 : 7)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {toNextTier === null && (
                    <div className="mt-2 pt-2 border-t border-green-400/20">
                      <p className="text-green-400 text-[11px] font-bold text-center">
                        ✓ Tienes todas las zonas con envío gratis (incluye
                        Salvador del Mundo)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Location Toggle + Inline Map (Same Cart Window) */}
              <div className="rounded-xl border border-neon-cyan/20 bg-dark-700/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCustomLocation((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-neon-cyan/5 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-neon-cyan shrink-0" />
                    <div className="min-w-0">
                      <p className="text-neon-cyan text-xs font-bold">
                        Seleccionar ubicación personalizada
                      </p>
                      {address.trim() && (
                        <p className="text-white/60 text-[11px] truncate">
                          {address}
                        </p>
                      )}
                    </div>
                  </div>
                  {showCustomLocation ? (
                    <ChevronUp className="w-4 h-4 text-neon-cyan/70 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neon-cyan/70 shrink-0" />
                  )}
                </button>

                {showCustomLocation && (
                  <div className="px-4 pb-4 pt-2 border-t border-neon-cyan/10 space-y-3">
                    <div>
                      <label className="text-neon-cyan/80 text-[10px] font-bold uppercase tracking-wider mb-1.5 block">
                        Tu dirección o punto de referencia
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setZoneError(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchAddress();
                          }
                        }}
                        placeholder="Ej: Col. Escalón, Calle El Pedregal #12"
                        className="w-full bg-dark-800 border border-neon-cyan/20 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 text-xs focus:outline-none focus:border-neon-cyan/50 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleSearchAddress}
                        className="flex items-center justify-center gap-1.5 bg-neon-cyan/15 border border-neon-cyan/40 hover:bg-neon-cyan/25 text-neon-cyan rounded-xl py-2.5 px-3 text-xs font-bold transition-all"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Buscar mi dirección
                      </button>

                      <button
                        type="button"
                        onClick={handleUseLocation}
                        disabled={locating}
                        className="flex items-center justify-center gap-1.5 bg-dark-800 border border-neon-cyan/25 hover:border-neon-cyan/60 text-white/80 hover:text-neon-cyan rounded-xl py-2.5 px-3 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <Navigation
                          className={`w-3.5 h-3.5 ${
                            locating ? "animate-spin" : ""
                          }`}
                        />
                        {locating ? "Ubicando..." : "Usar mi GPS"}
                      </button>
                    </div>

                    {geoError && (
                      <p className="text-orange-400 text-[11px] text-center">
                        {geoError}
                      </p>
                    )}

                    {coordinates && (
                      <p className="text-neon-cyan/80 text-[11px] font-mono text-center">
                        GPS: {coordinates.lat.toFixed(6)},{" "}
                        {coordinates.lng.toFixed(6)}
                      </p>
                    )}

                    <div className="rounded-xl overflow-hidden border border-neon-cyan/20 h-44 bg-dark-900">
                      <iframe
                        key={mapQuery}
                        title="Mapa de entrega"
                        src={mapSrc}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer (Single Comprar Button -> WhatsApp) */}
            <div className="shrink-0 border-t border-neon-cyan/20 px-5 py-4 space-y-3 bg-dark-700/40">
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between text-xs text-white/55">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/55">
                    Envío {selectedZone ? `(${selectedZone})` : ""}
                  </span>
                  <span
                    className={
                      shippingCost === 0
                        ? "text-green-400 font-bold"
                        : shippingCost !== null
                          ? "text-orange-400 font-bold"
                          : "text-white/40"
                    }
                  >
                    {shippingCost === 0
                      ? "GRATIS"
                      : shippingCost !== null
                        ? `+$${shippingCost.toFixed(2)}`
                        : hasCustomLocation
                          ? "Por confirmar"
                          : "Selecciona zona"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-white/80 text-sm font-semibold">
                    Total
                  </span>
                  <span className="font-orbitron font-black text-xl text-neon-cyan glow-text">
                    ${totalWithShipping.toFixed(2)}
                  </span>
                </div>
              </div>

              {canBuyDirect ? (
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeCart}
                  className="btn-neon w-full flex items-center justify-center gap-2 py-3.5 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Comprar
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleMissingSelection}
                  className="btn-neon w-full flex items-center justify-center gap-2 py-3.5 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Comprar
                </button>
              )}

              <button
                onClick={clearCart}
                className="w-full text-white/30 hover:text-red-400 text-xs font-semibold transition-colors py-1"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
