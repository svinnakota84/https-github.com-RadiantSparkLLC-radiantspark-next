/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { USA_SERVICES } from '../data/companyData';
import {
  Zap,
  ArrowUpRight,
  Cpu,
  ChevronDown,
  Check,
  Building2,
  Terminal,
  ExternalLink,
  Code2
} from 'lucide-react';

interface UsaViewProps {
  onOpenSparkSync: () => void;
  onSwitchToIndia: () => void;
}

export const UsaView: React.FC<UsaViewProps> = ({ onOpenSparkSync, onSwitchToIndia }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const FAQS = [
    {
      q: 'Which company provides Spark IT Consulting?',
      a: 'Spark IT Consulting is delivered exclusively through Radiant Spark LLC, our independent technology company incorporated in the United States.'
    },
    {
      q: 'What specialized technologies does Spark IT Consulting support?',
      a: 'We specialize in Oracle Cloud ERP/HCM (Fast Formulas, BIP, HCM Extracts), enterprise cloud migrations (AWS, GCP), custom full-stack web applications, REST/GraphQL API integration pipelines, and generative AI workflow automation.'
    },
    {
      q: 'Does Radiant Spark LLC handle the India divisions?',
      a: 'No. The clean-energy, FMCG, food divisions, and the SparkDeal Hub in India are operated independently by RDNT Sparkle Industries LLP in Andhra Pradesh.'
    },
    {
      q: 'Where can I reach Radiant Spark LLC?',
      a: 'You can email info@radiantsparkllc.com or visit the official corporate portal at radiantsparkllc.com.'
    }
  ];

  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-200">
      {/* USA Hero */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="absolute top-1/3 left-10 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              {/* Jurisdiction Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 font-medium mb-6">
                <span>🇺🇸</span>
                <span>United States · Radiant Spark LLC</span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400 font-mono">Est. September 1, 2025</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Technology for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-200 font-serif italic">
                  what’s next.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Through <strong className="text-white">Spark IT Consulting</strong>, Radiant Spark LLC helps organizations modernize mission-critical systems, orchestrate cloud transitions, implement enterprise AI, and extract maximum performance from Oracle Cloud infrastructure.
              </p>

              {/* Actions with HIGH-VISIBILITY SparkSync Button */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#services"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>Explore IT Services</span>
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
                  onClick={onSwitchToIndia}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-800 transition-colors flex items-center gap-2"
                >
                  <span>View India Company &amp; SparkDeal Hub</span>
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Hero Visual Image */}
            <div className="lg:col-span-5">
              <div className="relative h-72 sm:h-88 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950 group">
                <img
                  src="./assets/spark-it.jpg"
                  alt="Spark IT Consulting technology and Oracle Cloud services"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/spark-it.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 right-3 bg-slate-900/90 text-cyan-300 font-bold text-xs px-3 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-sm shadow-md">
                  Spark IT Consulting · USA
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-sm shadow-lg">
                  Radiant Spark LLC · Sheridan, WY
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-cyan-400 font-mono block">06</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">Service Practices</span>
            <p className="text-xs text-slate-400 mt-1">Specialized technology delivery practices under Spark IT Consulting.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-white font-mono block">US</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">United States Corporate</span>
            <p className="text-xs text-slate-400 mt-1">Incorporated and governed under U.S. corporate statutes.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-indigo-400 font-mono block">2025</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">LLC Established</span>
            <p className="text-xs text-slate-400 mt-1">Founded September 1, 2025 with enterprise technology focus.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
            Spark IT Consulting
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Build smarter. <br />
            <span className="text-slate-400 font-serif italic">Move with confidence.</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Technology consulting and delivery services engineered for enterprises ready to integrate, automate, and scale operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USA_SERVICES.map((serv) => (
            <article
              key={serv.number}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {serv.number} / {serv.badge}
                  </span>
                  <Code2 className="w-4 h-4 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{serv.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{serv.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">Key Stacks &amp; Frameworks</div>
                <div className="flex flex-wrap gap-1.5">
                  {serv.technologies.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
            U.S. Company Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Find the right <span className="font-serif italic text-slate-400">service.</span>
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

      {/* USA Contact Card */}
      <section id="usa-contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">
              United States · Radiant Spark LLC
            </span>
            <h3 className="text-2xl font-bold text-white">Spark IT Consulting</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Enterprise technology and consulting services provided through Radiant Spark LLC in the United States.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="mailto:info@radiantsparkllc.com?subject=Spark%20IT%20Consulting%20Inquiry"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shadow"
            >
              Email info@radiantsparkllc.com ↗
            </a>
            <a
              href="https://radiantsparkllc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Visit radiantsparkllc.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
