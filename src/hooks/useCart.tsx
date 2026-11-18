import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Product } from "@/types";
import { isPerfumeProduct } from "@/constants/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

const CART_STORAGE_KEY = "gotech_cart_v1";

interface PersistedCartState {
  items: CartItem[];
  address: string;
  coordinates: Coordinates | null;
}

function parseCoordinatesFromText(text: string): Coordinates | null {
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

function loadPersistedCart(): PersistedCartState {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return { items: [], address: "", coordinates: null };
    }
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      address: typeof parsed?.address === "string" ? parsed.address : "",
      coordinates:
        parsed?.coordinates &&
        typeof parsed.coordinates.lat === "number" &&
        typeof parsed.coordinates.lng === "number"
          ? parsed.coordinates
          : null,
    };
  } catch {
    return { items: [], address: "", coordinates: null };
  }
}

interface CartContextType {
  items: CartItem[];
  address: string;
  coordinates: Coordinates | null;
  setAddress: (addr: string) => void;
  setLocation: (addr: string, coords?: Coordinates | null) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartBounce: boolean;
  lastAddedTheme: "perfumes" | "tech";
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const initialRef = useRef<PersistedCartState | null>(null);
  if (!initialRef.current) {
    initialRef.current = loadPersistedCart();
  }

  const [items, setItems] = useState<CartItem[]>(initialRef.current.items);
  const [address, setAddressState] = useState<string>(
    initialRef.current.address
  );
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    initialRef.current.coordinates
  );
  const [isOpen, setIsOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [lastAddedTheme, setLastAddedTheme] = useState<"perfumes" | "tech">(
    () =>
      initialRef.current &&
      initialRef.current.items.length > 0 &&
      initialRef.current.items.every((i) => isPerfumeProduct(i.product))
        ? "perfumes"
        : "tech"
  );
  const bounceTimerRef = useRef<number | null>(null);

  // Persistencia segura del carrito, dirección y coordenadas en localStorage
  useEffect(() => {
    try {
      const payload: PersistedCartState = {
        items,
        address,
        coordinates,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignora errores de almacenamiento (modo incógnito/cuota llena)
    }
  }, [items, address, coordinates]);

  const triggerCartBounce = useCallback(() => {
    try {
      setCartBounce(false);
      requestAnimationFrame(() => {
        setCartBounce(true);
      });
      if (bounceTimerRef.current) {
        window.clearTimeout(bounceTimerRef.current);
      }
      bounceTimerRef.current = window.setTimeout(() => {
        setCartBounce(false);
      }, 650);
    } catch {
      // No interrumpe el flujo del carrito
    }
  }, []);

  const setAddress = useCallback((addr: string) => {
    setAddressState(addr);
    const parsedCoords = parseCoordinatesFromText(addr);
    if (parsedCoords) {
      setCoordinates(parsedCoords);
    }
  }, []);

  const setLocation = useCallback(
    (addr: string, coords?: Coordinates | null) => {
      setAddressState(addr);
      if (coords !== undefined) {
        setCoordinates(coords);
      } else {
        setCoordinates(parseCoordinatesFromText(addr));
      }
    },
    []
  );

  const addToCart = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? {
                  ...i,
                  product,
                  quantity: Math.min(i.quantity + 1, product.stock),
                }
              : i
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      setLastAddedTheme(isPerfumeProduct(product) ? "perfumes" : "tech");
      triggerCartBounce();
      setIsOpen(true);
    },
    [triggerCartBounce]
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(qty, i.product.stock) }
            : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        address,
        coordinates,
        setAddress,
        setLocation,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
        cartBounce,
        lastAddedTheme,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
