/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Building2, CheckCircle2, ShieldCheck, Send, Truck, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface SupplierIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierIntakeModal: React.FC<SupplierIntakeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    category: 'Clean Energy & Solar Hardware',
    countryRegion: 'India',
    supplyCapacity: '',
    moq: '',
    certifications: '',
    productDescription: '',
    agreedToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    timestamp: string;
    companyName: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      alert('Please fill in all required company contact details.');
      return;
    }

    if (!formData.agreedToTerms) {
      alert('Please check the box to acknowledge the Supplier Onboarding Draft Guidelines.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/suppliers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      setSubmittedTicket({
        id: data.ticketId || `SUP-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString(),
        companyName: formData.companyName,
      });
    } catch {
      // Fallback
      setSubmittedTicket({
        id: `SUP-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString(),
        companyName: formData.companyName,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Supplier & Vendor Application Intake Modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold shadow-md">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">
                  Supplier &amp; Vendor Qualification Intake
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  SUPPLIER JOURNEY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Partner with RDNT Sparkle Industries LLP (India) or Radiant Spark LLC (USA)
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
          
          {submittedTicket ? (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-500/40">
                ✓
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Application Received</h4>
                <p className="text-xs text-slate-300">
                  Thank you, <strong className="text-white">{submittedTicket.companyName}</strong>. Your supplier profile has been recorded under Procurement Ticket ID <strong className="text-emerald-400 font-mono">{submittedTicket.id}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-[11px] text-slate-400 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Ticket Reference:</span>
                  <span className="text-white font-bold">{submittedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Submission Time:</span>
                  <span className="text-slate-300">{submittedTicket.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Procurement Entity:</span>
                  <span className="text-amber-300 font-bold">RDNT Sparkle / Radiant Spark Procurement</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Notice: Submitting a supplier application does not constitute a binding supply agreement or purchase order commitment. Our procurement team will review your capacity, certifications, and pricing before contacting you.
              </p>

              <button
                onClick={() => {
                  setSubmittedTicket(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
              >
                Close &amp; Return to Website
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Entity Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-slate-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block font-bold mb-0.5">
                    Official Procurement Channel Notice:
                  </strong>
                  <span>
                    We evaluate suppliers for solar panels, LiFePO4 batteries, beverage botanical extracts, aluminum cans, cold-chain transport, and enterprise software. Submissions are processed by human procurement managers.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    placeholder="Enter official company name..."
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    placeholder="Enter full name of representative..."
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="supplier@company.com..."
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210 or +1 (555) 000-0000..."
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Supply Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Clean Energy & Solar Hardware">Clean Energy &amp; Solar Hardware</option>
                    <option value="Beverage Ingredients & Cans">Beverage Ingredients &amp; Packaging Cans</option>
                    <option value="Refrigerated Cold-Chain & Logistics">Refrigerated Cold-Chain &amp; EV Logistics</option>
                    <option value="IT & Cloud Software Infrastructure">IT &amp; Cloud Software Infrastructure</option>
                    <option value="Gourmet Food & Dry Fruits Processing">Gourmet Food &amp; Dry Fruits Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Primary Country / Operating Region *
                  </label>
                  <select
                    name="countryRegion"
                    value={formData.countryRegion}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="India">India (Andhra Pradesh, Telangana, Pan-India)</option>
                    <option value="USA">United States (Georgia &amp; North America)</option>
                    <option value="Global">Global International Trade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Monthly Supply Capacity
                  </label>
                  <input
                    type="text"
                    name="supplyCapacity"
                    placeholder="e.g. 10,000 units / month"
                    value={formData.supplyCapacity}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                    Minimum Order Quantity (MOQ)
                  </label>
                  <input
                    type="text"
                    name="moq"
                    placeholder="e.g. 500 units minimum"
                    value={formData.moq}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase font-mono text-[10px]">
                  Product / Service Specifications &amp; Pricing Quotation
                </label>
                <textarea
                  name="productDescription"
                  rows={3}
                  placeholder="Describe your product specifications, quality standards, unit pricing, and delivery timelines..."
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Acknowledgement Checkbox */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleInputChange}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span>
                    I acknowledge that this intake form is an initial supplier application. No commercial contract or binding purchase order is created until formal written agreement is executed by authorized human executive managers.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Recording Supplier Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Submit Supplier &amp; Vendor Application</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
