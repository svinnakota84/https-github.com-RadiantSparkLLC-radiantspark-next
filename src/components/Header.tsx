/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CountryView } from '../types';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';
import { Zap, Menu, X, Globe, ChevronDown, Sun, Moon, Building2, Search, Briefcase } from 'lucide-react';

interface HeaderProps {
  currentView: CountryView;
  currentLang: LanguageCode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onSelectView: (view: CountryView) => void;
  onOpenSparkSync: () => void;
  onOpenAssistant: () => void;
  onOpenLegalShield: () => void;
  onOpenDownloadApp: () => void;
  onOpenBusinessInquiry: () => void;
  onOpenSupplierIntake?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentLang,
  theme,
  onToggleTheme,
  onSelectLanguage,
  onSelectView,
  onOpenSparkSync,
  onOpenAssistant,
  onOpenLegalShield,
  onOpenDownloadApp,
  onOpenBusinessInquiry,
  onOpenSupplierIntake,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

  const handleNavClick = (view: CountryView) => {
    onSelectView(view);
    setMobileMenuOpen(false);
    setCompanyDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompanyNav = (sectionId: string) => {
    setCompanyDropdownOpen(false);
    setMobileMenuOpen(false);
    if (currentView !== 'global') {
      onSelectView('global');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Floating Capsule Dock */}
        <div
          className={`relative rounded-2xl sm:rounded-3xl backdrop-blur-xl border shadow-2xl px-3 sm:px-4 py-2 flex items-center justify-between transition-colors ${
            isLight
              ? 'bg-white/90 border-slate-200 shadow-slate-200/80 text-slate-900'
              : 'bg-[#030712]/80 border-slate-800/80 text-white'
          }`}
        >
          {/* Left Brand Badge */}
          <button
            onClick={() => handleNavClick('global')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center p-1.5 shadow-md transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 group-hover:border-blue-500'
                  : 'bg-slate-900 border-slate-700/80 group-hover:border-blue-500/50'
              }`}
            >
              <img
                src="./assets/icon.svg"
                alt="Radiant Spark Symbol"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <span
                className={`font-extrabold text-sm sm:text-base tracking-tight transition-colors block ${
                  isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-300'
                }`}
              >
                Radiant Spark Global
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-semibold block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                UNITED STATES · INDIA
              </span>
            </div>
          </button>

          {/* Desktop Center Navigation Pills */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('global')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                currentView === 'global'
                  ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500 shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              GLOBAL PORTAL
            </button>

            <button
              onClick={() => handleNavClick('usa')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentView === 'usa'
                  ? 'bg-blue-600/20 text-blue-600 border border-blue-500 shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              TECH USA
            </button>

            <button
              onClick={() => handleNavClick('india')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentView === 'india'
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500 shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              INDUSTRIES INDIA
            </button>

            <button
              onClick={() => handleNavClick('sparkdeals')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 ${
                currentView === 'sparkdeals'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-amber-600 hover:bg-amber-50'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <span>🔥</span>
              <span>SPARKDEALS</span>
            </button>

            <button
              onClick={() => handleNavClick('brain')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                currentView === 'brain'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-cyan-700 hover:bg-cyan-50'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <span>🧠</span>
              <span>AI WORKFORCE</span>
            </button>

            <button
              onClick={() => handleNavClick('lifestyle')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 ${
                currentView === 'lifestyle'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              <span>🌿</span>
              <span>LIFESTYLE &amp; DIET</span>
            </button>

            {/* B2B Business Inquiry Direct Nav Pill */}
            <button
              type="button"
              onClick={onOpenBusinessInquiry}
              className="px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/50 transition-all flex items-center gap-1"
              title="Submit Enterprise RFQ & B2B Volume Order"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>B2B RFQ</span>
            </button>

            {/* Single Consolidated Company & Legal Dropdown Tab */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  companyDropdownOpen
                    ? isLight
                      ? 'bg-slate-200 text-slate-900'
                      : 'bg-slate-800 text-white border border-slate-700 shadow-md'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span>🏢 COMPANY</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${companyDropdownOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
              </button>

              {companyDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCompanyDropdownOpen(false)} />
                  <div
                    className={`absolute top-full left-0 mt-2 w-64 rounded-2xl backdrop-blur-xl border p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                      isLight
                        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/80'
                        : 'bg-slate-950/95 border-slate-800/90 text-slate-100'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/40 dark:border-slate-800/80 mb-1">
                      Corporate &amp; Legal Hub
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCompanyNav('about')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900/90 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                        🏢
                      </div>
                      <div>
                        <strong className="block dark:text-white group-hover:text-blue-500">About Us</strong>
                        <span className="text-[10px] text-slate-400 font-normal">Dual Corporate Overview</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompanyNav('careers')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900/90 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                        💼
                      </div>
                      <div>
                        <strong className="block dark:text-white group-hover:text-amber-500">Careers</strong>
                        <span className="text-[10px] text-slate-400 font-normal">Global Talent Network</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompanyNav('contact')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900/90 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                        📞
                      </div>
                      <div>
                        <strong className="block dark:text-white group-hover:text-emerald-500">Contact Us</strong>
                        <span className="text-[10px] text-slate-400 font-normal">US &amp; India HQ Enquiries</span>
                      </div>
                    </button>

                    {onOpenSupplierIntake && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompanyDropdownOpen(false);
                          onOpenSupplierIntake();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900/90 flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                          🤝
                        </div>
                        <div>
                          <strong className="block dark:text-white group-hover:text-amber-500">Supplier Intake</strong>
                          <span className="text-[10px] text-slate-400 font-normal">Vendor Onboarding Application</span>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setCompanyDropdownOpen(false);
                        onOpenLegalShield();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900/90 flex items-center gap-2.5 transition-colors group border-t border-slate-200/40 dark:border-slate-800/80 mt-1 pt-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                        🛡️
                      </div>
                      <div>
                        <strong className="block dark:text-white group-hover:text-purple-500">Privacy &amp; Legal</strong>
                        <span className="text-[10px] text-slate-400 font-normal">Sec 79 IT Act &amp; FSSAI Shield</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right Action: Light/Dark Mode Switcher, Language Switcher, Download Apps & Launch SparkSync */}
          <div className="flex items-center gap-2">
            {/* Light / Dark Mode Toggle Button (Customer Saved Preference) */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
                isLight
                  ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200 shadow-sm'
                  : 'bg-slate-900 border-slate-700/80 text-amber-300 hover:bg-slate-800 shadow-md'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </button>

            {/* Multi-Language Switcher (English, Telugu, Hindi) */}
            <div
              className={`flex items-center rounded-xl p-1 border text-[10px] font-mono font-bold shadow-sm ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currentLang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('te')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currentLang === 'te'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-amber-700'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
                title="తెలుగు (Telugu)"
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('hi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currentLang === 'hi'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-purple-700'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
                title="हिंदी (Hindi)"
              >
                हिंदी
              </button>
            </div>

            {/* Prominent Download Mobile Apps Button */}
            <button
              type="button"
              onClick={onOpenDownloadApp}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Download Mobile Apps (SparkSync OS & SparkDeals Hub)"
            >
              <span>📲</span>
              <span className="hidden sm:inline">Apps</span>
            </button>

            <button
              type="button"
              onClick={onOpenSparkSync}
              className="group px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg shadow-blue-600/30 border border-blue-400/40 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Launch SparkSync App"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <div className="text-left leading-tight font-extrabold">
                <span className="block text-[9px] text-blue-200">SPARKSYNC</span>
                <span className="block">APP</span>
              </div>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden p-2 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`xl:hidden mt-2 rounded-2xl backdrop-blur-xl border p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-900'
                : 'bg-slate-950/95 border-slate-800 text-slate-100'
            }`}
          >
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleNavClick('global')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  currentView === 'global'
                    ? 'bg-amber-500 text-slate-950'
                    : isLight
                    ? 'text-slate-800 bg-slate-100'
                    : 'text-slate-300 bg-slate-900/60'
                }`}
              >
                <span>Radiant Spark Global</span>
                <Globe className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleNavClick('usa')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  currentView === 'usa'
                    ? 'bg-blue-600 text-white'
                    : isLight
                    ? 'text-slate-800 bg-slate-100'
                    : 'text-slate-300 bg-slate-900/60'
                }`}
              >
                <span>Technology USA</span>
                <span>🇺🇸</span>
              </button>

              <button
                onClick={() => handleNavClick('india')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  currentView === 'india'
                    ? 'bg-amber-500 text-slate-950'
                    : isLight
                    ? 'text-slate-800 bg-slate-100'
                    : 'text-slate-300 bg-slate-900/60'
                }`}
              >
                <span>Industries India</span>
                <span>🇮🇳</span>
              </button>

              <button
                onClick={() => handleNavClick('sparkdeals')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  currentView === 'sparkdeals'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
                    : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                }`}
              >
                <span>🔥 SparkDeals Portal</span>
                <span>⚡</span>
              </button>

              <button
                onClick={() => handleNavClick('brain')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  currentView === 'brain'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
                }`}
              >
                <span>🧠 AI Enterprise Brain (10 Agents)</span>
                <span>⚡</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBusinessInquiry();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between text-purple-300 bg-purple-950/40 border border-purple-500/30"
              >
                <span>🏢 Submit B2B Business RFQ</span>
                <span>📋</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block px-1">
                🏢 Company &amp; Legal Hub
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => handleCompanyNav('about')}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-left font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>🏢</span> About Us
                </button>
                <button
                  onClick={() => handleCompanyNav('careers')}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-left font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>💼</span> Careers
                </button>
                <button
                  onClick={() => handleCompanyNav('contact')}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-left font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>📞</span> Contact
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLegalShield();
                  }}
                  className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 text-left font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>🛡️</span> Privacy &amp; Legal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
