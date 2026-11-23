/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Share2 } from 'lucide-react';

export const ReelsMonetizationModule: React.FC = () => {
  return (
    <div className="space-y-8 py-6">
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 border border-amber-500/40 shadow-2xl">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
            <Share2 className="w-3.5 h-3.5" />
            <span>CREATOR &amp; PARTNER AFFILIATE PROGRAM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            SparkDeals Creator &amp; Partner Distribution
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Content creators and B2B partners can reference verified SparkDeals offers or RDNT Sparkle products via standard merchant affiliate programs and brand sponsorship agreements.
          </p>
          <div className="pt-2">
            <a
              href="./sparkdeals.html"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
            >
              <span>Browse Live SparkDeals Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-rose-400 font-bold">01 · SHORT-FORM VIDEO</span>
          <h3 className="text-base font-bold text-white">Creator Program Participation</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eligible creators participate in platform-native monetization tools governed directly by YouTube Shorts and Instagram policies.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-amber-400 font-bold">02 · PRODUCT DISCOVERY</span>
          <h3 className="text-base font-bold text-white">SparkDeals Link Sharing</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Share direct retailer offer links synced every 15 minutes from DealNews, Slickdeals, Amazon US, and Flipkart.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-emerald-400 font-bold">03 · BRAND COLLABS</span>
          <h3 className="text-base font-bold text-white">Direct Wholesale Inquiries</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Regional distributors and beverage stockists submit commercial onboarding requests directly through B2B RFQ and Supplier Intake.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-bold">04 · DISCLOSURE</span>
          <h3 className="text-base font-bold text-white">ASCI &amp; FTC Transparency</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All sponsored promotions and outbound merchant links include clear commercial affiliate disclosures at point of view.
          </p>
        </div>
      </div>
    </div>
  );
};
