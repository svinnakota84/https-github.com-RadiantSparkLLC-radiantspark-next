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
  RefreshCw,
  CheckCircle2,
  Tag,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface SparkDealsViewProps {
  deals: DealItem[];
  onVoteDeal: (dealId: string) => void;
  onSelectDealModal: (deal: DealItem) => void;
  onOpenLegalShield: () => void;
}

interface SourceStatus {
  id: string;
  name: string;
  status: 'ok' | 'degraded' | 'error';
  itemCount: number;
  durationMs: number;
  checkedAt: string;
  error?: string;
}

function formatPrice(amount: number, currency: 'USD' | 'INR' = 'USD') {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(min / 60);
  return `${hrs}h ${min % 60}m ago`;
}

export const SparkDealsView: React.FC<SparkDealsViewProps> = ({
  deals: fallbackDeals,
  onVoteDeal,
  onSelectDealModal,
  onOpenLegalShield,
}) => {
  const [dealsList, setDealsList] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'discount' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  const [feedMeta, setFeedMeta] = useState<{
    status: string;
    lastRefreshedAt: string | null;
    lastCheckedLabel: string;
    refreshIntervalMinutes: number;
    freshnessLimitMinutes: number;
    isStale: boolean;
    connectedSources: string[];
    sourcesStatus: SourceStatus[];
    affiliateDisclosure: string;
    isRefreshing: boolean;
    modeLabel: string;
    errorMessage: string | null;
  }>({
    status: 'initializing',
    lastRefreshedAt: null,
    lastCheckedLabel: 'Checking live feeds...',
    refreshIntervalMinutes: 15,
    freshnessLimitMinutes: 360,
    isStale: false,
    connectedSources: [],
    sourcesStatus: [],
    affiliateDisclosure:
      'Disclosure: SparkDeals links directly to third-party retailer offers and deal listings. Some outbound links may contain affiliate tracking parameters at no extra cost to buyers.',
    isRefreshing: false,
    modeLabel: 'Server Live Sync',
    errorMessage: null,
  });

  const applyFeedPayload = (data: any, modeLabel: string) => {
    const incomingDeals: DealItem[] = Array.isArray(data?.deals) ? data.deals : [];
    const lastRefreshed = data?.lastRefreshedAt || new Date().toISOString();
    const isStale = Boolean(data?.isStale);

    setDealsList(isStale ? [] : incomingDeals);
    setFeedMeta((prev) => ({
      ...prev,
      status: data?.status || 'online',
      lastRefreshedAt: lastRefreshed,
      lastCheckedLabel: data?.lastCheckedLabel || formatRelativeTime(lastRefreshed),
      refreshIntervalMinutes: data?.refreshIntervalMinutes || 15,
      freshnessLimitMinutes: data?.freshnessLimitMinutes || 360,
      isStale,
      connectedSources: Array.isArray(data?.connectedSources) ? data.connectedSources : [],
      sourcesStatus: Array.isArray(data?.sourcesStatus) ? data.sourcesStatus : [],
      affiliateDisclosure: data?.affiliateDisclosure || prev.affiliateDisclosure,
      isRefreshing: false,
      modeLabel,
      errorMessage:
        isStale
          ? 'Live deal sources have exceeded the 6-hour freshness limit. Prices are temporarily hidden until sources recover.'
          : data?.status === 'degraded' && incomingDeals.length === 0
          ? 'All upstream retail feeds are temporarily unreachable.'
          : null,
    }));
  };

  const fetchServerDeals = async () => {
    try {
      const res = await fetch('/api/deals', { cache: 'no-store' });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        applyFeedPayload(data, 'Server Scheduled Sync (15m)');
        setIsLoading(false);
        return;
      }
    } catch {
      // Static deploy fallback below
    }

    try {
      const staticRes = await fetch(`./deals-feed.json?t=${Date.now()}`, { cache: 'no-store' });
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        applyFeedPayload(staticData, 'Automated Static Feed (15m GitHub Sync)');
        setIsLoading(false);
        return;
      }
    } catch {
      // No static JSON either
    }

    // Only use fallbackDeals if both live API & static JSON failed completely
    setDealsList(fallbackDeals);
    setFeedMeta((prev) => ({
      ...prev,
      status: 'degraded',
      lastCheckedLabel: 'Live backend unavailable',
      isRefreshing: false,
      modeLabel: 'Fallback Cache',
      errorMessage: 'Could not reach live deal sync endpoint or static feed snapshot.',
    }));
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchServerDeals();
    const interval = setInterval(() => {
      void fetchServerDeals();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualTriggerRefresh = async () => {
    setFeedMeta((prev) => ({ ...prev, isRefreshing: true }));
    try {
      await fetch('/api/deals/refresh', { method: 'POST' });
    } catch {
      // ignore on static host
    }
    await fetchServerDeals();
  };

  const storeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    let blackFridayCount = 0;

    for (const d of dealsList) {
      const store = (d.primaryStore || d.merchant || 'Retailer').trim();
      counts.set(store, (counts.get(store) || 0) + 1);
      if (
        d.isBlackFriday ||
        d.badges?.some((b) => /black friday|thanksgiving|doorbuster|holiday|cyber monday/i.test(b))
      ) {
        blackFridayCount += 1;
      }
    }

    const topStores = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count]) => ({ id: `store:${name}`, label: `${name} (${count})`, storeName: name }));

    return [
      { id: 'all', label: `All Live Deals (${dealsList.length})` },
      { id: 'black_friday', label: `Black Friday 2026 (${blackFridayCount})` },
      ...topStores,
    ];
  }, [dealsList]);

  const CATEGORY_FILTERS = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Tech & Electronics' },
    { id: 'home', label: 'Home, Tools & Garden' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'apparel', label: 'Apparel & Gear' },
    { id: 'energy', label: 'Solar & Clean Energy' },
    { id: 'beverages', label: 'Beverages & Tumblers' },
    { id: 'food', label: 'Kitchen & Foods' },
    { id: 'lifestyle', label: 'Lifestyle & Everyday' },
  ];

  const filteredDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = dealsList.filter((deal) => {
      let matchesFilter = true;
      if (selectedFilter === 'black_friday') {
        matchesFilter =
          Boolean(deal.isBlackFriday) ||
          Boolean(
            deal.badges?.some((b) =>
              /black friday|thanksgiving|doorbuster|holiday|cyber monday/i.test(b)
            )
          );
      } else if (selectedFilter.startsWith('store:')) {
        const targetStore = selectedFilter.slice(6).toLowerCase();
        matchesFilter =
          (deal.primaryStore || '').toLowerCase() === targetStore ||
          deal.merchant.toLowerCase().includes(targetStore);
      }

      const matchesCat = selectedCategory === 'all' || deal.category === selectedCategory;

      const matchesSearch =
        !q ||
        deal.title.toLowerCase().includes(q) ||
        deal.merchant.toLowerCase().includes(q) ||
        deal.description.toLowerCase().includes(q) ||
        (deal.couponCode || '').toLowerCase().includes(q);

      return matchesFilter && matchesCat && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'discount') {
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      }
      if (sortBy === 'price_low') return a.currentPrice - b.currentPrice;
      if (sortBy === 'price_high') return b.currentPrice - a.currentPrice;
      if (sortBy === 'popular') return b.score - a.score;
      const tA = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tB = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tB - tA || b.score - a.score;
    });
  }, [dealsList, selectedFilter, selectedCategory, searchQuery, sortBy]);

  const handleCopyCoupon = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const trackAndOpenDeal = (deal: DealItem, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'deal_click', label: deal.merchant, dealId: deal.id }),
    }).catch(() => {});
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLocalVote = (deal: DealItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setVotedIds((prev) => ({ ...prev, [deal.id]: !prev[deal.id] }));
    onVoteDeal(deal.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Live Scheduled Refresh Telemetry Bar */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs ${
          feedMeta.isStale || feedMeta.status === 'degraded'
            ? 'bg-amber-950/50 border-amber-500/50'
            : 'bg-slate-900/90 border-emerald-500/40'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border font-mono text-[10px] uppercase shrink-0 ${
              feedMeta.isStale
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                feedMeta.isStale ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>{feedMeta.modeLabel}</span>
          </span>

          <span className="text-slate-200 font-medium text-xs">
            Last checked:{' '}
            <strong className="text-emerald-300 font-mono">
              {feedMeta.lastRefreshedAt
                ? `${feedMeta.lastCheckedLabel} (${new Date(feedMeta.lastRefreshedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })})`
                : feedMeta.lastCheckedLabel}
            </strong>{' '}
            · Scheduled sync every {feedMeta.refreshIntervalMinutes}m across{' '}
            {feedMeta.connectedSources.length || 3} live deal feeds (prices verified at check time; not tick-by-tick live checkout quotes)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleManualTriggerRefresh}
            disabled={feedMeta.isRefreshing}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${feedMeta.isRefreshing ? 'animate-spin text-amber-300' : ''}`}
            />
            <span>{feedMeta.isRefreshing ? 'Syncing Live Feeds...' : 'Sync Deals Now'}</span>
          </button>
        </div>
      </div>

      {/* Source Outage / Freshness Alert Banner */}
      {feedMeta.errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-xs text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-white">Feed Freshness / Source Status Notice</strong>
            <span>{feedMeta.errorMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-xl relative overflow-hidden">
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
            <span>SparkDeals Hub · Black Friday &amp; Live Verified Drops 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SparkDeals Live Hub. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 font-serif italic">
              {dealsList.length > 0
                ? `${dealsList.length} Real-Time & Black Friday Offers Synced.`
                : 'Verified Merchant Offers & Black Friday Price Drops.'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Automatically aggregated from <strong>DealNews</strong>, <strong>Slickdeals Frontpage</strong>, and <strong>Black Friday 2026</strong> feeds every 15 minutes with expired offer suppression, deduplication, and direct merchant links. Reference list prices and discount percentages appear only when explicitly provided by the source.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenLegalShield}
          className="relative z-10 self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-slate-900 transition-colors flex items-center gap-1.5 shrink-0 shadow-md"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Intermediary &amp; Affiliate Disclosure ↗</span>
        </button>
      </div>

      {/* Search, Category & Sorting Controls */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search OLED TV, Milwaukee, Amazon, headphones, tools, coupon..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              {CATEGORY_FILTERS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort deals"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="newest">Newest Live Drops</option>
              <option value="discount">Highest Verified Discount %</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Top Community Score</option>
            </select>
          </div>
        </div>

        {/* Store & Black Friday Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          {storeOptions.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedFilter === f.id
                  ? f.id === 'black_friday'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-amber-500 text-slate-950 shadow-md'
                  : f.id === 'black_friday'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Active Source Status Chips */}
        {feedMeta.sourcesStatus.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
            <span className="uppercase tracking-wider text-slate-500">Feeds:</span>
            {feedMeta.sourcesStatus.map((src) => (
              <span
                key={src.id}
                className={`px-2 py-0.5 rounded border ${
                  src.status === 'ok'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {src.name}: {src.status === 'ok' ? `${src.itemCount} offers` : src.error || 'error'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4 space-y-3"
            >
              <div className="h-4 bg-slate-800 rounded w-1/2" />
              <div className="h-32 bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-800 rounded w-5/6" />
              <div className="h-6 bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No matching deals found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {feedMeta.isStale
              ? 'Prices are temporarily paused because cached feeds exceeded the 6-hour freshness limit.'
              : 'Try clearing your search query or selecting All Live Deals above.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
          {filteredDeals.map((deal) => {
            const currency = deal.currency || 'USD';
            const formattedCurrent = formatPrice(deal.currentPrice, currency);
            const hasValidRef =
              typeof deal.originalPrice === 'number' &&
              deal.originalPrice > deal.currentPrice &&
              typeof deal.discountPercent === 'number' &&
              deal.discountPercent > 0;
            const formattedOriginal = hasValidRef
              ? formatPrice(deal.originalPrice!, currency)
              : null;
            const isUpvoted = deal.upvoted || votedIds[deal.id];

            return (
              <article
                key={deal.id}
                onClick={() => onSelectDealModal(deal)}
                className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between cursor-pointer group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border truncate max-w-[65%] ${
                        deal.isBlackFriday
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {deal.isBlackFriday ? 'Black Friday 2026' : deal.primaryStore || deal.merchant}
                    </span>

                    {hasValidRef ? (
                      <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 shrink-0">
                        {deal.discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">
                        {currency} DROP
                      </span>
                    )}
                  </div>

                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full h-full object-contain bg-slate-950 p-1 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/90 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{deal.merchant}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug min-h-[2.2rem]">
                    {deal.title}
                  </h3>

                  <div className="mt-2.5 flex items-baseline gap-2 font-mono">
                    <span className="text-lg font-black text-amber-400">{formattedCurrent}</span>
                    {formattedOriginal && (
                      <span className="text-xs text-slate-500 line-through">{formattedOriginal}</span>
                    )}
                    <span className="text-[10px] text-slate-500 ml-auto">{currency}</span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      {deal.availability || 'Active at check'}
                    </span>
                    {deal.expiresAt && (
                      <span className="inline-flex items-center gap-1 text-amber-300">
                        <Clock className="w-2.5 h-2.5" />
                        Ends {new Date(deal.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {deal.couponCode && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyCoupon(deal.id, deal.couponCode!, e)}
                      className="mt-2 w-full py-1 px-2 rounded-lg bg-slate-950 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 flex items-center justify-between hover:bg-slate-800"
                    >
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Code: {deal.couponCode}
                      </span>
                      {copiedId === deal.id ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Primary View Deal + Store Links */}
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => trackAndOpenDeal(deal, deal.affiliateUrl, e)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <span>View Deal at {deal.merchant}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {(deal.amazonUsaUrl || deal.walmartUrl) && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                      {deal.amazonUsaUrl && (
                        <button
                          type="button"
                          onClick={(e) => trackAndOpenDeal(deal, deal.amazonUsaUrl!, e)}
                          className="flex-1 py-1 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1"
                        >
                          <span>Direct Amazon</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {deal.walmartUrl && (
                        <button
                          type="button"
                          onClick={(e) => trackAndOpenDeal(deal, deal.walmartUrl!, e)}
                          className="flex-1 py-1 px-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1"
                        >
                          <span>Direct Walmart</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={(e) => handleLocalVote(deal, e)}
                      className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 border ${
                        isUpvoted
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{deal.score + (votedIds[deal.id] ? 1 : 0)}</span>
                    </button>

                    <span className="text-slate-500 truncate">{deal.sourceFeed || 'Verified Feed'}</span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDealModal(deal);
                      }}
                      className="text-[11px] font-bold text-slate-300 hover:text-white underline ml-auto"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Footer Affiliate Disclosure */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-center text-xs text-slate-400 leading-relaxed">
        <span>{feedMeta.affiliateDisclosure}</span>
      </div>
    </div>
  );
};
