/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Bot, ShieldAlert, ArrowRight, Building2, Send, HelpCircle, Sparkles, MessageSquare } from 'lucide-react';
import { CountryView } from '../types';

interface RadiantAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: CountryView) => void;
  onOpenSparkSync: () => void;
  onOpenLegalShield: () => void;
  onOpenBusinessInquiry?: (category?: string) => void;
}

export const RadiantAssistantModal: React.FC<RadiantAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
  onOpenSparkSync,
  onOpenLegalShield,
  onOpenBusinessInquiry,
}) => {
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; isUser?: boolean }>>([
    {
      sender: 'Radiant Intelligence Guide',
      text: 'Hello! I am the automated guide for Radiant Spark LLC (USA) and RDNT Sparkle Industries LLP (India). How can I assist you today with our consulting services, products, or legal policies?',
    },
  ]);

  if (!isOpen) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userMsg = chatPrompt;
    setChatPrompt('');

    setChatLog((prev) => [
      ...prev,
      { sender: 'You', text: userMsg, isUser: true },
    ]);

    setTimeout(() => {
      let reply = "Thank you for reaching out! For formal commercial quotes, SOW agreements, or custom distribution inquiries, please submit a direct request to our human executive team.";
      const lower = userMsg.toLowerCase();
      if (lower.includes('cloud') || lower.includes('oracle') || lower.includes('oic') || lower.includes('usa')) {
        reply = "Radiant Spark LLC provides Oracle Fusion ERP, Oracle Integration Cloud (OIC), and Cloud AI architectural consulting in the USA. Click 'Request Technical Consultation' to connect with our US team.";
      } else if (lower.includes('beverage') || lower.includes('sparkle') || lower.includes('india') || lower.includes('solar')) {
        reply = "RDNT Sparkle Industries LLP (India) manages clean energy distribution and Sparkle Drinks botanical beverages in Andhra Pradesh. Click 'Apply for Distributorship' to connect with our India team.";
      } else if (lower.includes('legal') || lower.includes('shield') || lower.includes('privacy') || lower.includes('terms')) {
        reply = "Our legal framework complies with IT Act Section 79 Intermediary Safe Harbour (India) and Section 230 Communications Decency Act (USA). All AI agent interactions are non-binding demonstrations.";
      }

      setChatLog((prev) => [
        ...prev,
        { sender: 'Radiant Intelligence Guide', text: reply },
      ]);
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Radiant Intelligence Assistant"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-slate-950 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-300 shadow-md">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Radiant Intelligence Guide</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                  DEMONSTRATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive Assistant &amp; Navigation Portal
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Important Legal & Scope Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-slate-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-bold mb-0.5">
                Non-Binding Guidance &amp; Human Escalation Notice:
              </strong>
              <span>
                AI representatives and automated guides provide general informational assistance only. AI agents CANNOT execute binding commercial contracts, alter price quotations, commit company resources, or grant unapproved refunds. For binding commercial proposals, please contact human executive managers.
              </span>
            </div>
          </div>

          {/* Quick Action Destinations */}
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Explore Enterprise Portals
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onNavigateToView('usa');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-left transition-colors group"
              >
                <span className="text-xs font-bold text-white group-hover:text-blue-300 block">🇺🇸 Tech USA</span>
                <span className="text-[10px] text-slate-400">Oracle Fusion &amp; OIC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateToView('india');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-left transition-colors group"
              >
                <span className="text-xs font-bold text-white group-hover:text-amber-300 block">🇮🇳 Industries India</span>
                <span className="text-[10px] text-slate-400">Solar, Cans &amp; Beverages</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateToView('sparkdeals');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-left transition-colors group"
              >
                <span className="text-xs font-bold text-white group-hover:text-amber-400 block">🔥 SparkDeals</span>
                <span className="text-[10px] text-slate-400">Verified Deals Feed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateToView('brain');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-left transition-colors group"
              >
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">🧠 AI Brain (10 Agents)</span>
                <span className="text-[10px] text-slate-400">Autonomous Workflow</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateToView('lifestyle');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left transition-colors group"
              >
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">🌿 Lifestyle Hub</span>
                <span className="text-[10px] text-slate-400">Diet &amp; Wellness Plans</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegalShield();
                }}
                className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-400 text-left transition-colors group"
              >
                <span className="text-xs font-bold text-purple-300 block">🛡️ Legal Shield</span>
                <span className="text-[10px] text-slate-400">IT Act Sec 79 &amp; Safe Harbor</span>
              </button>
            </div>
          </div>

          {/* Human Escalation Link */}
          {onOpenBusinessInquiry && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <strong className="text-xs font-bold text-purple-200 block">Need a Human Executive or Commercial Quote?</strong>
                <span className="text-[11px] text-slate-300">Submit an official RFQ or consultation request to our management team.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBusinessInquiry('B2B Executive Consultation');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Contact Human Team</span>
              </button>
            </div>
          )}

          {/* Interactive Chat Window */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Automated Q&amp;A Chat
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl ${
                    msg.isUser
                      ? 'bg-blue-900/40 text-blue-100 border border-blue-500/30 ml-6'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 mr-6'
                  }`}
                >
                  <strong className="block text-[10px] font-mono text-slate-400 mb-0.5">{msg.sender}:</strong>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask about consulting, Sparkle Drinks, or legal disclosures..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
