import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { PRODUCTS } from "@/constants/products";
import { Product } from "@/types";

export interface ProductOverrideInput {
  name: string;
  description: string;
  image: string;
  price: number;
  category?: string;
  stock?: number;
  badge?: string;
  deleted?: boolean;
  isCustom?: boolean;
}

interface CatalogContextType {
  products: Product[];
  deletedProducts: Product[];
  productOverrides: Record<string, ProductOverrideInput>;
  customProductIds: Record<string, boolean>;
  createProduct: (
    data: ProductOverrideInput,
    adminProof: string
  ) => Promise<string>;
  saveProductOverride: (
    productId: string,
    data: ProductOverrideInput,
    adminProof: string
  ) => Promise<void>;
  resetProductOverride: (
    productId: string,
    adminProof: string
  ) => Promise<void>;
  deleteProduct: (product: Product, adminProof: string) => Promise<void>;
  restoreProduct: (product: Product, adminProof: string) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | null>(null);

const PROOF_HEX_REGEX = /^[a-f0-9]{64}$/;
const IMAGE_URI_REGEX =
  /^(https?:\/\/.+|\/.+|data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+)$/;
const BASE_PRODUCT_ID_SET = new Set(PRODUCTS.map((p) => p.id));

function toProductFromOverride(id: string, ov: ProductOverrideInput): Product {
  const stockVal =
    typeof ov.stock === "number" && Number.isFinite(ov.stock)
      ? Math.max(0, Math.min(10000, Math.round(ov.stock)))
      : 10;
  const cleanCategory =
    typeof ov.category === "string" && ov.category.trim()
      ? ov.category.trim().slice(0, 60)
      : "Tecnología";
  const cleanBadge =
    typeof ov.badge === "string" && ov.badge.trim()
      ? ov.badge.trim().slice(0, 60)
      : "🆕 NUEVO";

  return {
    id,
    name: ov.name,
    shortName: ov.name.slice(0, 28),
    price: ov.price,
    stock: stockVal,
    image: ov.image,
    badge: cleanBadge,
    description: ov.description,
    features: [
      ov.description.slice(0, 90),
      "Entrega en San Salvador",
      "Compra rápida por WhatsApp",
    ],
    available: stockVal > 0,
    category: cleanCategory,
  };
}

function generateCustomProductId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const raw = `${slug || "producto"}-${Date.now().toString(36)}`;
  return raw.slice(0, 64);
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [productOverrides, setProductOverrides] = useState<
    Record<string, ProductOverrideInput>
  >({});

