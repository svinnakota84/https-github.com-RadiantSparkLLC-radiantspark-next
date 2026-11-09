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
} from 'lucide-react';

export const O2cP2pModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'o2c' | 'p2p'>('o2c');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const runStepSimulation = (stepNum: number) => {
    setActiveStep(stepNum);
    const timeStr = new Date().toLocaleTimeString();
    if (activeTab === 'o2c') {
      const logs = [
        `[${timeStr}] O2C Step 1: Customer Order #ORD-9982 ingested from SparkDeals Hub.`,
        `[${timeStr}] O2C Step 2: Automated GSTIN & Credit Limit Check passed (Andhra Mega Ltd).`,
        `[${timeStr}] O2C Step 3: Factory stock allocated at Visakhapatnam Unit #02 (200 cases reserved).`,
        `[${timeStr}] O2C Step 4: Refrigerated EV Fleet AP-31-EV-8840 dispatched with temperature IoT log (2.8°C).`,
        `[${timeStr}] O2C Step 5: Statutory Form GST INV-01 issued with IRN & QR Code.`,
        `[${timeStr}] O2C Step 6: Bank NEFT/RTGS payment received & Cash Application reconciled in Oracle ERP.`,
      ];
      setExecutionLog((prev) => [logs[stepNum - 1], ...prev.slice(0, 8)]);
    } else {
      const logs = [
        `[${timeStr}] P2P Step 1: Raw Material Requisition #REQ-4410 created for 500 KG Berry Extract.`,
        `[${timeStr}] P2P Step 2: Vendor PO #PO-8810 dispatched to Herbal Suppliers LLP.`,
        `[${timeStr}] P2P Step 3: Factory Goods Receipt Note (GRN #GRN-3021) logged at Chittoor Facility.`,
        `[${timeStr}] P2P Step 4: Automated 3-Way Match verified (PO #8810 == GRN #3021 == Invoice #901).`,
        `[${timeStr}] P2P Step 5: Accounts Payable voucher scheduled for Net-30 disbursement.`,
        `[${timeStr}] P2P Step 6: Vendor disbursement remitted via HDFC Corporate Banking API.`,
      ];
      setExecutionLog((prev) => [logs[stepNum - 1], ...prev.slice(0, 8)]);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>ENTERPRISE ERP &amp; AUTOMATED WORKFLOW MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order-to-Cash (O2C) &amp; Procure-to-Pay (P2P) Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Autonomous closed-loop business processes bridging U.S. Oracle Fusion ERP with India factory manufacturing and cold-chain distribution.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold shrink-0">
          <button
            onClick={() => {
              setActiveTab('o2c');
              setActiveStep(1);
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'o2c'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🥤 Order-to-Cash (O2C)
          </button>
          <button
            onClick={() => {
              setActiveTab('p2p');
              setActiveStep(1);
            }}
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

      {/* Workflow Step Diagrams */}
      {activeTab === 'o2c' ? (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
            <span>End-to-End O2C Process Flow:</span>
            <span className="text-slate-400">Click any step to test execution</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: 1, title: '1. Order Intake', desc: 'SparkDeals / D2C' },
              { step: 2, title: '2. Credit Check', desc: 'GSTIN & Limit' },
              { step: 3, title: '3. Factory Reserve', desc: 'Visakhapatnam' },
              { step: 4, title: '4. EV Dispatch', desc: 'Tata Reefer 2.8°C' },
              { step: 5, title: '5. GST E-Invoice', desc: 'IRN & 28% Tax' },
              { step: 6, title: '6. Cash Application', desc: 'AR Reconciliation' },
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => runStepSimulation(s.step)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  activeStep === s.step
                    ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1">STEP 0{s.step}</span>
                <strong className="text-xs font-bold block text-white">{s.title}</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center justify-between">
            <span>End-to-End P2P Process Flow:</span>
            <span className="text-slate-400">Click any step to test execution</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: 1, title: '1. Requisition', desc: 'Berry Extract' },
              { step: 2, title: '2. Vendor PO', desc: 'Herbal Supplier' },
              { step: 3, title: '3. Factory GRN', desc: 'Chittoor Plant' },
              { step: 4, title: '4. 3-Way Match', desc: 'PO == GRN == Inv' },
              { step: 5, title: '5. AP Voucher', desc: 'Net-30 Approval' },
              { step: 6, title: '6. Disbursement', desc: 'HDFC Banking API' },
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => runStepSimulation(s.step)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  activeStep === s.step
                    ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">STEP 0{s.step}</span>
                <strong className="text-xs font-bold block text-white">{s.title}</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
          <div className="space-y-1 max-h-32 overflow-y-auto text-[11px] text-slate-300">
            {executionLog.map((log, idx) => (
              <div key={idx} className="py-0.5 flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-[11px] text-center py-3">
            Click on any process step above to trigger real-time O2C or P2P execution logs.
          </div>
        )}
      </div>
    </div>
  );
};
