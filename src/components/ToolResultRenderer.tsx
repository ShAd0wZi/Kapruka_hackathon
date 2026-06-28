'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Package,
  FolderOpen,
  MapPin,
  Truck,
  ShoppingBag,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import ProductCarousel from './ProductCarousel';
import DeliveryQuote from './DeliveryQuote';
import OrderTimeline from './OrderTimeline';

interface ToolResultRendererProps {
  toolName: string;
  state: string;
  args: Record<string, unknown>;
  result?: unknown;
  onAddToCart?: (product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  }) => void;
  onSendMessage?: (message: string) => void;
}

const toolMeta: Record<
  string,
  { icon: React.ReactNode; label: string; loadingText: string }
> = {
  kapruka_search_products: {
    icon: <Search className="w-3.5 h-3.5" />,
    label: 'Searching products',
    loadingText: 'Searching Kapruka catalog...',
  },
  kapruka_get_product: {
    icon: <Package className="w-3.5 h-3.5" />,
    label: 'Getting product details',
    loadingText: 'Fetching product details...',
  },
  kapruka_list_categories: {
    icon: <FolderOpen className="w-3.5 h-3.5" />,
    label: 'Browsing categories',
    loadingText: 'Loading categories...',
  },
  kapruka_list_delivery_cities: {
    icon: <MapPin className="w-3.5 h-3.5" />,
    label: 'Searching delivery cities',
    loadingText: 'Searching delivery network...',
  },
  kapruka_check_delivery: {
    icon: <Truck className="w-3.5 h-3.5" />,
    label: 'Checking delivery',
    loadingText: 'Checking delivery availability...',
  },
  kapruka_create_order: {
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    label: 'Creating order',
    loadingText: 'Creating your order...',
  },
  kapruka_track_order: {
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    label: 'Tracking order',
    loadingText: 'Looking up order status...',
  },
};

export default function ToolResultRenderer({
  toolName,
  state,
  args,
  result,
  onAddToCart,
  onSendMessage,
}: ToolResultRendererProps) {
  const meta = toolMeta[toolName] || {
    icon: <Package className="w-3.5 h-3.5" />,
    label: toolName,
    loadingText: 'Processing...',
  };

  // Loading state with contextual message
  if (state !== 'result') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card"
      >
        <div className="relative">
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-brand/20 animate-ping" />
        </div>
        <div>
          <span className="text-xs font-medium text-text-secondary">{meta.loadingText}</span>
          <div className="flex gap-1 mt-1">
            <div className="w-12 h-1 rounded-full bg-brand/30 shimmer" />
            <div className="w-8 h-1 rounded-full bg-brand/20 shimmer" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Parse the result
  const data = parseToolResult(result);

  if (!data) {
    return null;
  }

  // Render based on tool type
  switch (toolName) {
    case 'kapruka_search_products':
      return renderSearchResults(data, args, onAddToCart);
    case 'kapruka_get_product':
      return renderProductDetail(data, onAddToCart);
    case 'kapruka_list_categories':
      return renderCategories(data, onSendMessage);
    case 'kapruka_list_delivery_cities':
      return renderCities(data);
    case 'kapruka_check_delivery':
      return renderDeliveryCheck(data, args);
    case 'kapruka_create_order':
      return renderOrderCreated(data);
    case 'kapruka_track_order':
      return renderOrderTracking(data);
    default:
      return null;
  }
}

function parseToolResult(result: unknown): Record<string, unknown> | null {
  if (!result) return null;

  if (typeof result === 'object' && result !== null) {
    const r = result as Record<string, unknown>;
    if (Array.isArray(r.content)) {
      const textContent = (r.content as Array<{ type: string; text?: string }>).find(
        (c) => c.type === 'text'
      );
      if (textContent?.text) {
        try {
          return JSON.parse(textContent.text);
        } catch {
          return { text: textContent.text };
        }
      }
    }
    return r;
  }

  if (typeof result === 'string') {
    try {
      return JSON.parse(result);
    } catch {
      return { text: result };
    }
  }

  return null;
}

