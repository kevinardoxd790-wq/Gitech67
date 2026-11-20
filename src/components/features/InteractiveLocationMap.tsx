import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Maximize2,
  Minus,
  Navigation,
  Plus,
  X,
  Check,
} from "lucide-react";
import { Coordinates } from "@/hooks/useCart";
import { CoverageEstimate, formatEnvioUsd } from "@/lib/deliveryCoverage";

interface InteractiveLocationMapProps {
  coordinates: Coordinates | null;
  onSelectCoordinates: (coords: Coordinates) => void;
  onUseGps?: () => void;
  locating?: boolean;
  coverageEstimate?: CoverageEstimate | null;
  effectiveCustomShippingUsd?: number | null;
  isPerfumeTheme?: boolean;
  isPerfumeMujer?: boolean;
}

const DEFAULT_CENTER: Coordinates = { lat: 13.7028, lng: -89.234 };

interface LeafletCanvasProps {
  coordinates: Coordinates | null;
  onSelectCoordinates: (coords: Coordinates) => void;
  expanded: boolean;
  isPerfumeTheme: boolean;
  isPerfumeMujer: boolean;
  onUseGps?: () => void;
  locating?: boolean;
  onOpenExpand?: () => void;
}

function LeafletCanvas({
  coordinates,
  onSelectCoordinates,
  expanded,
  isPerfumeTheme,
  isPerfumeMujer,
  onUseGps,
  locating,
  onOpenExpand,
}: LeafletCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const isProgrammaticMoveRef = useRef(false);
  const lastEmittedRef = useRef<Coordinates | null>(null);
  const onSelectRef = useRef(onSelectCoordinates);
  const [pinLifted, setPinLifted] = useState(false);

  onSelectRef.current = onSelectCoordinates;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const initialCenter = coordinates ?? DEFAULT_CENTER;
    const initialZoom = coordinates ? (expanded ? 17 : 16) : 14;

    const map = L.map(el, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      scrollWheelZoom: expanded,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    map.on("movestart", () => {
      if (!isProgrammaticMoveRef.current) {
        setPinLifted(true);
      }
    });

    map.on("moveend", () => {
      setPinLifted(false);
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }
      const center = map.getCenter();
      const next: Coordinates = {
        lat: Number(center.lat.toFixed(6)),
        lng: Number(center.lng.toFixed(6)),
      };
      lastEmittedRef.current = next;
      onSelectRef.current(next);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      map.panTo(e.latlng, { animate: true });
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    resizeObserver.observe(el);

    const timer = window.setTimeout(() => {
      map.invalidateSize({ pan: false });
    }, 120);

    return () => {
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coordinates) return;

    const last = lastEmittedRef.current;
    if (
      last &&
      Math.abs(last.lat - coordinates.lat) < 0.00001 &&
      Math.abs(last.lng - coordinates.lng) < 0.00001
    ) {
      return;
    }

    const currentCenter = map.getCenter();
    if (
      Math.abs(currentCenter.lat - coordinates.lat) < 0.00001 &&
      Math.abs(currentCenter.lng - coordinates.lng) < 0.00001
    ) {
      return;
    }

    isProgrammaticMoveRef.current = true;
    const targetZoom = Math.max(map.getZoom(), expanded ? 17 : 16);
    map.setView([coordinates.lat, coordinates.lng], targetZoom, {
      animate: false,
    });
    const resetTimer = window.setTimeout(() => {
      isProgrammaticMoveRef.current = false;
    }, 100);

    return () => window.clearTimeout(resetTimer);
  }, [coordinates, expanded]);

  const pinColorClass = isPerfumeTheme
    ? isPerfumeMujer
      ? "text-[#A62660]"
      : "text-[#0B4A31]"
    : "text-[#0057FF]";

  const accentBgClass = isPerfumeTheme
    ? isPerfumeMujer
      ? "bg-[#A62660]"
      : "bg-[#0B4A31]"
    : "bg-[#0057FF]";

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full z-0"
        style={{ touchAction: "none" }}
      />

      {/* Center Target Pin */}
      <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div
            className={`w-2.5 h-2.5 rounded-full ${accentBgClass} ring-2 ring-white shadow-md`}
          />
          <div
            className={`absolute bottom-1/2 transition-transform duration-150 drop-shadow-[0_4px_8px_rgba(0,0,0,0.32)] ${
              pinLifted ? "-translate-y-1.5 scale-110" : "translate-y-0 scale-100"
            }`}
          >
            <MapPin
              className={`w-9 h-9 ${pinColorClass}`}
              fill="currentColor"
              stroke="white"
              strokeWidth={1.75}
            />
          </div>
        </div>
      </div>

      {/* Expand Button (inline map) */}
      {!expanded && onOpenExpand && (
        <button
          type="button"
          onClick={onOpenExpand}
          aria-label="Ampliar mapa"
          className="absolute top-2.5 right-2.5 z-[450] inline-flex items-center gap-1.5 rounded-lg bg-white/95 hover:bg-white text-[#0B172A] border border-black/10 px-2.5 py-1.5 text-[11px] font-bold shadow-md backdrop-blur-sm transition-transform active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Ampliar</span>
        </button>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-2.5 right-2.5 z-[450] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Acercar mapa"
          className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-[#0B172A] border border-black/10 flex items-center justify-center shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Alejar mapa"
          className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-[#0B172A] border border-black/10 flex items-center justify-center shadow-md active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick GPS button in expanded mode */}
      {expanded && onUseGps && (
        <button
          type="button"
          onClick={onUseGps}
          disabled={locating}
          aria-label="Usar mi GPS"
          className="absolute bottom-2.5 left-2.5 z-[450] inline-flex items-center gap-1.5 rounded-lg bg-white/95 hover:bg-white text-[#0B172A] border border-black/10 px-3 py-2 text-xs font-bold shadow-md active:scale-95 disabled:opacity-50"
        >
          <Navigation
            className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`}
          />
          <span>{locating ? "Ubicando..." : "GPS"}</span>
        </button>
      )}
    </div>
  );
}

export default function InteractiveLocationMap({
  coordinates,
  onSelectCoordinates,
  onUseGps,
  locating = false,
  coverageEstimate,
  effectiveCustomShippingUsd,
  isPerfumeTheme = false,
  isPerfumeMujer = false,
}: InteractiveLocationMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Inline Interactive Map */}
      <div
        className={`rounded-xl overflow-hidden border h-52 ${
          isPerfumeTheme
            ? isPerfumeMujer
              ? "border-[#F0C4D7] bg-[#FFF1F6]"
              : "border-[#C5DFD1] bg-[#EEF7F2]"
            : "border-[#DCE7F8] bg-[#F4F8FF]"
        }`}
      >
        <LeafletCanvas
          coordinates={coordinates}
          onSelectCoordinates={onSelectCoordinates}
          expanded={false}
          isPerfumeTheme={isPerfumeTheme}
          isPerfumeMujer={isPerfumeMujer}
          onOpenExpand={() => setIsExpanded(true)}
        />
      </div>

      {/* Expanded Fullscreen Modal Map */}
      {isExpanded && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-sm">
          <div
            className={`w-full h-[90vh] max-w-3xl rounded-2xl overflow-hidden flex flex-col border shadow-2xl ${
              isPerfumeTheme
                ? isPerfumeMujer
                  ? "bg-[#FFF8FB] border-[#F0C4D7] text-[#5C0E32]"
                  : "bg-[#F7FBF9] border-[#C5DFD1] text-[#063020]"
                : "bg-white border-[#CFE0FA] text-[#0B172A]"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-[#FFF1F6] border-[#F0C4D7]"
                    : "bg-[#EEF7F2] border-[#C5DFD1]"
                  : "bg-[#F4F8FF] border-[#DCE7F8]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold truncate">
                  Ubicación de entrega
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Cerrar mapa ampliado"
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Coverage Strip */}
            {coverageEstimate && (
              <div
                className={`px-4 py-2 text-xs border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
                  coverageEstimate.withinCoverage
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <span className="font-semibold">
                  {coverageEstimate.distanceKm.toFixed(2)} km ·{" "}
                  {coverageEstimate.isFreeZone
                    ? `Envío GRATIS (${coverageEstimate.freeZoneName})`
                    : coverageEstimate.withinCoverage
                      ? `Estimación: ~${formatEnvioUsd(
                          effectiveCustomShippingUsd ??
                            coverageEstimate.estimatedShippingUsd
                        )} USD (acordar en WhatsApp)`
                      : "No se puede hacer el envío (consulta en WhatsApp)"}
                </span>
              </div>
            )}

            {/* Expanded Map Canvas */}
            <div className="flex-1 min-h-0 relative">
              <LeafletCanvas
                coordinates={coordinates}
                onSelectCoordinates={onSelectCoordinates}
                expanded={true}
                isPerfumeTheme={isPerfumeTheme}
                isPerfumeMujer={isPerfumeMujer}
                onUseGps={onUseGps}
                locating={locating}
              />
            </div>

            {/* Modal Footer */}
            <div
              className={`px-4 py-3 border-t shrink-0 ${
                isPerfumeTheme
                  ? isPerfumeMujer
                    ? "bg-[#FFF1F6] border-[#F0C4D7]"
                    : "bg-[#EEF7F2] border-[#C5DFD1]"
                  : "bg-[#F4F8FF] border-[#DCE7F8]"
              }`}
            >
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  isPerfumeTheme
                    ? isPerfumeMujer
                      ? "bg-[#A62660] hover:bg-[#C23273] text-white"
                      : "bg-[#0B4A31] hover:bg-[#116443] text-white"
                    : "bg-[#0057FF] hover:bg-[#0044CC] text-white"
                }`}
              >
                <Check className="w-4 h-4" />
                Confirmar ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
