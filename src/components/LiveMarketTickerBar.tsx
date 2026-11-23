/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw } from 'lucide-react';
import { TradingViewLegalDisclaimerModal } from './TradingViewLegalDisclaimerModal';

interface TickerQuote {
  symbol: string;
  name: string;
  price: number;
  changePct: number | null;
  currency: '$' | '₹' | '€' | '';
  market: 'US' | 'IN' | 'CRYPTO' | 'FOREX';
  source?: string;
  url: string;
}

export const LiveMarketTickerBar: React.FC = () => {
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'offline'>('loading');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  const loadLiveMarkets = async () => {
    try {
      const res = await fetch('/api/markets/live', { cache: 'no-store' });
      if (!res.ok) throw new Error('Markets API returned non-OK');
      const data = await res.json();
      const incoming: TickerQuote[] = Array.isArray(data?.quotes) ? data.quotes : [];
      if (incoming.length > 0) {
        setQuotes(incoming);
        setUpdatedAt(data.updatedAt || new Date().toISOString());
        setStatus('live');
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus((prev) => (prev === 'live' ? 'live' : 'offline'));
    }
  };

  useEffect(() => {
    void loadLiveMarkets();
    const interval = setInterval(() => {
      void loadLiveMarkets();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="bg-slate-950 border-y border-slate-800/80 overflow-hidden relative select-none font-mono text-xs z-30">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Left Status Badge */}
          <div className="z-10 bg-slate-950/95 pr-3 pl-3 py-2 border-r border-slate-800 flex items-center gap-2 shrink-0 shadow-lg">
            <div
              className={`flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                status === 'live'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  : status === 'loading'
                  ? 'bg-slate-900 text-slate-300 border-slate-700'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              }`}
              title={updatedAt ? `Last market sync: ${new Date(updatedAt).toLocaleTimeString()}` : undefined}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === 'live'
                    ? 'bg-emerald-400 animate-pulse'
                    : status === 'loading'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              <span>
                {status === 'live'
                  ? 'LIVE MARKETS'
                  : status === 'loading'
                  ? 'SYNCING...'
                  : 'MARKETS OFFLINE'}
              </span>
            </div>
          </div>

          {/* Scrolling Real Quotes Track */}
          <div className="overflow-hidden whitespace-nowrap flex-1 py-1.5 relative">
            {quotes.length === 0 ? (
              <div className="px-4 py-1 text-[11px] text-slate-400 flex items-center gap-3">
                <span>
                  {status === 'loading'
                    ? 'Fetching live quotes from Frankfurter ECB, Yahoo Finance & CoinGecko...'
                    : 'Live market feeds are temporarily unavailable.'}
                </span>
                {status === 'offline' && (
                  <button
                    type="button"
                    onClick={() => void loadLiveMarkets()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px]"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-6 animate-ticker hover:[animation-play-state:paused]">
                {quotes.concat(quotes).map((q, idx) => {
                  const pct = typeof q.changePct === 'number' ? q.changePct : null;
                  const isPos = pct === null ? true : pct >= 0;
                  return (
                    <a
                      key={`${q.symbol}-${idx}`}
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs transition-all hover:scale-105 ${
                        pct === null
                          ? 'bg-slate-900/70 border-slate-700/80 text-cyan-200 hover:border-cyan-400'
                          : isPos
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:border-rose-400'
                      }`}
                      title={`${q.name} (${q.source || 'Live Feed'})`}
                    >
                      <span className="font-extrabold text-white tracking-tight">{q.symbol}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">{q.name}</span>
                      <span className="font-bold text-white font-mono tabular-nums">
                        {q.currency}
                        {q.price.toLocaleString(undefined, {
                          minimumFractionDigits: q.price < 10 ? 4 : 2,
                          maximumFractionDigits: q.price < 10 ? 4 : 2,
                        })}
                      </span>
                      {pct !== null && (
                        <span className="font-bold flex items-center gap-0.5 font-mono tabular-nums">
                          {isPos ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                          )}
                          <span>
                            {isPos ? '+' : ''}
                            {pct.toFixed(2)}%
                          </span>
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action: Legal Shield & Source Attribution */}
          <div className="flex items-center shrink-0 border-l border-slate-800">
            <button
              type="button"
              onClick={() => setIsLegalModalOpen(true)}
              className="px-3 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border-r border-slate-800 text-[11px] font-bold transition-colors flex items-center gap-1.5"
              title="View Market Data Safe Harbor Legal Disclaimer"
            >
              <span>⚖️</span>
              <span className="hidden lg:inline">Market Legal Shield</span>
              <span className="lg:hidden">Legal</span>
            </button>

            <a
              href="https://www.frankfurter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold transition-colors"
              title="ECB Reference Exchange Rates & Public Market Data"
            >
              <span>Live Benchmark</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>
          </div>
        </div>
      </div>

      <TradingViewLegalDisclaimerModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </>
  );
};
