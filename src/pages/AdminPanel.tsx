import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  User,
  Package,
  MapPin,
  Trash2,
  RefreshCw,
  Download,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  ShieldCheck,
  Save,
  RotateCcw,
  ShoppingBag,
  ImagePlus,
  Link2,
  Plus,
  X,
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  db,
  OperationType,
  handleFirestoreError,
  deriveAdminPasswordProof,
  sha256Hex,
} from "@/lib/firebase";
import {
  Booking,
  loadBookings,
  saveBookings,
} from "@/constants/schedule";
import { useCatalog } from "@/hooks/useCatalog";
import { Product } from "@/types";

const ADMIN_STATUS_DOC_PATH = "admin_settings/status";
const ADMIN_ACCESS_DOC_PATH = "admin_settings/knas_access";
const ADMIN_CHECK_DOC_PATH = "admin_auth_checks/session";
const INITIAL_KNAS_VERIFIER_HASH =
  "a57610610d9b5a523a7b28e26eda59ef7194c7470fcefe9f1959899c431f3cc4";
const MAX_GALLERY_DATA_URL_LENGTH = 180000;

async function compressGalleryImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen válido.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen."));
      el.src = objectUrl;
    });

    const maxSizes = [480, 360, 260];
    const qualities = [0.82, 0.68, 0.52];

    for (const maxDim of maxSizes) {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No se pudo procesar la imagen.");
      }
      ctx.fillStyle = "#0b0f17";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for (const quality of qualities) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length <= MAX_GALLERY_DATA_URL_LENGTH) {
          return dataUrl;
        }
      }
    }

    throw new Error(
      "La imagen es demasiado pesada. Elige una imagen más pequeña."
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const PRESET_CATEGORIES = [
  "Tecnología",
  "Bluetooth",
  "Memorias",
  "Controles",
  "Accesorios Moto",
  "Accesorios Auto",
];

function AddProductCard({
  onCreate,
  onCancel,
}: {
  onCreate: (data: {
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    stock: number;
    badge: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [categorySelect, setCategorySelect] = useState("Tecnología");
  const [customCategory, setCustomCategory] = useState("");
  const [badge, setBadge] = useState("🆕 NUEVO");
  const [processingImage, setProcessingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setProcessingImage(true);
    setError("");
    try {
      const compressedDataUrl = await compressGalleryImage(file);
      setImage(compressedDataUrl);
      setShowUrlField(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la imagen de galería."
      );
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalCategory =
      categorySelect === "__custom__"
        ? customCategory.trim()
        : categorySelect.trim();
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim()) {
      setError("Ingresa el nombre del producto.");
      return;
    }
    if (!finalCategory) {
      setError("Ingresa la categoría del producto.");
      return;
    }
    if (!image.trim()) {
      setError("Selecciona una imagen de galería o pega un enlace URL.");
      return;
    }
    if (!description.trim()) {
      setError("Ingresa la descripción del producto.");
      return;
    }
    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0 ||
      numericPrice > 10000
    ) {
      setError("Ingresa un precio válido entre $0.00 y $10,000.");
      return;
    }
    if (
      Number.isNaN(numericStock) ||
      numericStock < 0 ||
      numericStock > 10000
    ) {
      setError("Ingresa un stock válido entre 0 y 10,000.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        price: numericPrice,
        category: finalCategory,
        stock: Math.round(numericStock),
        badge: badge.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar el producto."
      );
    } finally {
      setSaving(false);
    }
  };

  const isGalleryDataUrl = image.startsWith("data:image/");

  return (
    <form
      onSubmit={handleSubmit}
      className="card-tech p-6 border-2 border-neon-cyan/40 space-y-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-orbitron font-black text-base text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-neon-cyan" /> Nuevo Producto
          </h3>
          <p className="text-white/45 text-xs mt-0.5">
            Se publicará automáticamente en la tienda web y en el catálogo
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-white/40 hover:text-white p-1.5 transition-colors"
          aria-label="Cerrar formulario"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Audífonos Bluetooth Pro"
              maxLength={160}
              required
              className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
                Precio (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4.99"
                required
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2.5 text-sm text-neon-cyan font-bold placeholder-white/25 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
                Stock *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="10000"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
                Categoría *
              </label>
              <select
                value={categorySelect}
                onChange={(e) => setCategorySelect(e.target.value)}
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-dark-800">
                    {cat}
                  </option>
                ))}
                <option value="__custom__" className="bg-dark-800">
                  Otra categoría...
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
                Etiqueta (opcional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="🆕 NUEVO"
                maxLength={60}
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
          </div>

          {categorySelect === "__custom__" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
                Nombre de categoría *
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ej: Audio, Cargadores..."
                maxLength={60}
                required
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
              Imagen del producto *
            </label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-20 h-20 rounded-xl bg-dark-700 border border-neon-cyan/20 flex items-center justify-center overflow-hidden shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="w-6 h-6 text-neon-cyan/35" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryFileChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={processingImage || saving}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-dark-700 hover:bg-neon-cyan/10 border border-neon-cyan/35 hover:border-neon-cyan text-neon-cyan rounded-xl px-3 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <ImagePlus className="w-4 h-4" />
                    {processingImage
                      ? "Procesando..."
                      : "Seleccionar de galería"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlField((v) => !v)}
                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-dark-700 border border-white/15 hover:border-neon-cyan/40 text-white/60 hover:text-neon-cyan text-xs transition-all"
                    title="Pegar enlace URL"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isGalleryDataUrl && (
                  <p className="text-[11px] text-green-400 font-semibold">
                    Imagen de galería lista
                  </p>
                )}
              </div>
            </div>
            {showUrlField && (
              <input
                type="text"
                value={isGalleryDataUrl ? "" : image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... (opcional)"
                maxLength={2000}
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/50"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe las características principales del producto..."
              maxLength={1000}
              rows={3}
              required
              className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/50 resize-y"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || processingImage}
          className="btn-neon flex items-center justify-center gap-2 px-6 py-2.5 text-xs disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {saving ? "Publicando..." : "Publicar producto en la web"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="btn-neon-outline px-5 py-2.5 text-xs"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ProductEditCard({
  product,
  isOverridden,
  isCustom,
  onSave,
  onReset,
  onDelete,
}: {
  product: Product;
  isOverridden: boolean;
  isCustom: boolean;
  onSave: (data: {
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    stock: number;
  }) => Promise<void>;
  onReset: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(product.image);
  const [price, setPrice] = useState(product.price.toFixed(2));
  const [category, setCategory] = useState(product.category);
  const [stock, setStock] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [status, setStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description);
    setImage(product.image);
    setPrice(product.price.toFixed(2));
    setCategory(product.category);
    setStock(String(product.stock));
  }, [
    product.name,
    product.description,
    product.image,
    product.price,
    product.category,
    product.stock,
  ]);

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setProcessingImage(true);
    setStatus("");
    try {
      const compressedDataUrl = await compressGalleryImage(file);
      setImage(compressedDataUrl);
      setShowUrlField(false);
      setStatus("Imagen cargada desde galería. Presiona Guardar para aplicar.");
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la imagen de galería."
      );
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await onSave({
        name,
        description,
        image,
        price: Number(price),
        category: category.trim() || "Tecnología",
        stock: Math.max(0, Math.min(10000, Math.round(Number(stock) || 0))),
      });
      setStatus("Guardado en base de datos.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setStatus("");
    try {
      await onReset();
      setStatus("Restaurado al original.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al restaurar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setSaving(true);
    setStatus("");
    try {
      await onDelete();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al borrar.");
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  const isGalleryDataUrl = image.startsWith("data:image/");

  return (
    <form
      onSubmit={handleSave}
      className="card-tech p-5 space-y-4 border border-neon-cyan/20"
    >
      <div className="flex items-start gap-4">
        <img
          src={image || product.image}
          alt={name}
          className="w-20 h-20 object-cover rounded-xl bg-dark-700 border border-neon-cyan/20 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-neon-cyan/70 uppercase truncate">
              {product.id}
            </span>
            {isCustom ? (
              <span className="text-[10px] font-bold bg-green-400/15 text-green-400 px-2 py-0.5 rounded-full shrink-0">
                Nuevo producto
              </span>
            ) : (
              isOverridden && (
                <span className="text-[10px] font-bold bg-neon-cyan/15 text-neon-cyan px-2 py-0.5 rounded-full shrink-0">
                  Editado en BD
                </span>
              )
            )}
          </div>
          <p className="text-white/50 text-xs mt-0.5">{product.category}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
            Título
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={160}
            required
            className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1.5">
            Imagen del producto
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryFileChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={processingImage || saving}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-dark-700 hover:bg-neon-cyan/10 border border-neon-cyan/35 hover:border-neon-cyan text-neon-cyan rounded-xl px-3 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              {processingImage
                ? "Procesando imagen..."
                : "Seleccionar de galería"}
            </button>
            <button
              type="button"
              onClick={() => setShowUrlField((v) => !v)}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-dark-700 border border-white/15 hover:border-neon-cyan/40 text-white/60 hover:text-neon-cyan text-[11px] font-semibold transition-all"
              title="Pegar enlace URL"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {isGalleryDataUrl && (
            <p className="text-[11px] text-green-400 mt-1.5 font-semibold">
              Imagen de galería seleccionada
            </p>
          )}
          {showUrlField && (
            <input
              type="text"
              value={isGalleryDataUrl ? "" : image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... (opcional)"
              maxLength={2000}
              className="mt-2 w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/50"
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            required
            className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
              Precio (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-sm text-neon-cyan font-bold focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
              Stock
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="10000"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neon-cyan/80 mb-1">
            Categoría
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={60}
            required
            className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
      </div>

      {status && (
        <p className="text-xs text-neon-cyan font-semibold">{status}</p>
      )}

      {confirmDelete ? (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
          <p className="text-xs text-red-300 font-semibold text-center">
            ¿Eliminar este producto del catálogo?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleDeleteConfirmed}
              className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {saving ? "Borrando..." : "Sí, borrar"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 rounded-lg border border-white/15 text-white/70 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving || processingImage}
            className="btn-neon flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {isOverridden && !isCustom && (
            <button
              type="button"
              disabled={saving}
              onClick={handleReset}
              className="btn-neon-outline flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs disabled:opacity-50"
              title="Restaurar original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/15 hover:border-red-500/60 text-xs font-bold transition-all disabled:opacity-50"
            title="Borrar producto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </form>
  );
}

export default function AdminPanel() {
  const {
    products,
    deletedProducts,
    productOverrides,
    customProductIds,
    createProduct,
    saveProductOverride,
    resetProductOverride,
    deleteProduct,
    restoreProduct,
  } = useCatalog();

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [adminProof, setAdminProof] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<"entregas" | "productos">(
    "entregas"
  );
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [productNotice, setProductNotice] = useState("");
  const [showDeletedList, setShowDeletedList] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");

  const refresh = () => setBookings(loadBookings());

  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      setLoadingStatus(true);
      setError("");
      try {
        const snap = await getDoc(doc(db, "admin_settings", "status"));
        if (cancelled) return;
        setIsConfigured(snap.exists() && snap.data()?.configured === true);
      } catch (err) {
        if (cancelled) return;
        try {
          handleFirestoreError(err, OperationType.GET, ADMIN_STATUS_DOC_PATH);
        } catch (wrappedErr) {
          console.error(wrappedErr);
          setError("No se pudo conectar con la base de datos.");
        }
      } finally {
        if (!cancelled) {
          setLoadingStatus(false);
        }
      }
    };

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authenticated) {
      refresh();
    }
  }, [authenticated]);

  const handleSignOut = () => {
    setAuthenticated(false);
    setAdminProof("");
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Ingresa la contraseña.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const proof = await deriveAdminPasswordProof(password);

      if (!isConfigured) {
        const candidateVerifier = await sha256Hex(proof);
        if (candidateVerifier !== INITIAL_KNAS_VERIFIER_HASH) {
          setError("Contraseña incorrecta.");
          return;
        }

        const batch = writeBatch(db);
        batch.set(doc(db, "admin_settings", "knas_access"), {
          verifierHash: candidateVerifier,
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, "admin_settings", "status"), {
          configured: true,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();

        setIsConfigured(true);
        setAdminProof(proof);
        setAuthenticated(true);
        setPassword("");
        setError("");
        return;
      }

      await setDoc(doc(db, "admin_auth_checks", "session"), {
        proof,
        updatedAt: serverTimestamp(),
      });

      setAdminProof(proof);
      setAuthenticated(true);
      setPassword("");
      setError("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("permission")) {
        setError("Contraseña incorrecta.");
      } else {
        try {
          handleFirestoreError(err, OperationType.WRITE, ADMIN_CHECK_DOC_PATH);
        } catch (wrappedErr) {
          console.error(wrappedErr);
          setError("Contraseña incorrecta o error de conexión.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProof) return;

    if (newPassword.trim().length < 4 || newPassword.length > 256) {
      setChangeError("La contraseña debe tener entre 4 y 256 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangeError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    setChangeError("");
    setChangeSuccess("");
    try {
      const newProof = await deriveAdminPasswordProof(newPassword);
      const newVerifierHash = await sha256Hex(newProof);

      const batch = writeBatch(db);
      batch.set(doc(db, "admin_auth_checks", "session"), {
        proof: adminProof,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, "admin_settings", "knas_access"), {
        verifierHash: newVerifierHash,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      setAdminProof(newProof);
      setNewPassword("");
      setConfirmNewPassword("");
      setChangeSuccess("Contraseña actualizada en la base de datos.");
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setChangeSuccess("");
      }, 1200);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, ADMIN_ACCESS_DOC_PATH);
      } catch (wrappedErr) {
        console.error(wrappedErr);
        setChangeError(
          "No se pudo actualizar la contraseña en la base de datos."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="pt-16 min-h-screen section-grid flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="card-tech p-8 border border-neon-cyan/30 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mx-auto mb-5 animate-pulse">
              <Lock className="w-7 h-7 text-neon-cyan" />
            </div>
            <p className="text-white/60 text-sm">Verificando acceso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="pt-16 min-h-screen section-grid flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="card-tech p-8 border border-neon-cyan/30">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mx-auto mb-5">
              <Lock className="w-7 h-7 text-neon-cyan" />
            </div>
            <h1 className="font-orbitron font-black text-xl text-white text-center mb-1">
              Acceso Admin
            </h1>
            <p className="text-white/40 text-xs text-center mb-6">
              GoTech Panel de Control
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-neon-cyan/50 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-neon w-full py-3 text-sm disabled:opacity-50"
              >
                {submitting ? "Verificando..." : "Acceder"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const deleteBooking = (id: string) => {
    const updated = bookings.filter((b) => b.id !== id);
    saveBookings(updated);
    setBookings(updated);
  };

  const clearAll = () => {
    saveBookings([]);
    setBookings([]);
    setConfirmClearAll(false);
  };

  const todayStr = new Date().toLocaleDateString("es-SV", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const filtered = bookings
    .filter((b) => {
      if (filter === "today") return b.date === todayStr;
      if (filter === "upcoming")
        return new Date(b.createdAt) >= new Date(Date.now() - 86400000);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const exportCSV = () => {
    const headers = [
      "ID",
      "Fecha",
      "Hora",
      "Nombre",
      "Producto",
      "Punto de Entrega",
      "Teléfono",
      "Creado",
    ];
    const rows = bookings.map((b) => [
      b.id,
      b.date,
      b.time,
      b.name,
      b.product,
      b.deliveryPoint,
      b.phone || "",
      b.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gotech-entregas-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="pt-16 min-h-screen section-grid">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-neon-cyan" />
              <h1 className="font-orbitron font-black text-2xl text-white">
                Panel <span className="text-neon-cyan">KNAS</span>
              </h1>
            </div>
            <p className="text-white/40 text-sm">
              Administra entregas y productos en tiempo real
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setShowChangePasswordModal(!showChangePasswordModal);
                setChangeError("");
                setChangeSuccess("");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neon-cyan/20 text-neon-cyan/70 hover:border-neon-cyan/60 hover:text-neon-cyan text-xs font-bold transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" /> Contraseña
            </button>
            {activeTab === "entregas" && (
              <>
                <button
                  onClick={refresh}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neon-cyan/20 text-neon-cyan/70 hover:border-neon-cyan/60 hover:text-neon-cyan text-xs font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                </button>
                <button
                  onClick={exportCSV}
                  disabled={bookings.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neon-cyan/20 text-neon-cyan/70 hover:border-neon-cyan/60 hover:text-neon-cyan text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar CSV
                </button>
                {bookings.length > 0 &&
                  (confirmClearAll ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={clearAll}
                        className="px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold transition-all"
                      >
                        Confirmar borrado
                      </button>
                      <button
                        onClick={() => setConfirmClearAll(false)}
                        className="px-3 py-2 rounded-xl border border-white/15 text-white/60 text-xs font-semibold transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClearAll(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400/70 hover:border-red-500/60 hover:text-red-400 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Borrar todo
                    </button>
                  ))}
              </>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-white/50 hover:border-white/40 hover:text-white text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab("entregas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === "entregas"
                ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan shadow-neon-sm"
                : "border-white/10 text-white/50 hover:border-neon-cyan/30 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> Entregas ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("productos")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === "productos"
                ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan shadow-neon-sm"
                : "border-white/10 text-white/50 hover:border-neon-cyan/30 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Productos ({products.length})
          </button>
        </div>

        {/* Change password panel */}
        {showChangePasswordModal && (
          <div className="card-tech p-6 mb-8 border border-neon-cyan/30 max-w-md">
            <h2 className="font-orbitron font-bold text-sm text-white mb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-neon-cyan" /> Cambiar contraseña
              en base de datos
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-neon-cyan/50"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-neon-cyan/50"
              />
              {changeError && (
                <p className="text-red-400 text-xs">{changeError}</p>
              )}
              {changeSuccess && (
                <p className="text-green-400 text-xs">{changeSuccess}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-neon px-5 py-2 text-xs disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="btn-neon-outline px-4 py-2 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 1: ENTREGAS */}
        {activeTab === "entregas" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: bookings.length, color: "text-neon-cyan" },
                {
                  label: "Hoy",
                  value: bookings.filter((b) => b.date === todayStr).length,
                  color: "text-green-400",
                },
                {
                  label: "Esta semana",
                  value: bookings.filter(
                    (b) =>
                      new Date(b.createdAt) >= new Date(Date.now() - 7 * 86400000)
                  ).length,
                  color: "text-orange-400",
                },
                {
                  label: "Puntos únicos",
                  value: new Set(bookings.map((b) => b.deliveryPoint)).size,
                  color: "text-purple-400",
                },
              ].map((stat) => (
                <div key={stat.label} className="card-tech p-4 text-center">
                  <p
                    className={`font-orbitron font-black text-3xl ${stat.color} glow-text`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
              {(["all", "today", "upcoming"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    filter === f
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : "border-white/10 text-white/40 hover:border-neon-cyan/30 hover:text-white/60"
                  }`}
                >
                  {f === "all" ? "Todas" : f === "today" ? "Hoy" : "Recientes"}
                </button>
              ))}
            </div>

            {/* Bookings list */}
            {filtered.length === 0 ? (
              <div className="card-tech p-12 text-center">
                <Calendar className="w-12 h-12 text-neon-cyan/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">
                  {filter === "today"
                    ? "No hay entregas para hoy."
                    : "No hay entregas programadas aún."}
                </p>
                <p className="text-white/20 text-xs mt-1">
                  Los clientes verán el calendario en la página de inicio.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((booking) => (
                  <div
                    key={booking.id}
                    className="card-tech p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="shrink-0 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl px-4 py-3 text-center min-w-[100px]">
                      <p className="font-orbitron font-black text-neon-cyan text-sm leading-tight">
                        {booking.time}
                      </p>
                      <p className="text-white/40 text-[10px] mt-0.5 leading-tight">
                        {booking.date.split(" ").slice(0, 2).join(" ")}
                      </p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
                            Cliente
                          </p>
                          <p className="text-white text-sm font-semibold">
                            {booking.name}
                          </p>
                          {booking.phone && (
                            <p className="text-white/40 text-[11px]">
                              {booking.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
                            Producto
                          </p>
                          <p className="text-white text-sm font-semibold leading-snug">
                            {booking.product}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
                            Punto
                          </p>
                          <p className="text-white text-xs font-semibold leading-snug">
                            {booking.deliveryPoint}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-white/20 text-[10px] font-mono">
                        {booking.id}
                      </span>
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="w-7 h-7 rounded-lg border border-red-500/20 text-red-400/50 hover:border-red-500/60 hover:text-red-400 flex items-center justify-center transition-all"
                        title="Eliminar reserva"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: PRODUCTOS */}
        {activeTab === "productos" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-tech p-4 border border-neon-cyan/20">
              <div>
                <h2 className="font-orbitron font-bold text-sm text-white">
                  Catálogo Web ({products.length} productos activos)
                </h2>
                <p className="text-white/45 text-xs mt-0.5">
                  Agrega productos nuevos con foto de galería y muéstralos al instante en la web
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddProductForm((v) => !v);
                  setProductNotice("");
                }}
                className="btn-neon flex items-center justify-center gap-2 px-5 py-2.5 text-xs shrink-0"
              >
                {showAddProductForm ? (
                  <>
                    <X className="w-4 h-4" /> Cerrar formulario
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Agregar producto
                  </>
                )}
              </button>
            </div>

            {productNotice && (
              <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-400/30 text-green-400 text-xs font-semibold">
                {productNotice}
              </div>
            )}

            {showAddProductForm && (
              <AddProductCard
                onCreate={async (data) => {
                  await createProduct(data, adminProof);
                  setShowAddProductForm(false);
                  setProductNotice(
                    `Producto "${data.name}" publicado en la web correctamente.`
                  );
                }}
                onCancel={() => setShowAddProductForm(false)}
              />
            )}

            {products.length === 0 ? (
              <div className="card-tech p-10 text-center">
                <ShoppingBag className="w-10 h-10 text-neon-cyan/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm">
                  No hay productos activos en el catálogo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductEditCard
                    key={product.id}
                    product={product}
                    isOverridden={Boolean(productOverrides[product.id])}
                    isCustom={Boolean(customProductIds[product.id])}
                    onSave={(data) =>
                      saveProductOverride(product.id, data, adminProof)
                    }
                    onReset={() => resetProductOverride(product.id, adminProof)}
                    onDelete={() => deleteProduct(product, adminProof)}
                  />
                ))}
              </div>
            )}

            {deletedProducts.length > 0 && (
              <div className="card-tech p-4 border border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDeletedList((v) => !v)}
                  className="text-xs font-bold text-white/60 hover:text-neon-cyan transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Productos eliminados ({deletedProducts.length})
                </button>
                {showDeletedList && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {deletedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 bg-dark-700/70 border border-white/10 rounded-xl p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-neon-cyan">
                            ${p.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => restoreProduct(p, adminProof)}
                          className="btn-neon-outline px-2.5 py-1.5 text-[11px] shrink-0"
                        >
                          Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-white/15 text-[10px] text-center mt-8">
          Panel Admin GoTech · Contraseña y cambios de catálogo guardados en Firestore
        </p>
      </div>
    </div>
  );
}
