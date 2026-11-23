/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, FileText, AlertTriangle, Scale, ExternalLink } from 'lucide-react';

interface IndiaLegalShieldProps {
  onOpenTakedownModal: () => void;
  onOpenBrainAgreements?: () => void;
  onSwitchToUsaLegalShield?: () => void;
}

export const IndiaLegalShield: React.FC<IndiaLegalShieldProps> = ({
  onOpenTakedownModal,
  onOpenBrainAgreements,
  onSwitchToUsaLegalShield,
}) => {
  const handleJumpToAgreements = () => {
    if (onOpenBrainAgreements) {
      onOpenBrainAgreements();
    } else {
      window.location.hash = 'brain';
    }
  };

  return (
    <section
      id="legal-shield"
      data-jurisdiction="india"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
    >
      <div
        id="india-legal-shield"
        className="p-6 sm:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl text-slate-200 space-y-6 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>INDIA COMMERCIAL SHIELDS &amp; STATUTORY DISCLOSURES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Customer, Supplier &amp; Revenue Agreement Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Supervised by Legal Agent Ananya Iyer, B2B Lead Arjun Reddy &amp; Monetization Architect Kavya Nair — transparent intermediary boundaries across RDNT Sparkle Industries LLP (India) and Radiant Spark LLC (USA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleJumpToAgreements}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft Vendor Agreement &amp; Test Flows</span>
            </button>
            <button
              type="button"
              onClick={onOpenTakedownModal}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Notice / Takedown Request</span>
            </button>
            {onSwitchToUsaLegalShield && (
              <button
                type="button"
                onClick={onSwitchToUsaLegalShield}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition-colors"
              >
                U.S. Legal Shield (Amazon / Walmart / Best Buy) →
              </button>
            )}
          </div>
        </div>

      {/* 3 Practical Revenue Channel Legal Shield Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>1. SparkDeals Affiliate Shield</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Merchant purchases: confirm the seller, current price, taxes, shipping, return policy and warranty on the merchant&apos;s website before purchase. We may receive an affiliate commission where a relationship exists; no affiliation is implied otherwise.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <FileText className="w-4 h-4 shrink-0" />
            <span>2. Vendor Commission &amp; Supplier MSA</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Direct company work requires a written scope, quotation, delivery milestones, payment terms, complaint and refund process, and signed acceptance. Supplier contracts should identify product specifications, inspection, liability allocation, insurance and a dispute process. No website statement replaces a signed agreement.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Scale className="w-4 h-4 shrink-0" />
            <span>3. Honest Liability &amp; Privacy Boundaries</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            No immunity from lawsuits is promised. Applicable consumer rights remain in force. Intermediary protections are conditional and do not automatically cover the company&apos;s own goods, services, negligence or contractual obligations.
          </p>
        </div>
      </div>

      {/* Explicit Data & Regulatory Notices */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs text-slate-300">
        <p>
          Do not submit card numbers, banking credentials, identity documents or sensitive personal information through this public website. No verified grievance officer, statutory registration or licensing status is asserted here.
        </p>
        <p>
          India divisions are presented for business inquiries. Verify entity registrations, GST classification and rates, FSSAI licensing, product labels, local permits and insurance with qualified Indian advisers before sales or operations.
        </p>
        <div className="pt-1">
          <a
            className="inline-flex items-center gap-1.5 underline text-amber-300 hover:text-amber-200 font-semibold"
            href="./business-readiness.html"
          >
            <span>Business readiness and operating controls</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
      </div>
    </section>
  );
};
