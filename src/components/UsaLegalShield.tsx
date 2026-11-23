/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, FileText, AlertTriangle, Scale, ExternalLink, ArrowRight } from 'lucide-react';

interface UsaLegalShieldProps {
  onOpenTakedownModal: () => void;
  onSwitchToIndia?: () => void;
}

const US_COVERED_COMPANIES = [
  {
    merchant: 'Amazon.com (Associates US)',
    relationship: 'Affiliate Referral Link / Tracking Tag (?tag=)',
    boundary:
      'Radiant Spark LLC does not set prices, hold inventory, ship products, or service Prime warranties. Per Amazon Associates Operating Agreement guidelines, check live checkout price, stock, and seller terms on amazon.com (prices older than 6h are gated).',
  },
  {
    merchant: 'Walmart.com (Creator / Impact)',
    relationship: 'Affiliate Referral Link (wmlspartner / Impact)',
    boundary:
      'Orders, pickup, shipping, rollback pricing, and return policies are governed exclusively by Walmart Inc. or the listed Walmart Marketplace seller.',
  },
  {
    merchant: 'Best Buy (Affiliate / Impact)',
    relationship: 'Electronics Referral & Direct Link Tracking (mpid)',
    boundary:
      'Geek Squad protection plans, manufacturer warranties, open-box grading, and store pickup terms remain strictly between buyer and Best Buy.',
  },
  {
    merchant: 'Target · Home Depot · Newegg · Costco · eBay · B&H',
    relationship: 'Direct URL / Skimlinks / Sovrn / EPN Attribution',
    boundary:
      'Multi-retailer listings link out to each independent US merchant. No brand endorsement, authorized-dealer warranty, or price match obligation is implied unless backed by a signed written partner contract.',
  },
  {
    merchant: 'Stripe USA (Lifestyle Spark Pro)',
    relationship: 'Hosted PCI SAQ-A Payment Processor',
    boundary:
      'All global credit/debit card details are processed directly by Stripe—never stored on Radiant Spark servers. Subscriptions ($9.99/mo, $149.99/yr) and the $49.99 90-day one-time pass comply with FTC ROSCA transparent cancellation terms.',
  },
  {
    merchant: 'US Vendors, Suppliers & IT Clients',
    relationship: 'Radiant Spark LLC (Wyoming LLC / Georgia Ops)',
    boundary:
      'Direct software consulting (Spark IT), agency commissions, and supplier splits require a written SOW/MSA, W-9 / 1099-NEC tax documentation, product liability indemnification, and executive signature.',
  },
];

export const UsaLegalShield: React.FC<UsaLegalShieldProps> = ({
  onOpenTakedownModal,
  onSwitchToIndia,
}) => {
  const handleJumpToAgreements = () => {
    window.location.hash = 'brain';
  };

  return (
    <section
      id="legal-shield"
      data-jurisdiction="usa"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
    >
      <div
        id="usa-legal-shield"
        className="p-6 sm:p-8 bg-slate-900/95 border border-cyan-500/35 rounded-3xl text-slate-200 space-y-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-cyan-400">
              United States Commercial Shield · Radiant Spark LLC (FTC / DMCA / ROSCA)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              U.S. Legal Shield &amp; Retailer Program Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Supervised by Legal Agent Ananya Iyer &amp; Monetization Architect Kavya Nair — transparent intermediary boundaries across Amazon.com, Walmart, Best Buy, Target, Home Depot, Newegg, Costco, eBay, Stripe, and U.S. IT/vendor contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleJumpToAgreements}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>US Agreements &amp; Commission Test</span>
            </button>
            <button
              type="button"
              onClick={onOpenTakedownModal}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DMCA / Takedown Request</span>
            </button>
            {onSwitchToIndia && (
              <button
                type="button"
                onClick={onSwitchToIndia}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <span>India Legal Shield</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Covered US Companies & Programs Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">
            U.S. Companies, Marketplaces &amp; Merchant Liability Boundaries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {US_COVERED_COMPANIES.map((item) => (
              <article
                key={item.merchant}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-white text-xs leading-snug">{item.merchant}</strong>
                </div>
                <div className="text-[11px] font-mono text-cyan-300">{item.relationship}</div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{item.boundary}</p>
              </article>
            ))}
          </div>
        </div>

        {/* 3 Core US Statutory & Contractual Safeguards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>FTC 16 CFR Part 255 &amp; Price Freshness</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every SparkDeals offer carries a clear material-connection notice. Where an approved tag exists, Radiant Spark LLC may earn a referral fee at zero buyer markup. Upstream feeds older than 6 hours are automatically hidden to prevent stale pricing displays.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Written U.S. SOW, MSA &amp; W-9 Rule</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              No website listing creates a binding US purchase order or consulting obligation. Direct Spark IT Consulting, vendor agency splits, and bulk supply agreements require a signed SOW/MSA, liability caps, insurance verification, and IRS W-9 / 1099-NEC tax records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Scale className="w-4 h-4 shrink-0" />
              <span>Honest Statutory Boundaries &amp; DMCA § 512</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              No blanket lawsuit immunity is claimed. U.S. federal/state consumer protection laws and FTC ROSCA subscription rules remain in force, Section 230 protections are conditional, and lifestyle coaching is educational rather than FDA/medical care.
            </p>
          </div>
        </div>

        {/* Privacy & Link Hygiene Notice */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Do not submit Social Security numbers, bank account credentials, raw card numbers, or protected health records through public inquiry forms. Report trademark, copyright (DMCA 17 U.S.C. § 512), or retailer listing inaccuracies directly via the Takedown Request desk.
          </p>
          <a
            className="inline-flex items-center gap-1.5 underline text-cyan-300 hover:text-cyan-200 font-semibold shrink-0 whitespace-nowrap"
            href="./business-readiness.html"
          >
            <span>US &amp; India Readiness Controls</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