interface Product {
  id?: string;
  product_id?: string;
  name?: string;
  title?: string;
  price?: number;
  lkr_price?: number;
  image?: string;
  image_url?: string;
  thumbnail?: string;
  images?: string[];
  url?: string;
  product_url?: string;
  in_stock?: boolean;
  stock?: string;
  available?: boolean;
}

function extractProducts(data: Record<string, unknown>): Product[] {
  if (Array.isArray(data.products)) return data.products as Product[];
  if (Array.isArray(data.results)) return data.results as Product[];
  if (Array.isArray(data.items)) return data.items as Product[];
  if (Array.isArray(data)) return data as unknown as Product[];

  if (data.name || data.title || data.product_id) {
    return [data as unknown as Product];
  }

  return [];
}

function renderSearchResults(
  data: Record<string, unknown>,
  args: Record<string, unknown>,
  onAddToCart?: (product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  }) => void
) {
  const products = extractProducts(data);

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-8 px-4 rounded-2xl glass-card text-center"
      >
        <div className="w-12 h-12 rounded-full bg-text-muted/10 flex items-center justify-center mb-3">
          <Search className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-sm text-text-secondary font-medium">No products found</p>
        <p className="text-xs text-text-muted mt-1">Try different keywords or browse categories</p>
      </motion.div>
    );
  }

  const carouselProducts = products.slice(0, 8).map((product) => ({
    id: String(product.id || product.product_id || ''),
    name: String(product.name || product.title || 'Product'),
    price: Number(product.price || product.lkr_price || 0),
    image: String(
      product.image ||
        product.image_url ||
        product.thumbnail ||
        (product.images && product.images[0]) ||
        ''
    ),
    url: String(product.url || product.product_url || ''),
    inStock:
      product.in_stock !== undefined
        ? Boolean(product.in_stock)
        : product.stock !== 'Out of Stock'
          ? product.available !== false
          : false,
  }));

  const searchQuery = String(args.query || args.keyword || args.search || 'Results');

  return (
    <ProductCarousel
      products={carouselProducts}
      title={`"${searchQuery}"`}
      onAddToCart={onAddToCart}
    />
  );
}