  // Sincronización en tiempo real con Firestore (con respaldo silencioso si falla)
  useEffect(() => {
    let unsubProducts = () => {};

    try {
      const qProducts = query(
        collection(db, "catalog_products"),
        where("published", "==", true)
      );
      unsubProducts = onSnapshot(
        qProducts,
        (snapshot) => {
          try {
            const next: Record<string, ProductOverrideInput> = {};
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              if (
                typeof d.name === "string" &&
                typeof d.description === "string" &&
                typeof d.image === "string" &&
                typeof d.price === "number"
              ) {
                next[docSnap.id] = {
                  name: d.name,
                  description: d.description,
                  image: d.image,
                  price: d.price,
                  category:
                    typeof d.category === "string" ? d.category : undefined,
                  stock: typeof d.stock === "number" ? d.stock : undefined,
                  badge: typeof d.badge === "string" ? d.badge : undefined,
                  isCustom: d.isCustom === true,
                  deleted: d.deleted === true,
                };
              }
            });
            setProductOverrides(next);
          } catch {
            // Respaldo silencioso: conserva catálogo actual
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, "catalog_products");
          } catch {
            // Mantiene el catálogo base sin romper la tienda
          }
        }
      );
    } catch {
      // Si Firestore no está disponible, se usan los valores base
    }

    return () => {
      unsubProducts();
    };
  }, []);

  const customProductIds = useMemo<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const [id, ov] of Object.entries(productOverrides)) {
      if (!BASE_PRODUCT_ID_SET.has(id) || ov.isCustom) {
        map[id] = true;
      }
    }
    return map;
  }, [productOverrides]);

  const products = useMemo<Product[]>(() => {
    const customList = Object.entries(productOverrides)
      .filter(([id, ov]) => !BASE_PRODUCT_ID_SET.has(id) && ov.deleted !== true)
      .map(([id, ov]) => toProductFromOverride(id, ov));

    const baseList = PRODUCTS.filter(
      (base) => productOverrides[base.id]?.deleted !== true
    ).map((base) => {
      const ov = productOverrides[base.id];
      if (!ov) return base;
      return {
        ...base,
        name: ov.name,
        description: ov.description,
        image: ov.image,
        price: ov.price,
        category: ov.category ? ov.category : base.category,
        stock: typeof ov.stock === "number" ? ov.stock : base.stock,
        badge: ov.badge !== undefined ? ov.badge : base.badge,
      };
    });

    return [...customList, ...baseList];
  }, [productOverrides]);

  const deletedProducts = useMemo<Product[]>(() => {
    const deletedCustom = Object.entries(productOverrides)
      .filter(([id, ov]) => !BASE_PRODUCT_ID_SET.has(id) && ov.deleted === true)
      .map(([id, ov]) => toProductFromOverride(id, ov));

    const deletedBase = PRODUCTS.filter(
      (base) => productOverrides[base.id]?.deleted === true
    ).map((base) => {
      const ov = productOverrides[base.id];
      if (!ov) return base;
      return {
        ...base,
        name: ov.name,
        description: ov.description,
        image: ov.image,
        price: ov.price,
        category: ov.category ? ov.category : base.category,
        stock: typeof ov.stock === "number" ? ov.stock : base.stock,
        badge: ov.badge !== undefined ? ov.badge : base.badge,
      };
    });

    return [...deletedCustom, ...deletedBase];
  }, [productOverrides]);

  const validateAndBuildPayload = (
    productId: string,
    data: ProductOverrideInput,
    deletedFlag: boolean
  ) => {
    const cleanName = data.name.trim().slice(0, 160);
    const cleanDescription = data.description.trim().slice(0, 1000);
    const cleanImage = data.image.trim();
    const cleanPrice = Number(data.price);
    const cleanCategory =
      typeof data.category === "string" && data.category.trim()
        ? data.category.trim().slice(0, 60)
        : "Tecnología";
    const cleanStock =
      typeof data.stock === "number" && Number.isFinite(data.stock)
        ? Math.max(0, Math.min(10000, Math.round(data.stock)))
        : 10;
    const cleanBadge =
      typeof data.badge === "string" ? data.badge.trim().slice(0, 60) : "";

    if (
      !cleanName ||
      !cleanDescription ||
      !cleanImage ||
      cleanImage.length > 250000 ||
      !IMAGE_URI_REGEX.test(cleanImage) ||
      Number.isNaN(cleanPrice) ||
      cleanPrice < 0 ||
      cleanPrice > 10000
    ) {
      throw new Error(
        "Datos o imagen del producto inválidos (selecciona una imagen más ligera)."
      );
    }

    const isCustom =
      data.isCustom === true || !BASE_PRODUCT_ID_SET.has(productId);

    const payload: Record<string, unknown> = {
      name: cleanName,
      description: cleanDescription,
      image: cleanImage,
      price: Number(cleanPrice.toFixed(2)),
      category: cleanCategory,
      stock: cleanStock,
      isCustom,
      published: true,
      deleted: deletedFlag,
      updatedAt: serverTimestamp(),
    };

    if (cleanBadge) {
      payload.badge = cleanBadge;
    }

    return payload;
  };

  const createProduct = async (
    data: ProductOverrideInput,
    adminProof: string
  ): Promise<string> => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    const productId = generateCustomProductId(data.name || "producto");
    const payload = validateAndBuildPayload(
      productId,
      { ...data, isCustom: true },
      false
    );

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "catalog_products", productId), payload);
      await batch.commit();
      return productId;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `catalog_products/${productId}`
      );
      return productId;
    }
  };

  const saveProductOverride = async (
    productId: string,
    data: ProductOverrideInput,
    adminProof: string
  ) => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    const existingOverride = productOverrides[productId];
    const baseMatch = PRODUCTS.find((p) => p.id === productId);
    const mergedData: ProductOverrideInput = {
      ...data,
      category:
        data.category ?? existingOverride?.category ?? baseMatch?.category,
      stock: data.stock ?? existingOverride?.stock ?? baseMatch?.stock,
      badge: data.badge ?? existingOverride?.badge ?? baseMatch?.badge,
      isCustom:
        data.isCustom ??
        existingOverride?.isCustom ??
        !BASE_PRODUCT_ID_SET.has(productId),
    };

    const payload = validateAndBuildPayload(productId, mergedData, false);

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "catalog_products", productId), payload);
      await batch.commit();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `catalog_products/${productId}`
      );
    }
  };

  const resetProductOverride = async (
    productId: string,
    adminProof: string
  ) => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.delete(doc(db, "catalog_products", productId));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `catalog_products/${productId}`
      );
    }
  };

  const deleteProduct = async (product: Product, adminProof: string) => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    const safeImage =
      product.image &&
      product.image.length <= 250000 &&
      IMAGE_URI_REGEX.test(product.image.trim())
        ? product.image.trim()
        : "/placeholder.svg";

    const payload = validateAndBuildPayload(
      product.id,
      {
        name: product.name.trim().slice(0, 160) || product.id,
        description:
          product.description.trim().slice(0, 1000) || "Producto eliminado",
        image: safeImage,
        price: Number.isFinite(Number(product.price))
          ? Math.max(0, Math.min(10000, Number(product.price)))
          : 0,
        category: product.category,
        stock: product.stock,
        badge: product.badge,
        isCustom: !BASE_PRODUCT_ID_SET.has(product.id),
      },
      true
    );

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "catalog_products", product.id), payload);
      await batch.commit();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `catalog_products/${product.id}`
      );
    }
  };

  const restoreProduct = async (product: Product, adminProof: string) => {
    await saveProductOverride(
      product.id,
      {
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        category: product.category,
        stock: product.stock,
        badge: product.badge,
        isCustom: !BASE_PRODUCT_ID_SET.has(product.id),
        deleted: false,
      },
      adminProof
    );
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        deletedProducts,
        productOverrides,
        customProductIds,
        createProduct,
        saveProductOverride,
        resetProductOverride,
        deleteProduct,
        restoreProduct,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextType {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
