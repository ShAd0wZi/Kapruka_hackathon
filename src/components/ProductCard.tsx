'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ExternalLink, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  url?: string;
  inStock?: boolean;
  onAddToCart?: (product: { id: string; name: string; price: number; image?: string }) => void;
  onViewDetails?: (id: string) => void;
}

const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString('en-LK')}`;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
  url,
  inStock = true,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    onAddToCart?.({ id, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleViewDetails}
      className="group relative flex flex-col w-[200px] min-w-[200px] sm:w-[220px] sm:min-w-[220px] 
                 rounded-2xl overflow-hidden cursor-pointer
                 bg-[#13131f] border border-[rgba(255,255,255,0.07)]
                 transition-shadow duration-300"
      style={{
        boxShadow: isHovered
          ? '0 0 24px rgba(124, 92, 191, 0.2), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#1a1a2e]">
        {image && !imageError ? (
          <motion.img
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7c5cbf]/30 to-[#1a1a2e] flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-[#7c5cbf]/40" />
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2.5 left-2.5">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase backdrop-blur-md
              ${inStock
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {inStock ? 'In Stock' : 'Out of Stock'}
          </motion.span>
        </div>

        {/* External Link */}
        {url && (
          <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md 
                       border border-[rgba(255,255,255,0.1)] text-[#f0eef5]/70
                       hover:text-[#f0eef5] hover:bg-black/60 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-[#13131f] via-transparent to-transparent flex items-end justify-center pb-3"
            >
              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-[#f0eef5]/80"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        {/* Product Name */}
        <h3
          className="text-sm font-medium text-[#f0eef5] leading-snug line-clamp-2 min-h-[2.5em]"
          title={name}
        >
          {name}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-[#f8da08] tracking-tight">
          {formatPrice(price)}
        </p>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!inStock}
          whileHover={inStock ? { scale: 1.03 } : {}}
          whileTap={inStock ? { scale: 0.97 } : {}}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold
                      transition-all duration-300 mt-auto
            ${added
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : inStock
                ? 'bg-gradient-to-r from-[#7c5cbf] to-[#9b7ed8] text-white hover:shadow-[0_0_20px_rgba(124,92,191,0.35)]'
                : 'bg-[#1a1a2e] text-[#8b87a0]/50 border border-[rgba(255,255,255,0.05)] cursor-not-allowed'
            }`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="cart"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                {inStock ? 'Add to Cart' : 'Unavailable'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
