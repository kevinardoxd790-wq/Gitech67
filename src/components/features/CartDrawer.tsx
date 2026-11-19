import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCatalog } from "@/hooks/useCatalog";
import {
  getShippingZones,
  getShippingLabel,
  isPerfumeProduct,
} from "@/constants/products";
import { generarEnlaceWhatsAppSeguro } from "@/lib/whatsapp";
import {
  AiShippingQuote,
  calcularCoberturaEnvioSeguro,
  extractCoordinatesFromInput,
  formatEnvioUsd,
  geocodificarDireccionCliente,
  solicitarCotizacionEnvioIA,
} from "@/lib/deliveryCoverage";

export default function CartDrawer() {
  const location = useLocation();
  const { products } = useCatalog();
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
    lastAddedTheme,
  } = useCart();

  const detailId = location.pathname.startsWith("/producto/")
    ? location.pathname.slice("/producto/".length)
    : "";
  const activeDetailProduct = detailId
    ? products.find((p) => p.id === detailId)
    : undefined;

  const isPerfumeTheme =
    location.pathname === "/perfumes"
      ? true
      : activeDetailProduct
        ? isPerfumeProduct(activeDetailProduct)
        : location.pathname === "/"
          ? lastAddedTheme === "perfumes"
          : false;

  const [selectedZone, setSelectedZone] = useState<string>("");
  const [zoneError, setZoneError] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(
    Boolean(address.trim() || coordinates)
  );
  const [locating, setLocating] = useState(false);
  const [searchingGeo, setSearchingGeo] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [addressNotFound, setAddressNotFound] = useState(false);
  const [aiQuote, setAiQuote] = useState<AiShippingQuote | null>(null);
  const [mapQuery, setMapQuery] = useState(
    coordinates
      ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
      : address.trim() || "San Salvador, El Salvador"
  );

  const zoneSectionRef = useRef<HTMLDivElement>(null);
  const lastAutoGeocodedRef = useRef<string>("");

  const shippingZones = getShippingZones(totalPrice, totalItems);
  const freeZones = shippingZones.filter((z) => z.cost === 0);
  const paidZones = shippingZones.filter((z) => z.cost > 0);
  const shippingLabel = getShippingLabel(totalPrice, totalItems);

  const coverageEstimate = useMemo(() => {
    try {
      return calcularCoberturaEnvioSeguro(coordinates);
    } catch {
      return null;
    }
  }, [coordinates]);

  useEffect(() => {
    try {
      if (coordinates) {
        setMapQuery(
          `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
        );
        setAddressNotFound(false);
      }
    } catch {
      // Ignora error de sincronización de mapa
    }
  }, [coordinates]);

  useEffect(() => {
    if (isOpen && (address.trim() || coordinates) && !selectedZone) {
      setShowCustomLocation(true);
    }
  }, [isOpen, address, coordinates, selectedZone]);

  // Auto-geocodifica direcciones escritas para mostrar cobertura y costo sin requerir doble clic
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = address.trim();
    if (trimmed.length < 3) {
      setAddressNotFound(false);
      return;
    }
    if (trimmed === lastAutoGeocodedRef.current && coordinates) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const direct = extractCoordinatesFromInput(trimmed);
        if (direct) {
          if (cancelled) return;
          lastAutoGeocodedRef.current = trimmed;
          setLocation(trimmed, direct);
          setMapQuery(`${direct.lat.toFixed(6)}, ${direct.lng.toFixed(6)}`);
          setSelectedZone("");
          setAddressNotFound(false);
          return;
        }

        const resolved = await geocodificarDireccionCliente(trimmed);
        if (cancelled) return;
        lastAutoGeocodedRef.current = trimmed;
        if (resolved) {
          setLocation(trimmed, resolved);
          setMapQuery(`${resolved.lat.toFixed(6)}, ${resolved.lng.toFixed(6)}`);
          setSelectedZone("");
          setAddressNotFound(false);
        } else {
          setAddressNotFound(true);
        }
      } catch {
        // No interrumpe la escritura si falla la geocodificación automática
      }
    }, 550);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, address, coordinates, setLocation]);

  const coverageDistanceKey = coverageEstimate?.distanceKm ?? null;
  const coverageWithinKey = coverageEstimate?.withinCoverage ?? null;

  useEffect(() => {
    if (
      !isOpen ||
      coverageDistanceKey === null ||
      !coverageEstimate ||
      items.length === 0
    ) {
      if (!coverageEstimate) {
        setAiQuote(null);
      }
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await solicitarCotizacionEnvioIA({
          coverage: coverageEstimate,
          subtotal: totalPrice,
          itemCount: totalItems,
          customerAddress: address,
        });
        if (cancelled) return;
        if (result.quote) {
          setAiQuote(result.quote);
        } else {
          setAiQuote(null);
        }
      } catch {
        if (!cancelled) {
          setAiQuote(null);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    coverageDistanceKey,
    coverageWithinKey,
    items.length,
    totalPrice,
    totalItems,
  ]);

  useEffect(() => {
    if (selectedZone && !shippingZones.some((z) => z.name === selectedZone)) {
      setSelectedZone("");
    }
  }, [selectedZone, shippingZones]);

  if (!isOpen) return null;

  const selectedZoneObj = shippingZones.find((z) => z.name === selectedZone);
  const shippingCost = selectedZoneObj?.cost ?? null;
  const effectiveCustomShippingUsd = aiQuote
    ? aiQuote.shippingPriceUsd
    : coverageEstimate
      ? coverageEstimate.estimatedShippingUsd
      : null;
  const approxCustomShipping =
    shippingCost === null ? effectiveCustomShippingUsd : null;
  const totalWithShipping =
    shippingCost !== null
      ? totalPrice + shippingCost
      : approxCustomShipping !== null
        ? totalPrice + approxCustomShipping
        : totalPrice;

  const hasCustomLocation = Boolean(address.trim() || coordinates);
  const canBuyDirect = Boolean(selectedZone || hasCustomLocation);

  function handleUseLocation() {
    try {
      setGeoError("");
      setAddressNotFound(false);
      if (!navigator.geolocation) {
        setGeoError(
          "Tu navegador no soporta geolocalización. Escribe tu dirección y presiona Buscar mi dirección."
        );
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const formatted = `${latitude.toFixed(6)}, ${longitude.toFixed(
              6
            )}`;
            const currentAddr = address.trim();
            const isCurrentRawCoords =
              /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(currentAddr);
            const preservedAddress =
              currentAddr && !isCurrentRawCoords ? currentAddr : "";
            lastAutoGeocodedRef.current = preservedAddress;
            setLocation(preservedAddress, { lat: latitude, lng: longitude });
            setMapQuery(formatted);
            setSelectedZone("");
            setZoneError(false);
          } catch {
            setGeoError(
              "No se pudo procesar tu ubicación. Intenta buscar tu dirección."
            );
          } finally {
            setLocating(false);
          }
        },
        () => {
          setLocating(false);
          setGeoError(
            "No se pudo obtener tu ubicación GPS. Escribe tu colonia o dirección arriba y presiona Buscar mi dirección."
          );
        }
      );
    } catch {
      setLocating(false);
      setGeoError(
        "No se pudo iniciar la geolocalización. Escribe tu dirección y presiona Buscar mi dirección."
      );
    }
  }

  async function handleSearchAddress() {
    try {
      setGeoError("");
      setAddressNotFound(false);
      const trimmed = address.trim();
      if (!trimmed) {
        setGeoError("Escribe una dirección para buscarla en el mapa.");
        return;
      }
      const parsed = extractCoordinatesFromInput(trimmed);
      if (parsed) {
        lastAutoGeocodedRef.current = trimmed;
        setLocation(trimmed, parsed);
        setMapQuery(`${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`);
        setSelectedZone("");
        setZoneError(false);
        return;
      }

      setSearchingGeo(true);
      const resolved = await geocodificarDireccionCliente(trimmed);
      lastAutoGeocodedRef.current = trimmed;
      if (resolved) {
        setLocation(trimmed, resolved);
        setMapQuery(`${resolved.lat.toFixed(6)}, ${resolved.lng.toFixed(6)}`);
        setSelectedZone("");
        setAddressNotFound(false);
      } else {
        setLocation(trimmed, null);
        setMapQuery(`${trimmed}, San Salvador, El Salvador`);
        setAddressNotFound(true);
      }
      setZoneError(false);
    } catch {
      setGeoError(
        "No se pudo ubicar la dirección exacta. Prueba usando tu GPS o pegando un enlace de Google Maps."
      );
    } finally {
      setSearchingGeo(false);
    }
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
      coverageEstimate,
      aiQuote,
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
        className={`fixed inset-0 z-40 backdrop-blur-sm ${
          isPerfumeTheme ? "bg-[#2A050E]/45" : "bg-[#0B172A]/45"
        }`}
        onClick={closeCart}
      />

      {/* Single Cart Window */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col animate-slide-up overflow-hidden border-l font-montserrat ${
          isPerfumeTheme
            ? "bg-[#FDF7F5] border-[#DFC5BC] text-[#3B0815] shadow-[-12px_0_40px_rgba(77,8,25,0.18)]"
            : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0B172A] shadow-[-12px_0_40px_rgba(0,68,180,0.16)]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
            isPerfumeTheme
              ? "bg-[#FAF0EC] border-[#E2C8BF]"
              : "bg-white border-[#DCE7F8]"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart
              className={`w-5 h-5 ${
                isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
              }`}
            />
            <h2
              className={`font-bold ${
                isPerfumeTheme
                  ? "font-playfair text-[#4D0819] text-lg"
                  : "font-montserrat text-[#0B172A] text-base font-extrabold"
              }`}
            >
              Mi Carrito
            </h2>
            {totalItems > 0 && (
              <span
                className={`font-black text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                  isPerfumeTheme
                    ? "bg-[#5B0A1E] text-[#FFF8F6]"
                    : "bg-[#0057FF] text-white"
                }`}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className={`transition-colors p-1 ${
              isPerfumeTheme
                ? "text-[#8B5D68] hover:text-[#4D0819]"
                : "text-[#6B7E9E] hover:text-[#0B172A]"
            }`}
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div
              className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${
                isPerfumeTheme
                  ? "bg-[#FAF0EC] border-[#E2C8BF]"
                  : "bg-white border-[#DCE7F8] shadow-sm"
              }`}
            >
              <ShoppingCart
                className={`w-8 h-8 ${
                  isPerfumeTheme ? "text-[#8B1A35]/50" : "text-[#0057FF]/45"
                }`}
              />
            </div>
            <p
              className={`text-sm ${
                isPerfumeTheme ? "text-[#6B4A52]" : "text-[#4D607D]"
              }`}
            >
              Tu carrito está vacío
            </p>
            <button
              onClick={closeCart}
              className={
                isPerfumeTheme
                  ? "bg-[#5B0A1E] hover:bg-[#7A102B] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
                  : "btn-gotech text-sm px-6 py-2.5"
              }
            >
              {isPerfumeTheme ? "Ver perfumes" : "Ver productos"}
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
                      className={`p-3 flex gap-3 items-start rounded-xl border ${
                        isPerfumeTheme
                          ? "bg-white border-[#E6D1CA]"
                          : "bg-white border-[#DCE7F8] shadow-[0_6px_18px_rgba(0,68,180,0.06)]"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-16 h-16 object-cover rounded-xl shrink-0 ${
                          isPerfumeTheme ? "bg-[#FAF2EF]" : "bg-[#F4F8FF]"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-xs leading-tight line-clamp-2 mb-1 ${
                            isPerfumeTheme
                              ? "font-playfair text-sm text-[#3B0815]"
                              : "text-[#0B172A] font-bold"
                          }`}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className={`font-black text-sm ${
                              isPerfumeTheme
                                ? "font-playfair text-[#5B0A1E]"
                                : "text-[#0057FF]"
                            }`}
                          >
                            ${fixedPrice.toFixed(2)}
                          </span>
                        </div>
                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                              isPerfumeTheme
                                ? "bg-[#FAF0EC] border-[#DFC5BC] text-[#5B0A1E] hover:border-[#5B0A1E]"
                                : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0057FF] hover:border-[#0057FF]"
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`font-bold text-sm w-5 text-center ${
                              isPerfumeTheme ? "text-[#3B0815]" : "text-[#0B172A]"
                            }`}
                          >
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              isPerfumeTheme
                                ? "bg-[#FAF0EC] border-[#DFC5BC] text-[#5B0A1E] hover:border-[#5B0A1E]"
                                : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0057FF] hover:border-[#0057FF]"
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className={`transition-colors ${
                            isPerfumeTheme
                              ? "text-[#B08D95] hover:text-red-600"
                              : "text-[#8EA0BA] hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span
                          className={`text-xs font-bold ${
                            isPerfumeTheme
                              ? "text-[#5E3A43]"
                              : "text-[#4D607D]"
                          }`}
                        >
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
                className={`rounded-xl border overflow-hidden transition-colors ${
                  isPerfumeTheme
                    ? `bg-white ${
                        zoneError ? "border-amber-600" : "border-[#E5CEC6]"
                      }`
                    : `bg-white shadow-[0_6px_18px_rgba(0,68,180,0.06)] ${
                        zoneError
                          ? "border-amber-500"
                          : "border-[#DCE7F8]"
                      }`
                }`}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-3 border-b ${
                    isPerfumeTheme
                      ? "border-[#E5CEC6] bg-[#FAF0EC]"
                      : "border-[#DCE7F8] bg-[#F4F8FF]"
                  }`}
                >
                  <Truck
                    className={`w-4 h-4 shrink-0 ${
                      isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
                    }`}
                  />
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
                    }`}
                  >
                    Elige tu zona de entrega
                  </p>
                </div>

                <div className="p-4 space-y-2.5">
                  <p
                    className={`text-xs font-semibold leading-relaxed ${
                      isPerfumeTheme ? "text-[#3B0815]" : "text-[#0B172A]"
                    }`}
                  >
                    {shippingLabel}
                  </p>

                  {zoneError && (
                    <p
                      className={`text-[11px] font-bold ${
                        isPerfumeTheme ? "text-amber-700" : "text-amber-700"
                      }`}
                    >
                      Selecciona una zona de entrega o ingresa tu ubicación
                      personalizada.
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
                              isPerfumeTheme
                                ? active
                                  ? "border-[#5B0A1E] bg-[#F7E8E3]"
                                  : "border-[#EAD9D3] bg-[#FDF9F8] hover:border-[#A6596C]"
                                : active
                                  ? "border-[#0057FF] bg-[#EAF2FF]"
                                  : "border-[#E2ECFA] bg-[#F8FAFF] hover:border-[#0057FF]/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isPerfumeTheme
                                    ? active
                                      ? "border-[#5B0A1E]"
                                      : "border-[#C9A89D]"
                                    : active
                                      ? "border-[#0057FF]"
                                      : "border-[#B6C8E6]"
                                }`}
                              >
                                {active && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPerfumeTheme
                                        ? "bg-[#5B0A1E]"
                                        : "bg-[#0057FF]"
                                    }`}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold truncate ${
                                  isPerfumeTheme
                                    ? active
                                      ? "text-[#3B0815]"
                                      : "text-[#6B4A52]"
                                    : active
                                      ? "text-[#0B172A] font-bold"
                                      : "text-[#4D607D]"
                                }`}
                              >
                                {z.name}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold shrink-0 ml-2 ${
                                isPerfumeTheme
                                  ? "text-emerald-700"
                                  : "text-emerald-700"
                              }`}
                            >
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
                              isPerfumeTheme
                                ? active
                                  ? "border-[#5B0A1E] bg-[#F7E8E3]"
                                  : "border-[#EAD9D3] bg-[#FDF9F8] hover:border-[#A6596C]"
                                : active
                                  ? "border-[#0057FF] bg-[#EAF2FF]"
                                  : "border-[#E2ECFA] bg-[#F8FAFF] hover:border-[#0057FF]/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isPerfumeTheme
                                    ? active
                                      ? "border-[#5B0A1E]"
                                      : "border-[#C9A89D]"
                                    : active
                                      ? "border-[#0057FF]"
                                      : "border-[#B6C8E6]"
                                }`}
                              >
                                {active && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPerfumeTheme
                                        ? "bg-[#5B0A1E]"
                                        : "bg-[#0057FF]"
                                    }`}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold leading-tight ${
                                  isPerfumeTheme
                                    ? active
                                      ? "text-[#3B0815]"
                                      : "text-[#6B4A52]"
                                    : active
                                      ? "text-[#0B172A] font-bold"
                                      : "text-[#4D607D]"
                                }`}
                              >
                                {z.name}
                                {z.note && (
                                  <span className="block text-[10px] opacity-80 font-normal">
                                    {z.note}
                                  </span>
                                )}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold shrink-0 ml-2 ${
                                isPerfumeTheme
                                  ? "text-amber-700"
                                  : "text-amber-700"
                              }`}
                            >
                              +${z.cost.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={`mt-2 pt-2 border-t ${
                      isPerfumeTheme
                        ? "border-emerald-700/20"
                        : "border-emerald-600/20"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-bold text-center ${
                        isPerfumeTheme ? "text-emerald-800" : "text-emerald-700"
                      }`}
                    >
                      ✓ Envío gratis para todos los productos (incluye Salvador
                      del Mundo)
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Location Toggle + Inline Map (Same Cart Window) */}
              <div
                className={`rounded-xl border overflow-hidden ${
                  isPerfumeTheme
                    ? "border-[#E5CEC6] bg-white"
                    : "border-[#DCE7F8] bg-white shadow-[0_6px_18px_rgba(0,68,180,0.06)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowCustomLocation((v) => !v)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors ${
                    isPerfumeTheme
                      ? "hover:bg-[#FAF0EC]"
                      : "hover:bg-[#F4F8FF]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin
                      className={`w-4 h-4 shrink-0 ${
                        isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-bold ${
                            isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
                          }`}
                        >
                          Seleccionar ubicación personalizada
                        </p>
                        {coverageEstimate && effectiveCustomShippingUsd !== null && (
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              coverageEstimate.withinCoverage
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            {coverageEstimate.distanceKm.toFixed(1)} km · ~
                            {formatEnvioUsd(effectiveCustomShippingUsd)}
                          </span>
                        )}
                      </div>
                      {(address.trim() || coordinates) && (
                        <p
                          className={`text-[11px] truncate ${
                            isPerfumeTheme
                              ? "text-[#6B4A52]"
                              : "text-[#4D607D]"
                          }`}
                        >
                          {address.trim() || "Ubicación GPS seleccionada"}
                          {coverageEstimate && effectiveCustomShippingUsd !== null
                            ? ` · Envío aprox.: ~${formatEnvioUsd(
                                effectiveCustomShippingUsd
                              )}`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  {showCustomLocation ? (
                    <ChevronUp
                      className={`w-4 h-4 shrink-0 ${
                        isPerfumeTheme ? "text-[#7A102B]" : "text-[#0057FF]"
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 ${
                        isPerfumeTheme ? "text-[#7A102B]" : "text-[#0057FF]"
                      }`}
                    />
                  )}
                </button>

                {showCustomLocation && (
                  <div
                    className={`px-4 pb-4 pt-2 border-t space-y-3 ${
                      isPerfumeTheme
                        ? "border-[#F0E2DD]"
                        : "border-[#E7EFFC]"
                    }`}
                  >
                    <div>
                      <label
                        className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 block ${
                          isPerfumeTheme
                            ? "text-[#7A102B]"
                            : "text-[#0057FF]"
                        }`}
                      >
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
                            void handleSearchAddress();
                          }
                        }}
                        placeholder="Ej: Col. Escalón, Calle El Pedregal #12 o enlace Maps"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${
                          isPerfumeTheme
                            ? "bg-[#FDF9F8] border-[#DFC5BC] text-[#3B0815] placeholder-[#A88B92] focus:border-[#5B0A1E]"
                            : "bg-[#F8FAFF] border-[#CFE0FA] text-[#0B172A] placeholder-[#7A8CA8] focus:border-[#0057FF]"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSearchAddress()}
                        disabled={searchingGeo}
                        className={`flex items-center justify-center gap-1.5 border rounded-xl py-2.5 px-3 text-xs font-bold transition-all disabled:opacity-50 ${
                          isPerfumeTheme
                            ? "bg-[#FAF0EC] border-[#C9A89D] hover:bg-[#F3DFD8] text-[#5B0A1E]"
                            : "bg-[#EAF2FF] border-[#BFD7FF] hover:bg-[#DCEAFF] text-[#0057FF]"
                        }`}
                      >
                        <Search
                          className={`w-3.5 h-3.5 ${
                            searchingGeo ? "animate-pulse" : ""
                          }`}
                        />
                        {searchingGeo ? "Calculando..." : "Buscar mi dirección"}
                      </button>

                      <button
                        type="button"
                        onClick={handleUseLocation}
                        disabled={locating}
                        className={`flex items-center justify-center gap-1.5 border rounded-xl py-2.5 px-3 text-xs font-semibold transition-all disabled:opacity-50 ${
                          isPerfumeTheme
                            ? "bg-white border-[#DFC5BC] hover:border-[#5B0A1E] text-[#4D0819]"
                            : "bg-white border-[#CFE0FA] hover:border-[#0057FF] text-[#0B172A] hover:text-[#0057FF]"
                        }`}
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
                      <p className="text-[11px] text-center text-amber-700 font-medium">
                        {geoError}
                      </p>
                    )}

                    {addressNotFound && !coverageEstimate && address.trim().length >= 3 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 leading-snug">
                        No ubicamos esa dirección exacta para calcular km.
                        Agrega tu colonia o punto conocido (ej:{" "}
                        <strong>Col. Escalón, Metrocentro, Santa Tecla</strong>)
                        o presiona <strong>Usar mi GPS</strong>.
                      </div>
                    )}

                    {/* Resultado limpio de cobertura de 5 km y costo aproximado de envío (sin punto de origen ni desglose interno) */}
                    {coverageEstimate && (
                      <div
                        className={`rounded-xl border p-3 space-y-1.5 ${
                          coverageEstimate.withinCoverage
                            ? isPerfumeTheme
                              ? "bg-emerald-50/80 border-emerald-700/25 text-emerald-950"
                              : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                            : isPerfumeTheme
                              ? "bg-amber-50/90 border-amber-700/25 text-amber-950"
                              : "bg-amber-50 border-amber-200 text-amber-950"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {coverageEstimate.withinCoverage ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-xs font-bold leading-snug">
                              {coverageEstimate.statusLabel}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] pt-0.5">
                              <span className="font-medium opacity-90">
                                Distancia:{" "}
                                <strong>
                                  {coverageEstimate.distanceKm.toFixed(2)} km
                                </strong>
                              </span>
                              <span className="font-bold">
                                Envío aprox.: ~
                                {formatEnvioUsd(
                                  effectiveCustomShippingUsd ??
                                    coverageEstimate.estimatedShippingUsd
                                )}{" "}
                                USD
                              </span>
                            </div>
                            {!coverageEstimate.withinCoverage && (
                              <p className="text-[10.5px] leading-snug text-amber-800 pt-1">
                                Tu ubicación supera el límite directo de{" "}
                                {coverageEstimate.maxCoverageKm.toFixed(0)} km.
                                El monto mostrado es referencial y el envío debe
                                coordinarse por WhatsApp.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(coordinates || address.trim()) && (
                      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                        <a
                          href={
                            coordinates
                              ? `https://maps.google.com/?q=${coordinates.lat.toFixed(
                                  6
                                )},${coordinates.lng.toFixed(6)}`
                              : `https://maps.google.com/?q=${encodeURIComponent(
                                  address.trim()
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold hover:underline ${
                            isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
                          }`}
                        >
                          Google Maps ↗
                        </a>
                        <span
                          className={
                            isPerfumeTheme ? "text-[#C9A89D]" : "text-[#C0D1EC]"
                          }
                        >
                          ·
                        </span>
                        <a
                          href={
                            coordinates
                              ? `https://waze.com/ul?ll=${coordinates.lat.toFixed(
                                  6
                                )},${coordinates.lng.toFixed(6)}&navigate=yes`
                              : `https://waze.com/ul?q=${encodeURIComponent(
                                  address.trim()
                                )}&navigate=yes`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold hover:underline ${
                            isPerfumeTheme ? "text-[#5B0A1E]" : "text-[#0057FF]"
                          }`}
                        >
                          Waze ↗
                        </a>
                      </div>
                    )}

                    <div
                      className={`rounded-xl overflow-hidden border h-44 ${
                        isPerfumeTheme
                          ? "border-[#E5CEC6] bg-[#FAF0EC]"
                          : "border-[#DCE7F8] bg-[#F4F8FF]"
                      }`}
                    >
                      <iframe
                        key={mapQuery}
                        title="Tu ubicación de entrega"
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
            <div
              className={`shrink-0 border-t px-5 py-4 space-y-3 ${
                isPerfumeTheme
                  ? "border-[#E2C8BF] bg-[#FAF0EC]"
                  : "border-[#DCE7F8] bg-white"
              }`}
            >
              <div className="space-y-1 px-1">
                <div
                  className={`flex items-center justify-between text-xs ${
                    isPerfumeTheme ? "text-[#6B4A52]" : "text-[#546885]"
                  }`}
                >
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span
                    className={
                      isPerfumeTheme ? "text-[#6B4A52]" : "text-[#546885]"
                    }
                  >
                    Envío{" "}
                    {selectedZone
                      ? `(${selectedZone})`
                      : coverageEstimate
                        ? `aprox. (${coverageEstimate.distanceKm.toFixed(2)} km)`
                        : ""}
                  </span>
                  <span
                    className={
                      shippingCost === 0
                        ? "text-emerald-700 font-bold"
                        : shippingCost !== null
                          ? "text-amber-700 font-bold"
                          : coverageEstimate
                            ? coverageEstimate.withinCoverage
                              ? "text-emerald-700 font-bold"
                              : "text-amber-700 font-bold"
                            : isPerfumeTheme
                              ? "text-[#9A7A82]"
                              : "text-[#7A8CA8]"
                    }
                  >
                    {shippingCost === 0
                      ? "GRATIS"
                      : shippingCost !== null
                        ? `+${
                            Number.isInteger(shippingCost)
                              ? `$${shippingCost}`
                              : `$${shippingCost.toFixed(2)}`
                          }`
                        : coverageEstimate && effectiveCustomShippingUsd !== null
                          ? coverageEstimate.withinCoverage
                            ? `~${formatEnvioUsd(effectiveCustomShippingUsd)}`
                            : `~${formatEnvioUsd(
                                effectiveCustomShippingUsd
                              )} (coordinar)`
                          : hasCustomLocation
                            ? "Por confirmar"
                            : "Selecciona zona"}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between pt-1 border-t ${
                    isPerfumeTheme ? "border-[#DFC5BC]" : "border-[#E7EFFC]"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isPerfumeTheme ? "text-[#4D0819]" : "text-[#0B172A]"
                    }`}
                  >
                    {approxCustomShipping !== null
                      ? "Total aproximado"
                      : "Total"}
                  </span>
                  <span
                    className={
                      isPerfumeTheme
                        ? "font-playfair font-bold text-2xl text-[#4D0819]"
                        : "font-montserrat font-black text-2xl text-[#0057FF]"
                    }
                  >
                    {approxCustomShipping !== null ? "~" : ""}$
                    {totalWithShipping.toFixed(2)}
                  </span>
                </div>
              </div>

              {canBuyDirect ? (
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeCart}
                  className={
                    isPerfumeTheme
                      ? "w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#5B0A1E] hover:bg-[#7A102B] text-[#FFF8F6] shadow-[0_8px_22px_rgba(91,10,30,0.22)] transition-colors"
                      : "btn-gotech w-full flex items-center justify-center gap-2 py-3.5 text-sm"
                  }
                >
                  <MessageCircle className="w-4 h-4" />
                  Comprar
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleMissingSelection}
                  className={
                    isPerfumeTheme
                      ? "w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#5B0A1E] hover:bg-[#7A102B] text-[#FFF8F6] shadow-[0_8px_22px_rgba(91,10,30,0.22)] transition-colors"
                      : "btn-gotech w-full flex items-center justify-center gap-2 py-3.5 text-sm"
                  }
                >
                  <MessageCircle className="w-4 h-4" />
                  Comprar
                </button>
              )}

              <button
                onClick={clearCart}
                className={`w-full text-xs font-semibold transition-colors py-1 ${
                  isPerfumeTheme
                    ? "text-[#8E6971] hover:text-red-700"
                    : "text-[#7A8CA8] hover:text-red-600"
                }`}
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
