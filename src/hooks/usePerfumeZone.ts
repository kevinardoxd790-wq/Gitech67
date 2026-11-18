import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";
import { isPerfumeProduct } from "@/constants/products";

/**
 * Detects whether the user is currently viewing the Perfumes boutique zone:
 * - /perfumes standalone page
 * - /producto/:id for a perfume item
 * - scrolled into the #perfumes section on /
 */
export function usePerfumeZone(): boolean {
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
