'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  products: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
    url?: string;
    inStock?: boolean;
  }>;
  title?: string;
  onAddToCart?: (product: { id: string; name: string; price: number; image?: string }) => void;
  onViewDetails?: (id: string) => void;
}

export default function ProductCarousel({
  products,
  title = 'Search Results',
  onAddToCart,
  onViewDetails,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-10 px-4 text-center
                   rounded-2xl bg-[#13131f]/50 border border-[rgba(255,255,255,0.07)]"
      >
        <Package className="w-10 h-10 text-[#8b87a0]/40 mb-3" />
        <p className="text-sm text-[#8b87a0]">No products found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-[#f0eef5]">{title}</h3>
          <span className="text-xs font-medium text-[#8b87a0] bg-[#1a1a2e] px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.07)]">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Desktop Nav Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-xl border transition-all duration-200
              ${canScrollLeft
                ? 'bg-[#1a1a2e] border-[rgba(255,255,255,0.1)] text-[#f0eef5] hover:border-[#7c5cbf]/40 hover:shadow-[0_0_12px_rgba(124,92,191,0.15)]'
                : 'bg-[#13131f] border-[rgba(255,255,255,0.04)] text-[#8b87a0]/30 cursor-not-allowed'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-xl border transition-all duration-200
              ${canScrollRight
                ? 'bg-[#1a1a2e] border-[rgba(255,255,255,0.1)] text-[#f0eef5] hover:border-[#7c5cbf]/40 hover:shadow-[0_0_12px_rgba(124,92,191,0.15)]'
                : 'bg-[#13131f] border-[rgba(255,255,255,0.04)] text-[#8b87a0]/30 cursor-not-allowed'
              }`}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left fade gradient */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none
                         bg-gradient-to-r from-[#0a0a12] to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Right fade gradient */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none
                         bg-gradient-to-l from-[#0a0a12] to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Scroll Area */}
        <div
          ref={scrollRef}
          className="carousel-scroll flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
            >
              <ProductCard
                {...product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
