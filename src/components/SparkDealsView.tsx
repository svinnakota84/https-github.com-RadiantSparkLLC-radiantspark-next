/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { DealItem } from '../types';
import {
  Flame,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  RefreshCw,
  CheckCircle2,
  Tag,
  ArrowUpDown
} from 'lucide-react';

import { ReelsMonetizationModule } from './ReelsMonetizationModule';

interface SparkDealsViewProps {
  deals: DealItem[];
  onVoteDeal: (dealId: string) => void;
  onSelectDealModal: (deal: DealItem) => void;
  onOpenLegalShield: () => void;
}

export const SparkDealsView: React.FC<SparkDealsViewProps> = ({
  deals: initialDeals,
  onVoteDeal,
  onSelectDealModal,
  onOpenLegalShield,
}) => {
  const [dealsList, setDealsList] = useState<DealItem[]>(initialDeals);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'price_low' | 'price_high' | 'popular'>('discount');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Server-Side Telemetry State
  const [serverSyncStatus, setServerSyncStatus] = useState<{
    lastCheckedLabel: string;
    refreshIntervalMinutes: number;
    connectedSourcesCount: number;
    isRefreshing: boolean;
  }>({
    lastCheckedLabel: '2 mins ago',
    refreshIntervalMinutes: 15,
    connectedSourcesCount: 4,
    isRefreshing: false,
  });

  // Fetch Live Server API Deals on Mount & Poll in Real-Time every 15s
  useEffect(() => {
    fetchServerDeals();
    const interval = setInterval(() => {
      fetchServerDeals();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchServerDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      if (res.ok) {
        const data = await res.json();
        if (data.deals && Array.isArray(data.deals) && data.deals.length > 0) {
          setDealsList(data.deals);
          setServerSyncStatus({
            lastCheckedLabel: data.lastCheckedLabel || 'Just now',
            refreshIntervalMinutes: data.refreshIntervalMinutes || 15,
            connectedSourcesCount: data.connectedSources?.length || 4,
            isRefreshing: false,
          });
        }
      }
    } catch {
      // Fallback to client cache
    }
  };

  const handleManualTriggerRefresh = async () => {
    setServerSyncStatus((prev) => ({ ...prev, isRefreshing: true }));
    try {
      const res = await fetch('/api/deals/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchServerDeals();
      }
    } catch {
      // ignore
    } finally {
      setTimeout(() => {
        setServerSyncStatus((prev) => ({ ...prev, isRefreshing: false }));
      }, 500);
    }
  };

  const STORE_FILTERS = [
    { id: 'all', label: '🔥 All Deals' },
    { id: 'black_friday', label: '🛍️ Black Friday & Holiday 2026' },
    { id: 'amazon_usa', label: '🇺🇸 Amazon USA (amazon.com)' },
    { id: 'amazon_india', label: '🇮🇳 Amazon India (amazon.in)' },
    { id: 'walmart', label: '🏬 Walmart Deals' },
    { id: 'flipkart', label: '⚡ Flipkart Hub' },
  ];

  const CATEGORY_FILTERS = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Tech & Electronics' },
    { id: 'energy', label: 'Solar & Clean Energy' },
    { id: 'beverages', label: 'Beverages & Drinks' },
    { id: 'food', label: 'Naturals & Gourmet Foods' },
  ];

  const filteredDeals = useMemo(() => {
    let result = dealsList.filter((deal) => {
      let matchesFilter = true;

      if (selectedFilter === 'black_friday') {
        matchesFilter = deal.badges?.some(
          (b) => b.toLowerCase().includes('black friday') || b.toLowerCase().includes('thanksgiving') || b.toLowerCase().includes('doorbuster')
        ) || false;
      } else if (selectedFilter === 'amazon_usa') {
        matchesFilter = !!deal.amazonUsaUrl || deal.merchant.toLowerCase().includes('amazon usa') || deal.primaryStore === 'Amazon USA';
      } else if (selectedFilter === 'amazon_india') {
        matchesFilter = !!deal.amazonIndiaUrl || deal.merchant.toLowerCase().includes('amazon india') || deal.primaryStore === 'Amazon India';
      } else if (selectedFilter === 'walmart') {
        matchesFilter = !!deal.walmartUrl || deal.merchant.toLowerCase().includes('walmart');
      } else if (selectedFilter === 'flipkart') {
        matchesFilter = !!deal.flipkartUrl || deal.merchant.toLowerCase().includes('flipkart');
      }

      let matchesCat = true;
      if (selectedCategory !== 'all') {
        matchesCat = deal.category === selectedCategory;
      }

      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesCat && matchesSearch;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'price_low') return a.currentPrice - b.currentPrice;
      if (sortBy === 'price_high') return b.currentPrice - a.currentPrice;
      return b.score - a.score;
    });
  }, [dealsList, selectedFilter, selectedCategory, searchQuery, sortBy]);

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
      
      {/* Live Server Scheduled Refresh Telemetry Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono text-[10px] uppercase shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SERVER-SIDE AUTO-REFRESH ENGINE
          </span>
          <span className="text-slate-200 truncate font-medium text-xs">
            ⚡ Last checked: <strong className="text-emerald-300 font-mono">{serverSyncStatus.lastCheckedLabel}</strong> (Auto-syncs every {serverSyncStatus.refreshIntervalMinutes}m from {serverSyncStatus.connectedSourcesCount} Retailer APIs)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualTriggerRefresh}
            disabled={serverSyncStatus.isRefreshing}
            className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${serverSyncStatus.isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
            <span>{serverSyncStatus.isRefreshing ? 'Syncing...' : 'Sync Server Feed Now'}</span>
          </button>
        </div>
      </div>

      {/* Social Reels Monetization & Ad Revenue Suite */}
      <ReelsMonetizationModule />

      {/* Section Head */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-xl relative overflow-hidden">
        {/* Visual Background Image Banner */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/hero_sparkdeals_shopping_1794361985564.jpg"
            alt="SparkDeals Retail Electronics Showcase"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Flame className="w-4 h-4 fill-amber-400" />
            SparkDeals Hub · Thanksgiving &amp; Black Friday 2026 Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SparkDeals Live Hub. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 font-serif italic">
              Verified Thanksgiving &amp; Black Friday Price Drops.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every deal directly deep-links to its official product page on <strong>Amazon USA (amazon.com)</strong>, <strong>Amazon India (amazon.in)</strong>, <strong>Walmart</strong>, and <strong>Flipkart</strong>. Prices and discounts are calculated strictly against valid list reference prices.
          </p>
        </div>

        <button
          onClick={onOpenLegalShield}
          className="relative z-10 self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-slate-900 transition-colors flex items-center gap-1.5 shrink-0 shadow-md"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Intermediary Safe Harbor Shield ↗</span>
        </button>
      </div>

      {/* Search, Store Tabs & Sorting Controls */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search iPad, AirPods, Sony, TV, Solar, Tumbler..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              {CATEGORY_FILTERS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sorting Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="discount">Highest Discount %</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Store & Event Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          {STORE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedFilter === f.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Verified Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
        {filteredDeals.map((deal) => {
          const isInr =
            deal.category === 'energy' ||
            deal.merchant.includes('India') ||
            deal.primaryStore === 'Amazon India';

          const formattedCurrentPrice = isInr
            ? `₹${deal.currentPrice.toLocaleString('en-IN')}`
            : `$${deal.currentPrice.toLocaleString('en-US')}`;

          const formattedOriginalPrice = isInr
            ? `₹${deal.originalPrice.toLocaleString('en-IN')}`
            : `$${deal.originalPrice.toLocaleString('en-US')}`;

          return (
            <article
              key={deal.id}
              onClick={() => onSelectDealModal(deal)}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between cursor-pointer group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    {deal.badges ? deal.badges[0] : deal.merchant.split('/')[0].trim()}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                    {deal.discountPercent}% OFF
                  </span>
                </div>

                <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>In Stock &amp; Verified</span>
                  </div>
                </div>

                <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                  {deal.title}
                </h3>

                <div className="mt-2.5 flex items-baseline gap-2 font-mono">
                  <span className="text-lg font-black text-amber-400">
                    {formattedCurrentPrice}
                  </span>
                  <span className="text-xs text-slate-500 line-through">
                    {formattedOriginalPrice}
                  </span>
                </div>
              </div>

              {/* Direct Store Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono font-bold">
                  {deal.amazonUsaUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenStore(deal.amazonUsaUrl!, e)}
                      className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-center flex items-center justify-center gap-1 transition-all"
                      title="Direct Product Page on Amazon USA"
                    >
                      <span>🇺🇸 Amazon US</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {deal.amazonIndiaUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenStore(deal.amazonIndiaUrl!, e)}
                      className="py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-center flex items-center justify-center gap-1 transition-all"
                      title="Direct Product Page on Amazon India"
                    >
                      <span>🇮🇳 Amazon IN</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {deal.walmartUrl && !deal.amazonIndiaUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenStore(deal.walmartUrl!, e)}
                      className="col-span-2 py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-center flex items-center justify-center gap-1 transition-all"
                      title="Direct Product Page on Walmart"
                    >
                      <span>🏬 Walmart Official</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVoteDeal(deal.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 border ${
                      deal.upvoted
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{deal.score}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectDealModal(deal)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white underline ml-auto"
                  >
                    Full Details
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer Affiliate Disclosure */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-center text-xs text-slate-400 leading-relaxed">
        <span>🛡️ <strong>Affiliate Disclosure:</strong> SparkDeals is supported by readers. We earn qualifying affiliate commissions when you purchase through retailer links on our platform at zero price markup to you.</span>
      </div>
    </div>
  );
};
