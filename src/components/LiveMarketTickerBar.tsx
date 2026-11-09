/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, Activity } from 'lucide-react';

interface TickerQuote {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  currency: '$' | '₹';
  market: 'US' | 'IN' | 'CRYPTO' | 'FOREX';
  url: string;
}

const INITIAL_QUOTES: TickerQuote[] = [
  { symbol: 'ORCL', name: 'Oracle Corp', price: 188.40, changePct: 2.15, currency: '$', market: 'US', url: 'https://www.nasdaq.com/market-activity/stocks/orcl' },
  { symbol: 'NVDA', name: 'NVIDIA AI', price: 148.20, changePct: 3.40, currency: '$', market: 'US', url: 'https://www.nasdaq.com/market-activity/stocks/nvda' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 208.60, changePct: 2.20, currency: '$', market: 'US', url: 'https://www.nasdaq.com/market-activity/stocks/amzn' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 242.80, changePct: 1.10, currency: '$', market: 'US', url: 'https://www.nasdaq.com/market-activity/stocks/aapl' },
  { symbol: 'S&P 500', name: 'US Index', price: 5920.40, changePct: 0.75, currency: '$', market: 'US', url: 'https://www.nasdaq.com/market-activity/index/spx' },
  { symbol: 'NIFTY 50', name: 'NSE India', price: 24350.20, changePct: 0.85, currency: '₹', market: 'IN', url: 'https://www.nseindia.com/market-data/live-equity-market' },
  { symbol: 'RELIANCE', name: 'Reliance Ind', price: 1274.50, changePct: 1.45, currency: '₹', market: 'IN', url: 'https://www.nseindia.com/get-quotes/equity?symbol=RELIANCE' },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 4120.00, changePct: 0.95, currency: '₹', market: 'IN', url: 'https://www.nseindia.com/get-quotes/equity?symbol=TCS' },
  { symbol: 'USD/INR', name: 'Forex Spot', price: 84.32, changePct: -0.08, currency: '₹', market: 'FOREX', url: 'https://www.tradingview.com/symbols/USDINR/' },
  { symbol: 'BTC/USD', name: 'Bitcoin Spot', price: 94850.00, changePct: 3.20, currency: '$', market: 'CRYPTO', url: 'https://www.coinbase.com/price/bitcoin' },
];

export const LiveMarketTickerBar: React.FC = () => {
  const [quotes, setQuotes] = useState<TickerQuote[]>(INITIAL_QUOTES);

  // Live price fluctuation simulation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuotes((prev) =>
        prev.map((item) => {
          const deltaPct = (Math.random() - 0.48) * 0.3; // subtle random movement
          const newPrice = Math.max(0.1, item.price * (1 + deltaPct / 100));
          const newChange = item.changePct + deltaPct * 0.2;
          return {
            ...item,
            price: Number(newPrice.toFixed(2)),
            changePct: Number(newChange.toFixed(2)),
          };
        })
      );
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 border-y border-slate-800/80 overflow-hidden relative select-none font-mono text-xs z-30">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Left Badge */}
        <div className="z-10 bg-slate-950/95 pr-3 pl-3 py-2 border-r border-slate-800 flex items-center gap-2 shrink-0 shadow-lg">
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>REAL-TIME MARKETS</span>
          </div>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="overflow-hidden whitespace-nowrap flex-1 py-1.5 relative">
          <div className="inline-flex items-center gap-6 animate-ticker hover:[animation-play-state:paused]">
            {quotes.concat(quotes).map((q, idx) => {
              const isPos = q.changePct >= 0;
              return (
                <a
                  key={`${q.symbol}-${idx}`}
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs transition-all hover:scale-105 ${
                    isPos
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:border-rose-400'
                  }`}
                  title={`View live market activity for ${q.name}`}
                >
                  <span className="font-extrabold text-white tracking-tight">{q.symbol}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{q.name}</span>
                  <span className="font-bold text-white font-mono">
                    {q.currency}{q.price.toLocaleString()}
                  </span>
                  <span className="font-bold flex items-center gap-0.5 font-mono">
                    {isPos ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                    <span>{isPos ? '+' : ''}{q.changePct.toFixed(2)}%</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right External Link */}
        <a
          href="https://www.nasdaq.com/market-activity"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-l border-slate-800 text-[11px] font-bold shrink-0 transition-colors"
        >
          <span>Nasdaq Live</span>
          <ExternalLink className="w-3 h-3 text-blue-400" />
        </a>
      </div>
    </div>
  );
};
