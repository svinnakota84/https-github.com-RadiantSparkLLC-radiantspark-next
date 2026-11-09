/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Zap,
  Play,
  Share2,
  Tv,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  BarChart2,
  Eye,
  Award,
} from 'lucide-react';

export const ReelsMonetizationModule: React.FC = () => {
  const [adImpressions, setAdImpressions] = useState(14250);
  const [adEarnings, setAdEarnings] = useState(142.50);
  const [simulatingAdClick, setSimulatingAdClick] = useState(false);

  const triggerAdClick = () => {
    setSimulatingAdClick(true);
    setTimeout(() => {
      setSimulatingAdClick(false);
      setAdImpressions((prev) => prev + 1);
      setAdEarnings((prev) => parseFloat((prev + 1.25).toFixed(2)));
    }, 600);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Monetization & Ad Revenue Suite Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>INSTAGRAM &amp; YOUTUBE REELS MONETIZATION SUITE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Social Reels Monetization &amp; Enterprise Ad Revenue Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              How creators and brands generate <strong className="text-white">₹50,000 to ₹10,00,000+/month</strong> in India using YouTube Shorts, Instagram Reels, SparkDeals Affiliate Links, and Google AdSense programmatic ad units.
            </p>
          </div>

          {/* Ad Revenue Telemetry Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 text-center shrink-0 space-y-2 font-mono">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Live Ad Revenue Counter
            </span>
            <div className="text-2xl font-black text-emerald-400">
              ${adEarnings.toFixed(2)} USD
            </div>
            <span className="text-[10px] text-slate-400 block">
              {adImpressions.toLocaleString()} Verified Impressions
            </span>
            <button
              onClick={triggerAdClick}
              disabled={simulatingAdClick}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] w-full transition-transform active:scale-95"
            >
              {simulatingAdClick ? 'Tracking Click...' : 'Simulate Ad Impression +$1.25'}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded High-Converting Ad Banner (Google AdSense 728x90 Unit Format) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 text-center space-y-2 shadow-lg">
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>SPONSORED ADVERTISEMENT</span>
          <span>·</span>
          <span>GOOGLE ADSENSE / NATIVE RETAIL NETWORK</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
              🔥
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                Exclusive Deal: Tata Ace EV Cold-Chain Fleet Discount
              </strong>
              <span className="text-xs text-slate-400 block">
                Zero Emission Commercial Delivery Vehicles for Andhra &amp; Telangana Distributors.
              </span>
            </div>
          </div>

          <a
            href="https://www.amazon.in"
            target="_blank"
            rel="noopener noreferrer"
            onClick={triggerAdClick}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <span>Claim Discount Offer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4-Pillar Reels Monetization Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg font-bold">
            01
          </div>
          <h3 className="text-base font-bold text-white">Instagram Reels Gifts &amp; Subscriptions</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monetize short-form videos through Instagram Star Gifts, paid subscriber badges, and direct brand sponsorship payouts.
          </p>
          <span className="text-[10px] font-mono text-rose-400 font-bold block pt-1">
            Avg: ₹30,000 - ₹2,00,000/mo
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-lg font-bold">
            02
          </div>
          <h3 className="text-base font-bold text-white">YouTube Shorts Ad Revenue Sharing</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Earn 45% of allocated Shorts ad pool revenue based on total video views and regional Indian CPM rates.
          </p>
          <span className="text-[10px] font-mono text-red-400 font-bold block pt-1">
            Avg: ₹40,000 - ₹5,00,000/mo
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg font-bold">
            03
          </div>
          <h3 className="text-base font-bold text-white">SparkDeals Affiliate Links-In-Bio</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Attach SparkDeals product shortlinks in video captions. Earn up to 12% commission on Amazon US, Amazon India, and Flipkart checkouts.
          </p>
          <span className="text-[10px] font-mono text-amber-400 font-bold block pt-1">
            Avg: 8-12% Sales Commission
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg font-bold">
            04
          </div>
          <h3 className="text-base font-bold text-white">Direct Brand Sponsorship Deals</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Feature RDNT Sparkle Drinks or Spark EV hardware in lifestyle videos. Receive direct brand sponsorships and product placements.
          </p>
          <span className="text-[10px] font-mono text-emerald-400 font-bold block pt-1">
            Avg: ₹50,000 per Reel
          </span>
        </div>
      </div>
    </div>
  );
};
