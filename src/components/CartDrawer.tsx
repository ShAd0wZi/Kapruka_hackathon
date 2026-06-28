'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString('en-LK')}`;
};

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: { id: string; name: string; price: number; quantity: number; image?: string };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 p-3 rounded-xl bg-[#1a1a2e]/60 border border-[rgba(255,255,255,0.05)]
                 hover:border-[rgba(255,255,255,0.1)] transition-colors"
    >
      {/* Item Image */}
      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#13131f]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7c5cbf]/20 to-[#13131f] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#7c5cbf]/40" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <h4 className="text-sm font-medium text-[#f0eef5] truncate leading-tight">{item.name}</h4>
        <p className="text-sm font-bold text-[#f8da08]">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity & Remove */}
      <div className="flex flex-col items-end justify-between">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onRemove(item.id)}
          className="p-1 text-[#8b87a0]/60 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded-md bg-[#13131f] border border-[rgba(255,255,255,0.07)] 
                       text-[#8b87a0] hover:text-[#f0eef5] hover:border-[#7c5cbf]/40 transition-all"
          >
            <Minus className="w-3 h-3" />
          </motion.button>
          <span className="w-7 text-center text-sm font-semibold text-[#f0eef5]">
            {item.quantity}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded-md bg-[#13131f] border border-[rgba(255,255,255,0.07)] 
                       text-[#8b87a0] hover:text-[#f0eef5] hover:border-[#7c5cbf]/40 transition-all"
          >
            <Plus className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, requestCheckout, getTotal, getItemCount } =
    useCartStore();

  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md
                       bg-[#0e0e1a]/95 backdrop-blur-xl
                       border-l border-[rgba(255,255,255,0.07)]
                       shadow-[-8px_0_40px_rgba(0,0,0,0.5)]
                       flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#7c5cbf]/15 border border-[#7c5cbf]/20">
                  <ShoppingCart className="w-5 h-5 text-[#7c5cbf]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f0eef5]">Your Cart</h2>
                  <p className="text-xs text-[#8b87a0]">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="p-2 rounded-xl bg-[#1a1a2e] border border-[rgba(255,255,255,0.07)]
                           text-[#8b87a0] hover:text-[#f0eef5] hover:border-[rgba(255,255,255,0.15)]
                           transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3
                            [-ms-overflow-style:none] [scrollbar-width:thin] 
                            [scrollbar-color:rgba(124,92,191,0.3)_transparent]">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="p-5 rounded-full bg-[#1a1a2e] border border-[rgba(255,255,255,0.05)] mb-4">
                      <ShoppingBag className="w-10 h-10 text-[#8b87a0]/30" />
                    </div>
                    <p className="text-[#8b87a0] text-sm font-medium">Your cart is empty</p>
                    <p className="text-[#8b87a0]/60 text-xs mt-1">
                      Ask Kade to find products for you!
                    </p>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer — Total & Checkout */}
            {items.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-5 py-4 border-t border-[rgba(255,255,255,0.07)]
                           bg-[#0e0e1a]/80 backdrop-blur-md"
              >
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#8b87a0]">Subtotal</span>
                  <span className="text-xl font-bold text-[#f8da08]">{formatPrice(total)}</span>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(124,92,191,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestCheckout}
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-sm
                             bg-gradient-to-r from-[#7c5cbf] to-[#9b7ed8]
                             shadow-[0_4px_20px_rgba(124,92,191,0.25)]
                             transition-shadow duration-300"
                >
                  Proceed to Checkout
                </motion.button>

                {/* Clear Cart */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={clearCart}
                  className="w-full mt-2.5 py-2.5 rounded-xl text-xs font-medium text-[#8b87a0]
                             hover:text-red-400 transition-colors"
                >
                  Clear Cart
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
