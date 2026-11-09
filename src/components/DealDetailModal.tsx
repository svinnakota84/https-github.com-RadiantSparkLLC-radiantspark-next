/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DealItem } from '../types';
import {
  Flame,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  ShoppingCart
} from 'lucide-react';

interface DealDetailModalProps {
  deal: DealItem | null;
  onClose: () => void;
  onVoteDeal: (dealId: string) => void;
  onOpenLegalShield: () => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onVoteDeal,
  onOpenLegalShield,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!deal) return null;

  const savings = deal.originalPrice - deal.currentPrice;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
              Curated Deal Intel
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {deal.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close deal dialog"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top row: Image & quick buy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 h-56 border border-slate-800">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow">
                {deal.discountPercent}% OFF
              </div>
              <div className="absolute bottom-2 left-2 text-[11px] text-slate-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {deal.expiresInHours} hours remaining
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Merchant: <strong className="text-amber-300">{deal.merchant}</strong>
                </span>
                <h3 className="text-base font-bold text-white leading-snug">{deal.title}</h3>

                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 mb-1">Verified Deal Pricing:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {deal.currentPrice > 1000 && (deal.merchant.includes('India') || deal.category === 'energy')
                        ? `₹${deal.currentPrice.toLocaleString('en-IN')}`
                        : deal.currentPrice >= 1000 && !deal.merchant.includes('India') && deal.id.includes('samsung')
                        ? `$${(deal.currentPrice / 100).toFixed(2)}`
                        : deal.currentPrice < 1000
                        ? `₹${deal.currentPrice}`
                        : `$${(deal.currentPrice / 100).toFixed(2)} / ₹${deal.currentPrice.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-xs text-slate-500 line-through font-mono">
                      {deal.originalPrice > 1000 && (deal.merchant.includes('India') || deal.category === 'energy')
                        ? `₹${deal.originalPrice.toLocaleString('en-IN')}`
                        : `$${(deal.originalPrice / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold font-mono mt-1">
                    Verified Discount: {deal.discountPercent}% OFF
                  </div>
                </div>
              </div>

              {/* Coupon block if available */}
              {deal.couponCode && (
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">COUPON CODE</span>
                    <span className="font-mono font-bold text-amber-300">{deal.couponCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(deal.couponCode!)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Direct Store Links Selection Box (Amazon USA vs Amazon India vs Walmart vs Flipkart) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                Direct Product Store Selection (Deep Links)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Direct Product Page ↗</span>
            </div>
            <p className="text-xs text-slate-300">
              Select your preferred store. Clicking directly navigates to the exact product item page:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {deal.amazonIndiaUrl && (
                <a
                  href={deal.amazonIndiaUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center justify-between transition-all group hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇮🇳</span>
                    <div className="text-left">
                      <div className="font-bold text-xs text-white group-hover:text-amber-300">Amazon India</div>
                      <div className="text-[10px] text-slate-400 font-mono">Direct Product on Amazon.in (₹)</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                </a>
              )}

              {deal.amazonUsaUrl && (
                <a
                  href={deal.amazonUsaUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-200 flex items-center justify-between transition-all group hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇺🇸</span>
                    <div className="text-left">
                      <div className="font-bold text-xs text-white group-hover:text-blue-300">Amazon USA</div>
                      <div className="text-[10px] text-slate-400 font-mono">Direct Product on Amazon.com ($)</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
                </a>
              )}

              {deal.walmartUrl && (
                <a
                  href={deal.walmartUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 flex items-center justify-between transition-all group hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏬</span>
                    <div className="text-left">
                      <div className="font-bold text-xs text-white group-hover:text-cyan-300">Walmart Store</div>
                      <div className="text-[10px] text-slate-400 font-mono">Direct Item on Walmart.com</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                </a>
              )}

              {deal.flipkartUrl && (
                <a
                  href={deal.flipkartUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 flex items-center justify-between transition-all group hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <div className="text-left">
                      <div className="font-bold text-xs text-white group-hover:text-yellow-300">Flipkart India</div>
                      <div className="text-[10px] text-slate-400 font-mono">Direct Product on Flipkart</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-yellow-400 shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* Key Specs */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Verified Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {deal.specifications.map((spec, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  {spec}
                </div>
              ))}
            </div>
          </div>

          {/* Highlight description */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400 block mb-1">Editor &amp; Community Notes:</strong>
            {deal.highlight} {deal.description}
          </div>

          {/* Legal Shield & Affiliate Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Intermediary Safe Harbour &amp; Consumer Protection Compliance</span>
            </div>
            <p className="leading-relaxed">
              SparkDeal Hub is an automated informational price curation platform. Clicking store buttons directs you directly to the verified third-party vendor's product page (Amazon India, Amazon US, Walmart, etc.) where your transaction is fulfilled. Radiant Spark LLC carries $0 liability for retailer fulfillment.
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenLegalShield();
                }}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Learn more about our India Legal Shield ↗
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={() => onVoteDeal(deal.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 border ${
              deal.upvoted
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Flame className={`w-4 h-4 ${deal.upvoted ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{deal.score} Upvotes</span>
          </button>

          <div className="flex items-center gap-2">
            {deal.amazonIndiaUrl && (
              <a
                href={deal.amazonIndiaUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <span>🇮🇳 Amazon India</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {deal.amazonUsaUrl && (
              <a
                href={deal.amazonUsaUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                <span>🇺🇸 Amazon USA</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {!deal.amazonIndiaUrl && !deal.amazonUsaUrl && (
              <a
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <span>Proceed to Merchant Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
