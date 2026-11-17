import { useState } from "react";
import { X, Plus, Minus, Trash2, MapPin, MessageCircle, ShoppingCart, Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { getShippingZones, getShippingLabel } from "@/constants/products";
import AddressPickerModal from "@/components/features/AddressPickerModal";
import OrderTicketModal from "@/components/features/OrderTicketModal";

export default function CartDrawer() {
  const { items, address, coordinates, setLocation, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems, isOpen, closeCart } = useCart();
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  if (!isOpen) return null;

  const shippingZones = getShippingZones(totalPrice);
  const freeZones = shippingZones.filter((z) => z.cost === 0);
  const paidZones = shippingZones.filter((z) => z.cost > 0);
  const shippingLabel = getShippingLabel(totalPrice);

  const toNextTier = totalPrice < 5 ? 5 - totalPrice : totalPrice < 9 ? 9 - totalPrice : null;
  const nextTierLabel = totalPrice < 5 ? "Torre Futura y 75 Av. Norte" : totalPrice < 9 ? "6 zonas con envío gratis" : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-dark-800 border-l border-neon-cyan/20 shadow-neon animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neon-cyan/20 bg-dark-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-orbitron font-bold text-white text-base">Mi Carrito</h2>
            {totalItems > 0 && (
              <span className="bg-neon-cyan text-dark-900 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="text-white/40 hover:text-white transition-colors p-1">
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
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map(({ product, quantity }) => {
                const fixedPrice = Number(product.price);
                return (
                  <div key={product.id} className="card-tech p-3 flex gap-3 items-start">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl shrink-0 bg-dark-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-xs leading-tight line-clamp-2 mb-1">{product.name}</p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-neon-cyan font-black text-sm">${fixedPrice.toFixed(2)}</span>
                      </div>
                      {/* Qty controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-dark-700 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan hover:border-neon-cyan/50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-bold text-sm w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 rounded-lg bg-dark-700 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan hover:border-neon-cyan/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-white/20 text-[10px] ml-1">max {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button onClick={() => removeFromCart(product.id)} className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-white/60 text-xs font-bold">${(fixedPrice * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}

              {/* Shipping calculator panel */}
              <div className="rounded-xl border border-neon-cyan/20 bg-dark-700/50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neon-cyan/10 bg-neon-cyan/5">
                  <Truck className="w-4 h-4 text-neon-cyan shrink-0" />
                  <p className="text-neon-cyan text-xs font-bold uppercase tracking-wider">Costo de Envío</p>
                </div>

                <div className="p-4 space-y-2">
                  {/* Shipping label */}
                  <p className="text-white text-xs font-semibold leading-relaxed">{shippingLabel}</p>

                  {/* Free zones */}
                  {freeZones.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {freeZones.map((z) => (
                        <div key={z.name} className="flex items-center justify-between">
                          <span className="text-white/60 text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                            {z.name}
                          </span>
                          <span className="text-green-400 text-[11px] font-bold">GRATIS</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Paid zones */}
                  {paidZones.map((z) => (
                    <div key={z.name} className="flex items-center justify-between">
                      <span className="text-white/60 text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full inline-block" />
                        {z.name}
                      </span>
                      <span className="text-orange-400 text-[11px] font-bold">+${z.cost.toFixed(2)}</span>
                    </div>
                  ))}

                  {/* Upsell to next tier */}
                  {toNextTier !== null && (
                    <div className="mt-3 pt-3 border-t border-neon-cyan/10">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-neon-cyan/70 text-[11px] font-semibold">
                          Agrega ${toNextTier.toFixed(2)} más y desbloquea:
                        </span>
                      </div>
                      <p className="text-neon-cyan text-[11px] font-bold">{nextTierLabel}</p>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (totalPrice / (totalPrice < 5 ? 5 : 9)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {toNextTier === null && (
                    <div className="mt-2 pt-2 border-t border-green-400/20">
                      <p className="text-green-400 text-[11px] font-bold text-center">
                        ✓ Tienes el máximo de zonas con envío gratis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-neon-cyan/20 px-5 py-4 space-y-3 bg-dark-700/40">
              {/* Address */}
              <button
                onClick={() => setShowAddressPicker(true)}
                className="w-full flex items-center gap-2 bg-dark-700 border border-neon-cyan/20 hover:border-neon-cyan/50 rounded-xl px-4 py-3 transition-all group"
              >
                <MapPin className="w-4 h-4 text-neon-cyan shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  {address ? (
                    <>
                      <p className="text-[10px] text-neon-cyan/60 uppercase tracking-wider font-bold">Dirección</p>
                      <p className="text-white text-xs truncate">{address}</p>
                    </>
                  ) : (
                    <p className="text-white/40 text-sm">Agregar dirección de entrega</p>
                  )}
                </div>
                <span className="text-neon-cyan/40 group-hover:text-neon-cyan text-xs shrink-0">Editar</span>
              </button>

              {/* Total */}
              <div className="space-y-1.5 px-1">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-white/60 text-sm font-semibold">Total</span>
                  <span className="font-orbitron font-black text-xl text-neon-cyan glow-text">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout → Ticket */}
              <button
                onClick={() => setShowTicket(true)}
                className="btn-neon w-full flex items-center justify-center gap-2 py-3.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Revisar y pedir por WhatsApp
              </button>

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

      {/* Address Picker Modal */}
      {showAddressPicker && (
        <AddressPickerModal
          initialAddress={address}
          initialCoordinates={coordinates}
          onConfirm={setLocation}
          onClose={() => setShowAddressPicker(false)}
        />
      )}

      {/* Order Ticket Modal */}
      {showTicket && (
        <OrderTicketModal onClose={() => setShowTicket(false)} />
      )}
    </>
  );
}
