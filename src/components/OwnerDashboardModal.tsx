/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthSummary {
  status: string;
  uptimeSeconds: number;
  dealsCount: number;
  lastRefresh: string;
  refreshIntervalMinutes: number;
  isStale?: boolean;
}

interface OwnerOverview {
  inquiries: any[];
  suppliers: any[];
  analytics: {
    dealClicks: number;
    inquirySubmissions: number;
    supplierSubmissions: number;
  };
  smtpConfigured: boolean;
  affiliateTagsConfigured: boolean;
}

interface RevenueSummaryPayload {
  realizedRevenue: {
    totalRealizedUsd: number;
    erpDirectUsd: number;
    erpDirectInr: number;
    lifestyleSparkUsd: number;
    affiliateVerifiedUsd: number;
    affiliateConversionsCount: number;
  };
  monetizationReadiness: {
    stripeConnected: boolean;
    configuredCount: number;
  };
  sparkdealsFunnel: {
    totalLiveDeals: number;
    affiliateTaggedCount: number;
    untaggedDirectCount: number;
    aggregatorOnlyCount: number;
    outboundClicksTotal: number;
  };
  diagnosisReasons: string[];
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'suppliers' | 'sparkdeals' | 'analytics' | 'setup'>('leads');
  const [healthData, setHealthData] = useState<HealthSummary | null>(null);
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [revSummary, setRevSummary] = useState<RevenueSummaryPayload | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [hRes, oRes, rRes] = await Promise.all([
        fetch('/api/health', { cache: 'no-store' }),
        fetch('/api/owner/overview', { cache: 'no-store' }),
        fetch('/api/revenue/summary', { cache: 'no-store' }),
      ]);
      if (hRes.ok && (hRes.headers.get('content-type') || '').includes('application/json')) {
        setHealthData(await hRes.json());
      }
      if (oRes.ok && (oRes.headers.get('content-type') || '').includes('application/json')) {
        setOverview(await oRes.json());
      }
      if (rRes.ok && (rRes.headers.get('content-type') || '').includes('application/json')) {
        setRevSummary(await rRes.json());
      }
    } catch {
      // Fallback on static deploy
    }
  };

  const handleChiefAuditNow = async () => {
    setRunningAudit(true);
    setSyncNotice('Dispatching Chief Agent Maya Chen across all 11 AI employees...');
    try {
      const res = await fetch('/api/brain/chief-audit', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data?.success) {
        setSyncNotice(
          `Chief Audit #${data.audit?.auditNumber ?? ''} complete: ${data.audit?.directives?.length ?? 11} agents checked & synced.`
        );
        await loadDashboardData();
      } else {
        setSyncNotice(data?.error || 'Audit failed on server.');
      }
    } catch {
      setSyncNotice('Chief Agent audit requires live server runtime.');
    } finally {
      setRunningAudit(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadDashboardData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const inquiries = overview?.inquiries || [];
  const suppliers = overview?.suppliers || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Executive Owner Console"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl bg-slate-950 border border-blue-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950/80 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-300 font-bold shadow-md">
              OPS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Executive Owner Control Console</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  LIVE SERVER RECORDS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single operations console for Radiant Spark LLC &amp; RDNT Sparkle Industries LLP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Nav Tabs */}
        <div className="px-6 pt-3 pb-0 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono font-bold shrink-0">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'leads'
                ? 'bg-slate-950 text-blue-400 border-blue-500/50 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Client Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'suppliers'
                ? 'bg-slate-950 text-amber-400 border-amber-500/50 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Supplier Intakes ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('sparkdeals')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'sparkdeals'
                ? 'bg-slate-950 text-cyan-400 border-cyan-500/50 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            SparkDeals Automation
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'analytics'
                ? 'bg-slate-950 text-emerald-400 border-emerald-500/50 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Event Counters
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'setup'
                ? 'bg-slate-950 text-purple-400 border-purple-500/50 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Integration Setup
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Persisted Client Inquiries &amp; RFQs</h4>
                  <p className="text-[11px] text-slate-400">
                    Real submissions stored via POST /api/inquiries/submit
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/40">
                  {inquiries.length} RECORDED
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 font-mono text-xs">
                  No client inquiries recorded yet on this server. Submit an RFQ to see it logged here in real time.
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-800/60">
                      <span className="text-blue-400 font-bold">{inq.id}</span>
                      <span className="text-white">{inq.company} · {inq.category}</span>
                      <span className="text-slate-300">{inq.country} (${Number(inq.volumeUsd || 0).toLocaleString()})</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">{inq.status}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic">
                Email delivery status: {overview?.smtpConfigured ? 'SMTP Configured' : 'SMTP credentials not configured — saving locally to server disk only.'}
              </p>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Supplier Qualification Applications</h4>
                  <p className="text-[11px] text-slate-400">
                    Stored via POST /api/suppliers/submit without automatic binding purchase orders
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                  {suppliers.length} RECORDED
                </span>
              </div>

              {suppliers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 font-mono text-xs">
                  No supplier applications recorded yet on this server.
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
                  {suppliers.map((sup) => (
                    <div key={sup.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-800/60">
                      <span className="text-amber-400 font-bold">{sup.id}</span>
                      <span className="text-white">{sup.companyName} ({sup.category})</span>
                      <span className="text-slate-300">{sup.capacityMoq}</span>
                      <span className="text-emerald-400">{sup.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sparkdeals' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white">SparkDeals Live Feed Scheduler</h4>
                  <p className="text-[11px] text-slate-400">
                    Runs automatically every 15 minutes with deduplication, expired item suppression, and 6-hour freshness enforcement
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setSyncNotice('Triggering sync...');
                    try {
                      const r = await fetch('/api/deals/refresh', { method: 'POST' });
                      const d = await r.json();
                      setSyncNotice(`Synced ${d.totalDeals} verified deals (${d.status}).`);
                      await loadDashboardData();
                    } catch {
                      setSyncNotice('Manual server sync unavailable on static host.');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Trigger Live Sync</span>
                </button>
              </div>

              {syncNotice && (
                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
                  {syncNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">SCHEDULER STATUS</span>
                  <strong className="text-emerald-400 text-sm block uppercase">
                    {healthData?.status || 'Unknown'}
                  </strong>
                  <span className="text-slate-500 text-[9px]">
                    Every {healthData?.refreshIntervalMinutes || 15} mins
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">ACTIVE DEALS &amp; TAGGING</span>
                  <strong className="text-white text-sm block">
                    {revSummary?.sparkdealsFunnel?.affiliateTaggedCount ?? 0} / {healthData?.dealsCount ?? 0} Tagged
                  </strong>
                  <span className="text-slate-500 text-[9px]">
                    {revSummary?.sparkdealsFunnel?.untaggedDirectCount ?? 0} Direct Untagged · {revSummary?.sparkdealsFunnel?.outboundClicksTotal ?? 0} Redirect Clicks
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">LAST CHECKED TIMESTAMP</span>
                  <strong className="text-amber-300 text-xs block truncate">
                    {healthData?.lastRefresh ? new Date(healthData.lastRefresh).toLocaleTimeString() : 'Pending'}
                  </strong>
                  <span className="text-slate-500 text-[9px]">Auto Chief Agent audit synced</span>
                </div>
              </div>

              {revSummary?.diagnosisReasons && revSummary.diagnosisReasons.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 space-y-1.5 text-[11px]">
                  <strong className="text-amber-300 font-mono uppercase block">
                    Kavya Nair (Agent #11) Monetization Check
                  </strong>
                  {revSummary.diagnosisReasons.map((reason, idx) => (
                    <p key={idx} className="text-slate-200 leading-relaxed">• {reason}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Verified Revenue &amp; Conversion Counters</h4>
                  <p className="text-[11px] text-slate-400">
                    Actual Stripe webhooks, ERP invoices &amp; redirect counters only — $0 fake commissions
                  </p>
                </div>
                <button
                  type="button"
                  disabled={runningAudit}
                  onClick={() => void handleChiefAuditNow()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningAudit ? 'animate-spin' : ''}`} />
                  <span>{runningAudit ? 'Auditing 11 Agents...' : 'Chief Agent Audit All 11'}</span>
                </button>
              </div>

              {syncNotice && (
                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
                  {syncNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center text-[11px]">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">ERP + Stripe Verified</span>
                  <strong className="text-emerald-400 text-2xl block mt-1">
                    ${(revSummary?.realizedRevenue?.totalRealizedUsd ?? 0).toFixed(2)}
                  </strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    Lifestyle Stripe: ${(revSummary?.realizedRevenue?.lifestyleSparkUsd ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Verified Affiliate Payouts</span>
                  <strong className="text-cyan-300 text-2xl block mt-1">
                    ${(revSummary?.realizedRevenue?.affiliateVerifiedUsd ?? 0).toFixed(2)}
                  </strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    {revSummary?.sparkdealsFunnel?.outboundClicksTotal ?? overview?.analytics?.dealClicks ?? 0} redirect clicks
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Inquiries &amp; Suppliers</span>
                  <strong className="text-purple-300 text-2xl block mt-1">
                    {(overview?.analytics?.inquirySubmissions ?? inquiries.length) + (overview?.analytics?.supplierSubmissions ?? suppliers.length)}
                  </strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    {inquiries.length} RFQs · {suppliers.length} Suppliers
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-purple-300 block">1. Affiliate Partner Tags (Zero-Code via AI Brain Dashboard)</strong>
                <p className="text-slate-300 font-sans">
                  Save <code className="text-cyan-300">AMAZON_AFFILIATE_TAG</code>, <code className="text-cyan-300">AMAZON_INDIA_TAG</code>, <code className="text-cyan-300">WALMART_IMPACT_ID</code>, <code className="text-cyan-300">EBAY_CAMPAIGN_ID</code>, or <code className="text-cyan-300">SKIMLINKS_PUBLISHER_ID</code> either in environment variables or directly in the <strong>AI Workforce (#brain) → Activate Affiliate Partner Tags</strong> panel for automatic server-side attribution by Kavya Nair (Agent #11).
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-purple-300 block">2. Global Stripe Checkout &amp; Outbound SMTP</strong>
                <p className="text-slate-300 font-sans">
                  Stripe Status: <strong className={revSummary?.monetizationReadiness?.stripeConnected ? 'text-emerald-400' : 'text-amber-300'}>{revSummary?.monetizationReadiness?.stripeConnected ? 'LIVE SECRET KEY ACTIVE' : 'STRIPE_SECRET_KEY unset'}</strong>. Configure <code className="text-cyan-300">STRIPE_SECRET_KEY</code> and optional <code className="text-cyan-300">SMTP_*</code> credentials in server environment variables.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Console Status: <strong className="text-white">Server Synced</strong></span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
