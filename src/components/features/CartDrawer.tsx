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
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";
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
  geocodificarDireccionClienteConEstado,
  solicitarCotizacionEnvioIA,
} from "@/lib/deliveryCoverage";
import InteractiveLocationMap from "@/components/features/InteractiveLocationMap";

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

  const { isPerfumeZone, perfumeGender } = usePerfumeTheme();

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
          ? isPerfumeZone || lastAddedTheme === "perfumes"
          : false;

  const isPerfumeMujer = isPerfumeTheme && perfumeGender === "mujer";

  const [selectedZone, setSelectedZone] = useState<string>("");
  const [zoneError, setZoneError] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(
    Boolean(address.trim() || coordinates)
  );
  const [locating, setLocating] = useState(false);
  const [searchingGeo, setSearchingGeo] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [isReferentialGeo, setIsReferentialGeo] = useState(false);
  const [aiQuote, setAiQuote] = useState<AiShippingQuote | null>(null);

  const zoneSectionRef = useRef<HTMLDivElement>(null);
  const lastAutoGeocodedRef = useRef<string>("");

  const shippingZones = getShippingZones(totalPrice, totalItems);
  const freeZones = shippingZones.filter((z) => z.cost === 0);
  const paidZones = shippingZones.filter((z) => z.cost > 0);
  const shippingLabel = getShippingLabel(totalPrice, totalItems);

  const coverageEstimate = useMemo(() => {
    try {
      return calcularCoberturaEnvioSeguro(coordinates, address);
    } catch {
      return null;
    }
  }, [coordinates, address]);

  useEffect(() => {
    if (coordinates) {
      setIsReferentialGeo(false);
    }
  }, [coordinates]);

  useEffect(() => {
    if (isOpen && (address.trim() || coordinates) && !selectedZone) {
      setShowCustomLocation(true);
    }
  }, [isOpen, address, coordinates, selectedZone]);

  // Auto-geocodifica cualquier dirección escrita para calcular siempre cobertura de 5 km y costo de envío
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = address.trim();
    if (trimmed.length < 3) {
      setIsReferentialGeo(false);
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
          setSelectedZone("");
          setIsReferentialGeo(false);
          return;
        }

        const resolved = await geocodificarDireccionClienteConEstado(trimmed);
        if (cancelled) return;
        lastAutoGeocodedRef.current = trimmed;
        if (resolved) {
          setLocation(trimmed, resolved.coords);
          setSelectedZone("");
          setIsReferentialGeo(resolved.isReferentialFallback);
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
  const coverageIsFreeKey = Boolean(coverageEstimate?.isFreeZone);

  useEffect(() => {
    if (
      !isOpen ||
      coverageDistanceKey === null ||
      !coverageWithinKey ||
      coverageIsFreeKey ||
      !coverageEstimate ||
      items.length === 0
    ) {
      if (!coverageEstimate || !coverageWithinKey || coverageIsFreeKey) {
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
    coverageIsFreeKey,
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
  const effectiveCustomShippingUsd = coverageEstimate
    ? coverageEstimate.isFreeZone
      ? 0
      : coverageEstimate.withinCoverage
        ? aiQuote
          ? aiQuote.shippingPriceUsd
          : coverageEstimate.estimatedShippingUsd
        : null
    : null;
  const approxCustomShipping =
    shippingCost === null ? effectiveCustomShippingUsd : null;
  const isEstimatedCustomShipping =
    approxCustomShipping !== null && !coverageEstimate?.isFreeZone;
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
      setIsReferentialGeo(false);
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
            const currentAddr = address.trim();
            const isCurrentRawCoords =
              /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(currentAddr);
            const preservedAddress =
              currentAddr && !isCurrentRawCoords ? currentAddr : "";
            lastAutoGeocodedRef.current = preservedAddress;
            setLocation(preservedAddress, { lat: latitude, lng: longitude });
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
      setIsReferentialGeo(false);
      const trimmed = address.trim();
      if (!trimmed) {
        setGeoError("Escribe una dirección para buscarla en el mapa.");
        return;
      }
      const parsed = extractCoordinatesFromInput(trimmed);
      if (parsed) {
        lastAutoGeocodedRef.current = trimmed;
        setLocation(trimmed, parsed);
        setSelectedZone("");
        setZoneError(false);
        return;
      }

      setSearchingGeo(true);
      const resolved = await geocodificarDireccionClienteConEstado(trimmed);
      lastAutoGeocodedRef.current = trimmed;
      if (resolved) {
        setLocation(trimmed, resolved.coords);
        setSelectedZone("");
        setIsReferentialGeo(resolved.isReferentialFallback);
      }
      setZoneError(false);
    } catch {
      setGeoError(
        "No se pudo completar la búsqueda. Intenta nuevamente o usa tu GPS."
      );
    } finally {
      setSearchingGeo(false);
    }
  }

  const handleMapSelectCoordinates = (newCoords: { lat: number; lng: number }) => {
    const coordStr = `${newCoords.lat.toFixed(6)}, ${newCoords.lng.toFixed(6)}`;
    lastAutoGeocodedRef.current = coordStr;
    setLocation(coordStr, newCoords);
    setSelectedZone("");
    setZoneError(false);
    setGeoError("");
    setIsReferentialGeo(false);
  };

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur-sm ${
          isPerfumeTheme
            ? isPerfumeMujer
              ? "bg-[#3D0720]/45"
              : "bg-[#042417]/45"
            : "bg-[#0B172A]/45"
        }`}
        onClick={closeCart}
      />

      {/* Single Cart Window */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col animate-slide-up overflow-hidden border-l font-montserrat ${
          isPerfumeTheme
            ? isPerfumeMujer
              ? "bg-[#FFF8FB] border-[#F0C4D7] text-[#5C0E32] shadow-[-12px_0_40px_rgba(142,29,78,0.18)]"
              : "bg-[#F7FBF9] border-[#C5DFD1] text-[#063020] shadow-[-12px_0_40px_rgba(6,48,32,0.18)]"
            : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0B172A] shadow-[-12px_0_40px_rgba(0,68,180,0.16)]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
            isPerfumeTheme
              ? isPerfumeMujer
                ? "bg-[#FFF1F6] border-[#F0C4D7]"
                : "bg-[#EEF7F2] border-[#C5DFD1]"
              : "bg-white border-[#DCE7F8]"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart
              className={`w-5 h-5 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "text-[#A62660]"
                    : "text-[#0B4A31]"
                  : "text-[#0057FF]"
              }`}
            />
            <h2
              className={`font-bold ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "font-playfair text-[#5C0E32] text-lg"
                    : "font-playfair text-[#063020] text-lg"
                  : "font-montserrat text-[#0B172A] text-base font-extrabold"
              }`}
            >
              Mi Carrito
            </h2>
            {totalItems > 0 && (
              <span
                className={`font-black text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "bg-[#A62660] text-[#FFF8FB]"
                      : "bg-[#0B4A31] text-[#F7FBF9]"
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
                ? isPerfumeMujer
                  ? "text-[#9F5977] hover:text-[#5C0E32]"
                  : "text-[#4D7866] hover:text-[#063020]"
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
                  ? isPerfumeMujer
                    ? "bg-[#FFF1F6] border-[#F0C4D7]"
                    : "bg-[#EEF7F2] border-[#C5DFD1]"
                  : "bg-white border-[#DCE7F8] shadow-sm"
              }`}
            >
              <ShoppingCart
                className={`w-8 h-8 ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "text-[#A62660]/50"
                      : "text-[#0B4A31]/50"
                    : "text-[#0057FF]/45"
                }`}
              />
            </div>
            <p
              className={`text-sm ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "text-[#7E3B59]"
                    : "text-[#355E4D]"
                  : "text-[#4D607D]"
              }`}
            >
              Tu carrito está vacío
            </p>
            <button
              onClick={closeCart}
              className={
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "font-playfair bg-[#A62660] hover:bg-[#C23273] text-white text-sm font-bold tracking-wider px-6 py-3 rounded-xl transition-colors"
                    : "font-playfair bg-[#0B4A31] hover:bg-[#116443] text-white text-sm font-bold tracking-wider px-6 py-3 rounded-xl transition-colors"
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
                          ? isPerfumeMujer
                            ? "bg-white border-[#F2C9DA]"
                            : "bg-white border-[#C8E0D4]"
                          : "bg-white border-[#DCE7F8] shadow-[0_6px_18px_rgba(0,68,180,0.06)]"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-16 h-16 object-cover rounded-xl shrink-0 ${
                          isPerfumeTheme
                            ? isPerfumeMujer
                              ? "bg-[#FFF3F7]"
                              : "bg-[#EEF7F2]"
                            : "bg-[#F4F8FF]"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-xs leading-tight line-clamp-2 mb-1 ${
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "font-playfair text-sm text-[#5C0E32]"
                                : "font-playfair text-sm text-[#063020]"
                              : "text-[#0B172A] font-bold"
                          }`}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className={`font-black text-sm ${
                              isPerfumeTheme
                                ? isPerfumeMujer
                                  ? "font-playfair text-[#A62660]"
                                  : "font-playfair text-[#0B4A31]"
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
                                ? isPerfumeMujer
                                  ? "bg-[#FFF1F6] border-[#F0C4D7] text-[#A62660] hover:border-[#A62660]"
                                  : "bg-[#EEF7F2] border-[#C5DFD1] text-[#0B4A31] hover:border-[#0B4A31]"
                                : "bg-[#F4F8FF] border-[#CFE0FA] text-[#0057FF] hover:border-[#0057FF]"
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`font-bold text-sm w-5 text-center ${
                              isPerfumeTheme
                                ? isPerfumeMujer
                                  ? "text-[#5C0E32]"
                                  : "text-[#063020]"
                                : "text-[#0B172A]"
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
                                ? isPerfumeMujer
                                  ? "bg-[#FFF1F6] border-[#F0C4D7] text-[#A62660] hover:border-[#A62660]"
                                  : "bg-[#EEF7F2] border-[#C5DFD1] text-[#0B4A31] hover:border-[#0B4A31]"
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
                              ? isPerfumeMujer
                                ? "text-[#C089A1] hover:text-red-600"
                                : "text-[#7A9C8C] hover:text-red-600"
                              : "text-[#8EA0BA] hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span
                          className={`text-xs font-bold ${
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#7E3B59]"
                                : "text-[#355E4D]"
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
                        zoneError
                          ? "border-amber-600"
                          : isPerfumeMujer
                            ? "border-[#F0C4D7]"
                            : "border-[#C5DFD1]"
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
                      ? isPerfumeMujer
                        ? "border-[#F0C4D7] bg-[#FFF1F6]"
                        : "border-[#C5DFD1] bg-[#EEF7F2]"
                      : "border-[#DCE7F8] bg-[#F4F8FF]"
                  }`}
                >
                  <Truck
                    className={`w-4 h-4 shrink-0 ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#A62660]"
                          : "text-[#0B4A31]"
                        : "text-[#0057FF]"
                    }`}
                  />
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#A62660]"
                          : "text-[#0B4A31]"
                        : "text-[#0057FF]"
                    }`}
                  >
                    Elige tu zona de entrega
                  </p>
                </div>

                <div className="p-4 space-y-2.5">
                  <p
                    className={`text-xs font-semibold leading-relaxed ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#5C0E32]"
                          : "text-[#063020]"
                        : "text-[#0B172A]"
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
                                ? isPerfumeMujer
                                  ? active
                                    ? "border-[#A62660] bg-[#FCE6EF]"
                                    : "border-[#F2D5E1] bg-[#FFF8FB] hover:border-[#D17099]"
                                  : active
                                    ? "border-[#0B4A31] bg-[#E2F0E9]"
                                    : "border-[#D4E7DC] bg-[#F7FBF9] hover:border-[#4D8A70]"
                                : active
                                  ? "border-[#0057FF] bg-[#EAF2FF]"
                                  : "border-[#E2ECFA] bg-[#F8FAFF] hover:border-[#0057FF]/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isPerfumeTheme
                                    ? isPerfumeMujer
                                      ? active
                                        ? "border-[#A62660]"
                                        : "border-[#D9A7BC]"
                                      : active
                                        ? "border-[#0B4A31]"
                                        : "border-[#9EC4B2]"
                                    : active
                                      ? "border-[#0057FF]"
                                      : "border-[#B6C8E6]"
                                }`}
                              >
                                {active && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPerfumeTheme
                                        ? isPerfumeMujer
                                          ? "bg-[#A62660]"
                                          : "bg-[#0B4A31]"
                                        : "bg-[#0057FF]"
                                    }`}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold truncate ${
                                  isPerfumeTheme
                                    ? isPerfumeMujer
                                      ? active
                                        ? "text-[#5C0E32]"
                                        : "text-[#7E3B59]"
                                      : active
                                        ? "text-[#063020]"
                                        : "text-[#355E4D]"
                                    : active
                                      ? "text-[#0B172A] font-bold"
                                      : "text-[#4D607D]"
                                }`}
                              >
                                {z.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold shrink-0 ml-2 text-emerald-700">
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
                                ? isPerfumeMujer
                                  ? active
                                    ? "border-[#A62660] bg-[#FCE6EF]"
                                    : "border-[#F2D5E1] bg-[#FFF8FB] hover:border-[#D17099]"
                                  : active
                                    ? "border-[#0B4A31] bg-[#E2F0E9]"
                                    : "border-[#D4E7DC] bg-[#F7FBF9] hover:border-[#4D8A70]"
                                : active
                                  ? "border-[#0057FF] bg-[#EAF2FF]"
                                  : "border-[#E2ECFA] bg-[#F8FAFF] hover:border-[#0057FF]/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isPerfumeTheme
                                    ? isPerfumeMujer
                                      ? active
                                        ? "border-[#A62660]"
                                        : "border-[#D9A7BC]"
                                      : active
                                        ? "border-[#0B4A31]"
                                        : "border-[#9EC4B2]"
                                    : active
                                      ? "border-[#0057FF]"
                                      : "border-[#B6C8E6]"
                                }`}
                              >
                                {active && (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPerfumeTheme
                                        ? isPerfumeMujer
                                          ? "bg-[#A62660]"
                                          : "bg-[#0B4A31]"
                                        : "bg-[#0057FF]"
                                    }`}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-semibold leading-tight ${
                                  isPerfumeTheme
                                    ? isPerfumeMujer
                                      ? active
                                        ? "text-[#5C0E32]"
                                        : "text-[#7E3B59]"
                                      : active
                                        ? "text-[#063020]"
                                        : "text-[#355E4D]"
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
                            <span className="text-[11px] font-bold shrink-0 ml-2 text-amber-700">
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
                    ? isPerfumeMujer
                      ? "border-[#F0C4D7] bg-white"
                      : "border-[#C5DFD1] bg-white"
                    : "border-[#DCE7F8] bg-white shadow-[0_6px_18px_rgba(0,68,180,0.06)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowCustomLocation((v) => !v)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors ${
                    isPerfumeTheme
                      ? isPerfumeMujer
                        ? "hover:bg-[#FFF1F6]"
                        : "hover:bg-[#EEF7F2]"
                      : "hover:bg-[#F4F8FF]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin
                      className={`w-4 h-4 shrink-0 ${
                        isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#A62660]"
                            : "text-[#0B4A31]"
                          : "text-[#0057FF]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-bold ${
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#A62660]"
                                : "text-[#0B4A31]"
                              : "text-[#0057FF]"
                          }`}
                        >
                          Seleccionar ubicación personalizada
                        </p>
                        {coverageEstimate && (
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              coverageEstimate.withinCoverage
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            {coverageEstimate.isFreeZone
                              ? "GRATIS"
                              : coverageEstimate.withinCoverage &&
                                  effectiveCustomShippingUsd !== null
                                ? `${coverageEstimate.distanceKm.toFixed(1)} km · ~${formatEnvioUsd(
                                    effectiveCustomShippingUsd
                                  )}`
                                : `${coverageEstimate.distanceKm.toFixed(1)} km · Sin cobertura`}
                          </span>
                        )}
                      </div>
                      {(address.trim() || coordinates) && (
                        <p
                          className={`text-[11px] truncate ${
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#7E3B59]"
                                : "text-[#355E4D]"
                              : "text-[#4D607D]"
                          }`}
                        >
                          {/^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(
                            address.trim()
                          )
                            ? "Ubicación marcada en el mapa"
                            : address.trim() || "Ubicación GPS seleccionada"}
                          {coverageEstimate
                            ? coverageEstimate.isFreeZone
                              ? " · Envío GRATIS"
                              : coverageEstimate.withinCoverage &&
                                  effectiveCustomShippingUsd !== null
                                ? ` · Estimación: ~${formatEnvioUsd(
                                    effectiveCustomShippingUsd
                                  )} (acordar en WhatsApp)`
                                : " · No se puede hacer el envío (consulta en WhatsApp)"
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  {showCustomLocation ? (
                    <ChevronUp
                      className={`w-4 h-4 shrink-0 ${
                        isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#A62660]"
                            : "text-[#0B4A31]"
                          : "text-[#0057FF]"
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 ${
                        isPerfumeTheme
                          ? isPerfumeMujer
                            ? "text-[#A62660]"
                            : "text-[#0B4A31]"
                          : "text-[#0057FF]"
                      }`}
                    />
                  )}
                </button>

                {showCustomLocation && (
                  <div
                    className={`px-4 pb-4 pt-2 border-t space-y-3 ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "border-[#FAE0EA]"
                          : "border-[#DCEEE4]"
                        : "border-[#E7EFFC]"
                    }`}
                  >
                    <div>
                      <label
                        className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 block ${
                          isPerfumeTheme
                            ? isPerfumeMujer
                              ? "text-[#A62660]"
                              : "text-[#0B4A31]"
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
                            ? isPerfumeMujer
                              ? "bg-[#FFF8FB] border-[#F0C4D7] text-[#5C0E32] placeholder-[#B07A92] focus:border-[#A62660]"
                              : "bg-[#F7FBF9] border-[#C5DFD1] text-[#063020] placeholder-[#6B9382] focus:border-[#0B4A31]"
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
                            ? isPerfumeMujer
                              ? "bg-[#FFF1F6] border-[#F0C4D7] hover:bg-[#FCE4EE] text-[#A62660]"
                              : "bg-[#EEF7F2] border-[#C5DFD1] hover:bg-[#E0F0E8] text-[#0B4A31]"
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
                            ? isPerfumeMujer
                              ? "bg-white border-[#F0C4D7] hover:border-[#A62660] text-[#5C0E32]"
                              : "bg-white border-[#C5DFD1] hover:border-[#0B4A31] text-[#063020]"
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

                    {isReferentialGeo && coverageEstimate && address.trim().length >= 3 && (
                      <p className="text-[10.5px] opacity-80 leading-snug px-1">
                        Cálculo referencial en San Salvador; agrega tu colonia o
                        presiona <strong>Usar mi GPS</strong> si deseas mayor exactitud.
                      </p>
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
                              {coverageEstimate.isFreeZone ? (
                                <span className="font-bold text-emerald-700">
                                  Envío: GRATIS
                                </span>
                              ) : coverageEstimate.withinCoverage ? (
                                <span className="font-bold">
                                  Estimación de envío: ~
                                  {formatEnvioUsd(
                                    effectiveCustomShippingUsd ??
                                      coverageEstimate.estimatedShippingUsd
                                  )}{" "}
                                  USD
                                </span>
                              ) : (
                                <span className="font-bold text-amber-900">
                                  Supera {coverageEstimate.maxCoverageKm.toFixed(0)} km
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10.5px] leading-snug pt-1 font-medium ${
                                coverageEstimate.withinCoverage
                                  ? "text-emerald-900"
                                  : "text-amber-900"
                              }`}
                            >
                              {coverageEstimate.isFreeZone
                                ? "Aplica envío gratis únicamente en este punto exacto (cercanías no aplican)."
                                : coverageEstimate.withinCoverage
                                  ? "Es una estimación; el precio final se debe acordar en WhatsApp."
                                  : `Supera el límite de ${coverageEstimate.maxCoverageKm.toFixed(
                                      0
                                    )} km. No se puede hacer el envío (consulta en WhatsApp).`}
                            </p>
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
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#A62660]"
                                : "text-[#0B4A31]"
                              : "text-[#0057FF]"
                          }`}
                        >
                          Google Maps ↗
                        </a>
                        <span
                          className={
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#E3A9C3]"
                                : "text-[#9EC4B2]"
                              : "text-[#C0D1EC]"
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
                            isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#A62660]"
                                : "text-[#0B4A31]"
                              : "text-[#0057FF]"
                          }`}
                        >
                          Waze ↗
                        </a>
                      </div>
                    )}

                    <InteractiveLocationMap
                      coordinates={coordinates}
                      onSelectCoordinates={handleMapSelectCoordinates}
                      onUseGps={handleUseLocation}
                      locating={locating}
                      coverageEstimate={coverageEstimate}
                      effectiveCustomShippingUsd={effectiveCustomShippingUsd}
                      isPerfumeTheme={isPerfumeTheme}
                      isPerfumeMujer={isPerfumeMujer}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer (Single Comprar Button -> WhatsApp) */}
            <div
              className={`shrink-0 border-t px-5 py-4 space-y-3 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "border-[#F0C4D7] bg-[#FFF1F6]"
                    : "border-[#C5DFD1] bg-[#EEF7F2]"
                  : "border-[#DCE7F8] bg-white"
              }`}
            >
              <div className="space-y-1 px-1">
                <div
                  className={`flex items-center justify-between text-xs ${
                    isPerfumeTheme
                      ? isPerfumeMujer
                        ? "text-[#7E3B59]"
                        : "text-[#355E4D]"
                      : "text-[#546885]"
                  }`}
                >
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span
                    className={
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#7E3B59]"
                          : "text-[#355E4D]"
                        : "text-[#546885]"
                    }
                  >
                    Envío{" "}
                    {selectedZone
                      ? `(${selectedZone})`
                      : coverageEstimate
                        ? coverageEstimate.isFreeZone
                          ? `(${coverageEstimate.freeZoneName})`
                          : coverageEstimate.withinCoverage
                            ? `estimado (${coverageEstimate.distanceKm.toFixed(2)} km)`
                            : `(${coverageEstimate.distanceKm.toFixed(2)} km)`
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
                              : "text-amber-700 font-bold text-right"
                            : isPerfumeTheme
                              ? isPerfumeMujer
                                ? "text-[#B07A92]"
                                : "text-[#6B9382]"
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
                        : coverageEstimate
                          ? coverageEstimate.isFreeZone
                            ? "GRATIS"
                            : coverageEstimate.withinCoverage &&
                                effectiveCustomShippingUsd !== null
                              ? `~${formatEnvioUsd(effectiveCustomShippingUsd)} (estimado)`
                              : "No se puede hacer el envío (consulta en WhatsApp)"
                          : hasCustomLocation
                            ? "Por confirmar"
                            : "Selecciona zona"}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between pt-1 border-t ${
                    isPerfumeTheme
                      ? isPerfumeMujer
                        ? "border-[#F0C4D7]"
                        : "border-[#C5DFD1]"
                      : "border-[#E7EFFC]"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#5C0E32]"
                          : "text-[#063020]"
                        : "text-[#0B172A]"
                    }`}
                  >
                    {isEstimatedCustomShipping ? "Total estimado" : "Total"}
                  </span>
                  <span
                    className={
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "font-playfair font-bold text-2xl text-[#5C0E32]"
                          : "font-playfair font-bold text-2xl text-[#063020]"
                        : "font-montserrat font-black text-2xl text-[#0057FF]"
                    }
                  >
                    {isEstimatedCustomShipping ? "~" : ""}$
                    {totalWithShipping.toFixed(2)}
                  </span>
                </div>
                {isEstimatedCustomShipping && (
                  <p
                    className={`text-[10.5px] leading-snug pt-0.5 ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#7E3B59]"
                          : "text-[#355E4D]"
                        : "text-[#546885]"
                    }`}
                  >
                    El envío es una estimación; el precio final se debe acordar en WhatsApp.
                  </p>
                )}
                {!selectedZone && coverageEstimate && !coverageEstimate.withinCoverage && (
                  <p
                    className={`text-[10.5px] leading-snug pt-0.5 ${
                      isPerfumeTheme
                        ? isPerfumeMujer
                          ? "text-[#7E3B59]"
                          : "text-[#355E4D]"
                        : "text-amber-700"
                    }`}
                  >
                    Supera los {coverageEstimate.maxCoverageKm.toFixed(0)} km: no se puede hacer el envío (consulta en WhatsApp).
                  </p>
                )}
              </div>

              {canBuyDirect ? (
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeCart}
                  className={
                    isPerfumeTheme
                      ? isPerfumeMujer
                        ? "font-playfair w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB] shadow-[0_8px_22px_rgba(166,38,96,0.22)] transition-colors"
                        : "font-playfair w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9] shadow-[0_8px_22px_rgba(11,74,49,0.22)] transition-colors"
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
                      ? isPerfumeMujer
                        ? "font-playfair w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB] shadow-[0_8px_22px_rgba(166,38,96,0.22)] transition-colors"
                        : "font-playfair w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9] shadow-[0_8px_22px_rgba(11,74,49,0.22)] transition-colors"
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
                    ? isPerfumeMujer
                      ? "text-[#9F5977] hover:text-red-700"
                      : "text-[#4D7866] hover:text-red-700"
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
