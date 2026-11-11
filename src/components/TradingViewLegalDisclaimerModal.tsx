/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Scale, ExternalLink, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface TradingViewLegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradingViewLegalDisclaimerModal: React.FC<TradingViewLegalDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="TradingView & Market Data Safe Harbor Legal Shield"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-slate-950 border border-purple-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 font-bold shadow-md">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">
                  TradingView &amp; Market Data Legal Shield
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  STATUTORY IMMUNITY ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Safe Harbor Protection &amp; Financial Market Data Attribution Policy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          
          {/* Executive Legal Shield Statement */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-purple-300 uppercase text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Corporation Liability Waiver &amp; Indemnification Notice</span>
            </div>
            <p className="text-[11px] text-slate-200">
              This statutory legal shield protects <strong className="text-white">Radiant Spark LLC (USA)</strong> and <strong className="text-white">RDNT Sparkle Industries LLP (India)</strong>, their directors, employees, and technological infrastructure from any claims, suits, or financial damages arising from market ticker displays, stock quotes, or TradingView data integrations.
            </p>
          </div>

          {/* Section 1: TradingView Data & Attribution Policy */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>1. TradingView &amp; Market Data Attribution</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Market data quotes, stock symbols (ORCL, NVDA, AMZN, AAPL, S&amp;P 500, NIFTY 50, USD/INR, BTC/USD), and financial tickers displayed on this platform are aggregated for educational software demonstration and real-time visualization purposes only in accordance with <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">TradingView Inc.</a> public guidelines.
            </p>
          </div>

          {/* Section 2: Non-Investment Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>2. No Financial, SEBI, or SEC Advisory Role</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Neither Radiant Spark LLC nor RDNT Sparkle Industries LLP operates as a registered broker-dealer, investment advisor, SEBI-registered research analyst, or SEC registered investment entity. No ticker display, calculation, or market indicator constitutes financial advice, stock recommendation, or solicitation to execute security transactions.
            </p>
          </div>

          {/* Section 3: Third-Party Trademark Ownership */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>3. Trademark Ownership &amp; IP Protection</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              TradingView®, Nasdaq®, S&amp;P 500®, NIFTY 50®, and all listed corporate symbols are registered trademarks of TradingView Inc., Nasdaq Inc., S&amp;P Dow Jones Indices LLC, National Stock Exchange of India Ltd., and their respective parent organizations. The inclusion of public symbols on this website does not imply endorsement, affiliation, sponsorship, or licensing partnerships.
            </p>
          </div>

          {/* Section 4: Section 79 IT Act 2000 & US 47 U.S.C. § 230 Immunity */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>4. Intermediary Safe Harbor Statutory Immunity</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Under Section 79 of the Indian Information Technology Act 2000 and Section 230 of the United States Communications Decency Act (47 U.S.C. § 230), the company maintains full statutory immunity as an automated platform intermediary. We accept zero liability for price discrepancies, execution delays, or third-party data latency.
            </p>
          </div>

          {/* Direct External Links */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 font-mono text-xs">
            <a
              href="https://www.tradingview.com/gopro/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold flex items-center justify-center gap-1.5"
            >
              <span>TradingView Official Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg"
            >
              <span>Acknowledge &amp; Close Shield</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
