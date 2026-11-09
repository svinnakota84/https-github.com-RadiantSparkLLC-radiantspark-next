/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DealItem } from '../types';
import {
  Flame,
  Search,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Radio,
  Eye,
  Info,
  ShoppingCart
} from 'lucide-react';

import { ReelsMonetizationModule } from './ReelsMonetizationModule';

interface SparkDealsViewProps {
  deals: DealItem[];
  onVoteDeal: (dealId: string) => void;
  onSelectDealModal: (deal: DealItem) => void;
  onOpenLegalShield: () => void;
}

export const SparkDealsView: React.FC<SparkDealsViewProps> = ({
  deals,
  onVoteDeal,
  onSelectDealModal,
  onOpenLegalShield,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const STORE_FILTERS = [
    { id: 'all', label: '🔥 All Deals' },
    { id: 'amazon_usa', label: '🇺🇸 Amazon USA (amazon.com)' },
    { id: 'amazon_india', label: '🇮🇳 Amazon India (amazon.in)' },
    { id: 'walmart', label: '🏬 Walmart Deals' },
    { id: 'flipkart', label: '⚡ Flipkart Hub' },
    { id: 'sparkle', label: '☀️ Sparkle Direct' },
  ];

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      let matchesFilter = true;
      if (selectedFilter === 'amazon_usa') {
        matchesFilter = !!deal.amazonUsaUrl || deal.merchant.toLowerCase().includes('amazon usa') || deal.primaryStore === 'Amazon USA';
      } else if (selectedFilter === 'amazon_india') {
        matchesFilter = !!deal.amazonIndiaUrl || deal.merchant.toLowerCase().includes('amazon india') || deal.primaryStore === 'Amazon India';
      } else if (selectedFilter === 'walmart') {
        matchesFilter = !!deal.walmartUrl || deal.merchant.toLowerCase().includes('walmart');
      } else if (selectedFilter === 'flipkart') {
        matchesFilter = !!deal.flipkartUrl || deal.merchant.toLowerCase().includes('flipkart');
      } else if (selectedFilter === 'sparkle') {
        matchesFilter = deal.merchant.toLowerCase().includes('sparkle') || deal.category === 'energy' || deal.category === 'beverages';
      }

      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [deals, selectedFilter, searchQuery]);

  const handleCopy = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleOpenStore = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer sponsored');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Live Real-Time Radar Banner */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 shadow-lg shadow-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 font-mono text-[10px] uppercase shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            DIRECT PRODUCT DEEP-LINKS
          </span>
          <span className="text-slate-200 truncate font-medium">
            ⚡ Direct product links to Amazon USA, Amazon India &amp; Walmart (no generic homepages)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
          <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 font-bold">
            <Eye className="w-3.5 h-3.5" />
            1,482 Live Deal Hunters
          </span>
          <span className="text-amber-400 font-bold">🟢 Active Syndication</span>
        </div>
      </div>

      {/* Social Reels Monetization & Ad Revenue Suite */}
      <ReelsMonetizationModule />

      {/* Section Head */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 fill-amber-400" />
            SparkDeals Hub · Multi-Store Direct Product Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SparkDeals. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 font-serif italic">
              Direct Product Links for Amazon USA, Amazon India &amp; Walmart.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Every product now directly deep-links to its exact product page on <strong>Amazon USA (amazon.com)</strong> and <strong>Amazon India (amazon.in)</strong>, plus <strong>Walmart</strong> and <strong>Flipkart</strong>. Never get dumped on a generic homepage.
          </p>
        </div>

        <button
          onClick={onOpenLegalShield}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Intermediary Safe Harbor Shield ↗</span>
        </button>
      </div>

      {/* Big Retailer Safe Harbor & Non-Liability Shield Alert */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
        <span className="text-xl">🛡️</span>
        <div>
          <strong className="text-amber-300 block font-bold mb-0.5">
            Intermediary Safe Harbor &amp; Direct Merchant Deep-Links:
          </strong>
          <span>
            SparkDeals indexes verified product links directly on third-party retailer platforms. Radiant Spark LLC carries $0 liability for order fulfillment, delivery, or warranty. All orders are completed safely on official retailer platforms.
          </span>
        </div>
      </div>

      {/* Search & Separate Store Filters */}
      <div className="space-y-3 pt-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals by product name (e.g. iPad, AirPods, Stanley, Solar, GaN, TV)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Store Tabs with separate Amazon India & Amazon USA */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STORE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedFilter === f.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
        {filteredDeals.map((deal) => {
          return (
            <article
              key={deal.id}
              onClick={() => onSelectDealModal(deal)}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between cursor-pointer group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    {deal.merchant.split('/')[0].trim()}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/30">
                    🔥 +{deal.score}° HOT
                  </span>
                </div>

                <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800/80">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded">
                    {deal.discountPercent}% OFF
                  </div>
                </div>

                <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                  {deal.title}
                </h3>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {deal.category === 'energy' || deal.merchant.includes('India')
                      ? `₹${deal.currentPrice.toLocaleString('en-IN')}`
                      : `$${(deal.currentPrice / 100).toFixed(2)}`}
                  </span>
                  <span className="text-xs text-slate-500 line-through font-mono">
                    {deal.category === 'energy' || deal.merchant.includes('India')
                      ? `₹${deal.originalPrice.toLocaleString('en-IN')}`
                      : `$${(deal.originalPrice / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Direct Store Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                {/* Store Action Links: Amazon India vs Amazon USA */}
                <div className="flex items-center gap-1.5">
                  {deal.amazonIndiaUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenStore(deal.amazonIndiaUrl!, e)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="Direct Product Page on Amazon India (amazon.in)"
                    >
                      <span>🇮🇳 Amazon IN</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {deal.amazonUsaUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenStore(deal.amazonUsaUrl!, e)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="Direct Product Page on Amazon USA (amazon.com)"
                    >
                      <span>🇺🇸 Amazon US</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {deal.walmartUrl && !deal.amazonIndiaUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenStore(deal.walmartUrl!, e)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="Direct Product Page on Walmart"
                    >
                      <span>🏬 Walmart</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVoteDeal(deal.id);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 border ${
                      deal.upvoted
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{deal.score}</span>
                  </button>

                  {deal.couponCode && (
                    <button
                      type="button"
                      onClick={(e) => handleCopy(deal.id, deal.couponCode!, e)}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                      {copiedId === deal.id ? 'COPIED' : deal.couponCode}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectDealModal(deal)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white underline ml-auto"
                  >
                    Details
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
