/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Building2, Phone, Mail, FileText, CheckCircle2, MessageSquare, Calculator, History, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface BusinessInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export interface SavedInquiry {
  id: string;
  timestamp: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: 'USA' | 'India' | 'Global';
  category: string;
  volumeUsd: number;
  message: string;
  status: 'Received' | 'Under Review' | 'Quoted';
}

export const BusinessInquiryModal: React.FC<BusinessInquiryModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'B2B EV Fleet & Solar Distribution',
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'calculator' | 'history'>('form');
  
  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<'USA' | 'India' | 'Global'>('India');
  const [category, setCategory] = useState(defaultCategory);
  const [volumeUsd, setVolumeUsd] = useState(15000);
  const [message, setMessage] = useState('');

  // History State
  const [inquiries, setInquiries] = useState<SavedInquiry[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // Load inquiries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('radiant_spark_inquiries');
      if (saved) {
        setInquiries(JSON.parse(saved));
      } else {
        setInquiries([]);
      }
    } catch {
      setInquiries([]);
    }
  }, []);

  if (!isOpen) return null;

  // Calculate volume pricing estimate
  const discountPct = volumeUsd >= 50000 ? 18 : volumeUsd >= 20000 ? 12 : volumeUsd >= 5000 ? 7 : 0;
  const estimatedSavings = Math.round((volumeUsd * discountPct) / 100);
  const finalEstimate = volumeUsd - estimatedSavings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) return;

    const newInquiry: SavedInquiry = {
      id: `RFQ-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      name,
      company,
      email,
      phone,
      country,
      category,
      volumeUsd,
      message: message || 'Standard B2B Business Quote & Partnership Request',
      status: 'Received',
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    try {
      localStorage.setItem('radiant_spark_inquiries', JSON.stringify(updated));
    } catch {
      // ignore storage error
    }

    setLastSubmittedId(newInquiry.id);
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Radiant Spark B2B Team,\n\nI have submitted Inquiry ID: ${lastSubmittedId || 'RFQ-DIRECT'}.\n\nName: ${name || 'Enterprise Customer'}\nCompany: ${company || 'Corporate Partner'}\nCategory: ${category}\nEst. Volume: $${volumeUsd.toLocaleString()} USD\n\nPlease share the official quote PDF and dispatch timeline.`
    );
    window.open(`https://wa.me/919999999999?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  B2B Enterprise Business Inquiry &amp; RFQ
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  REAL-TIME QUOTE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Radiant Spark LLC (US) &amp; RDNT Sparkle Industries LLP (India) Corporate Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('form'); setIsSubmitted(false); }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'form'
                ? 'border-amber-400 text-amber-300 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Submit RFQ / Inquiry</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'calculator'
                ? 'border-blue-400 text-blue-300 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Volume Pricing Estimator</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-purple-400 text-purple-300 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Saved Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'form' && (
            <>
              {isSubmitted ? (
                <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                      INQUIRY CONFIRMED · {lastSubmittedId}
                    </span>
                    <h4 className="text-2xl font-black text-white">RFQ Successfully Transmitted!</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Thank you, <strong className="text-white">{name}</strong> ({company}). Our enterprise operations team in US / India has logged your inquiry and prepared initial pricing dispatch.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-bold text-slate-200">{category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Volume:</span>
                      <span className="font-bold text-amber-300">${volumeUsd.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Region:</span>
                      <span className="font-bold text-blue-300">{country}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2">
                      <span className="text-slate-400">GST Input / Tax Saver:</span>
                      <span className="font-bold text-emerald-400">Eligible (Up to 18%)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleOpenWhatsApp}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Instant WhatsApp Alert</span>
                    </button>

                    <button
                      onClick={handleResetForm}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Full Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar / Sarah Jenkins"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Company / Business Entity <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Apex Global Distributors LLC"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Corporate Email <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="procurement@company.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 99999 99999 or +1 (555) 000-0000"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Operating Region / Country
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="India">India (RDNT Sparkle Industries LLP)</option>
                        <option value="USA">United States (Radiant Spark LLC)</option>
                        <option value="Global">Global / International Cross-Border</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Inquiry Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="B2B EV Fleet & Solar Distribution">B2B EV Fleet Loader &amp; Solar Distribution</option>
                        <option value="Spark IT Enterprise Consulting (US)">Spark IT Enterprise Cloud &amp; AI Consulting (US)</option>
                        <option value="AI Autonomous Workforce Deployment">AI Autonomous Workforce (10 Agents) Deployment</option>
                        <option value="O2C & P2P Supply Chain Integration">O2C &amp; P2P Order-to-Cash / Procure-to-Pay Engine</option>
                        <option value="Bulk Wholesale SparkDeals RFQ">Bulk Wholesale SparkDeals Purchase RFQ</option>
                        <option value="Regional Distributor License Application">Regional Distributor / Dealership Partnership</option>
                      </select>
                    </div>
                  </div>

                  {/* Slider for volume */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Estimated Annual Deal / Purchase Volume:</span>
                      <span className="font-extrabold text-amber-400 font-mono text-sm">
                        ${volumeUsd.toLocaleString()} USD
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={200000}
                      step={1000}
                      value={volumeUsd}
                      onChange={(e) => setVolumeUsd(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>$2,000 (Small Pilot)</span>
                      <span>$50,000 (Medium Business)</span>
                      <span>$200,000+ (Enterprise Fleet)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Inquiry Specification / Custom Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please specify expected quantities, delivery locations, GST registration numbers, or technical requirements..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Protected under Sec 79 IT Act &amp; Non-Disclosure terms</span>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Enterprise RFQ</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200">
                <strong>B2B Wholesale Volume Tier Calculator:</strong> Instant estimate of volume savings and input tax credit eligibility for corporate buyers across United States &amp; India.
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Select Target Annual Procurement Volume ($ USD):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[5000, 15000, 50000, 100000].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setVolumeUsd(vol)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold text-center transition-all ${
                        volumeUsd === vol
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      ${vol.toLocaleString()} USD
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">List Price</span>
                    <span className="text-xl font-bold text-white font-mono">${volumeUsd.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block">Volume Tier Discount ({discountPct}%)</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">-${estimatedSavings.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] font-mono text-amber-300 uppercase block">Net Estimated Cost</span>
                    <span className="text-xl font-extrabold text-amber-300 font-mono">${finalEstimate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>GST Input Tax Credit Eligibility (India):</span>
                    <span className="font-bold text-emerald-400">18% ITC Preserved</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard SLA &amp; Dispatch Timeline:</span>
                    <span className="font-bold text-blue-300">24-48 Hours Direct Dispatch</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stripe Multi-Currency USD Converter:</span>
                    <span className="font-bold text-purple-300">Auto FX Handled</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('form')}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Submit RFQ with calculated volume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No saved inquiries found. Submit an RFQ to track its status here.
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">{inq.id}</span>
                          <span className="text-[10px] text-slate-500">· {inq.timestamp}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                          {inq.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        <div>
                          <span className="text-slate-500">Contact:</span> {inq.name} ({inq.company})
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span> {inq.category}
                        </div>
                        <div>
                          <span className="text-slate-500">Est. Volume:</span> ${inq.volumeUsd.toLocaleString()} USD
                        </div>
                        <div>
                          <span className="text-slate-500">Region:</span> {inq.country}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        "{inq.message}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
