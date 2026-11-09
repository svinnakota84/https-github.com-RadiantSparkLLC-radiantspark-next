/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, Zap, Globe, Shield, Sparkles, Building2, Cpu, ChevronDown, CheckCircle2, TrendingUp } from 'lucide-react';
import { ThreeGlobeScene } from './ThreeGlobeScene';
import { RealTimeMarketTerminal } from './RealTimeMarketTerminal';

interface GlobalViewProps {
  onSwitchView: (view: 'india' | 'usa' | 'sparkdeals' | 'brain' | 'lifestyle') => void;
  onOpenSparkSync: () => void;
  onOpenAssistant: () => void;
  onOpenLegalShield: () => void;
  onOpenDownloadApp: () => void;
  onOpenBusinessInquiry?: () => void;
}

export const GlobalView: React.FC<GlobalViewProps> = ({
  onSwitchView,
  onOpenSparkSync,
  onOpenAssistant,
  onOpenLegalShield,
  onOpenDownloadApp,
  onOpenBusinessInquiry,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section matching image_75289c42.png with 3D Celestial Globe in background */}
      <section className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden pt-4 pb-12">
        
        {/* 3D Celestial Wireframe Earth Globe (Centered behind typography) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <ThreeGlobeScene className="w-full h-full max-w-5xl" variant="global" />
        </div>

        {/* Subtle radial ambient atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Foreground Content (Centered over 3D Globe as in image_75289c42.png) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          {/* Top Capsule Badge (Exact from image_75289c42.png) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 font-medium backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Radiant Spark Global · United States + India</span>
          </div>

          {/* Headline Typography (Exact from image_75289c42.png) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05]">
            Intelligence across <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-sky-200 to-blue-300 font-serif italic">
              frontiers.
            </span>
          </h1>

          {/* Subtitle (Exact from image_75289c42.png) */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal">
            Connecting U.S. technology services through <strong className="text-white">Radiant Spark LLC</strong> with India clean energy, products, and distribution through <strong className="text-white">RDNT Sparkle Industries LLP</strong>.
          </p>

          {/* Action Buttons matching image_ff37cf94.png */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#companies"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Portals</span>
              <ChevronDown className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onOpenDownloadApp}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/30 hover:from-emerald-500/30 hover:to-teal-500/40 border border-emerald-400/50 text-emerald-300 font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>📲</span>
              <span>Download Mobile Apps</span>
            </button>

            <button
              type="button"
              onClick={onOpenSparkSync}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/40 to-indigo-600/50 hover:from-blue-600/60 hover:to-indigo-600/70 border border-blue-400/60 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Launch SparkSync</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchView('sparkdeals')}
              className="px-5 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>🔥</span>
              <span>SparkDeals Hub</span>
            </button>
          </div>

          {/* Jurisdiction Quick Jump Badges matching image_ff37cf94.png */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
            <span className="font-mono text-slate-500 text-[11px] uppercase tracking-wider">DIRECT ACCESS:</span>
            <button
              onClick={() => onSwitchView('usa')}
              className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition-colors text-xs"
            >
              <span className="font-mono text-[10px] text-blue-400 font-bold">us</span> Technology USA (Spark IT)
            </button>
            <button
              onClick={() => onSwitchView('india')}
              className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition-colors text-xs"
            >
              <span className="font-mono text-[10px] text-amber-400 font-bold">in</span> Industries India (RDNT Sparkle)
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-white font-mono block">02</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">Distinct Companies</span>
            <p className="text-xs text-slate-400 mt-1">One U.S. corporate entity and one India LLP operating under separate jurisdictions.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-cyan-400 font-mono block">06</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">U.S. Technology Practices</span>
            <p className="text-xs text-slate-400 mt-1">Under Spark IT Consulting: Cloud, AI, Systems Integration, and Oracle Fusion HCM.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-4xl font-black text-amber-400 font-mono block">04</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">India Divisions</span>
            <p className="text-xs text-slate-400 mt-1">Under RDNT Sparkle Industries LLP: Spark EV, Drinks, Naturals, and Distribution.</p>
          </div>
        </div>
      </section>

      {/* WEBULL & LIVETRADES REAL-TIME MARKETS & TRADING TERMINAL */}
      <section id="live-markets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>EXTERNAL MARKET RESEARCH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Markets &amp; event research
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Provider connections are not active. Visit external providers for their own market information and eligibility terms.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              No market stream connected
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              No order execution
            </span>
          </div>
        </div>

        <RealTimeMarketTerminal />
      </section>

      {/* Two Teams / Clear Responsibilities Grid */}
      <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold mb-2">
              Corporate Separation &amp; Portals
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Two teams. <span className="text-slate-400 font-serif italic">Clear responsibilities.</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select a portal to explore specialized operational capabilities, team profiles, and direct services.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* USA Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-cyan-400/60 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                  United States Corporation
                </span>
                <span className="text-2xl">🇺🇸</span>
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Radiant Spark LLC
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enterprise technology strategy and systems architecture. Delivering high-throughput Oracle Fusion HCM implementations, enterprise cloud migrations, and SparkSync algorithmic workflows.
              </p>
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400 font-mono uppercase">Key Capabilities:</div>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Oracle Fusion HCM</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Cloud Engineering</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> SparkSync Engine</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Enterprise IT Advisory</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => onSwitchView('usa')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <span>Explore Technology USA Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* India Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-amber-400/60 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                  India Limited Liability Partnership
                </span>
                <span className="text-2xl">🇮🇳</span>
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                RDNT Sparkle Industries LLP
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Business concepts across clean energy, beverages, natural foods, distribution and merchant discovery. Current licenses, registrations and operating capacity require verification.
              </p>
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400 font-mono uppercase">Key Divisions:</div>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Spark EV &amp; Solar</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Sparkle Refresh Drinks</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Spicy Sparkle Naturals</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> SparkDeal Hub (ASCI)</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => onSwitchView('india')}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Explore Industries India Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lifestyle Hub Card (lifestyle.radiantsparkllc.com / svinnakota84/lifestylehub) */}
          <div className="md:col-span-2 lg:col-span-1 p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-emerald-400/60 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  lifestyle.radiantsparkllc.com
                </span>
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Lifestyle Hub (AI Health &amp; Diet)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Integrated directly from <a href="https://github.com/svinnakota84/lifestylehub" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-mono">svinnakota84/lifestylehub</a>. AI Coach Maya Chen delivers personalized diet plans, Stripe USD multi-currency subscriptions, and daily WhatsApp updates.
              </p>
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400 font-mono uppercase">Hub Highlights:</div>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stripe USD Gateway</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Blank Intake Forms</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Coach Maya Chen</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ElevenLabs Voice AI</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => onSwitchView('lifestyle')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>Explore Lifestyle Hub Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Dedicated Mobile Apps & Download Center Section */}
      <section id="mobile-apps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950/40 to-slate-950 border border-cyan-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300">
                <span>📲</span>
                <span>MOBILE ECOSYSTEM · ZERO CORPORATE BLOAT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Standalone Mobile Web Apps &amp; PWA Downloads
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Direct mobile-optimized interfaces for your iPhone, iPad, Android, or Desktop. Open the responsive website; native app packages are not published.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenDownloadApp}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>📲</span>
                <span>Website access</span>
              </button>

              <button
                type="button"
                onClick={onOpenDownloadApp}
                className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>📦</span>
                <span>Website access</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* App 1: SparkSync Life & Work OS */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-blue-500/30 flex flex-col justify-between space-y-4 shadow-lg hover:border-blue-400/60 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                    Life &amp; Work OS
                  </span>
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold text-white">SparkSync Mobile OS</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Business task planning for ten roles. No health telemetry, trading, betting or device-cleaning service is connected.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href="./index.html#brain"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-md transition-all active:scale-95"
                >
                  Launch SparkSync App ↗
                </a>
                <button
                  onClick={onOpenDownloadApp}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
                >
                  Install Guide
                </button>
              </div>
            </div>

            {/* App 2: SparkDeals Live Hub */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-400/60 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Price Drop Aggregator
                  </span>
                  <span className="text-xl">🔥</span>
                </div>
                <h3 className="text-lg font-bold text-white">SparkDeals Hub App</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Browse merchant websites for current offers. No live price feed, stock verification or discount-code verification is connected.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href="./sparkdeals.html"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs text-center shadow-md transition-all active:scale-95"
                >
                  Launch SparkDeals ↗
                </a>
                <a
                  href="./sparkdeals.html"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700"
                >
                  Web Portal ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section for #about in-page link */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            About Radiant Spark Global
          </div>
          <h2 className="text-2xl font-extrabold text-white">Unified Vision, Specialized Operations</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Radiant Spark Global bridges cutting-edge Silicon Valley enterprise software with industrial physical manufacturing and clean technology in India. Our dual-hub architecture gives our clients and customers the security of U.S. corporate compliance coupled with India's manufacturing dynamism.
          </p>
        </div>
      </section>

      {/* Careers Section for #careers in-page link */}
      <section id="careers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Careers &amp; Talent Network
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join Our Worldwide Teams</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We are continuously seeking world-class talent in Cloud Architecture, Oracle Fusion HCM, Full-Stack TypeScript engineering, Solar PV distribution, and FMCG supply chain operations across Atlanta, GA, and Andhra Pradesh, India.
          </p>
          <div className="pt-2">
            <a
              href="mailto:careers@radiantsparkllc.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              <span>Contact Talent Desk: careers@radiantsparkllc.com</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section for #contact in-page link */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Contact Desks
          </div>
          <h2 className="text-2xl font-extrabold text-white">Connect with Headquarters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <strong className="text-white block font-bold text-sm mb-1">🇺🇸 U.S. Headquarters (Radiant Spark LLC)</strong>
              <p>Atlanta, GA 30350, United States</p>
              <p className="mt-1 text-cyan-400 font-mono">contact@radiantsparkllc.com</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <strong className="text-white block font-bold text-sm mb-1">🇮🇳 India Headquarters (RDNT Sparkle Industries LLP)</strong>
              <p>Andhra Pradesh, India</p>
              <p className="mt-1 text-amber-400 font-mono">india@radiantsparkllc.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
