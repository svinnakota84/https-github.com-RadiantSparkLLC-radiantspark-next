import React from 'react';
import { ExternalLink, Flame } from 'lucide-react';

export const SparkDealHub = (_props: any) => (
  <section className="p-8 bg-slate-900 rounded-3xl border border-amber-500/40 text-white space-y-4">
    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
      <Flame className="w-4 h-4 fill-amber-400" />
      <span>SPARKDEALS LIVE RSS FEED · 15-MINUTE AUTO SYNC</span>
    </div>
    <h2 className="text-2xl font-extrabold">SparkDeals Hub · Black Friday Electronics &amp; Verified Retail Drops</h2>
    <p className="text-sm text-slate-300 max-w-2xl">
      Live deal feeds are active and synchronized automatically every 15 minutes from DealNews Electronics, Slickdeals Frontpage, Amazon US, and Flipkart without fabricated prices or fake timers.
    </p>
    <a
      href="./sparkdeals.html"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
    >
      <span>Open Full SparkDeals Portal</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  </section>
);
