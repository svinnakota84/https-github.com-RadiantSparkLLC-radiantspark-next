/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, RefreshCw, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

interface SparkSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshDeals?: () => void;
}

export const SparkSyncModal: React.FC<SparkSyncModalProps> = ({
  isOpen,
  onClose,
  onRefreshDeals,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshingDeals, setRefreshingDeals] = useState(false);
  const [statusData, setStatusData] = useState<{
    healthOk: boolean;
    dealsCount: number;
    dealsLastRefreshed: string | null;
    usdInr: number | null;
    fxSource: string | null;
    brainRuns: number;
    oracleConfigured: boolean;
    geminiConfigured: boolean;
    stripeConfigured: boolean;
  } | null>(null);

  const loadAllStatuses = async () => {
    setLoading(true);
    try {
      const [healthRes, marketsRes, brainRes, stripeRes] = await Promise.all([
        fetch('/api/health', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        fetch('/api/markets/live', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        fetch('/api/brain/status', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        fetch('/api/stripe/config', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      ]);

      setStatusData({
        healthOk: Boolean(healthRes?.status === 'ok'),
        dealsCount: Number(healthRes?.dealsCount) || 0,
        dealsLastRefreshed: healthRes?.lastRefreshedAt || null,
        usdInr: Number(marketsRes?.fxRates?.INR) || null,
        fxSource: marketsRes?.fxSource || null,
        brainRuns: Number(brainRes?.runsCount) || 0,
        oracleConfigured: Boolean(brainRes?.oracleOicConfigured),
        geminiConfigured: Boolean(brainRes?.geminiConfigured),
        stripeConfigured: Boolean(stripeRes?.configured),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadAllStatuses();
    }
  }, [isOpen]);

  const handleSyncDealsNow = async () => {
    setRefreshingDeals(true);
    try {
      await fetch('/api/deals/refresh', { method: 'POST' });
      onRefreshDeals?.();
      await loadAllStatuses();
    } finally {
      setRefreshingDeals(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SparkSync Live Integration Diagnostics"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl bg-slate-950 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        <div className="p-5 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-extrabold text-white">SparkSync Live System Status</h2>
              <p className="text-xs text-slate-400">Real-time backend &amp; API connection inspector</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {loading || !statusData ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Checking live backend integrations...</span>
            </div>
          ) : (
            <div className="space-y-2.5 font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Express Backend &amp; SparkDeals Feed</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {statusData.dealsCount} live offers
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Live Markets &amp; FX ({statusData.fxSource || 'ECB'})</span>
                <span className={statusData.usdInr ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {statusData.usdInr ? `1 USD = ₹${statusData.usdInr.toFixed(2)}` : 'Offline'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>11-Agent Order &amp; Revenue Orchestrator</span>
                <span className="text-cyan-300 font-bold">{statusData.brainRuns} persisted runs</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Gemini 4 Hydrogen AI Engine</span>
                <span className={statusData.geminiConfigured ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {statusData.geminiConfigured ? 'API Key Configured' : 'GEMINI_API_KEY unset'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Stripe Global Checkout</span>
                <span className={statusData.stripeConfigured ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {statusData.stripeConfigured ? 'Live Secret Key Ready' : 'STRIPE_SECRET_KEY unset'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Oracle OIC ERP Webhook</span>
                <span className={statusData.oracleConfigured ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {statusData.oracleConfigured ? 'Webhook Connected' : 'Local Persistent Ledger'}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={refreshingDeals}
              onClick={() => void handleSyncDealsNow()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingDeals ? 'animate-spin' : ''}`} />
              <span>{refreshingDeals ? 'Refreshing Feeds...' : 'Sync Live Deals Now'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
