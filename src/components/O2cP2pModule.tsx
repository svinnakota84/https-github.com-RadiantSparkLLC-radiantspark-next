/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { SPARKLE_DRINKS_PRODUCTS } from '../data/aiEmployeesData';

interface O2cP2pProps {
  skuInventory?: Array<{ id: string; name: string; casePrice: number; inStockCases: number }>;
  warehouses?: Array<{ id: string; name: string; role: string; cases: number }>;
  liveFxInrPerUsd?: number;
  onPipelineComplete?: () => void;
}

export const O2cP2pModule: React.FC<O2cP2pProps> = ({
  skuInventory,
  warehouses,
  liveFxInrPerUsd = 92.68,
  onPipelineComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'o2c' | 'p2p'>('o2c');

  const [dealerName, setDealerName] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [customerTier, setCustomerTier] = useState('Wholesale Dealer - Tier A (10% Discount)');
  const [deliveryCity, setDeliveryCity] = useState('Vijayawada');
  const [productId, setProductId] = useState(SPARKLE_DRINKS_PRODUCTS[0].id);
  const [casesCount, setCasesCount] = useState<number>(200);
  const [selectedPlant, setSelectedPlant] = useState('Visakhapatnam Bottling Line #3');

  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedProduct =
    SPARKLE_DRINKS_PRODUCTS.find((p) => p.id === productId) || SPARKLE_DRINKS_PRODUCTS[0];
  const liveSku = skuInventory?.find((s) => s.id === productId);
  const availableSkuCases = liveSku?.inStockCases ?? selectedProduct.inStockCases;
  const totalCasesAvailable =
    skuInventory?.reduce((acc, s) => acc + s.inStockCases, 0) ??
    SPARKLE_DRINKS_PRODUCTS.reduce((acc, s) => acc + s.inStockCases, 0);

  const casePrice = selectedProduct.casePrice;
  const grossValue = casesCount * casePrice;
  const discountPct = casesCount >= 500 ? 15 : casesCount >= 200 ? 10 : 5;
  const discountAmount = (grossValue * discountPct) / 100;
  const taxableValue = grossValue - discountAmount;
  const isIntraState = /vijayawada|visakhapatnam|vizag|guntur|tirupati/i.test(deliveryCity);
  const cgst = isIntraState ? (taxableValue * 14) / 100 : 0;
  const sgst = isIntraState ? (taxableValue * 14) / 100 : 0;
  const igst = isIntraState ? 0 : (taxableValue * 28) / 100;
  const totalPayable = taxableValue + cgst + sgst + igst;
  const totalPayableUsd = totalPayable / liveFxInrPerUsd;

  const handleRunPipeline = async () => {
    setErrorMsg(null);
    setIsRunningPipeline(true);
    const timeStr = new Date().toLocaleTimeString();

    try {
      if (activeTab === 'p2p') {
        const res = await fetch('/api/brain/inventory/restock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skuId: productId, casesToAdd: casesCount }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          setErrorMsg(data?.error || 'Restock requisition failed.');
        } else {
          setExecutionLog((prev) => [
            `[${timeStr}] P2P RESTOCK APPROVED by Priya Sharma & Rajesh Varma: +${data.restockedCases ?? casesCount} cases added to ${selectedProduct.name} (${selectedPlant}). Updated SKU stock verified on server.`,
            ...prev,
          ]);
          onPipelineComplete?.();
        }
        return;
      }

      const res = await fetch('/api/brain/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: 'dealer',
          buyerName: dealerName.trim() || undefined,
          businessName: dealerName.trim() || undefined,
          gstin: buyerGstin.trim() || undefined,
          city: deliveryCity.trim() || 'Vijayawada',
          productId,
          casesCount,
          plant: selectedPlant,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || 'Order pipeline execution failed.');
        return;
      }

      const ord = data.order;
      setExecutionLog((prev) => [
        `[${timeStr}] 11-Agent Pipeline Completed (${data.durationMs ?? ord.durationMs ?? 1}ms) -> Order ${ord.id} | Req ${ord.requisitionId} | Invoice ${ord.invoiceId} (₹${ord.grandTotal.toLocaleString('en-IN')} / $${ord.grandTotalUsd?.toFixed(2)} USD) | Waybill ${ord.waybillId}`,
        ...prev,
      ]);
      onPipelineComplete?.();
    } catch {
      setErrorMsg('Unable to connect to /api/brain endpoints.');
    } finally {
      setIsRunningPipeline(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#070d1e] border-2 border-purple-500/40 shadow-2xl space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>LIVE SERVER ERP PIPELINE · 28% GST &amp; LIVE FX CALCULATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order-to-Cash (O2C) &amp; Procure-to-Pay (P2P) Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Compute deterministic 28% GST (CGST/SGST intra-state vs IGST inter-state), live USD FX equivalents, and allocate or restock persistent server inventory.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('o2c')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'o2c'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order-to-Cash (O2C)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('p2p')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'p2p'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Procure-to-Pay (Restock P2P)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                {activeTab === 'p2p' ? 'Supplier / Bottling Lot Ref' : 'Dealer / Customer Business Name'}
              </label>
              <input
                type="text"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                placeholder={activeTab === 'p2p' ? 'Enter batch supplier name...' : 'Enter Dealer Business Name...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Volume Tier (Computed Live)
              </label>
              <select
                value={customerTier}
                onChange={(e) => {
                  setCustomerTier(e.target.value);
                  if (e.target.value.includes('500')) setCasesCount(500);
                  else if (e.target.value.includes('200')) setCasesCount(200);
                  else setCasesCount(50);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="Wholesale Dealer - Tier A (200+ cases: 10% Discount)">
                  Wholesale Tier A (200+ cs · 10% off)
                </option>
                <option value="Regional Stockist - Tier S (500+ cases: 15% Discount)">
                  Regional Stockist (500+ cs · 15% off)
                </option>
                <option value="Direct Retail - Tier B (50+ cases: 5% Discount)">
                  Direct Retail (50+ cs · 5% off)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Buyer GSTIN (15-Char Tax ID)
              </label>
              <input
                type="text"
                value={buyerGstin}
                onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 37AAACA8891J1ZP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono font-bold text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                Delivery City ({isIntraState ? 'AP Intra-State' : 'Inter-State IGST'})
              </label>
              <input
                type="text"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                placeholder="Vijayawada, Hyderabad, Chennai..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-purple-300 uppercase">
                SPARKLE DRINKS SKU (HSN 22021010 · 28% GST)
              </span>
              <span className="text-slate-400 tabular-nums">
                {availableSkuCases.toLocaleString('en-IN')} cs in server stock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                  Select Beverage
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs focus:outline-none"
                >
                  {SPARKLE_DRINKS_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.casePrice}/cs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5 flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                    Cases
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={casesCount}
                    onChange={(e) => setCasesCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none tabular-nums"
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

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-400 font-mono">
                PERSISTENT SERVER INVENTORY
              </span>
              <span className="text-emerald-300 font-mono font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 tabular-nums">
                Total: {totalCasesAvailable.toLocaleString('en-IN')} Cases
              </span>
            </div>

            {warehouses && warehouses.length > 0 && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                {warehouses.map((w) => (
                  <div key={w.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block truncate">{w.name}</span>
                    <strong className="text-emerald-400 font-bold block text-sm tabular-nums">
                      {w.cases.toLocaleString('en-IN')} cs
                    </strong>
                    <span className="text-[9px] text-slate-500">{w.role}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300 font-bold tabular-nums">
              <span>{activeTab === 'p2p' ? 'Restock Batch:' : 'Order Stock Check:'}</span>
              <span>
                {activeTab === 'p2p'
                  ? `Post-restock SKU: ${(availableSkuCases + casesCount).toLocaleString('en-IN')} cs`
                  : `${availableSkuCases.toLocaleString('en-IN')} cs avail`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase font-mono text-xs">
              Origin Bottling Facility
            </label>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="Visakhapatnam Bottling Line #3">Visakhapatnam Bottling Line #3</option>
              <option value="Vijayawada Cross-Dock Hub">Vijayawada Cross-Dock Hub</option>
              <option value="Guntur Cold-Chain Depot">Guntur Cold-Chain Depot</option>
            </select>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleRunPipeline()}
            disabled={isRunningPipeline || (activeTab === 'o2c' && casesCount > availableSkuCases)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isRunningPipeline ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                <span>Executing on Server...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-300" />
                <span>
                  {activeTab === 'p2p'
                    ? 'COMMIT RESTOCK TO SERVER INVENTORY'
                    : 'EXECUTE 11-AGENT O2C PIPELINE'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Financials */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 font-mono text-xs tabular-nums">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <strong className="text-purple-300 font-extrabold uppercase">
                GST &amp; LIVE FX CALCULATION
              </strong>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                HSN 22021010 · 28% GST
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>
                  Gross ({casesCount} cs @ ₹{casePrice.toLocaleString()}):
                </span>
                <span className="font-bold text-white">
                  ₹{grossValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-emerald-400">
                <span>Tier Discount ({discountPct}%):</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                <span>Taxable Value:</span>
                <span>₹{taxableValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              {isIntraState ? (
                <>
                  <div className="flex justify-between text-cyan-300">
                    <span>CGST (14%):</span>
                    <span>₹{cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-cyan-300">
                    <span>SGST (14%):</span>
                    <span>₹{sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-cyan-300">
                  <span>IGST (28% Inter-State):</span>
                  <span>₹{igst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-black text-amber-300 pt-2 border-t-2 border-slate-800">
                <span>Total Invoice Payable:</span>
                <span>₹{totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-xs text-cyan-300">
                <span>USD Settlement (@ ₹{liveFxInrPerUsd.toFixed(2)}):</span>
                <span className="font-bold">
                  ${totalPayableUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
            <strong className="text-white font-extrabold uppercase block border-b border-slate-800 pb-2">
              CONNECTED AGENT HANDOFF STAGES
            </strong>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-white block">1. Maya Chen &amp; Arjun Reddy</strong>
                <span className="text-slate-400">Intake, GSTIN regex validation, discount tier</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-white block">2. Rajesh Varma &amp; Priya Sharma</strong>
                <span className="text-slate-400">Persistent server inventory deduction &amp; alert</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-white block">3. Elena Rostova &amp; Ananya Iyer</strong>
                <span className="text-slate-400">28% CGST/SGST/IGST split &amp; SHA-256 IRN digest</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-white block">4. Capt. Vikram, Marcus, Sarah, David &amp; Kavya</strong>
                <span className="text-slate-400">Waybill generation, ERP ledger sync, FX rollup &amp; SparkDeals attribution</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Execution Audit Log */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Server Execution Audit Log
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">Persisted to data/brain-runs.json</span>
        </div>

        {executionLog.length > 0 ? (
          <div className="space-y-1 max-h-36 overflow-y-auto text-[11px] text-slate-300">
            {executionLog.map((log, idx) => (
              <div key={idx} className="py-0.5 flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">OK</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-[11px] text-center py-3">
            Execute an O2C order or P2P restock above to inspect real persisted execution results.
          </div>
        )}
      </div>
    </div>
  );
};
