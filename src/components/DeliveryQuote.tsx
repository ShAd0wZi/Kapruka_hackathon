'use client';

import { motion } from 'framer-motion';
import { Truck, MapPin, Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface DeliveryQuoteProps {
  city: string;
  date?: string;
  canDeliver: boolean;
  rate?: number;
  perishableWarning?: string;
  currency?: string;
}

const formatPrice = (price: number, currency: string): string => {
  if (currency === 'USD') return `$${price.toFixed(2)}`;
  return `Rs. ${price.toLocaleString('en-LK')}`;
};

export default function DeliveryQuote({
  city,
  date,
  canDeliver,
  rate,
  perishableWarning,
  currency = 'LKR',
}: DeliveryQuoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-2xl overflow-hidden border backdrop-blur-sm
        ${canDeliver
          ? 'bg-[#13131f] border-emerald-500/20'
          : 'bg-[#13131f] border-red-500/20'
        }`}
    >
      {/* Status Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3
          ${canDeliver
            ? 'bg-emerald-500/10 border-b border-emerald-500/15'
            : 'bg-red-500/10 border-b border-red-500/15'
          }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, delay: 0.15 }}
        >
          {canDeliver ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
        </motion.div>
        <span
          className={`text-sm font-semibold ${canDeliver ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {canDeliver ? 'Delivery Available' : 'Delivery Unavailable'}
        </span>
      </div>

      {/* Details Body */}
      <div className="px-4 py-4 space-y-3">
        {/* City */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-[#7c5cbf]/10 border border-[#7c5cbf]/15">
            <MapPin className="w-4 h-4 text-[#7c5cbf]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#8b87a0] font-medium">
              Delivery To
            </p>
            <p className="text-sm font-semibold text-[#f0eef5]">{city}</p>
          </div>
        </motion.div>

        {/* Date */}
        {date && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-[#7c5cbf]/10 border border-[#7c5cbf]/15">
              <Calendar className="w-4 h-4 text-[#7c5cbf]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#8b87a0] font-medium">
                Expected Date
              </p>
              <p className="text-sm font-semibold text-[#f0eef5]">{date}</p>
            </div>
          </motion.div>
        )}

        {/* Delivery Rate */}
        {canDeliver && rate !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-[#7c5cbf]/10 border border-[#7c5cbf]/15">
              <Truck className="w-4 h-4 text-[#7c5cbf]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#8b87a0] font-medium">
                Delivery Fee
              </p>
              <p className="text-sm font-bold text-[#f8da08]">
                {rate === 0 ? (
                  <span className="text-emerald-400">Free Delivery</span>
                ) : (
                  formatPrice(rate, currency)
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Perishable Warning */}
        {perishableWarning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-2.5 mt-3 p-3 rounded-xl 
                       bg-amber-500/8 border border-amber-500/15"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">{perishableWarning}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
