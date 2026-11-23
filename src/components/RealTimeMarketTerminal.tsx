/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowLeftRight,
  Globe,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../data/lifesparkData';

interface LiveQuote {
  symbol: string;
  name: string;
  price: number;
  changePct: number | null;
  currency: '$' | '₹' | '€' | '';
  market: 'US' | 'IN' | 'CRYPTO' | 'FOREX';
  source: string;
  url: string;
}

interface MarketsResponse {
  status: 'online' | 'degraded';
  updatedAt: string;
  fxRates: Record<string, number>;
  fxSource: string;
  quotes: LiveQuote[];
  sources: {
    forex: string;
    equities: string;
    crypto: string;
  };
}

export const RealTimeMarketTerminal: React.FC = () => {
  const [data, setData] = useState<MarketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read-only Supplier & Customer Cross-Border FX Converter state
  const [amountUsd, setAmountUsd] = useState<string>('1000');
  const [targetCurrency, setTargetCurrency] = useState<string>('INR');

  const fetchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/markets/live', { cache: 'no-store' });
      if (!res.ok) throw new Error('Markets API unreachable');
      const json: MarketsResponse = await res.json();
      setData(json);
    } catch {
      setError('Unable to reach /api/markets/live. Please verify server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMarkets();
    const id = setInterval(() => {
      void fetchMarkets();
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const parsedUsd = Math.max(0, Number(amountUsd) || 0);
  const fxRate =
    data?.fxRates?.[targetCurrency] ??
    SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency)?.rateFromUsd ??
    1;
  const convertedValue = parsedUsd * fxRate;
  const targetCfg = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency);

  const equityAndCryptoQuotes = (data?.quotes || []).filter((q) => q.market !== 'FOREX');
  const fxPairs = Object.entries(data?.fxRates || {}).filter(([code]) => code !== 'USD');

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-1">
            <Globe className="w-4 h-4" />
            <span>REAL-TIME MARKET BENCHMARKS &amp; GLOBAL FX SETTLEMENT DESK</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Customer &amp; Supplier Live Market Feed
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {data
              ? `Sources: ${data.sources.forex} · ${data.sources.equities} · ${data.sources.crypto} (Updated ${new Date(
                  data.updatedAt
                ).toLocaleTimeString()})`
              : 'Synchronizing live central bank FX and public market feeds...'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchMarkets()}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Quotes'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* Main Grid: Equities/Crypto Quotes + Interactive FX Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Equities & Crypto Benchmarks */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">US, India Equities &amp; Crypto Spot</span>
            <span>Read-Only Public Quotes</span>
          </div>

          {equityAndCryptoQuotes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              {loading ? 'Loading live equity & crypto quotes...' : 'No equity quotes currently returned by upstream sources.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {equityAndCryptoQuotes.map((q) => {
                const pct = typeof q.changePct === 'number' ? q.changePct : null;
                const isPos = pct === null ? true : pct >= 0;
                return (
                  <a
                    key={q.symbol}
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-white group-hover:text-cyan-300">
                          {q.symbol}
                        </strong>
                        <span className="text-[10px] font-mono text-slate-400">{q.market}</span>
                      </div>
                      <span className="text-xs text-slate-400 block truncate">{q.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{q.source}</span>
                    </div>

                    <div className="text-right font-mono tabular-nums shrink-0">
                      <strong className="text-sm font-black text-white block">
                        {q.currency}
                        {q.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                      {pct !== null && (
                        <span
                          className={`text-[11px] font-bold inline-flex items-center gap-0.5 ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPos ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isPos ? '+' : ''}
                          {pct.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer & Supplier Cross-Border FX Calculator */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <ArrowLeftRight className="w-4 h-4" />
                <span>SUPPLIER &amp; BUYER FX CALCULATOR</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {data?.fxSource || 'Live Spot'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Invoice / Order Amount (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Target Market Currency
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                >
                  {SUPPORTED_CURRENCIES.filter((c) => c.code !== 'USD').map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Estimated Settlement</span>
                <strong className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                  {targetCfg?.symbol || ''}
                  {convertedValue.toLocaleString('en-US', {
                    minimumFractionDigits: targetCfg?.zeroDecimal ? 0 : 2,
                    maximumFractionDigits: targetCfg?.zeroDecimal ? 0 : 2,
                  })}
                </strong>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400 tabular-nums">
                <span className="block text-white font-bold">
                  1 USD = {fxRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {targetCurrency}
                </span>
                <span>Live Reference Rate</span>
              </div>
            </div>

            {/* Live FX Matrix Pills */}
            {fxPairs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                {fxPairs.map(([code, rate]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setTargetCurrency(code)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      targetCurrency === code
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block">USD/{code}</span>
                    <strong className="font-bold tabular-nums">{rate.toFixed(2)}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Read-only reference market data for B2B pricing &amp; customer transparency. This site does not accept brokerage deposits, execute securities trades, or offer prediction betting.{' '}
              <a
                href="https://www.frankfurter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline inline-flex items-center gap-0.5"
              >
                ECB FX Source <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