function renderProductDetail(
  data: Record<string, unknown>,
  onAddToCart?: (product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  }) => void
) {
  const product = (data.product || data) as Product;
  const images: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    images.push(...product.images.map(String));
  } else if (product.image || product.image_url || product.thumbnail) {
    images.push(String(product.image || product.image_url || product.thumbnail));
  }

  const name = String(product.name || product.title || 'Product');
  const price = Number(product.price || product.lkr_price || 0);
  const id = String(product.id || product.product_id || '');
  const url = String(product.url || product.product_url || '');
  const inStock = product.in_stock !== undefined ? Boolean(product.in_stock) : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-[#13131f] border border-[rgba(255,255,255,0.07)]"
    >
      {/* Image */}
      {images.length > 0 && (
        <div className="relative w-full aspect-video overflow-hidden bg-[#1a1a2e]">
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-contain"
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium
                         bg-black/50 backdrop-blur-md border border-[rgba(255,255,255,0.1)] text-[#f0eef5]
                         hover:bg-black/70 transition-all"
            >
              View on Kapruka ↗
            </a>
          )}
        </div>
      )}

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-[#f0eef5] leading-snug">{name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex-shrink-0
            ${inStock
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/15 text-red-400 border border-red-500/20'
            }`}
          >
            {inStock ? '● In Stock' : '● Out of Stock'}
          </span>
        </div>

        <p className="text-xl font-bold text-[#f8da08]">Rs. {price.toLocaleString('en-LK')}</p>

        {inStock && onAddToCart && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart({ id, name, price, image: images[0] })}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                       bg-gradient-to-r from-[#7c5cbf] to-[#9b7ed8]
                       hover:shadow-[0_0_20px_rgba(124,92,191,0.3)] transition-all"
          >
            🛒 Add to Cart
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

interface Category {
  name?: string;
  title?: string;
  id?: string;
  url?: string;
}

function renderCategories(
  data: Record<string, unknown>,
  onSendMessage?: (message: string) => void
) {
  const categories: Category[] = (
    Array.isArray(data.categories)
      ? data.categories
      : Array.isArray(data)
        ? data
        : []
  ) as Category[];

  if (categories.length === 0 && data.text) {
    return (
      <div className="px-3 py-2 rounded-xl glass-card text-sm text-text-secondary">
        <FolderOpen className="w-4 h-4 inline mr-2" />
        Categories loaded
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="font-medium">Browse Categories</span>
        <span className="px-1.5 py-0.5 rounded-full bg-[#1a1a2e] text-[10px]">{categories.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 24).map((cat, i) => {
          const catName = String(cat.name || cat.title || cat);
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSendMessage?.(`Show me products in ${catName}`)}
              className="quick-reply-chip hover:text-text-primary"
            >
              {catName}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

interface City {
  name?: string;
  city?: string;
  district?: string;
}

function renderCities(data: Record<string, unknown>) {
  const cities: City[] = (
    Array.isArray(data.cities)
      ? data.cities
      : Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : []
  ) as City[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <MapPin className="w-3.5 h-3.5" />
        <span className="font-medium">Delivery Cities</span>
        <span className="px-1.5 py-0.5 rounded-full bg-[#1a1a2e] text-[10px]">{cities.length} found</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {cities.slice(0, 15).map((city, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs text-text-secondary"
          >
            <MapPin className="w-3 h-3 text-brand" />
            {String(
              (typeof city === 'object' && city !== null ? city.name || city.city : city) || 'Unknown'
            )}
            {typeof city === 'object' && city?.district && (
              <span className="text-text-muted">({city.district})</span>
            )}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

function renderDeliveryCheck(
  data: Record<string, unknown>,
  args: Record<string, unknown>
) {
  return (
    <DeliveryQuote
      city={String(args.city || data.city || 'Unknown')}
      date={String(args.delivery_date || data.delivery_date || '')}
      canDeliver={Boolean(
        data.can_deliver !== undefined ? data.can_deliver : data.available !== undefined ? data.available : data.deliverable
      )}
      rate={Number(data.rate || data.delivery_rate || data.delivery_fee || 0)}
      perishableWarning={String(data.perishable_warning || data.warning || '')}
    />
  );
}

function renderOrderCreated(data: Record<string, unknown>) {
  const payUrl = String(data.pay_url || data.payment_url || data.checkout_url || data.url || '');
  const orderNumber = String(data.order_number || data.order_id || 'N/A');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden border border-emerald-500/20 bg-[#13131f]"
    >
      {/* Success Header */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/15 px-5 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-emerald-400">Order Created Successfully! 🎉</h3>
            <p className="text-xs text-emerald-400/70 font-mono mt-0.5">Order #{orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="p-5 space-y-4">
        {payUrl && (
          <motion.a
            href={payUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(16,185,129,0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="block w-full text-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600
                       text-white font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.25)]
                       hover:shadow-[0_4px_30px_rgba(16,185,129,0.35)] transition-all"
          >
            💳 Click to Pay Now
          </motion.a>
        )}

        <div className="flex items-center gap-2 text-xs text-text-muted justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 status-pulse" />
          <span>Payment link valid for 60 minutes · Prices locked</span>
        </div>
      </div>
    </motion.div>
  );
}

function renderOrderTracking(data: Record<string, unknown>) {
  const orderNumber = String(data.order_number || data.order_id || 'N/A');
  const status = String(data.status || data.order_status || 'Processing');

  const rawSteps = (
    Array.isArray(data.timeline)
      ? data.timeline
      : Array.isArray(data.tracking)
        ? data.tracking
        : Array.isArray(data.steps)
          ? data.steps
          : []
  ) as Array<{
    title?: string;
    status?: string;
    description?: string;
    timestamp?: string;
    date?: string;
    completed?: boolean;
    current?: boolean;
  }>;

  const steps =
    rawSteps.length > 0
      ? rawSteps.map((step) => ({
          title: String(step.title || step.status || 'Step'),
          description: step.description ? String(step.description) : undefined,
          timestamp: step.timestamp || step.date ? String(step.timestamp || step.date) : undefined,
          completed: Boolean(step.completed),
          current: Boolean(step.current),
        }))
      : [
          { title: 'Order Placed', completed: true },
          {
            title: status,
            completed: false,
            current: true,
          },
        ];

  return <OrderTimeline orderNumber={orderNumber} status={status} steps={steps} />;
}
