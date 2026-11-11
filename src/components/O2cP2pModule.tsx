/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  FileText,
  DollarSign,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Clock,
  ChevronRight,
  Check,
  Send,
  RefreshCw,
} from 'lucide-react';

export const O2cP2pModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'o2c' | 'p2p'>('o2c');
  const [customerType, setCustomerType] = useState<'dealer' | 'consumer'>('dealer');
  
  // Input fields (100% Blank for Customer Entry)
  const [dealerName, setDealerName] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [customerTier, setCustomerTier] = useState('Wholesale Dealer - Tier A (12% Discount)');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [beverageSku, setBeverageSku] = useState('Botanical Berry Spritz (₹1,560 / cs)');
  const [casesCount, setCasesCount] = useState<number>(200);
  const [selectedPlant, setSelectedPlant] = useState('Visakhapatnam Bottling Line #3 (Active)');
  const [selectedFleet, setSelectedFleet] = useState('Tata Ace EV Reefer (AP-31-EV-8840 · 3.2°C)');

  // Stage execution state
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [stageStatus, setStageStatus] = useState({
    intake: true,
    requisition: true,
    invoicing: true,
    logistics: true,
  });

  // Calculations
  const casePrice = beverageSku.includes('1,560') ? 1560 : 1440;
  const grossValue = casesCount * casePrice;
  const discountPct = customerTier.includes('12%') ? 12 : customerTier.includes('15%') ? 15 : 5;
  const discountAmount = (grossValue * discountPct) / 100;
  const taxableValue = grossValue - discountAmount;
  const cgst = (taxableValue * 14) / 100;
  const sgst = (taxableValue * 14) / 100;
  const totalPayable = taxableValue + cgst + sgst;

  const handleRunAutonomousPipeline = () => {
    setIsRunningPipeline(true);
    const timeStr = new Date().toLocaleTimeString();
    const activeDealerName = dealerName.trim() || 'Valued Dealer Partner';
    const activeGstin = buyerGstin.trim() || '37AABCR9912C1Z4';
    const activeCity = deliveryCity.trim() || 'Vijayawada Central Depot, AP';
    
    setExecutionLog((prev) => [
      `[${timeStr}] ⚡ Autonomous Execution Started for ${activeDealerName}...`,
      ...prev,
    ]);

    setTimeout(() => {
      setExecutionLog((prev) => [
        `[${timeStr}] Stage 1 VERIFIED: Dealer Intake (${activeDealerName}) & GSTIN ${activeGstin} validated by Arjun Reddy & Maya Chen.`,
        `[${timeStr}] Stage 2 ALLOCATED: Factory Requisition REQ-DRK-${Math.floor(1000 + Math.random() * 9000)} issued by Rajesh Varma (${casesCount} cases reserved at ${selectedPlant.split(' ')[0]}).`,
        `[${timeStr}] Stage 3 ISSUED: Statutory 28% GST Invoice (CGST ₹${cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })} + SGST ₹${sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}) stamped by Elena Rostova & Ananya Iyer.`,
        `[${timeStr}] Stage 4 DISPATCHED: Cold-Chain Fleet ${selectedFleet.split(' ')[0]} dispatched to ${activeCity} by Capt. Vikram Naidu! Total Payable: ₹${totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        ...prev,
      ]);
      setIsRunningPipeline(false);
    }, 1200);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#070d1e] border-2 border-purple-500/40 shadow-2xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>AUTONOMOUS ORDER-TO-SHIPMENT ERP PIPELINE &amp; GST 28% CALCULATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order-to-Cash (O2C) &amp; Procure-to-Pay (P2P) Execution Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Compute 28% GST, create statutory E-Invoices, allocate live on-hand inventory, and dispatch refrigerated EV transport.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold shrink-0">
          <button
            onClick={() => setActiveTab('o2c')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'o2c'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🥤 Order-to-Cash (O2C)
          </button>
          <button
            onClick={() => setActiveTab('p2p')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'p2p'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏭 Procure-to-Pay (P2P)
          </button>
        </div>
      </div>

      {/* Main Suite Layout matching image_0b4e04cd.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Inventory Selector */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Dealer / Customer Name
              </label>
              <input
                type="text"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                placeholder="Enter Dealer / Customer Business Name (e.g. Andhra Mega Distributors Ltd)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Customer Type &amp; Tier
              </label>
              <select
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="Wholesale Dealer - Tier A (12% Discount)">Wholesale Dealer - Tier A (12% Discount)</option>
                <option value="Regional Super Stockist - Tier S (15% Discount)">Regional Super Stockist - Tier S (15% Discount)</option>
                <option value="Direct Retail Store - Tier B (5% Discount)">Direct Retail Store - Tier B (5% Discount)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Buyer GSTIN / ID
              </label>
              <input
                type="text"
                value={buyerGstin}
                onChange={(e) => setBuyerGstin(e.target.value)}
                placeholder="Enter 15-Digit GSTIN (e.g. 37AABCR9912C1Z4)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono font-bold text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Delivery City / State
              </label>
              <input
                type="text"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                placeholder="Enter Delivery Location (e.g. Vijayawada Depot, AP)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* SKU Selection & Quick Increments */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-purple-300 uppercase">SPARKLE DRINKS SKU SELECTION (HSN 2202 · 28% GST)</span>
              <span className="text-slate-400">24 CANS / CASE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Select Beverage</label>
                <select
                  value={beverageSku}
                  onChange={(e) => setBeverageSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs focus:outline-none"
                >
                  <option value="Botanical Berry Spritz (₹1,560 / cs)">Botanical Berry Spritz (₹1,560 / cs)</option>
                  <option value="Citrus Herbal Tonic (₹1,440 / cs)">Citrus Herbal Tonic (₹1,440 / cs)</option>
                  <option value="Ginger Mint Sparkler (₹1,440 / cs)">Ginger Mint Sparkler (₹1,440 / cs)</option>
                </select>
              </div>

              <div className="sm:col-span-5 flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Quantity (Cases)</label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={casesCount}
                    onChange={(e) => setCasesCount(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-end gap-1 pt-4">
                  <button
                    type="button"
                    onClick={() => setCasesCount((prev) => prev + 50)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-300"
                  >
                    +50
                  </button>
                  <button
                    type="button"
                    onClick={() => setCasesCount((prev) => prev + 100)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-300"
                  >
                    +100
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live On-Hand Inventory Check Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE ON-HAND INVENTORY CHECK (PRIYA SHARMA &amp; RAJESH VARMA)
              </span>
              <span className="text-emerald-300 font-mono font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Available: 29,450 Cases
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">🏭 Vizag Plant</span>
                <strong className="text-emerald-400 font-bold block text-sm">18,450 cs</strong>
                <span className="text-[9px] text-slate-500">Active Line #3</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">🏢 Vijayawada Depot</span>
                <strong className="text-cyan-400 font-bold block text-sm">6,200 cs</strong>
                <span className="text-[9px] text-slate-500">Cross-Dock Hub</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">📦 Amazon FBA (HYD1)</span>
                <strong className="text-amber-300 font-bold block text-sm">4,800 cs</strong>
                <span className="text-[9px] text-slate-500">Prime 1-Day Stock</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
              <span>Stock Check for <strong>{casesCount} Cases</strong>:</span>
              <span>✓ In Stock &amp; Ready to Ship ({(29450 - casesCount).toLocaleString()} cs buffer)</span>
            </div>
          </div>

          {/* Plant & Fleet Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase font-mono">Manufacturing Plant</label>
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="Visakhapatnam Bottling Line #3 (Active)">Visakhapatnam Bottling Line #3 (Active)</option>
                <option value="Chittoor Organic Facility (Active)">Chittoor Organic Facility (Active)</option>
                <option value="Guntur Cross-Dock Hub (Active)">Guntur Cross-Dock Hub (Active)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase font-mono">Refrigerated Cold-Chain Fleet</label>
              <select
                value={selectedFleet}
                onChange={(e) => setSelectedFleet(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
              >
                <option value="Tata Ace EV Reefer (AP-31-EV-8840 · 3.2°C)">Tata Ace EV Reefer (AP-31-EV-8840 · 3.2°C)</option>
                <option value="Mahindra Supro EV Reefer (AP-07-EV-7120 · 2.8°C)">Mahindra Supro EV Reefer (AP-07-EV-7120 · 2.8°C)</option>
                <option value="Ashok Leyland BADA DOST EV (AP-16-EV-9901 · 3.5°C)">Ashok Leyland BADA DOST EV (AP-16-EV-9901 · 3.5°C)</option>
              </select>
            </div>
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleRunAutonomousPipeline}
            disabled={isRunningPipeline}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isRunningPipeline ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                <span>Synchronizing All 10 AI Agents &amp; Oracle ERP...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>⚡ RUN AUTONOMOUS AI PIPELINE (10 AI EMPLOYEES)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Financials & 4 Execution Stages */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* GST Calculation & Financials Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <strong className="text-purple-300 font-extrabold uppercase">GST CALCULATION &amp; FINANCIALS</strong>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                HSN 2202 · 28% GST
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Gross Value ({casesCount} cases @ ₹{casePrice.toLocaleString()}):</span>
                <span className="font-bold text-white">₹{grossValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-emerald-400">
                <span>Volume Dealer Discount ({discountPct}%):</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                <span>Taxable Value (Base):</span>
                <span>₹{taxableValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-cyan-300">
                <span>CGST (14%):</span>
                <span>₹{cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-cyan-300">
                <span>SGST (14%):</span>
                <span>₹{sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-lg font-black text-amber-300 pt-2 border-t-2 border-slate-800">
                <span>Total Invoice Payable:</span>
                <span>₹{totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-200 leading-normal">
              <strong className="block font-bold mb-0.5">Automated Compliance Sentinel:</strong>
              Compliant with Section 16 CGST Act &amp; FSSAI Lic #10126999000142. Zero tax miscalculation risk.
            </div>
          </div>

          {/* Autonomous AI Execution Stages (4 Steps Cards) */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <strong className="text-white font-extrabold uppercase">AUTONOMOUS AI EXECUTION STAGES</strong>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                Ready
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Stage 1 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="block text-white text-xs font-bold">1. Dealer Intake &amp; Validation</strong>
                    <span className="text-[10px] text-slate-400">Agents: Arjun Reddy &amp; Maya Chen</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                  VERIFIED
                </span>
              </div>

              {/* Stage 2 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="block text-white text-xs font-bold">2. Factory Requisition Slip</strong>
                    <span className="text-[10px] text-slate-400">Agents: Rajesh Varma &amp; Priya Sharma</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                  ALLOCATED
                </span>
              </div>

              {/* Stage 3 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="block text-white text-xs font-bold">3. Statutory 28% GST Invoice</strong>
                    <span className="text-[10px] text-slate-400">Agents: Elena Rostova &amp; Ananya Iyer</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                  ISSUED
                </span>
              </div>

              {/* Stage 4 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="block text-white text-xs font-bold">4. Cold-Chain EV Logistics</strong>
                    <span className="text-[10px] text-slate-400">Agent: Capt. Vikram Naidu</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                  DISPATCHED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Telemetry Log */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Live Process Execution Audit Log
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">100% Autonomous (0 Manual Errors)</span>
        </div>

        {executionLog.length > 0 ? (
          <div className="space-y-1 max-h-36 overflow-y-auto text-[11px] text-slate-300">
            {executionLog.map((log, idx) => (
              <div key={idx} className="py-0.5 flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-[11px] text-center py-3">
            Click <strong>"⚡ RUN AUTONOMOUS AI PIPELINE"</strong> above to trigger real-time O2C or P2P execution logs.
          </div>
        )}
      </div>
    </div>
  );
};
