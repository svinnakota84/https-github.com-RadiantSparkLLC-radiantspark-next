/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Download, Package, Code, FileArchive, CheckCircle2, Zap, Smartphone, ExternalLink } from 'lucide-react';
import { downloadZipFile } from '../utils/downloadZip';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download Production & Source Code ZIP Packages"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-slate-950 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-amber-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-black shadow-md">
              📦
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Download Complete ZIP Package Hub
              </h3>
              <p className="text-xs text-slate-400">
                Production Web Release &amp; Full Source Codebase Bundles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Option 1: Complete Production Build ZIP (GitHub Pages Ready) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/50 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-emerald-400" />
                <strong className="text-sm font-bold text-white">
                  1. Production Web Release ZIP (`radiantspark-final.zip`)
                </strong>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                RECOMMENDED FOR GITHUB PAGES
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              Includes pre-rendered production HTML (`index.html`), PWA Web Manifest (`manifest.json`), Service Worker (`sw.js`), standalone apps (`app.html`), and configured GitHub Pages domain (`CNAME`).
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                onClick={() => downloadZipFile('radiantspark-final.zip')}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download radiantspark-final.zip (Production)</span>
              </button>
            </div>
          </div>

          {/* Option 2: Full Source Codebase ZIP */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/50 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <strong className="text-sm font-bold text-white">
                  2. Full Source Codebase ZIP (`radiant-spark-full-codebase.zip`)
                </strong>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                COMPLETE TS &amp; REACT SOURCE
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              Contains the complete unminified React + TypeScript codebase (`src/`, `components/`, `data/`, `utils/`, `scripts/`, `package.json`, `vite.config.ts`, `tsconfig.json`).
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                onClick={() => downloadZipFile('radiant-spark-full-codebase.zip')}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download radiant-spark-full-codebase.zip (Source)</span>
              </button>
            </div>
          </div>

          {/* Mobile PWA & App Launch Quick Links */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
              ⚡ Web Apps &amp; Mobile PWA Direct Links
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <a
                href="/app.html"
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 hover:text-white hover:border-blue-500 flex items-center justify-between font-bold"
              >
                <span>⚡ SparkSync Mobile App (app.html)</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>
              <a
                href="/sparkdeals.html"
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 hover:text-white hover:border-amber-500 flex items-center justify-between font-bold"
              >
                <span>🔥 SparkDeals Portal (sparkdeals.html)</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
