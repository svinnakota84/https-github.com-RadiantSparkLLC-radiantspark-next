/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AI_EMPLOYEES,
  SPARKLE_DRINKS_PRODUCTS,
  INITIAL_ORDERS,
} from '../data/aiEmployeesData';
import { SparkDrinkOrder, RequisitionSlip, TaxInvoice, ShipmentDispatch } from '../types';
import { askAiBrain } from '../utils/geminiBrain';
import { dispatchToEnterpriseCloud } from '../utils/cloudSync';
import { buildWhatsAppInvoiceUrl } from '../utils/translations';
import { O2cP2pModule } from './O2cP2pModule';
import {
  Cpu,
  Zap,
  CheckCircle2,
  Truck,
  FileText,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  Send,
  Building,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';

interface AiBrainViewProps {
  onOpenSparkSync: () => void;
  onNavigateToView: (view: 'global' | 'india' | 'usa' | 'sparkdeals') => void;
}

export const AiBrainView: React.FC<AiBrainViewProps> = ({
  onOpenSparkSync,
  onNavigateToView,
}) => {
  // Active Filter for 10 AI Employees
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-1');

  // Orders State
  const [orders, setOrders] = useState<SparkDrinkOrder[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<SparkDrinkOrder>(INITIAL_ORDERS[0]);

  // Enterprise Cloud Sync State (Operated under the hood by Marcus Vance)
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    status: 'synced' | 'ready' | 'syncing';
    traceId: string;
    latencyMs: number;
    lastSyncTime: string;
  }>({
    status: 'ready',
    traceId: 'OIC-SYNC-INIT',
    latencyMs: 18,
    lastSyncTime: 'Real-time Synchronized'
  });
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [whatsappSentNotice, setWhatsappSentNotice] = useState<string | null>(null);

  const handleSendWhatsApp = () => {
    const url = buildWhatsAppInvoiceUrl(selectedOrder);
    window.open(url, '_blank');
    setWhatsappSentNotice(`✅ WhatsApp Business Invoice & Live Tracking Sent to Dealer (+91 98480 22331)`);
    setTimeout(() => setWhatsappSentNotice(null), 5000);
  };

  // Order Form State (100% Blank for Customer Intake)
  const [customerType, setCustomerType] = useState<'dealer' | 'consumer'>('dealer');
  const [buyerName, setBuyerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [selectedProduct, setSelectedProduct] = useState(SPARKLE_DRINKS_PRODUCTS[0]);
  const [casesCount, setCasesCount] = useState<number>(200);

  // Automation Pipeline State
  const [isAutomating, setIsAutomating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [activeDocTab, setActiveDocTab] = useState<'invoice' | 'receipt' | 'amazonLabel' | 'requisition' | 'shipment'>('invoice');

  // AI Chat Console State
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; role: string; text: string; source: string }>>([
    {
      sender: 'Maya Chen',
      role: 'Chief AI Operations Orchestrator',
      text: 'Welcome to the Radiant Spark Global AI Brain. All 10 AI employees are online, monitoring dealer orders, automating factory requisitions, stamping GST invoices, and scheduling refrigerated EV shipments for Sparkle Drinks across India.',
      source: 'gemini-3.8-flash'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Price Calculations
  const unitPrice = selectedProduct.casePrice;
  const subtotal = unitPrice * casesCount;
  const discountPercent = customerType === 'dealer' ? (casesCount >= 500 ? 15 : casesCount >= 200 ? 10 : 5) : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gstRate = 28; // Statutory 28% for carbonated/flavored beverages under HSN 2202
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = taxableAmount + gstAmount;

  // Filtered employees
  const filteredEmployees = selectedDept === 'all'
    ? AI_EMPLOYEES
    : AI_EMPLOYEES.filter(emp => emp.department.toLowerCase().includes(selectedDept.toLowerCase()));

  // Trigger End-to-End Autonomous Execution
  const handleTriggerAutomation = () => {
    setIsAutomating(true);
    setPipelineStep(1);

    const newOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReqId = `REQ-DRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newWaybillId = `WB-SPK-${Math.floor(1000 + Math.random() * 9000)}`;
    const vehicles = ['AP-07-EV-8842', 'AP-07-EV-7120', 'AP-16-EV-9901'];
    const chosenVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

    const activeBuyerName = buyerName.trim() || 'Valued Customer';
    const activeBusinessName = businessName.trim() || 'Wholesale Partner';
    const activeGstin = gstin.trim() || '37AAACP4412K1Z9';

    const createdOrder: SparkDrinkOrder = {
      id: newOrderId,
      date: new Date().toISOString().split('T')[0],
      customerType,
      buyerName: activeBuyerName,
      businessName: customerType === 'dealer' ? activeBusinessName : 'Direct Consumer',
      gstin: customerType === 'dealer' ? activeGstin : undefined,
      city,
      state: city === 'Hyderabad' ? 'Telangana' : 'Andhra Pradesh',
      product: selectedProduct.name,
      unitPrice,
      cases: casesCount,
      totalCans: casesCount * 24,
      subtotal,
      discountPercent,
      discountAmount,
      gstRate,
      gstAmount,
      grandTotal,
      status: 'received',
      requisitionId: newReqId,
      invoiceId: newInvId,
      waybillId: newWaybillId,
      vehicleNo: chosenVehicle
    };

    // Active background dispatch to Oracle OIC & Enterprise Cloud Backbone
    dispatchToEnterpriseCloud({
      orderId: newOrderId,
      buyerName,
      businessName: customerType === 'dealer' ? businessName : 'Direct Consumer',
      gstin: customerType === 'dealer' ? gstin : undefined,
      city,
      product: selectedProduct.name,
      cases: casesCount,
      grandTotal,
      waybillId: newWaybillId
    }).then(res => {
      setCloudSyncStatus({
        status: 'synced',
        traceId: res.traceId,
        latencyMs: res.latencyMs,
        lastSyncTime: res.timestamp
      });
    });

    // Step 1: Order Intake (Arjun Reddy)
    setTimeout(() => {
      setPipelineStep(2);
      createdOrder.status = 'requisitioned';
    }, 700);

    // Step 2: Requisition Work Order (Rajesh Varma)
    setTimeout(() => {
      setPipelineStep(3);
      createdOrder.status = 'invoiced';
    }, 1400);

    // Step 3: GST Invoice & Tax Stamping (Elena Rostova)
    setTimeout(() => {
      setPipelineStep(4);
      createdOrder.status = 'dispatched';
    }, 2100);

    // Step 4: Dispatch Complete (Capt. Vikram Naidu)
    setTimeout(() => {
      setIsAutomating(false);
      setOrders(prev => [createdOrder, ...prev]);
      setSelectedOrder(createdOrder);

      // Add audit log to AI chat
      setChatLog(prev => [
        ...prev,
        {
          sender: 'Autonomous Pipeline Loop',
          role: 'All 10 Agents Synchronized',
          text: `⚡ Autonomous Order-to-Shipment Complete for ${createdOrder.id}! B2B Dealer Order verified by Arjun Reddy (${casesCount} cases of ${selectedProduct.name}), Factory Requisition ${newReqId} issued by Rajesh Varma, 28% GST E-Invoice ${newInvId} (₹${grandTotal.toLocaleString('en-IN')}) stamped by Elena Rostova, EV Fleet ${chosenVehicle} dispatched to ${city} by Capt. Vikram Naidu, and ERP Ledger synchronized by Marcus Vance!`,
          source: 'autonomous-brain'
        }
      ]);
    }, 2800);
  };

  // Chat Submission
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatPrompt.trim() || isChatLoading) return;

    const userText = chatPrompt;
    setChatPrompt('');
    setIsChatLoading(true);

    const targetEmp = AI_EMPLOYEES.find(e => e.id === selectedEmployeeId);

    setChatLog(prev => [
      ...prev,
      {
        sender: 'You (Business Executive)',
        role: 'Authorized Commander',
        text: userText,
        source: 'user'
      }
    ]);

    const result = await askAiBrain(userText, selectedEmployeeId);

    setChatLog(prev => [
      ...prev,
      {
        sender: result.employeeName,
        role: result.employeeRole,
        text: result.response,
        source: result.source
      }
    ]);

    setIsChatLoading(false);
  };

  return (
    <div className="space-y-12 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* ============================================================== */}
      {/* SECTION 1: AI BRAIN CONTROL COCKPIT HEADER                      */}
      {/* ============================================================== */}
      <section className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0a1226] to-slate-950 border border-cyan-500/50 shadow-2xl overflow-hidden">
        
        {/* Ambient Neural Backlight */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-300 shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>GLOBAL AUTONOMOUS AI BRAIN · 10 AI EMPLOYEES</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Radiant Brain <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">10X OS</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Autonomous multi-agent intelligence taking care of global business operations: customer &amp; dealer order intake, factory batch requisitions, instant GST invoicing, and refrigerated EV cold-chain dispatch for <strong className="text-amber-300">Sparkle Drinks</strong>.
              </p>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Active AI Workforce</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  10 / 10
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Productivity Boost</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5 block">
                  +420%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Order-to-Ship Time</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5 block">
                  1.4s Auto
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Agent Activity Feed Ticker */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 overflow-x-auto">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] shrink-0 border border-cyan-500/30">
              LIVE BRAIN TICKER
            </span>
            <div className="flex items-center gap-6 whitespace-nowrap text-[11px] font-mono">
              <span className="text-emerald-400">⚡ Maya Chen synced US &amp; India ledgers</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-300">📦 Arjun Reddy onboarded Vijayawada Supermarket Network</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300">🏭 Rajesh Varma allocated batch REQ-DRK-8841</span>
              <span className="text-slate-600">·</span>
              <span className="text-blue-300">🧾 Elena Rostova generated GST Invoice INV-2026-0812</span>
              <span className="text-slate-600">·</span>
              <span className="text-purple-300">🚚 Capt. Vikram Naidu dispatched EV Van AP-07-EV-8842</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Order-to-Cash & Procure-to-Pay Closed-Loop Matrix */}
      <O2cP2pModule />

      {/* ============================================================== */}
      {/* SECTION 2: THE 10 AI EMPLOYEES DIRECTORY                        */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              AUTONOMOUS WORKFORCE DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              10 Specialized AI Employees
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Each employee possesses autonomous reasoning, domain prompts, and direct API actions to run global operations 24/7.
          </p>
        </div>

        {/* 10 AI Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {AI_EMPLOYEES.map((emp) => {
            const isSelected = selectedEmployeeId === emp.id;
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={`p-4 rounded-2xl bg-slate-900/80 border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-lg ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-900 shadow-cyan-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {emp.avatar}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      GEMINI AI AGENT
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{emp.name}</h3>
                    <p className="text-[11px] font-semibold text-cyan-400 leading-snug mt-0.5">{emp.role}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{emp.department}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-300 leading-relaxed">
                    <span className="text-slate-500 font-bold block mb-0.5">CURRENT TASK:</span>
                    {emp.currentTask}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400">
                    Operational Task Engine Active
                  </span>
                  <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                    Select <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected AI Employee Inter-Agent Connectivity Inspector */}
        {(() => {
          const emp = AI_EMPLOYEES.find((e) => e.id === selectedEmployeeId) || AI_EMPLOYEES[0];
          return (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/50 shadow-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl sm:text-4xl p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                    {emp.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white">{emp.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                        GEMINI 3.8 AI ENGINE
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-cyan-300 mt-0.5">{emp.role}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{emp.department}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    Tasks Completed: <strong className="text-cyan-400 font-bold">{emp.tasksCompleted.toLocaleString()}</strong>
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 font-bold">
                    Protocol: {emp.handshakeProtocol || 'AUTONOMOUS_REST_v1'}
                  </span>
                </div>
              </div>

              {/* Real-time Connectivity Flow: Upstream -> Current Agent -> Downstream */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Upstream Feeds */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⬆️ Upstream Data Feeds (Triggers)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {emp.connectedUpstream?.map((upName) => (
                      <span key={upName} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 font-bold text-[11px]">
                        {upName}
                      </span>
                    )) || <span className="text-slate-500 italic">Root Orchestrator</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    Provides verified input payloads, GSTINs, and order requisitions directly to {emp.name}.
                  </p>
                </div>

                {/* Business Value & Effect */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Real-Time Business Effect &amp; ROI</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                    {emp.businessValue || 'Runs 24/7 autonomous execution with zero manual intervention.'}
                  </p>
                </div>

                {/* Downstream Handshakes */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⬇️ Downstream Handshakes (Next Action)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {emp.connectedDownstream?.map((downName) => (
                      <span key={downName} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 font-bold text-[11px]">
                        {downName}
                      </span>
                    )) || <span className="text-slate-500 italic">Terminal Action</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    {emp.name} automatically triggers these downstream agents within &lt;12ms of execution.
                  </p>
                </div>
              </div>

              {/* Skills Badges & Direct Prompt Action */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Specialized Skills:</span>
                  {emp.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                      ✓ {skill}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const chatInput = document.getElementById('brain-chat-input');
                    if (chatInput) {
                      (chatInput as HTMLInputElement).value = `How do you connect with downstream agents during an active wholesale order?`;
                    }
                    const chatSec = document.getElementById('brain-chat');
                    if (chatSec) chatSec.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>💬 Consult {emp.name}</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* CLOSED-LOOP WORKFORCE HANDSHAKE ARCHITECTURE MATRIX */}
      <section className="space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-purple-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>AWARD-WINNING CLOSED-LOOP WORKFORCE ARCHITECTURE</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Real-Time Inter-Agent Handshake &amp; Workflow Connectivity
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                All 10 AI Employees function as an integrated, closed-loop neural network—eliminating manual paperwork, billing reconciliation delays, and dispatch bottlenecks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                ⚡ 10 Agents · 100% Closed-Loop
              </span>
            </div>
          </div>

          {/* 10 Step Sequential Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-purple-300 text-xs">1. Maya Chen</strong>
                <span className="text-[9px] text-slate-500">ORCHESTRATE</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Harmonizes global operations &amp; balances cross-border ledgers.</p>
              <span className="text-[9px] text-purple-400 block pt-1">➔ Triggers Arjun &amp; Sarah</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-blue-300 text-xs">2. Arjun Reddy</strong>
                <span className="text-[9px] text-slate-500">INTAKE</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Validates dealer GSTIN &amp; applies volume tier discounts.</p>
              <span className="text-[9px] text-blue-400 block pt-1">➔ Triggers Rajesh Varma</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-amber-300 text-xs">3. Rajesh Varma</strong>
                <span className="text-[9px] text-slate-500">BOTTLING</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Issues factory work order REQ-DRK-8841 at Vizag plant.</p>
              <span className="text-[9px] text-amber-400 block pt-1">➔ Triggers Elena &amp; Priya</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-emerald-300 text-xs">4. Elena Rostova</strong>
                <span className="text-[9px] text-slate-500">INVOICING</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Stamps 28% GST E-Invoice with IRN &amp; QR verification.</p>
              <span className="text-[9px] text-emerald-400 block pt-1">➔ Triggers Capt. Vikram</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-cyan-300 text-xs">5. Capt. Vikram</strong>
                <span className="text-[9px] text-slate-500">DISPATCH</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Dispatches Tata Ace EV Reefer at active 3.2°C cold-chain.</p>
              <span className="text-[9px] text-cyan-400 block pt-1">➔ Triggers Marcus Vance</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-teal-300 text-xs">6. Priya Sharma</strong>
                <span className="text-[9px] text-slate-500">PROCURE</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Monitors aluminum cans &amp; botanical syrup safety stock.</p>
              <span className="text-[9px] text-teal-400 block pt-1">➔ Triggers Plant Reorders</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-indigo-300 text-xs">7. Marcus Vance</strong>
                <span className="text-[9px] text-slate-500">CLOUD IT</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Streams transactions to Oracle Fusion ERP &amp; Amazon FBA.</p>
              <span className="text-[9px] text-indigo-400 block pt-1">➔ Triggers David Sterling</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-yellow-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-yellow-300 text-xs">8. Ananya Iyer</strong>
                <span className="text-[9px] text-slate-500">COMPLIANCE</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Audits Section 79 IT Act &amp; FSSAI Lic #10126999000142.</p>
              <span className="text-[9px] text-yellow-400 block pt-1">➔ Legal Shield Safe</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-pink-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-pink-300 text-xs">9. Sarah Jenkins</strong>
                <span className="text-[9px] text-slate-500">D2C CX</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Notifies consumer buyers with live GPS &amp; reorder links.</p>
              <span className="text-[9px] text-pink-400 block pt-1">➔ High Retention</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-violet-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-violet-300 text-xs">10. David Sterling</strong>
                <span className="text-[9px] text-slate-500">GROWTH</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">Forecasts wholesale reorders &amp; global expansion margins.</p>
              <span className="text-[9px] text-violet-400 block pt-1">➔ Feeds Maya Chen</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: SPARKLE DRINKS AUTOMATED ORDER-TO-SHIPMENT ENGINE    */}
      {/* ============================================================== */}
      <section className="space-y-6 pt-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold mb-2">
                <span>⚡</span>
                <span>END-TO-END AUTONOMOUS PIPELINE · SPARKLE DRINKS INDIA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Order Intake ➔ Requisition ➔ Tax Invoice ➔ EV Shipment
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Experience how all 10 AI employees process customer and dealer purchase orders without manual paperwork.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Division:</span>
              <span className="px-3 py-1 rounded-xl bg-slate-950 text-amber-300 font-bold text-xs border border-amber-500/30">
                RDNT Sparkle Drinks &amp; Logistics (AP)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Interactive Order Intake Form */}
            <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📝</span>
                <span>Customer &amp; Dealer Order Creator</span>
              </h3>

              {/* Customer Type Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('dealer');
                    setCasesCount(200);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    customerType === 'dealer'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏢 Wholesale Dealer (B2B)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('consumer');
                    setCasesCount(5);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    customerType === 'consumer'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛒 Direct Consumer (D2C)
                </button>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {customerType === 'dealer' ? 'Distributor / Dealer Business Name' : 'Consumer Full Name'}
                  </label>
                  <input
                    type="text"
                    value={customerType === 'dealer' ? businessName : buyerName}
                    onChange={(e) => {
                      if (customerType === 'dealer') setBusinessName(e.target.value);
                      else setBuyerName(e.target.value);
                    }}
                    placeholder={customerType === 'dealer' ? "Enter Distributor / Dealer Business Name..." : "Enter Consumer Full Name..."}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                  />
                </div>

                {customerType === 'dealer' && (
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Dealer GSTIN (Republic of India)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="Enter 15-Digit GSTIN (e.g. 37AAACP4412K1Z9)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Delivery Destination</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-amber-400"
                    >
                      <option value="Vijayawada">Vijayawada (AP)</option>
                      <option value="Visakhapatnam">Visakhapatnam (AP)</option>
                      <option value="Guntur">Guntur Hub (AP)</option>
                      <option value="Tirupati">Tirupati (AP)</option>
                      <option value="Hyderabad">Hyderabad (TG)</option>
                      <option value="Chennai">Chennai (TN)</option>
                      <option value="Bengaluru">Bengaluru (KA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Quantity (Cases of 24)</label>
                    <input
                      type="number"
                      min={customerType === 'dealer' ? 50 : 1}
                      max={5000}
                      step={customerType === 'dealer' ? 50 : 1}
                      value={casesCount}
                      onChange={(e) => setCasesCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Sparkle Drinks Product Flavor</label>
                  <select
                    value={selectedProduct.id}
                    onChange={(e) => {
                      const prod = SPARKLE_DRINKS_PRODUCTS.find(p => p.id === e.target.value);
                      if (prod) setSelectedProduct(prod);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    {SPARKLE_DRINKS_PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.casePrice}/case)
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {selectedProduct.tagline} · {selectedProduct.fssaiLicense}
                  </span>
                </div>

                {/* Real-Time On-Hand Quantity Check & Stock Matrix */}
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live On-Hand Inventory Check (Priya Sharma &amp; Rajesh Varma)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Available: 29,450 Cases
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">🏭 Vizag Plant</span>
                      <strong className="text-white text-xs block">18,450 cs</strong>
                      <span className="text-emerald-400 text-[9px]">Active Line #3</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">🏬 Vijayawada Depot</span>
                      <strong className="text-cyan-300 text-xs block">6,200 cs</strong>
                      <span className="text-cyan-400 text-[9px]">Cross-Dock Hub</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">📦 Amazon FBA (HYD1)</span>
                      <strong className="text-amber-300 text-xs block">4,800 cs</strong>
                      <span className="text-amber-400 text-[9px]">Prime 1-Day Stock</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      Stock Check for <strong className="text-white">{casesCount} Cases</strong>:
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span>✓ In Stock &amp; Ready to Ship</span>
                      <span className="text-[10px] text-slate-400">({(29450 - casesCount).toLocaleString('en-IN')} cs buffer)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Cost Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Cases Ordered:</span>
                  <span className="text-white font-bold">{casesCount} cases ({casesCount * 24} cans)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Wholesale Tier Discount ({discountPercent}%):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST Rate (HSN 2202 @ 28%):</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Big Launch Automation Button */}
              <button
                type="button"
                disabled={isAutomating}
                onClick={handleTriggerAutomation}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                {isAutomating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Executing All 10 AI Agents...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>⚡ Run Autonomous AI Pipeline</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Visual Automation Stepper & Generated Document Center */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Stepper Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3">
                  Autonomous Processing Stages (Executed by Specialized AI Employees):
                </span>
                
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {/* Step 1 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    pipelineStep >= 1 ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <span className="text-base block mb-0.5">👨‍💼</span>
                    <strong className="block text-[11px]">1. Order Intake</strong>
                    <span className="text-[9px] font-mono text-slate-400">Arjun Reddy</span>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    pipelineStep >= 2 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <span className="text-base block mb-0.5">👨‍🔬</span>
                    <strong className="block text-[11px]">2. Requisition</strong>
                    <span className="text-[9px] font-mono text-slate-400">Rajesh Varma</span>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    pipelineStep >= 3 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <span className="text-base block mb-0.5">👩‍⚖️</span>
                    <strong className="block text-[11px]">3. Tax Invoice</strong>
                    <span className="text-[9px] font-mono text-slate-400">Elena Rostova</span>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    pipelineStep >= 4 ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <span className="text-base block mb-0.5">👨‍✈️</span>
                    <strong className="block text-[11px]">4. EV Dispatch</strong>
                    <span className="text-[9px] font-mono text-slate-400">Capt. Vikram</span>
                  </div>
                </div>
              </div>

              {/* Document Tabs */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveDocTab('invoice')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeDocTab === 'invoice'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white bg-slate-900'
                      }`}
                    >
                      <span>📄</span>
                      <span>GST Tax Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDocTab('receipt')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeDocTab === 'receipt'
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white bg-slate-900'
                      }`}
                    >
                      <span>🧾</span>
                      <span>Customer Receipt &amp; GRN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDocTab('amazonLabel')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeDocTab === 'amazonLabel'
                          ? 'bg-orange-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white bg-slate-900'
                      }`}
                    >
                      <span>📦</span>
                      <span>Amazon Shipping Label</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDocTab('requisition')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeDocTab === 'requisition'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white bg-slate-900'
                      }`}
                    >
                      <span>📋</span>
                      <span>Factory Requisition</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDocTab('shipment')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeDocTab === 'shipment'
                          ? 'bg-purple-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white bg-slate-900'
                      }`}
                    >
                      <span>🚚</span>
                      <span>Waybill &amp; Cold-Chain</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      title="Send Invoice & Tracking link directly to dealer phone via WhatsApp"
                    >
                      <span className="text-sm">📲</span>
                      <span>Send WhatsApp Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1 shadow-sm"
                      title="Print Document Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>

                {/* Real-time WhatsApp Dispatch Notification Banner */}
                {whatsappSentNotice && (
                  <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 font-mono text-xs font-bold flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💬</span>
                      <span>{whatsappSentNotice}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">WHATSAPP API OK</span>
                  </div>
                )}

                {/* TAB 1: FORMAL GST TAX INVOICE */}
                {activeDocTab === 'invoice' && (
                  <div className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 shadow-2xl font-sans text-xs">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-extrabold block">
                          TAX INVOICE · E-INVOICE SYSTEM
                        </span>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">RDNT Sparkle Industries LLP</h4>
                        <p className="text-[11px] text-slate-600">
                          Industrial Division: Sparkle Drinks &amp; Logistics<br />
                          Autonagar Commercial Corridor, Guntur, Andhra Pradesh — 522001<br />
                          <strong>GSTIN:</strong> 37AAAFR9824K1Z5 · <strong>FSSAI:</strong> #10126999000142
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-bold text-xs inline-block mb-1">
                          {selectedOrder.invoiceId || 'INV-2026-0812'}
                        </span>
                        <p className="text-[11px] text-slate-600">
                          Date: <strong>{selectedOrder.date}</strong><br />
                          Payment Terms: <strong>Net 30 Days</strong><br />
                          Place of Supply: <strong>{selectedOrder.state} (State Code: 37)</strong>
                        </p>
                      </div>
                    </div>

                    {/* Buyer & Consignee */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-bold block mb-0.5 uppercase">Billed To (Customer / Dealer):</span>
                        <strong className="text-slate-900 text-xs block">{selectedOrder.businessName}</strong>
                        <p className="text-slate-600">
                          Attn: {selectedOrder.buyerName}<br />
                          City: {selectedOrder.city}, {selectedOrder.state}<br />
                          GSTIN: {selectedOrder.gstin || 'Unregistered Consumer (B2C)'}
                        </p>
                      </div>

                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-slate-500 font-bold block mb-0.5 uppercase">Dispatch Details:</span>
                        <p className="text-slate-600">
                          Waybill No: <strong>{selectedOrder.waybillId || 'WB-SPK-9941'}</strong><br />
                          Carrier: <strong>Sparkle EV Fleet ({selectedOrder.vehicleNo || 'AP-07-EV-8842'})</strong><br />
                          Authorized By: <strong>Elena Rostova (AI Financial Specialist)</strong>
                        </p>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b-2 border-slate-900 text-slate-800">
                          <th className="py-2">Item Description</th>
                          <th className="py-2">HSN Code</th>
                          <th className="py-2 text-right">Cases</th>
                          <th className="py-2 text-right">Rate/Case</th>
                          <th className="py-2 text-right">Taxable Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2.5">
                            <strong className="text-slate-900 block">{selectedOrder.product}</strong>
                            <span className="text-[10px] text-slate-500">24 x 330ml Aluminum Cans ({selectedOrder.cases * 24} units)</span>
                          </td>
                          <td className="py-2.5 font-mono">22021010</td>
                          <td className="py-2.5 text-right font-mono font-bold">{selectedOrder.cases}</td>
                          <td className="py-2.5 text-right font-mono">₹{selectedOrder.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 text-right font-mono font-bold">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Tax & Total Summary */}
                    <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                      <div className="space-y-1 text-[10px] text-slate-500 max-w-sm">
                        <p><strong>Statutory Declaration:</strong> Invoice generated autonomously in compliance with Section 31 of CGST Act, 2017 and Section 79 of Information Technology Act, 2000.</p>
                        <div className="flex items-center gap-2 pt-1 font-mono text-[9px] text-emerald-700">
                          <span>✓ Cryptographically Signed &amp; Stamped by AI Financial Agent</span>
                        </div>
                      </div>

                      <div className="w-64 space-y-1 font-mono text-right text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Tier Discount ({selectedOrder.discountPercent}%):</span>
                            <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>CGST (14%):</span>
                          <span>₹{(selectedOrder.gstAmount / 2).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>SGST (14%):</span>
                          <span>₹{(selectedOrder.gstAmount / 2).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-900 pt-1.5">
                          <span>Total Amount:</span>
                          <span className="text-blue-700">₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: CUSTOMER PURCHASE RECEIPT & GOODS RECEIPT NOTE (GRN) */}
                {activeDocTab === 'receipt' && (
                  <div className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 shadow-2xl font-sans text-xs border-2 border-emerald-500/50">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] uppercase">
                          <span>✓ GOODS RECEIPT &amp; PURCHASE RECEIPT</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mt-1">CUSTOMER OFFICIAL RECEIPT</h4>
                        <p className="text-[11px] text-slate-600">
                          RDNT Sparkle Industries LLP · Finished Goods Inventory &amp; Distribution
                        </p>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <strong className="text-emerald-700 block text-xs">RCP-2026-{(selectedOrder.id || '9041').replace('ORD-', '')}</strong>
                        <span className="text-slate-500">Receipt Date: {selectedOrder.date}</span>
                        <span className="text-slate-500 block">Payment: {selectedOrder.customerType === 'dealer' ? 'Net-30 Commercial Transfer' : 'Amazon Pay / UPI Verified'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-bold block uppercase text-[10px]">Customer / Consignee:</span>
                        <strong className="text-slate-900 block">{selectedOrder.buyerName}</strong>
                        <span className="text-slate-600 block">{selectedOrder.businessName}</span>
                        <span className="text-slate-600 block">{selectedOrder.city}, {selectedOrder.state}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block uppercase text-[10px]">On-Hand Inventory Check &amp; Receipt:</span>
                        <span className="text-slate-700 block">Warehouse Picked: <strong>Loading Bay 3 (Cold-Store)</strong></span>
                        <span className="text-slate-700 block">On-Hand Stock Deducted: <strong className="text-emerald-700">{selectedOrder.cases} Cases ({selectedOrder.cases * 24} Cans)</strong></span>
                        <span className="text-slate-700 block">Quality Signoff: <strong>Priya Sharma &amp; Rajesh Varma</strong></span>
                      </div>
                    </div>

                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b-2 border-slate-900 text-slate-800">
                          <th className="py-2">Item Description</th>
                          <th className="py-2 text-center">Cases</th>
                          <th className="py-2 text-right">Unit Price</th>
                          <th className="py-2 text-right">Discount</th>
                          <th className="py-2 text-right">Total Paid (incl. 28% GST)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        <tr>
                          <td className="py-2 font-sans">
                            <strong className="text-slate-900 block">{selectedOrder.product}</strong>
                            <span className="text-[10px] text-slate-500">HSN 2202 · FSSAI Central Lic #10126999000142</span>
                          </td>
                          <td className="py-2 text-center font-bold">{selectedOrder.cases}</td>
                          <td className="py-2 text-right">₹{selectedOrder.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2 text-right text-emerald-700">-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</td>
                          <td className="py-2 text-right font-bold text-slate-900">₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <div className="text-[10px] text-slate-500">
                        <span>Thank you for choosing Sparkle Drinks. Keep refrigerated at 2°C - 4°C.</span><br />
                        <span className="font-mono text-emerald-700">Digital Seal: SHA-256 Verified by Elena Rostova &amp; Arjun Reddy</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">AMOUNT RECEIVED (INR)</span>
                        <span className="text-xl font-black text-slate-900 font-mono">₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: AMAZON-STYLE CUSTOMER DISPATCH & SHIPPING LABEL */}
                {activeDocTab === 'amazonLabel' && (
                  <div className="max-w-md mx-auto p-6 rounded-2xl bg-white text-slate-950 space-y-4 shadow-2xl font-mono text-xs border-4 border-slate-950">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b-4 border-slate-950 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black tracking-tighter text-slate-950">amazon</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 bg-slate-950 text-white rounded">FBA / PRIME</span>
                      </div>
                      <div className="text-right leading-tight">
                        <span className="text-sm font-black text-slate-950 block">PRIORITY 1-DAY</span>
                        <span className="text-[10px] text-slate-600">DELIVERY BY 8:00 PM</span>
                      </div>
                    </div>

                    {/* Ship To */}
                    <div className="border-b-2 border-slate-950 pb-3 leading-snug">
                      <span className="text-[9px] uppercase text-slate-500 font-bold block">SHIP TO:</span>
                      <strong className="text-sm text-slate-950 block font-sans font-black">{selectedOrder.buyerName}</strong>
                      <span className="text-xs font-bold block font-sans">{selectedOrder.businessName}</span>
                      <span className="text-xs block font-sans">Plot #42, Commercial Sector / Customer Address</span>
                      <span className="text-xs block font-sans">{selectedOrder.city}, {selectedOrder.state} - 520001</span>
                      <span className="text-[11px] block text-slate-700 mt-1">TEL: +91 98480 22331</span>
                    </div>

                    {/* Carrier & Route */}
                    <div className="grid grid-cols-2 gap-2 border-b-2 border-slate-950 pb-2 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">SORT HUB / GATE:</span>
                        <strong className="text-sm font-black text-slate-950">HYD1 - BAY 04</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase block">PACKAGE WEIGHT:</span>
                        <strong className="text-sm font-black text-slate-950">{Math.round(selectedOrder.cases * 6.2)} KG</strong>
                      </div>
                    </div>

                    {/* 1D Barcode Simulation */}
                    <div className="py-2 text-center space-y-1">
                      <div className="h-14 w-full flex items-center justify-center gap-[2px] bg-white px-2">
                        {Array.from({ length: 44 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-full bg-slate-950"
                            style={{
                              width: (i % 5 === 0 ? '4px' : i % 3 === 0 ? '2px' : '1px'),
                              marginRight: (i % 7 === 0 ? '3px' : '1px')
                            }}
                          />
                        ))}
                      </div>
                      <div className="font-mono text-xs font-black tracking-widest text-slate-950">
                        TRACKING: TBA3091829012-{selectedOrder.id.replace('ORD-', '')}
                      </div>
                    </div>

                    {/* Cold Chain Badge & Dispatch Info */}
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-300 text-[10px] space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-blue-700">❄️ COLD-CHAIN CARGO: 2°C - 4°C</span>
                        <span className="text-emerald-700">REEFER EV TRANSIT</span>
                      </div>
                      <div className="text-slate-600 font-sans">
                        Contents: {selectedOrder.cases} Cases of {selectedOrder.product} ({selectedOrder.cases * 24} Aluminum Cans)
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                      <span>ORIGIN: RDNT GUNTUR FC</span>
                      <span>DISPATCH: CAPT. VIKRAM NAIDU</span>
                    </div>
                  </div>
                )}

                {/* TAB 4: FACTORY WORK REQUISITION */}
                {activeDocTab === 'requisition' && (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 text-slate-200 space-y-4 shadow-xl text-xs">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                          RDNT MANUFACTURING WORK REQUISITION
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          Requisition {selectedOrder.requisitionId || 'REQ-DRK-8841'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Factory: <strong>Guntur Central Cold-Storage &amp; Bottling Facility</strong> · FSSAI #10126999000142
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px]">
                        STATUS: ALLOCATED &amp; PACKED
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Allocated Raw Materials &amp; Batch:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <strong className="text-white block">Finished Beverage Stock:</strong>
                          <span className="text-slate-300">{selectedOrder.cases} Cases ({selectedOrder.cases * 24} Aluminum Cans)</span>
                          <span className="text-cyan-400 font-mono text-[10px] block mt-1">Batch ID: #DRK-OCT26-B9</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <strong className="text-white block">Packaging Materials:</strong>
                          <span className="text-slate-300">{selectedOrder.cases} Heavy Duty Recycled Corrugated Master Cartons</span>
                          <span className="text-emerald-400 font-mono text-[10px] block mt-1">FSSAI Packaging Certified</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200">
                      <strong>AI Production Audit:</strong> Generated by Rajesh Varma. Warehouse inventory decremented, quality inspection cleared, and batch staged at Loading Bay 3.
                    </div>
                  </div>
                )}

                {/* TAB 3: LOGISTICS WAYBILL & DISPATCH */}
                {activeDocTab === 'shipment' && (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/40 text-slate-200 space-y-4 shadow-xl text-xs">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                          SPARKLE DISTRIBUTION FLEET · CONSIGNMENT WAYBILL
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          Waybill #{selectedOrder.waybillId || 'WB-SPK-9941'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Carrier Fleet: <strong>Spark EV Refrigerated Commercial Van</strong> ({selectedOrder.vehicleNo || 'AP-07-EV-8842'})
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[11px]">
                        🟢 EN ROUTE TO {selectedOrder.city.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Origin Hub:</span>
                        <strong className="text-white">Guntur Central Depot</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Destination:</span>
                        <strong className="text-purple-300">{selectedOrder.city}, {selectedOrder.state}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Cargo Temp Sensor:</span>
                        <strong className="text-emerald-400 font-mono">4.2°C (Optimal Cold-Chain)</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
                      <strong>Fleet Telematics:</strong> Managed by Capt. Vikram Naidu. Solar-charged transit vehicle en route via NH-16 corridor. ETA: 2 hours 15 mins.
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3.5: ENTERPRISE CLOUD BACKBONE & SECURITY ASSURANCE    */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ENTERPRISE BACKBONE · ORACLE CLOUD &amp; HIGH-AVAILABILITY ERP</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Enterprise Cloud Integration &amp; Logistics Backbone
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Operated by <strong className="text-white">Marcus Vance (Enterprise Systems Engineer)</strong>. All customer, dealer, and factory events are securely processed with 256-bit cryptographic validation across our multi-region enterprise cloud infrastructure.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ERP Synchronizer: Online ({cloudSyncStatus.latencyMs}ms)</span>
              </span>
            </div>
          </div>

          {/* 4 Professional Enterprise Pillars (Customer Facing, Trust-Building) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Pillar 1: Oracle Cloud Infrastructure */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <span>🏛️</span>
                <span>Oracle Cloud ERP</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Autonomous ledger synchronization connecting US technology operations with RDNT Sparkle Industries manufacturing plants.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-purple-300 flex items-center justify-between">
                <span>Autonomous DB</span>
                <span className="text-emerald-400 font-bold">✓ Active</span>
              </div>
            </div>

            {/* Pillar 2: Google Cloud Platform */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <span>⚡</span>
                <span>Sub-Second Edge</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                High-concurrency dealer intake microservices powering instant order routing and real-time inventory reconciliation.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-blue-300 flex items-center justify-between">
                <span>Multi-Region Edge</span>
                <span className="text-emerald-400 font-bold">✓ 99.99% SLA</span>
              </div>
            </div>

            {/* Pillar 3: Amazon Logistics & FBA */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <span>📦</span>
                <span>Amazon FBA &amp; Fleet</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct integration with Amazon fulfillment hubs and regional refrigerated electric logistics with automated Code-128 tracking.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-300 flex items-center justify-between">
                <span>Prime Sort Center</span>
                <span className="text-emerald-400 font-bold">✓ HYD1 Linked</span>
              </div>
            </div>

            {/* Pillar 4: Statutory Legal Shield */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <span>🛡️</span>
                <span>Statutory Compliance</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Statutory 28% GST invoicing with IRN hash generation and FSSAI Central Food Safety License #10126999000142 audit readiness.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
                <span>FSSAI &amp; GSTN</span>
                <span className="text-emerald-400 font-bold">✓ Verified</span>
              </div>
            </div>
          </div>

          {/* Discreet Admin / Enterprise Operator Console Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Last Background ERP Sync: <strong className="text-white">{cloudSyncStatus.lastSyncTime}</strong></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Trace: <strong className="text-cyan-400">{cloudSyncStatus.traceId}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminConsole(!showAdminConsole)}
              className="text-[11px] font-mono text-slate-400 hover:text-purple-300 flex items-center gap-1.5 self-start sm:self-auto py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-colors"
            >
              <span>{showAdminConsole ? '▲ Hide IT Console' : '🔒 Enterprise IT Console (Marcus Vance)'}</span>
            </button>
          </div>

          {/* Collapsible IT / Admin Console (Kept clean & isolated for business operators) */}
          {showAdminConsole && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚙️</span> Enterprise IT Gateway Status (Restricted Operator View)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Active background link connects dealer orders and inventory balances directly to your cloud pipeline.
                  </p>
                </div>
                <a
                  href="/oracle_schema.sql"
                  download="oracle_schema.sql"
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <span>💾 Download oracle_schema.sql</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Oracle Cloud Region</span>
                  <strong className="text-white text-xs">us-ashburn-1</strong>
                  <span className="text-emerald-400 text-[10px] block mt-0.5">OIC Connected</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Dispatcher Pipeline</span>
                  <strong className="text-cyan-300 text-xs">Automated Real-Time</strong>
                  <span className="text-slate-400 text-[10px] block mt-0.5">Multi-Cloud Bridge</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Last Transaction Trace</span>
                  <strong className="text-amber-300 text-xs truncate block">{cloudSyncStatus.traceId}</strong>
                  <span className="text-emerald-400 text-[10px] block mt-0.5">{cloudSyncStatus.latencyMs}ms Latency</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: INTERACTIVE AI BRAIN CHAT & COMMAND CONSOLE         */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-2xl bg-cyan-950 border border-cyan-500/50">
                🧠
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Ask the AI Brain or Direct Any of the 10 Employees</h3>
                <p className="text-xs text-slate-400">
                  Powered by Gemini 3.8 Flash. Inquire about wholesale orders, production batch requisitions, or worldwide expansion.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Target Agent:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-semibold text-xs focus:outline-none"
              >
                {AI_EMPLOYEES.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.avatar} {emp.name} ({emp.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat Messages Window */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl space-y-1 ${
                  msg.source === 'user'
                    ? 'bg-blue-950/50 border border-blue-500/40 text-blue-100 ml-8'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 mr-8'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {msg.source === 'user' ? '👤' : '🤖'} {msg.sender}
                    <span className="text-slate-500 font-normal">({msg.role})</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] text-cyan-400 border border-slate-800">
                    {msg.source}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{msg.text}</p>
              </div>
            ))}
            {isChatLoading && (
              <div className="p-3 rounded-2xl bg-slate-900/50 border border-cyan-500/30 text-xs text-cyan-300 animate-pulse flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Brain is analyzing operational data...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="Ask about dealer orders, Sparkle Drinks bottling schedule, GST breakdown, or EV fleet routes..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatPrompt.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};
