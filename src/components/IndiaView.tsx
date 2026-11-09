/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { INDIA_DIVISIONS } from '../data/companyData';
import { DealItem } from '../types';
import { IndiaLegalShield } from './IndiaLegalShield';
import {
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Check,
  ExternalLink,
  ChevronDown,
  Building,
  HelpCircle,
  Truck,
  Leaf,
  Coffee,
  Sun
} from 'lucide-react';

interface IndiaViewProps {
  deals: DealItem[];
  onVoteDeal: (dealId: string) => void;
  onSelectDealModal: (deal: DealItem) => void;
  onOpenSparkSync: () => void;
  onOpenTakedownModal: () => void;
  onSwitchToUsa: () => void;
}

export const IndiaView: React.FC<IndiaViewProps> = ({
  deals,
  onVoteDeal,
  onSelectDealModal,
  onOpenSparkSync,
  onOpenTakedownModal,
  onSwitchToUsa,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const FAQS = [
    {
      q: 'Which company operates the India divisions and SparkDeal Hub?',
      a: 'Spark EV, Sparkle Drinks, Spicy Sparkle Naturals, Sparkle Distribution Network, and the SparkDeal Hub are operated under RDNT Sparkle Industries LLP, as described by the site owner; statutory registrations and current operating permissions have not been verified.'
    },
    {
      q: 'What does Spark EV focus on in Andhra Pradesh?',
      a: 'Spark EV focuses on solar power concepts, commercial and residential rooftop solar planning, electric vehicle charging infrastructure deployment, and clean energy storage solutions across South India.'
    },
    {
      q: 'How does the SparkDeal Hub affiliate model protect consumers and comply with Indian law?',
      a: 'SparkDeal Hub links to external merchants. Check the seller, price, shipping and return terms before purchase. Affiliate commissions may apply where an approved relationship exists. No immunity or blanket compliance is promised.'
    },
    {
      q: 'Where is Spark IT Consulting hosted?',
      a: 'Spark IT Consulting is listed separately under Radiant Spark LLC, our independent U.S. corporate entity.'
    }
  ];

  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-200">
      {/* India Hero */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="absolute top-1/3 left-10 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              {/* Jurisdiction Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 font-medium mb-6">
                <span>🇮🇳</span>
                <span>India · Andhra Pradesh · Parent Company</span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400 font-mono">Est. July 7, 2026</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Building a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 font-serif italic">
                  better future.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                <strong className="text-white">RDNT Sparkle Industries LLP</strong> drives sustainable industrial innovation across clean energy, botanical beverages, artisanal dry fruits, and regional cold-chain distribution across South India.
              </p>

              {/* Actions with HIGH-VISIBILITY SparkSync Button */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#divisions"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>Explore India Divisions</span>
                  <ChevronDown className="w-4 h-4" />
                </a>

                {/* SparkSync High-Visibility Button */}
                <button
                  type="button"
                  onClick={onOpenSparkSync}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/30 border border-blue-400/40 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-current animate-pulse-subtle" />
                  <span>⚡ Launch SparkSync App</span>
                </button>

                <button
                  type="button"
                  onClick={onSwitchToUsa}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-800 transition-colors flex items-center gap-2"
                >
                  <span>View U.S. Company (Radiant Spark LLC)</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Hero Visual Image */}
            <div className="lg:col-span-5">
              <div className="relative h-72 sm:h-88 rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950 group">
                <img
                  src="./assets/spark-ev.jpg"
                  alt="Spark EV concept: electric mobility and charging station"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/spark-ev.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-amber-500/30 backdrop-blur-sm shadow-lg">
                  RDNT Sparkle Industries LLP · India
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* India Facts Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-amber-400 font-mono block">04</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">India Divisions</span>
            <p className="text-xs text-slate-400 mt-1">Four specialized initiatives under RDNT Sparkle Industries LLP.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-white font-mono block">AP</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">Andhra Pradesh</span>
            <p className="text-xs text-slate-400 mt-1">Guntur commercial hub and regional clean energy distribution corridor.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-cyan-400 font-mono block">2026</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">LLP Established</span>
            <p className="text-xs text-slate-400 mt-1">Formed on July 7, 2026 under the Limited Liability Partnership Act of India.</p>
          </div>
        </div>
      </section>

      {/* Divisions Section */}
      <section id="divisions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
            Commercial Divisions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Clean energy, products <br />
            <span className="text-slate-400 font-serif italic">&amp; distribution.</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Operating units under RDNT Sparkle Industries LLP serving domestic and regional requirements with high sustainability standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INDIA_DIVISIONS.map((div) => (
            <article
              key={div.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-colors"
            >
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={div.image}
                  alt={div.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('/assets/')) {
                      target.src = target.src.replace('/assets/', '/');
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-lg border border-amber-500/20 backdrop-blur-sm">
                  {div.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{div.name}</h3>
                  <p className="text-xs text-amber-400/90 font-mono mb-3">{div.tagline}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{div.description}</p>

                  <ul className="space-y-1.5 mb-6">
                    {div.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">RDNT Sparkle Industries LLP</span>
                  <a
                    href="#india-contact"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                  >
                    <span>Inquire for {div.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. The India Legal Shield Component */}
      <IndiaLegalShield onOpenTakedownModal={onOpenTakedownModal} />

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
            Guidance &amp; Clarifications
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Questions, <span className="font-serif italic text-slate-400">answered.</span>
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <span className="text-slate-500 font-mono">{openFaqIndex === idx ? '−' : '+'}</span>
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* India Direct Contact Section */}
      <section id="india-contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold block mb-1">
              Direct Contact Desk · Andhra Pradesh
            </span>
            <h3 className="text-2xl font-bold text-white">RDNT Sparkle Industries LLP</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              For Spark EV clean energy, Sparkle Drinks distribution, Spicy Sparkle Naturals bulk procurement, or vendor onboarding for the SparkDeal Hub.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="mailto:info@radiantsparkllc.com?subject=RDNT%20Sparkle%20Industries%20LLP%20Inquiry"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow"
            >
              Email info@radiantsparkllc.com ↗
            </a>
            <button
              onClick={onOpenTakedownModal}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Legal &amp; Grievance Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
