'use client';

import { motion } from 'framer-motion';
import { Package, Truck, Check, Clock, Hash } from 'lucide-react';

interface OrderTimelineProps {
  orderNumber: string;
  status: string;
  steps: Array<{
    title: string;
    description?: string;
    timestamp?: string;
    completed: boolean;
    current?: boolean;
  }>;
}

function getStepIcon(title: string, completed: boolean, current: boolean) {
  const lowerTitle = title.toLowerCase();

  let Icon = Clock;
  if (lowerTitle.includes('deliver') || lowerTitle.includes('ship') || lowerTitle.includes('transit')) {
    Icon = Truck;
  } else if (lowerTitle.includes('confirm') || lowerTitle.includes('placed') || lowerTitle.includes('order')) {
    Icon = Package;
  } else if (lowerTitle.includes('complete') || lowerTitle.includes('received') || lowerTitle.includes('done')) {
    Icon = Check;
  } else if (completed) {
    Icon = Check;
  }

  return Icon;
}

export default function OrderTimeline({ orderNumber, status, steps }: OrderTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl bg-[#13131f] border border-[rgba(255,255,255,0.07)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] bg-[#1a1a2e]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7c5cbf]/15 border border-[#7c5cbf]/20">
              <Package className="w-5 h-5 text-[#7c5cbf]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-[#8b87a0]" />
                <span className="text-sm font-mono font-semibold text-[#f0eef5]">
                  {orderNumber}
                </span>
              </div>
              <p className="text-xs text-[#8b87a0] mt-0.5">Order Tracking</p>
            </div>
          </div>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="px-3 py-1 rounded-full text-xs font-semibold
                       bg-[#7c5cbf]/15 text-[#9b7ed8] border border-[#7c5cbf]/20"
          >
            {status}
          </motion.span>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-5">
        <div className="relative">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = getStepIcon(step.title, step.completed, !!step.current);

            const dotColor = step.completed
              ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : step.current
                ? 'bg-[#7c5cbf] shadow-[0_0_12px_rgba(124,92,191,0.4)]'
                : 'bg-[#2a2a3e]';

            const iconColor = step.completed
              ? 'text-white'
              : step.current
                ? 'text-white'
                : 'text-[#8b87a0]/50';

            const lineColor = step.completed
              ? 'bg-emerald-500/40'
              : 'bg-[rgba(255,255,255,0.06)]';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.15, duration: 0.35 }}
                className="flex gap-4 relative"
              >
                {/* Icon Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {/* Dot / Icon Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 350 }}
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center
                      ${dotColor} border-2
                      ${step.completed
                        ? 'border-emerald-500/40'
                        : step.current
                          ? 'border-[#7c5cbf]/40'
                          : 'border-[rgba(255,255,255,0.06)]'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                    {/* Pulse ring for current step */}
                    {step.current && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-[#7c5cbf]"
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                  </motion.div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                      className={`w-0.5 flex-1 min-h-[32px] origin-top ${lineColor}`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-6 ${isLast ? 'pb-0' : ''} flex-1 min-w-0`}>
                  <h4
                    className={`text-sm font-semibold leading-tight
                      ${step.completed
                        ? 'text-emerald-400'
                        : step.current
                          ? 'text-[#f0eef5]'
                          : 'text-[#8b87a0]/60'
                      }`}
                  >
                    {step.title}
                  </h4>

                  {step.description && (
                    <p
                      className={`text-xs mt-1 leading-relaxed
                        ${step.completed || step.current
                          ? 'text-[#8b87a0]'
                          : 'text-[#8b87a0]/40'
                        }`}
                    >
                      {step.description}
                    </p>
                  )}

                  {step.timestamp && (
                    <p
                      className={`text-[10px] mt-1.5 font-mono
                        ${step.completed
                          ? 'text-emerald-400/60'
                          : step.current
                            ? 'text-[#7c5cbf]/70'
                            : 'text-[#8b87a0]/30'
                        }`}
                    >
                      {step.timestamp}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
