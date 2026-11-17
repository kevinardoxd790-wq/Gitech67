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
import { BUNDLES, Bundle } from "@/constants/bundles";
import { Product } from "@/types";

export interface ProductOverrideInput {
  name: string;
  description: string;
  image: string;
  price: number;
  deleted?: boolean;
}

export interface BundleOverrideInput {
  name: string;
  tagline: string;
  image: string;
  bundlePrice: number;
}

interface CatalogContextType {
  products: Product[];
  deletedProducts: Product[];
  bundles: Bundle[];
  productOverrides: Record<string, ProductOverrideInput>;
  bundleOverrides: Record<string, BundleOverrideInput>;
  saveProductOverride: (
    productId: string,
    data: ProductOverrideInput,
    adminProof: string
  ) => Promise<void>;
  resetProductOverride: (
    productId: string,
    adminProof: string
  ) => Promise<void>;
  deleteProduct: (
    product: Product,
    adminProof: string
  ) => Promise<void>;
  restoreProduct: (
    product: Product,
    adminProof: string
  ) => Promise<void>;
  saveBundleOverride: (
    bundleId: string,
    data: BundleOverrideInput,
    adminProof: string
  ) => Promise<void>;
  resetBundleOverride: (
    bundleId: string,
    adminProof: string
  ) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | null>(null);

const PROOF_HEX_REGEX = /^[a-f0-9]{64}$/;
const IMAGE_URI_REGEX =
  /^(https?:\/\/.+|\/.+|data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+)$/;

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [productOverrides, setProductOverrides] = useState<
    Record<string, ProductOverrideInput>
  >({});
  const [bundleOverrides, setBundleOverrides] = useState<
    Record<string, BundleOverrideInput>
  >({});

  // Sincronización en tiempo real con Firestore (con respaldo silencioso si falla)
  useEffect(() => {
    let unsubProducts = () => {};
    let unsubBundles = () => {};

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

      const qBundles = query(
        collection(db, "catalog_bundles"),
        where("published", "==", true)
      );
      unsubBundles = onSnapshot(
        qBundles,
        (snapshot) => {
          try {
            const next: Record<string, BundleOverrideInput> = {};
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              if (
                typeof d.name === "string" &&
                typeof d.tagline === "string" &&
                typeof d.bundlePrice === "number"
              ) {
                next[docSnap.id] = {
                  name: d.name,
                  tagline: d.tagline,
                  image: typeof d.image === "string" ? d.image : "",
                  bundlePrice: d.bundlePrice,
                };
              }
            });
            setBundleOverrides(next);
          } catch {
            // Respaldo silencioso
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, "catalog_bundles");
          } catch {
            // Mantiene los combos base sin romper la tienda
          }
        }
      );
    } catch {
      // Si Firestore no está disponible, se usan los valores base
    }

    return () => {
      unsubProducts();
      unsubBundles();
    };
  }, []);

  const products = useMemo<Product[]>(() => {
    return PRODUCTS.filter(
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
      };
    });
  }, [productOverrides]);

  const deletedProducts = useMemo<Product[]>(() => {
    return PRODUCTS.filter(
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
      };
    });
  }, [productOverrides]);

  const bundles = useMemo<Bundle[]>(() => {
    return BUNDLES.map((base) => {
      const ov = bundleOverrides[base.id];
      if (!ov) return base;
      return {
        ...base,
        name: ov.name,
        tagline: ov.tagline,
        image: ov.image || base.image,
        bundlePrice: ov.bundlePrice,
      };
    });
  }, [bundleOverrides]);

  const saveProductOverride = async (
    productId: string,
    data: ProductOverrideInput,
    adminProof: string
  ) => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    const cleanName = data.name.trim().slice(0, 160);
    const cleanDescription = data.description.trim().slice(0, 1000);
    const cleanImage = data.image.trim();
    const cleanPrice = Number(data.price);

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

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "catalog_products", productId), {
        name: cleanName,
        description: cleanDescription,
        image: cleanImage,
        price: Number(cleanPrice.toFixed(2)),
        published: true,
        deleted: false,
        updatedAt: serverTimestamp(),
      });
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

    const cleanName = product.name.trim().slice(0, 160) || product.id;
    const cleanDescription =
      product.description.trim().slice(0, 1000) || "Producto eliminado";
    const cleanImage =
      product.image &&
      product.image.length <= 250000 &&
      IMAGE_URI_REGEX.test(product.image.trim())
        ? product.image.trim()
        : "/placeholder.svg";
    const cleanPrice = Number.isFinite(Number(product.price))
      ? Math.max(0, Math.min(10000, Number(product.price)))
      : 0;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "catalog_products", product.id), {
        name: cleanName,
        description: cleanDescription,
        image: cleanImage,
        price: Number(cleanPrice.toFixed(2)),
        published: true,
        deleted: true,
        updatedAt: serverTimestamp(),
      });
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
        deleted: false,
      },
      adminProof
    );
  };

  const saveBundleOverride = async (
    bundleId: string,
    data: BundleOverrideInput,
    adminProof: string
  ) => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    const cleanName = data.name.trim().slice(0, 160);
    const cleanTagline = data.tagline.trim().slice(0, 1000);
    const cleanImage = (data.image ?? "").trim().slice(0, 1000);
    const cleanPrice = Number(data.bundlePrice);

    if (
      !cleanName ||
      !cleanTagline ||
      Number.isNaN(cleanPrice) ||
      cleanPrice < 0 ||
      cleanPrice > 10000
    ) {
      throw new Error("Datos del combo inválidos.");
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "catalog_bundles", bundleId), {
        name: cleanName,
        tagline: cleanTagline,
        image: cleanImage,
        bundlePrice: Number(cleanPrice.toFixed(2)),
        published: true,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `catalog_bundles/${bundleId}`
      );
    }
  };

  const resetBundleOverride = async (bundleId: string, adminProof: string) => {
    if (!PROOF_HEX_REGEX.test(adminProof)) {
      throw new Error("Sesión de administrador requerida.");
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.delete(doc(db, "catalog_bundles", bundleId));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `catalog_bundles/${bundleId}`
      );
    }
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        deletedProducts,
        bundles,
        productOverrides,
        bundleOverrides,
        saveProductOverride,
        resetProductOverride,
        deleteProduct,
        restoreProduct,
        saveBundleOverride,
        resetBundleOverride,
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
