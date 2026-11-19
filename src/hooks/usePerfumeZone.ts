import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";
import { isPerfumeProduct } from "@/constants/products";
import {
  PerfumeCardPalette,
  getPerfumeCardPalette,
} from "@/constants/perfumePalettes";

export type PerfumeGender = "hombre" | "mujer";

interface PerfumeThemeContextValue {
  isPerfumeZone: boolean;
  perfumeGender: PerfumeGender;
  setPerfumeGender: (gender: PerfumeGender) => void;
  activePerfumeId: string | null;
  activePerfumePalette: PerfumeCardPalette | null;
}

const PerfumeThemeContext = createContext<PerfumeThemeContextValue | null>(
  null
);

function usePerfumeZoneDetection(): boolean {
  const location = useLocation();
  const { products } = useCatalog();
  const [homeScrolledInPerfumes, setHomeScrolledInPerfumes] = useState(false);

  const detailId = location.pathname.startsWith("/producto/")
    ? location.pathname.slice("/producto/".length)
    : "";
  const activeProduct = detailId
    ? products.find((p) => p.id === detailId)
    : undefined;

  const isRoutePerfumes =
    location.pathname === "/perfumes" || isPerfumeProduct(activeProduct);

  useEffect(() => {
    if (location.pathname !== "/") {
      setHomeScrolledInPerfumes(false);
      return;
    }

    let rafId: number | null = null;

    const checkPosition = () => {
      rafId = null;
      const el = document.getElementById("perfumes");
      if (!el) {
        setHomeScrolledInPerfumes(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const inZone = rect.top <= vh * 0.62 && rect.bottom >= vh * 0.25;
      setHomeScrolledInPerfumes((prev) => (prev === inZone ? prev : inZone));
    };

    const scheduleCheck = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(checkPosition);
      }
    };

    checkPosition();
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [location.pathname]);

  return isRoutePerfumes || (location.pathname === "/" && homeScrolledInPerfumes);
}

export function PerfumeThemeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { products } = useCatalog();
  const isPerfumeZone = usePerfumeZoneDetection();
  const [perfumeGender, setPerfumeGender] = useState<PerfumeGender>("hombre");

  const detailId = location.pathname.startsWith("/producto/")
    ? location.pathname.slice("/producto/".length)
    : "";
  const activeDetailProduct = detailId
    ? products.find((p) => p.id === detailId)
    : undefined;
  const isPerfumeDetail = Boolean(
    activeDetailProduct && isPerfumeProduct(activeDetailProduct)
  );
  const activePerfumeId =
    isPerfumeDetail && activeDetailProduct ? activeDetailProduct.id : null;
  const activePerfumePalette =
    isPerfumeDetail && activeDetailProduct
      ? getPerfumeCardPalette(
          activeDetailProduct.id,
          !activeDetailProduct.category.toLowerCase().includes("hombre")
        )
      : null;

  // Sincroniza automáticamente el estilo si el usuario abre el detalle de un perfume específico
  useEffect(() => {
    if (isPerfumeDetail && activeDetailProduct) {
      const isHombre = activeDetailProduct.category
        .toLowerCase()
        .includes("hombre");
      setPerfumeGender(isHombre ? "hombre" : "mujer");
    }
  }, [isPerfumeDetail, activeDetailProduct]);

  return createElement(
    PerfumeThemeContext.Provider,
    {
      value: {
        isPerfumeZone,
        perfumeGender,
        setPerfumeGender,
        activePerfumeId,
        activePerfumePalette,
      },
    },
    children
  );
}

export function usePerfumeTheme(): PerfumeThemeContextValue {
  const ctx = useContext(PerfumeThemeContext);
  const fallbackZone = usePerfumeZoneDetection();
  const [fallbackGender, setFallbackGender] = useState<PerfumeGender>("hombre");

  if (ctx) return ctx;
  return {
    isPerfumeZone: fallbackZone,
    perfumeGender: fallbackGender,
    setPerfumeGender: setFallbackGender,
    activePerfumeId: null,
    activePerfumePalette: null,
  };
}

/**
 * Detects whether the user is currently viewing the Perfumes boutique zone:
 * - /perfumes standalone page
 * - /producto/:id for a perfume item
 * - scrolled into the #perfumes section on /
 */
export function usePerfumeZone(): boolean {
  const ctx = useContext(PerfumeThemeContext);
  const fallbackZone = usePerfumeZoneDetection();
  return ctx ? ctx.isPerfumeZone : fallbackZone;
}
