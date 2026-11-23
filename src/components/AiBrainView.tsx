/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AI_EMPLOYEES,
  SPARKLE_DRINKS_PRODUCTS,
} from '../data/aiEmployeesData';
import { SparkDrinkOrder } from '../types';
import { askAiBrain } from '../utils/geminiBrain';
import { dispatchToEnterpriseCloud } from '../utils/cloudSync';
import { buildWhatsAppInvoiceUrl } from '../utils/translations';
import { O2cP2pModule } from './O2cP2pModule';
import {
  Zap,
  RefreshCw,
  Send,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface AiBrainViewProps {
  onOpenSparkSync: () => void;
  onNavigateToView: (view: 'global' | 'india' | 'usa' | 'sparkdeals' | 'lifestyle') => void;
}

interface TraceStep {
  step: number;
  agentId: string;
  agentName: string;
  department: string;
  action: string;
  durationMs: number;
  status: string;
}

interface WarehouseStock {
  id: string;
  name: string;
  role: string;
  cases: number;
}

interface SkuStock {
  id: string;
  name: string;
  casePrice: number;
  inStockCases: number;
}

interface AgentTelemetry {
  id: string;
  runsCount: number;
  lastAction: string | null;
  lastDurationMs: number;
}

interface ChiefDirective {
  agentId: string;
  agentName: string;
  role: string;
  chiefInstruction: string;
  actionTaken: string;
  autoFixed: boolean;
  status: 'healthy' | 'auto_fixed' | 'action_required';
  durationMs: number;
}

interface UsComplianceAuditPayload {
  entity: string;
  usRetailerDealCounts: Record<string, number>;
  amazonUsReady: boolean;
  walmartReady: boolean;
  bestBuyReady: boolean;
  multiMerchantNetworkReady: boolean;
  ftc16Cfr255Active: boolean;
  roscaStripeComplianceActive: boolean;
  dmca512ChannelActive: boolean;
  writtenSowW9NoticeActive: boolean;
}

interface ChiefAuditReport {
  auditId: string;
  trigger: string;
  executedAt: string;
  durationMs: number;
  summaryNote: string;
  usComplianceAudit?: UsComplianceAuditPayload;
  directives: ChiefDirective[];
}

interface RevenueSummaryPayload {
  currencyFxUsdInr: number;
  fxSource: string;
  realizedRevenue: {
    totalRealizedUsd: number;
    totalRealizedInr: number;
    erpDirectInr: number;
    erpDirectUsd: number;
    erpOrdersCount: number;
    lifestyleSparkUsd: number;
    lifestyleTransactionsCount: number;
    activePaidSubscriptions: number;
    affiliateVerifiedUsd: number;
    affiliateConversionsCount: number;
  };
  sparkdealsFunnel: {
    totalLiveDeals: number;
    affiliateTaggedCount: number;
    untaggedDirectCount: number;
    aggregatorOnlyCount: number;
    directMerchantResolvedCount: number;
    outboundClicksTotal: number;
    outboundClicksTagged: number;
    outboundClicksUntagged: number;
    topMerchantsByClicks: Array<{ merchant: string; clicks: number }>;
  };
  monetizationReadiness: {
    configuredTags: Array<{ network: string; tag: string }>;
    configuredCount: number;
    stripeConnected: boolean;
    paymentLinkConfigured: boolean;
  };
  diagnosisReasons: string[];
  categoryCommissionBenchmarks: Array<{
    category: string;
    range: string;
    program: string;
    referenceRateCardOnly: boolean;
  }>;
  updatedAt: string;
}

interface SimulationResultPayload {
  simulationOnly: boolean;
  notice: string;
  channel: string;
  orderValueUsd: number;
  orderValueInr: number;
  commissionPct: number;
  companyGrossRevenueUsd: number;
  processingFeeUsd: number;
  taxReserveUsd?: number;
  vendorPayoutUsd: number;
  netToCompanyUsd: number;
  netToCompanyInr: number;
  settlementMechanism: string;
  stepByStepFlow: Array<{
    step: number;
    actor: string;
    detail: string;
    amountLabel: string;
  }>;
  legalShieldsApplied: string[];
}

interface LegalAgreementFramework {
  id: string;
  title: string;
  entity: string;
  supervisedBy: string;
  howMoneyArrives: string;
  keyShields: string[];
}

interface RevenueAgreementDraft {
  id: string;
  partnerName: string;
  partnerEmail: string;
  entity: string;
  agreementType: string;
  commissionRatePct: number;
  settlementTerms: string;
  taxJurisdiction: string;
  legalShieldClauses: string[];
  sha256Digest: string;
  preparedByAgents: string;
  status: string;
  createdAt: string;
}

interface AgreementsPayload {
  frameworks: LegalAgreementFramework[];
  agreements: RevenueAgreementDraft[];
  usRetailerProgramCoverage?: Array<{
    merchant: string;
    tagConfigured: boolean;
    shield: string;
  }>;
  activeComplianceControls: {
    affiliateDisclosureActive: boolean;
    ftc16Cfr255Active?: boolean;
    roscaSubscriptionConsentActive?: boolean;
    dmca512TakedownChannelActive?: boolean;
    stripePciOffloaded: boolean;
    writtenContractRequiredNotice: boolean;
    gstTaxSplitEngineActive: boolean;
    w9WrittenSowBoundaryActive?: boolean;
    affiliateTagsConfiguredCount: number;
  };
}

export const AiBrainView: React.FC<AiBrainViewProps> = ({
  onOpenSparkSync: _onOpenSparkSync,
  onNavigateToView,
}) => {
  // Department filter & selected employee
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-1');

  // Server-persisted inventory, orders, FX, and agent stats
  const [skuInventory, setSkuInventory] = useState<SkuStock[]>(
    SPARKLE_DRINKS_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      casePrice: p.casePrice,
      inStockCases: p.inStockCases,
    }))
  );
  const [warehouses, setWarehouses] = useState<WarehouseStock[]>([]);
  const [orders, setOrders] = useState<SparkDrinkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SparkDrinkOrder | null>(null);
  const [latestTrace, setLatestTrace] = useState<TraceStep[]>([]);
  const [agentStats, setAgentStats] = useState<Record<string, AgentTelemetry>>({});
  const [runsCount, setRunsCount] = useState<number>(0);
  const [avgLatencyMs, setAvgLatencyMs] = useState<number>(0);
  const [liveFxInrPerUsd, setLiveFxInrPerUsd] = useState<number | null>(null);
  const [fxSource, setFxSource] = useState<string>('ECB / Frankfurter');
  const [oracleConfigured, setOracleConfigured] = useState<boolean>(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);
  const [recentTickerRuns, setRecentTickerRuns] = useState<any[]>([]);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Chief Agent Audit & Unified Revenue State
  const [chiefAudit, setChiefAudit] = useState<ChiefAuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryPayload | null>(null);
  const [monetizationForm, setMonetizationForm] = useState({
    amazonUsTag: '',
    amazonInTag: '',
    walmartImpactId: '',
    bestBuyImpactId: '',
    ebayCampId: '',
    skimlinksPubId: '',
    sovrnKey: '',
  });
  const [isSavingTags, setIsSavingTags] = useState<boolean>(false);
  const [tagSaveNotice, setTagSaveNotice] = useState<string | null>(null);

  // Order & Vendor Commission Flow Simulator (Dry-Run)
  const [simChannel, setSimChannel] = useState<
    'sparkdeals_affiliate' | 'third_party_vendor' | 'lifestyle_stripe' | 'direct_b2b_erp'
  >('third_party_vendor');
  const [simOrderValueUsd, setSimOrderValueUsd] = useState<string>('250');
  const [simCommissionPct, setSimCommissionPct] = useState<string>('12');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResultPayload | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  // Legal Shield Frameworks & Partner Revenue Agreements
  const [agreementsData, setAgreementsData] = useState<AgreementsPayload | null>(null);
  const [agreementForm, setAgreementForm] = useState({
    partnerName: '',
    partnerEmail: '',
    entity: 'Radiant Spark LLC (USA)' as 'Radiant Spark LLC (USA)' | 'RDNT Sparkle Industries LLP (India)',
    agreementType: 'vendor_agency_commission' as
      | 'vendor_agency_commission'
      | 'affiliate_cpa'
      | 'wholesale_supply_margin'
      | 'legal_shield_dpa',
    commissionRatePct: '12',
    settlementTerms: 'Net-15 Bank/ACH' as
      | 'Net-15 Bank/ACH'
      | 'Net-30 Network Payout'
      | 'Instant Stripe Split / Wire',
  });
  const [isDraftingAgreement, setIsDraftingAgreement] = useState<boolean>(false);
  const [agreementNotice, setAgreementNotice] = useState<string | null>(null);

  // Cloud Sync status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    status: string;
    traceId: string;
    latencyMs: number;
    lastSyncTime: string;
    details: string;
  }>({
    status: 'ready',
    traceId: 'Pending first sync',
    latencyMs: 0,
    lastSyncTime: 'Not yet triggered',
    details: 'Ready to transmit order ledger trace.',
  });
  const [showAdminConsole, setShowAdminConsole] = useState(false);

  // Order intake form state
  const [customerType, setCustomerType] = useState<'dealer' | 'consumer'>('dealer');
  const [buyerName, setBuyerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [selectedProductId, setSelectedProductId] = useState(SPARKLE_DRINKS_PRODUCTS[0].id);
  const [casesCount, setCasesCount] = useState<number>(200);

  // Execution state
  const [isAutomating, setIsAutomating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<
    'invoice' | 'receipt' | 'amazonLabel' | 'requisition' | 'shipment' | 'trace'
  >('invoice');

  // Interactive AI Chat state & refs
  const chatSectionRef = useRef<HTMLElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatLog, setChatLog] = useState<
    Array<{ sender: string; role: string; text: string; source: string }>
  >([
    {
      sender: 'Maya Chen',
      role: 'Chief AI Operations Orchestrator',
      text: 'All 11 operational agents are connected to the live Express order, SparkDeals monetization, inventory, GST, and FX backend. Use the Chief Agent Audit panel below to inspect every agent’s directives or configure your affiliate tags for SparkDeals revenue.',
      source: 'orchestrator-status',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const loadBrainStatus = async () => {
    try {
      const [res, monRes, agrRes] = await Promise.all([
        fetch('/api/brain/status', { cache: 'no-store' }),
        fetch('/api/monetization/config', { cache: 'no-store' }),
        fetch('/api/agreements', { cache: 'no-store' }),
      ]);
      if (!res.ok) throw new Error('Status fetch failed');
      const data = await res.json();
      setRunsCount(Number(data.runsCount) || 0);
      setAvgLatencyMs(Number(data.avgPipelineLatencyMs) || 0);
      setOracleConfigured(Boolean(data.oracleOicConfigured));
      setGeminiConfigured(Boolean(data.geminiConfigured));
      if (data.fxRateUsdInr) setLiveFxInrPerUsd(Number(data.fxRateUsdInr));
      if (data.fxSource) setFxSource(data.fxSource);
      if (data.lastChiefAudit) setChiefAudit(data.lastChiefAudit);
      if (data.revenueSummary) setRevenueSummary(data.revenueSummary);

      if (Array.isArray(data.inventory?.skus)) {
        setSkuInventory(
          data.inventory.skus.map((s: any) => ({
            id: s.id,
            name: s.name,
            casePrice: s.casePriceInr ?? s.casePrice ?? 1440,
            inStockCases: s.casesAvailable ?? s.inStockCases ?? 0,
          }))
        );
      }
      if (Array.isArray(data.inventory?.warehouses)) {
        setWarehouses(
          data.inventory.warehouses.map((w: any) => ({
            id: w.id,
            name: w.name,
            role: w.line ?? w.role ?? w.city ?? 'Fulfillment Hub',
            cases: w.casesAvailable ?? w.cases ?? 0,
          }))
        );
      }
      if (Array.isArray(data.recentOrders)) {
        const mappedOrders: SparkDrinkOrder[] = data.recentOrders.map((o: any) => ({
          ...o,
          fxRateInrPerUsd: o.fxRateUsed ?? o.fxRateInrPerUsd,
        }));
        setOrders(mappedOrders);
        if (mappedOrders.length > 0 && !selectedOrder) {
          setSelectedOrder(mappedOrders[0]);
        }
        if (mappedOrders[0]?.agentTrace) {
          setLatestTrace(
            mappedOrders[0].agentTrace.map((st: any) => ({
              step: st.step,
              agentId: st.agentId,
              agentName: st.name || st.agentName,
              department: st.role || st.department,
              action: st.action,
              durationMs: st.durationMs ?? mappedOrders[0].durationMs ?? 1,
              status: st.status,
            }))
          );
        }
      }
      if (Array.isArray(data.recentRuns)) {
        setRecentTickerRuns(data.recentRuns);
      }
      if (data.agentStats && typeof data.agentStats === 'object') {
        const mapped: Record<string, AgentTelemetry> = {};
        for (const [id, st] of Object.entries<any>(data.agentStats)) {
          mapped[id] = {
            id,
            runsCount: Number(st?.runs ?? st?.runsCount) || 0,
            lastAction: st?.lastAction || null,
            lastDurationMs: Number(st?.lastDurationMs) || 0,
          };
        }
        setAgentStats(mapped);
      }

      if (monRes.ok && (monRes.headers.get('content-type') || '').includes('application/json')) {
        const mCfg = await monRes.json();
        setMonetizationForm({
          amazonUsTag: mCfg.amazonUsTag || '',
          amazonInTag: mCfg.amazonInTag || '',
          walmartImpactId: mCfg.walmartImpactId || '',
          bestBuyImpactId: mCfg.bestBuyImpactId || '',
          ebayCampId: mCfg.ebayCampId || '',
          skimlinksPubId: mCfg.skimlinksPubId || '',
          sovrnKey: mCfg.sovrnKey || '',
        });
      }
      if (agrRes.ok && (agrRes.headers.get('content-type') || '').includes('application/json')) {
        const agrJson = await agrRes.json();
        setAgreementsData(agrJson);
      }
      setStatusError(null);
    } catch {
      setStatusError('Could not load /api/brain/status from backend server.');
    }
  };

  useEffect(() => {
    void loadBrainStatus();
  }, []);

  const handleRunChiefAudit = async () => {
    if (isAuditing) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/brain/chief-audit', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data?.success) {
        setChiefAudit(data.audit);
        if (data.revenueSummary) setRevenueSummary(data.revenueSummary);
        await loadBrainStatus();
      }
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveMonetizationTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingTags) return;
    setIsSavingTags(true);
    setTagSaveNotice(null);
    try {
      const res = await fetch('/api/monetization/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monetizationForm),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        if (data.summary) setRevenueSummary(data.summary);
        if (data.audit) setChiefAudit(data.audit);
        setTagSaveNotice(data.message || 'Affiliate tags saved and applied across all deals.');
        await loadBrainStatus();
      } else {
        setTagSaveNotice(data?.error || 'Could not save affiliate tags.');
      }
    } catch {
      setTagSaveNotice('Network error saving affiliate partner configuration.');
    } finally {
      setIsSavingTags(false);
    }
  };

  const handleRunCommissionSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSimulating) return;
    setIsSimulating(true);
    setSimError(null);
    try {
      const res = await fetch('/api/revenue/simulate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: simChannel,
          orderValueUsd: Number(simOrderValueUsd) || 199,
          commissionPct: Number(simCommissionPct) || 12,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSimError(data?.error || 'Could not simulate revenue flow.');
      } else {
        setSimResult(data);
      }
    } catch {
      setSimError('Network error running revenue flow simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDraftAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDraftingAgreement) return;
    setIsDraftingAgreement(true);
    setAgreementNotice(null);
    try {
      const res = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...agreementForm,
          commissionRatePct: Number(agreementForm.commissionRatePct) || 12,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setAgreementNotice(data?.error || 'Could not draft agreement.');
      } else {
        setAgreementNotice(
          `Drafted ${data.agreement.id} (${data.agreement.sha256Digest.slice(0, 12)}…) — ${data.disclaimer}`
        );
        setAgreementForm((p) => ({ ...p, partnerName: '', partnerEmail: '' }));
        await loadBrainStatus();
      }
    } catch {
      setAgreementNotice('Network error generating commercial agreement draft.');
    } finally {
      setIsDraftingAgreement(false);
    }
  };

  const selectedProductMeta =
    SPARKLE_DRINKS_PRODUCTS.find((p) => p.id === selectedProductId) || SPARKLE_DRINKS_PRODUCTS[0];
  const activeSkuStock =
    skuInventory.find((s) => s.id === selectedProductId)?.inStockCases ??
    selectedProductMeta.inStockCases;
  const totalAvailableCases = skuInventory.reduce((acc, s) => acc + s.inStockCases, 0);

  // Live INR & USD calculation matching server.ts logic
  const unitPrice = selectedProductMeta.casePrice;
  const subtotal = unitPrice * casesCount;
  const discountPercent =
    customerType === 'dealer' ? (casesCount >= 500 ? 15 : casesCount >= 200 ? 10 : 5) : 0;
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const taxableAmount = Number((subtotal - discountAmount).toFixed(2));
  const isIntraState = ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati'].includes(city);
  const gstRate = 28;
  const gstAmount = Number(((taxableAmount * gstRate) / 100).toFixed(2));
  const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));
  const fxRateUsed = liveFxInrPerUsd || 92.68;
  const grandTotalUsd = Number((grandTotal / fxRateUsed).toFixed(2));

  const departmentFilters = [
    { id: 'all', label: 'All 11 Agents' },
    { id: 'executive', label: 'Executive, Revenue & Legal' },
    { id: 'affiliate', label: 'SparkDeals Monetization' },
    { id: 'commercial', label: 'B2B & D2C Orders' },
    { id: 'manufacturing', label: 'Factory & Procurement' },
    { id: 'finance', label: 'Finance & GST' },
    { id: 'logistics', label: 'Cold-Chain & Cloud' },
  ];

  const filteredEmployees = AI_EMPLOYEES.filter((emp) => {
    if (selectedDept === 'all') return true;
    const dept = emp.department.toLowerCase();
    if (selectedDept === 'executive') return dept.includes('executive') || dept.includes('legal') || dept.includes('business intelligence');
    if (selectedDept === 'affiliate') return dept.includes('affiliate');
    if (selectedDept === 'commercial') return dept.includes('wholesale') || dept.includes('consumer');
    if (selectedDept === 'manufacturing') return dept.includes('manufacturing') || dept.includes('supply chain');
    if (selectedDept === 'finance') return dept.includes('finance');
    if (selectedDept === 'logistics') return dept.includes('logistics') || dept.includes('cloud');
    return true;
  });

  // Trigger real 11-Agent Server Pipeline Orchestration
  const handleTriggerAutomation = async () => {
    if (isAutomating) return;
    setPipelineError(null);
    setIsAutomating(true);
    setPipelineStep(1);
    setCloudSyncStatus((prev) => ({ ...prev, status: 'syncing' }));

    const timer2 = setTimeout(() => setPipelineStep(2), 250);
    const timer3 = setTimeout(() => setPipelineStep(3), 500);

    try {
      const res = await fetch('/api/brain/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType,
          buyerName: buyerName.trim() || undefined,
          businessName: businessName.trim() || undefined,
          gstin: customerType === 'dealer' ? gstin.trim() : undefined,
          city,
          productId: selectedProductId,
          casesCount,
        }),
      });

      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setPipelineError(data?.error || 'Order pipeline returned an error.');
        setPipelineStep(0);
        setIsAutomating(false);
        return;
      }

      setPipelineStep(4);
      const createdOrder: SparkDrinkOrder = {
        ...data.order,
        fxRateInrPerUsd: data.order.fxRateUsed ?? data.fxRateUsdInr,
      };
      setSelectedOrder(createdOrder);
      setOrders((prev) => [createdOrder, ...prev].slice(0, 25));
      if (Array.isArray(data.agentTrace)) {
        setLatestTrace(
          data.agentTrace.map((st: any) => ({
            step: st.step,
            agentId: st.agentId,
            agentName: st.name || st.agentName,
            department: st.role || st.department,
            action: st.action,
            durationMs: data.durationMs ?? 1,
            status: st.status,
          }))
        );
      }
      if (Array.isArray(data.inventory?.skus)) {
        setSkuInventory(
          data.inventory.skus.map((s: any) => ({
            id: s.id,
            name: s.name,
            casePrice: s.casePriceInr ?? 1440,
            inStockCases: s.casesAvailable ?? 0,
          }))
        );
      }
      if (Array.isArray(data.inventory?.warehouses)) {
        setWarehouses(
          data.inventory.warehouses.map((w: any) => ({
            id: w.id,
            name: w.name,
            role: w.line ?? w.city ?? 'Hub',
            cases: w.casesAvailable ?? 0,
          }))
        );
      }
      if (typeof data.statusSummary?.runsCount === 'number') {
        setRunsCount(data.statusSummary.runsCount);
      }

      setCloudSyncStatus({
        status: createdOrder.syncStatus || 'local_ledger',
        traceId: createdOrder.traceId || 'TRACE-OK',
        latencyMs: data.durationMs ?? 0,
        lastSyncTime: new Date().toISOString(),
        details: 'Order, GST invoice & inventory persisted atomically.',
      });

      void loadBrainStatus();

      setChatLog((prev) => [
        ...prev,
        {
          sender: '11-Agent Orchestrator',
          role: `All 11 Agents Completed (${data.durationMs ?? 1}ms)`,
          text: `Executed ${createdOrder.id} (${createdOrder.cases} cases of ${createdOrder.product} to ${createdOrder.city}). Requisition: ${createdOrder.requisitionId}, Invoice: ${createdOrder.invoiceId} (₹${createdOrder.grandTotal.toLocaleString('en-IN')} ≈ $${createdOrder.grandTotalUsd?.toFixed(2)} USD @ ₹${createdOrder.fxRateInrPerUsd?.toFixed(2)}), Waybill: ${createdOrder.waybillId}.`,
          source: 'pipeline-orchestrator',
        },
      ]);
    } catch {
      clearTimeout(timer2);
      clearTimeout(timer3);
      setPipelineError('Network error reaching /api/brain/orchestrate. Ensure server is running.');
      setPipelineStep(0);
    } finally {
      setIsAutomating(false);
    }
  };

  const handleManualCloudSync = async () => {
    setCloudSyncStatus((prev) => ({ ...prev, status: 'syncing' }));
    const res = await dispatchToEnterpriseCloud(
      selectedOrder
        ? { ...selectedOrder }
        : { type: 'heartbeat_sync', skuInventoryCount: totalAvailableCases }
    );
    setCloudSyncStatus({
      status: res.status,
      traceId: res.traceId,
      latencyMs: res.latencyMs,
      lastSyncTime: res.timestamp,
      details: res.details,
    });
  };

  const handleConsultAgent = (empId: string, empName: string) => {
    setSelectedEmployeeId(empId);
    setChatPrompt(`As ${empName}, summarize your live responsibilities and current stock/FX context.`);
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => chatInputRef.current?.focus(), 300);
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatPrompt.trim() || isChatLoading) return;

    const userText = chatPrompt;
    setChatPrompt('');
    setIsChatLoading(true);

    setChatLog((prev) => [
      ...prev,
      {
        sender: 'You (Operator)',
        role: 'Business Commander',
        text: userText,
        source: 'user',
      },
    ]);

    const result = await askAiBrain(userText, selectedEmployeeId);

    setChatLog((prev) => [
      ...prev,
      {
        sender: result.employeeName,
        role: result.employeeRole,
        text: result.response,
        source: result.source,
      },
    ]);

    setIsChatLoading(false);
  };

  return (
    <div className="space-y-12 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* SECTION 1: AI WORKFORCE COCKPIT HEADER (REAL SERVER TELEMETRY)  */}
      {/* ============================================================== */}
      <section className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0a1226] to-slate-950 border border-cyan-500/50 shadow-2xl overflow-hidden">
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
                <span>11 CONNECTED AI EMPLOYEES · LIVE REVENUE &amp; SERVER TELEMETRY</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Radiant Brain{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                  Operations OS
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Autonomous 11-agent execution engine: Chief Agent Maya Chen supervises SparkDeals affiliate link resolution, Lifestyle Spark checkout, customer &amp; dealer orders, SKU inventory, deterministic 28% GST invoicing with live FX, and real revenue accounting.
              </p>
            </div>

            {/* Real Measured Server KPI Cards (Zero fake % boosts or static SLAs) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Connected Workforce
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1.5 mt-0.5 tabular-nums">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  11 / 11
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Live USD / INR ({fxSource})
                </span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5 block tabular-nums">
                  ₹{fxRateUsed.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Realized Revenue (USD)
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5 block tabular-nums">
                  ${(revenueSummary?.realizedRevenue.totalRealizedUsd ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {statusError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{statusError}</span>
            </div>
          )}

          {/* Real Agent Activity Feed Ticker */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 overflow-x-auto">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] shrink-0 border border-cyan-500/30">
              EXECUTION FEED
            </span>
            {recentTickerRuns.length > 0 ? (
              <div className="flex items-center gap-6 whitespace-nowrap text-[11px] font-mono">
                {recentTickerRuns.slice(0, 4).map((run) => (
                  <span key={run.traceId || run.orderId} className="text-emerald-300">
                    {run.orderId} · {run.cases} cs ({run.buyer}) — ₹{Number(run.grandTotalInr ?? 0).toLocaleString('en-IN')} ({run.durationMs}ms)
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-slate-400">
                Pipeline operational ({runsCount} orders, {avgLatencyMs > 0 ? `${avgLatencyMs}ms avg` : 'ready'}). Chief Agent audit last ran {chiefAudit ? new Date(chiefAudit.executedAt).toLocaleTimeString() : 'at boot'}.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 1.5: CHIEF AGENT REVENUE DIAGNOSIS & AUTONOMOUS FIXES   */}
      {/* ============================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              COMPANY REVENUE LEDGER &amp; CHIEF AGENT AUTONOMOUS AUDIT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Realistic Revenue &amp; SparkDeals Affiliate Attribution
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              {chiefAudit?.summaryNote ||
                'Chief Agent Maya Chen continuously checks all 11 agents, resolves direct merchant URLs for SparkDeals, and reconciles Stripe subscriptions, affiliate postbacks, and B2B/D2C ERP invoices with zero fake revenue.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleRunChiefAudit()}
              disabled={isAuditing}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Chief Agent Auditing...' : 'Chief Agent: Audit & Auto-Fix All 11'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToView('sparkdeals')}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs"
            >
              Open SparkDeals ↗
            </button>
          </div>
        </div>

        {/* 3 Real Revenue Streams Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">1. SparkDeals Affiliate Payouts</span>
            <strong className="text-xl text-amber-400 font-black block tabular-nums">
              ${(revenueSummary?.realizedRevenue.affiliateVerifiedUsd ?? 0).toFixed(2)} USD
            </strong>
            <span className="text-[10px] text-slate-400 block">
              {revenueSummary?.realizedRevenue.affiliateConversionsCount ?? 0} verified postbacks ·{' '}
              <strong className="text-cyan-300">{revenueSummary?.sparkdealsFunnel.outboundClicksTotal ?? 0}</strong> redirect clicks
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">2. Lifestyle Spark Stripe</span>
            <strong className="text-xl text-emerald-400 font-black block tabular-nums">
              ${(revenueSummary?.realizedRevenue.lifestyleSparkUsd ?? 0).toFixed(2)} USD
            </strong>
            <span className="text-[10px] text-slate-400 block">
              {revenueSummary?.realizedRevenue.lifestyleTransactionsCount ?? 0} paid Stripe sessions ({revenueSummary?.monetizationReadiness.stripeConnected ? 'Stripe Live' : 'Stripe Key Needed'})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">3. Beverage / B2B ERP Sales</span>
            <strong className="text-xl text-cyan-300 font-black block tabular-nums">
              ₹{(revenueSummary?.realizedRevenue.erpDirectInr ?? 0).toLocaleString('en-IN')}
            </strong>
            <span className="text-[10px] text-slate-400 block">
              ≈ ${(revenueSummary?.realizedRevenue.erpDirectUsd ?? 0).toFixed(2)} USD · {revenueSummary?.realizedRevenue.erpOrdersCount ?? 0} ERP orders
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase block">SparkDeals Direct Resolution</span>
            <strong className="text-xl text-white font-black block tabular-nums">
              {revenueSummary?.sparkdealsFunnel.directMerchantResolvedCount ?? 0} / {revenueSummary?.sparkdealsFunnel.totalLiveDeals ?? 0} Deals
            </strong>
            <span className="text-[10px] text-slate-400 block">
              {revenueSummary?.sparkdealsFunnel.affiliateTaggedCount ?? 0} affiliate-tagged · {revenueSummary?.sparkdealsFunnel.aggregatorOnlyCount ?? 0} aggregator-only
            </span>
          </div>
        </div>

        {/* Realistic Diagnosis of Why $0 Is Realized (if any gap exists) */}
        {revenueSummary && revenueSummary.diagnosisReasons.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2 text-xs">
            <strong className="text-amber-300 font-mono uppercase tracking-wider text-[11px] block">
              Honest Revenue Blockers Found by Chief Agent Maya Chen &amp; Kavya Nair (emp-11):
            </strong>
            <ul className="space-y-1.5 text-slate-200 list-disc pl-5">
              {revenueSummary.diagnosisReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Configure Real Affiliate Tags Without Code Edits */}
        <form onSubmit={handleSaveMonetizationTags} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Activate SparkDeals Affiliate Partner Tags (Zero Code Changes)
              </h3>
              <p className="text-[11px] text-slate-400">
                Save your official Associate / Publisher IDs once; emp-11 (Kavya Nair) immediately tags Amazon.com, Walmart, Best Buy, Target, Home Depot, Newegg, Costco &amp; eBay links via /api/deals/redirect/:id.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300">
              {revenueSummary?.monetizationReadiness.configuredCount ?? 0} Active Tag(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">Amazon US Associate Tag</span>
              <input
                type="text"
                value={monetizationForm.amazonUsTag}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, amazonUsTag: e.target.value }))}
                placeholder="e.g. radiantspark-20"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">Amazon India Tag</span>
              <input
                type="text"
                value={monetizationForm.amazonInTag}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, amazonInTag: e.target.value }))}
                placeholder="e.g. radiantspark-21"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">Walmart Creator / Impact ID</span>
              <input
                type="text"
                value={monetizationForm.walmartImpactId}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, walmartImpactId: e.target.value }))}
                placeholder="Impact Publisher ID"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">Best Buy Impact ID (mpid)</span>
              <input
                type="text"
                value={monetizationForm.bestBuyImpactId}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, bestBuyImpactId: e.target.value }))}
                placeholder="Best Buy Impact mpid"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">eBay Partner Campaign ID</span>
              <input
                type="text"
                value={monetizationForm.ebayCampId}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, ebayCampId: e.target.value }))}
                placeholder="10-digit EPN campid"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">Skimlinks Publisher ID (Target / HD / Newegg)</span>
              <input
                type="text"
                value={monetizationForm.skimlinksPubId}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, skimlinksPubId: e.target.value }))}
                placeholder="e.g. 12345X67890"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
            <label className="space-y-1 block sm:col-span-2">
              <span className="text-[10px] text-slate-400">Sovrn //Commerce Key (Multi-Merchant Fallback)</span>
              <input
                type="text"
                value={monetizationForm.sovrnKey}
                onChange={(e) => setMonetizationForm((p) => ({ ...p, sovrnKey: e.target.value }))}
                placeholder="Sovrn API Key"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isSavingTags}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs disabled:opacity-50"
            >
              {isSavingTags ? 'Applying Across Live Feed...' : 'Save Partner IDs & Auto-Tag Deals'}
            </button>
            {tagSaveNotice && (
              <span className="text-xs font-mono text-emerald-300">{tagSaveNotice}</span>
            )}
          </div>
        </form>

        {/* Order & 3rd-Party Vendor Commission Flow Simulator (Strict Dry-Run) */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Order &amp; 3rd-Party Vendor Commission Flow Simulator (Dry-Run Test)
              </h3>
              <p className="text-[11px] text-slate-400">
                Test exactly how a customer order splits commission, card fees, tax reserves &amp; vendor payouts without mutating real ledger revenue.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shrink-0">
              DRY-RUN · $0.00 FAKE REVENUE ADDED
            </span>
          </div>

          <form onSubmit={handleRunCommissionSimulation} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono items-end">
            <label className="space-y-1 block sm:col-span-2">
              <span className="text-[10px] text-slate-400">Revenue Channel</span>
              <select
                value={simChannel}
                onChange={(e) => {
                  const ch = e.target.value as typeof simChannel;
                  setSimChannel(ch);
                  if (ch === 'sparkdeals_affiliate') setSimCommissionPct('4');
                  else if (ch === 'third_party_vendor') setSimCommissionPct('12');
                  else if (ch === 'lifestyle_stripe') {
                    setSimOrderValueUsd('149.99');
                    setSimCommissionPct('100');
                  } else setSimCommissionPct('22');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="sparkdeals_affiliate">1. SparkDeals Affiliate Click -&gt; Merchant CPA (%)</option>
                <option value="third_party_vendor">2. 3rd-Party Vendor / Supplier Agency Order (%)</option>
                <option value="lifestyle_stripe">3. Lifestyle Spark Direct Stripe Subscription ($9.99 / $49.99 / $149.99)</option>
                <option value="direct_b2b_erp">4. Direct B2B / Beverage ERP Order (28% GST + Margin)</option>
              </select>
            </label>

            <label className="space-y-1 block">
              <span className="text-[10px] text-slate-400">Customer Order (USD)</span>
              <input
                type="number"
                min="1"
                max="500000"
                step="0.01"
                value={simOrderValueUsd}
                onChange={(e) => setSimOrderValueUsd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </label>

            <div className="flex gap-2 items-end">
              <label className="space-y-1 block flex-1">
                <span className="text-[10px] text-slate-400">Rate (%)</span>
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={simCommissionPct}
                  onChange={(e) => setSimCommissionPct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </label>
              <button
                type="submit"
                disabled={isSimulating}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shrink-0 disabled:opacity-50"
              >
                {isSimulating ? 'Testing...' : 'Test Flow'}
              </button>
            </div>
          </form>

          {simError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
              {simError}
            </div>
          )}

          {simResult && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Buyer Order</span>
                  <strong className="text-white text-sm">${simResult.orderValueUsd.toFixed(2)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block">Company Gross Fee</span>
                  <strong className="text-emerald-300 text-sm">+${simResult.companyGrossRevenueUsd.toFixed(2)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vendor / COGS Share</span>
                  <strong className="text-cyan-300 text-sm">${simResult.vendorPayoutUsd.toFixed(2)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 block">Net Company Proceeds</span>
                  <strong className="text-amber-300 text-sm">
                    ${simResult.netToCompanyUsd.toFixed(2)} (₹{simResult.netToCompanyInr.toLocaleString('en-IN')})
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-300">
                <strong className="text-cyan-300">Settlement Mechanism:</strong> {simResult.settlementMechanism}
              </div>

              <div className="space-y-1.5">
                {simResult.stepByStepFlow.map((s) => (
                  <div
                    key={s.step}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80"
                  >
                    <div className="text-[11px] text-slate-300">
                      <span className="text-cyan-400 font-mono font-bold mr-1.5">Step {s.step} · {s.actor}:</span>
                      <span>{s.detail}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                      {s.amountLabel}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {simResult.legalShieldsApplied.map((shield, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300"
                  >
                    Shield: {shield}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legal Shield Frameworks & Partner Revenue Agreements (Ananya Iyer + Arjun Reddy) */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Legal Shield Frameworks &amp; Vendor / Supplier Revenue Agreements
              </h3>
              <p className="text-[11px] text-slate-400">
                Prepared by Ananya Iyer (emp-9), Arjun Reddy (emp-2) &amp; Kavya Nair (emp-11). Generates SHA-256 checksummed counsel-ready agreement drafts requiring written executive countersignature.
              </p>
            </div>
            {agreementsData && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono shrink-0">
                <span className="text-emerald-300">
                  FTC 16 CFR 255 · ROSCA · DMCA § 512 · Stripe SAQ-A
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToView('usa')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold"
                >
                  Open U.S. Legal Shield ↗
                </button>
              </div>
            )}
          </div>

          {/* U.S. Operations, Merchant Coverage & Legal Shield Readiness */}
          {(chiefAudit?.usComplianceAudit || agreementsData?.usRetailerProgramCoverage) && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-extrabold text-cyan-300">
                  U.S. Operations, Merchant Coverage &amp; Legal Shield Readiness ({chiefAudit?.usComplianceAudit?.entity || 'Radiant Spark LLC'})
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-300">
                  <span>Amazon 6h Price Gate: Active</span>
                  <span>·</span>
                  <span>W-9 / Written SOW Boundary: Enforced</span>
                </div>
              </div>

              {chiefAudit?.usComplianceAudit?.usRetailerDealCounts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[11px] font-mono">
                  {Object.entries(chiefAudit.usComplianceAudit.usRetailerDealCounts).map(([store, count]) => (
                    <div key={store} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block truncate" title={store}>{store}</span>
                      <strong className="text-white tabular-nums">{count} deals</strong>
                    </div>
                  ))}
                </div>
              )}

              {agreementsData?.usRetailerProgramCoverage && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {agreementsData.usRetailerProgramCoverage.map((row) => (
                    <div key={row.merchant} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-white text-[11px]">{row.merchant}</strong>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            row.tagConfigured ? 'text-emerald-400' : 'text-amber-300'
                          }`}
                        >
                          {row.tagConfigured ? 'TAG ACTIVE' : 'TAG PENDING'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{row.shield}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {agreementsData?.frameworks && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {agreementsData.frameworks.map((fw) => (
                <div key={fw.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-white text-xs">{fw.title}</strong>
                    <span className="text-[10px] font-mono text-amber-300 shrink-0">{fw.entity}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{fw.howMoneyArrives}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {fw.keyShields.map((sh, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                        {sh}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Draft Revenue Agreement Form */}
          <form onSubmit={handleDraftAgreement} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-300">
              Generate Vendor / Supplier Commission Agreement Draft (SHA-256 Checksummed)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <input
                type="text"
                required
                placeholder="Partner / Supplier Company Name *"
                value={agreementForm.partnerName}
                onChange={(e) => setAgreementForm((p) => ({ ...p, partnerName: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
              <input
                type="email"
                required
                placeholder="Partner Contact Email *"
                value={agreementForm.partnerEmail}
                onChange={(e) => setAgreementForm((p) => ({ ...p, partnerEmail: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
              <select
                value={agreementForm.entity}
                onChange={(e) =>
                  setAgreementForm((p) => ({ ...p, entity: e.target.value as typeof agreementForm.entity }))
                }
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Radiant Spark LLC (USA)">Radiant Spark LLC (USA)</option>
                <option value="RDNT Sparkle Industries LLP (India)">RDNT Sparkle Industries LLP (India)</option>
              </select>
              <select
                value={agreementForm.agreementType}
                onChange={(e) =>
                  setAgreementForm((p) => ({ ...p, agreementType: e.target.value as typeof agreementForm.agreementType }))
                }
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="vendor_agency_commission">Vendor Agency Commission MSA</option>
                <option value="affiliate_cpa">Affiliate CPA / CPS Partner Terms</option>
                <option value="wholesale_supply_margin">Wholesale Supply &amp; Distribution</option>
                <option value="legal_shield_dpa">Intermediary &amp; Data Protection DPA</option>
              </select>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                placeholder="Commission %"
                value={agreementForm.commissionRatePct}
                onChange={(e) => setAgreementForm((p) => ({ ...p, commissionRatePct: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
              <select
                value={agreementForm.settlementTerms}
                onChange={(e) =>
                  setAgreementForm((p) => ({ ...p, settlementTerms: e.target.value as typeof agreementForm.settlementTerms }))
                }
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Net-15 Bank/ACH">Net-15 Bank / ACH / NEFT</option>
                <option value="Net-30 Network Payout">Net-30 Network Payout</option>
                <option value="Instant Stripe Split / Wire">Instant Stripe Split / Wire</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <button
                type="submit"
                disabled={isDraftingAgreement}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs disabled:opacity-50"
              >
                {isDraftingAgreement ? 'Generating SHA-256 Draft...' : 'Draft Revenue Agreement & Legal Shield'}
              </button>
              {agreementNotice && (
                <span className="text-[11px] font-mono text-emerald-300">{agreementNotice}</span>
              )}
            </div>
          </form>

          {agreementsData && agreementsData.agreements.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Persisted Commercial Agreement Drafts ({agreementsData.agreements.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-mono">
                {agreementsData.agreements.slice(0, 6).map((agr) => (
                  <div key={agr.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex justify-between gap-2">
                      <strong className="text-white">{agr.partnerName}</strong>
                      <span className="text-amber-300">{agr.commissionRatePct}% · {agr.settlementTerms}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {agr.id} · {agr.entity} · {agr.taxJurisdiction}
                    </div>
                    <div className="text-[10px] text-cyan-300">
                      SHA-256: {agr.sha256Digest} · {agr.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chief Agent Directives Matrix Across All 11 Agents */}
        {chiefAudit && chiefAudit.directives?.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-cyan-300 font-bold">
                CHIEF AGENT DIRECTIVES LOG ({chiefAudit.auditId} · {chiefAudit.durationMs}ms · {chiefAudit.trigger})
              </span>
              <span className="text-slate-400">
                Checked {new Date(chiefAudit.executedAt).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {chiefAudit.directives.map((d) => (
                <div
                  key={d.agentId}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-white text-xs">
                      {d.agentName} <span className="text-slate-400 font-normal">({d.role})</span>
                    </strong>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        d.status === 'action_required'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : d.status === 'auto_fixed'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {d.status === 'action_required'
                        ? 'NEEDS CREDENTIAL'
                        : d.status === 'auto_fixed'
                        ? 'AUTO-FIXED'
                        : 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Directive:</strong> {d.chiefInstruction}
                  </p>
                  <p className="text-[11px] text-emerald-300/90 font-mono">{d.actionTaken}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Enterprise Order-to-Cash & Procure-to-Pay Matrix (Connected to Live Server Inventory) */}
      <O2cP2pModule
        skuInventory={skuInventory}
        warehouses={warehouses}
        liveFxInrPerUsd={fxRateUsed}
        onPipelineComplete={() => void loadBrainStatus()}
      />

      {/* ============================================================== */}
      {/* SECTION 2: THE 11 AI EMPLOYEES DIRECTORY (INTERACTIVE FILTER)   */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              OPERATIONAL WORKFORCE DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              11 Specialized AI Employees
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {departmentFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedDept(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedDept === f.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 11 AI Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((emp) => {
            const isSelected = selectedEmployeeId === emp.id;
            const telemetry = agentStats[emp.id];
            const completedCount = telemetry?.runsCount ?? emp.tasksCompleted;
            const liveTask = telemetry?.lastAction || emp.currentTask;
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full tabular-nums">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {completedCount} RUNS
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{emp.name}</h3>
                    <p className="text-[11px] font-semibold text-cyan-400 leading-snug mt-0.5">
                      {emp.role}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{emp.department}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-300 leading-relaxed">
                    <span className="text-slate-500 font-bold block mb-0.5">
                      {telemetry?.lastAction ? 'LAST EXECUTED STEP:' : 'ROLE SCOPE:'}
                    </span>
                    <span className="line-clamp-3">{liveTask}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400">{emp.accuracy}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                    Inspect <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected AI Employee Inter-Agent Connectivity Inspector */}
        {(() => {
          const emp = AI_EMPLOYEES.find((e) => e.id === selectedEmployeeId) || AI_EMPLOYEES[0];
          const telemetry = agentStats[emp.id];
          return (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/50 shadow-2xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl sm:text-4xl p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                    {emp.avatar}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-white">{emp.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                        {geminiConfigured ? 'GEMINI 4 HYDROGEN ACTIVE' : 'RULE ENGINE + GEMINI READY'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-cyan-300 mt-0.5">{emp.role}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{emp.department}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 tabular-nums">
                    Recorded Runs:{' '}
                    <strong className="text-cyan-400 font-bold">
                      {telemetry?.runsCount ?? 0}
                    </strong>
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 font-bold">
                    Protocol: {emp.handshakeProtocol}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Upstream Inputs
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {emp.connectedUpstream?.map((upName) => (
                      <span
                        key={upName}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 font-bold text-[11px]"
                      >
                        {upName}
                      </span>
                    )) || <span className="text-slate-500 italic">Root Orchestrator</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    Passes structured order, stock, or compliance payloads into {emp.name}.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Verified Agent Responsibility
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                    {emp.businessValue}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Downstream Handshake
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {emp.connectedDownstream?.map((downName) => (
                      <span
                        key={downName}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 font-bold text-[11px]"
                      >
                        {downName}
                      </span>
                    )) || <span className="text-slate-500 italic">Terminal Step</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    Sequentially triggers downstream pipeline steps during server execution.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    Capabilities:
                  </span>
                  {emp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleConsultAgent(emp.id, emp.name)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Consult {emp.name} ↗</span>
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: LIVE 10-AGENT ORDER-TO-DISPATCH EXECUTION ENGINE     */}
      {/* ============================================================== */}
      <section className="space-y-6 pt-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>END-TO-END 11-AGENT ORDER EXECUTION · PERSISTENT INVENTORY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Order Intake -&gt; Requisition -&gt; 28% GST Invoice -&gt; Dispatch
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Every submission executes all 11 agents sequentially on the backend server, deducts real SKU stock, computes intra/inter-state GST + USD FX equivalent, and persists to the ledger.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950 text-amber-300 font-bold text-xs border border-amber-500/30 font-mono">
                HSN 22021010 · FSSAI #10126999000142
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Customer & Dealer Intake Form */}
            <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-white">
                Customer &amp; Dealer Order Entry
              </h3>

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
                  Wholesale Dealer (B2B)
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
                  Direct Consumer (D2C)
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {customerType === 'dealer'
                      ? 'Distributor / Dealer Business Name'
                      : 'Consumer Full Name'}
                  </label>
                  <input
                    type="text"
                    value={customerType === 'dealer' ? businessName : buyerName}
                    onChange={(e) => {
                      if (customerType === 'dealer') setBusinessName(e.target.value);
                      else setBuyerName(e.target.value);
                    }}
                    placeholder={
                      customerType === 'dealer'
                        ? 'Enter Distributor / Dealer Business Name...'
                        : 'Enter Consumer Full Name...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                  />
                </div>

                {customerType === 'dealer' && (
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      Dealer GSTIN (15-char India Tax ID)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 37AAACA8891J1ZP"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      Delivery City ({isIntraState ? 'Intra-State' : 'Inter-State'})
                    </label>
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
                    <label className="text-slate-400 font-semibold block mb-1">
                      Quantity (Cases of 24)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={activeSkuStock}
                      value={casesCount}
                      onChange={(e) =>
                        setCasesCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-amber-400 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Sparkle Drinks SKU ({activeSkuStock.toLocaleString('en-IN')} cs available)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    {SPARKLE_DRINKS_PRODUCTS.map((p) => {
                      const liveCount =
                        skuInventory.find((s) => s.id === p.id)?.inStockCases ?? p.inStockCases;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.casePrice}/cs · {liveCount.toLocaleString('en-IN')} avail)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Live Persistent Server Stock Breakdown */}
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                      Server Warehouse Inventory
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold tabular-nums">
                      Total: {totalAvailableCases.toLocaleString('en-IN')} Cases
                    </span>
                  </div>

                  {warehouses.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                      {warehouses.map((wh) => (
                        <div key={wh.id} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                          <span className="text-slate-400 block text-[9px] truncate">{wh.name}</span>
                          <strong className="text-white text-xs block tabular-nums">
                            {wh.cases.toLocaleString('en-IN')} cs
                          </strong>
                          <span className="text-cyan-400 text-[9px] truncate block">{wh.role}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">SKU Check ({casesCount} cs):</span>
                    {casesCount <= activeSkuStock ? (
                      <span className="text-emerald-400 font-bold tabular-nums">
                        In Stock ({(activeSkuStock - casesCount).toLocaleString('en-IN')} remaining)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold">Exceeds SKU Stock</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Cost Breakdown (INR + USD Spot FX) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-slate-400">
                  <span>Cases Ordered:</span>
                  <span className="text-white font-bold">
                    {casesCount} cases ({(casesCount * 24).toLocaleString('en-IN')} cans)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Volume Tier Discount ({discountPercent}%):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>
                    {isIntraState ? 'CGST 14% + SGST 14%' : 'IGST 28% (Inter-State)'}:
                  </span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total (INR):</span>
                  <span className="text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-cyan-300">
                  <span>Live USD Spot Equivalent (@ ₹{fxRateUsed.toFixed(2)}):</span>
                  <span className="font-bold">${grandTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                </div>
              </div>

              {pipelineError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200">
                  {pipelineError}
                </div>
              )}

              <button
                type="button"
                disabled={isAutomating || casesCount > activeSkuStock}
                onClick={() => void handleTriggerAutomation()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAutomating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Executing All 11 AI Agents on Server...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Execute 11-Agent Order Pipeline</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Execution Stepper & Persisted Documents */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3">
                  11-Agent Execution Pipeline Stages:
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStep >= 1
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <strong className="block text-[11px]">1. Intake &amp; GSTIN</strong>
                    <span className="text-[9px] font-mono text-slate-400">Maya · Arjun</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStep >= 2
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <strong className="block text-[11px]">2. Stock &amp; Batch</strong>
                    <span className="text-[9px] font-mono text-slate-400">Rajesh · Priya</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStep >= 3
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <strong className="block text-[11px]">3. GST &amp; Audit</strong>
                    <span className="text-[9px] font-mono text-slate-400">Elena · Ananya</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStep >= 4
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <strong className="block text-[11px]">4. Waybill &amp; Rev</strong>
                    <span className="text-[9px] font-mono text-slate-400">Vikram · David · Kavya</span>
                  </div>
                </div>
              </div>

              {!selectedOrder ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">No Order Selected Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Submit an order using the form on the left to generate a real 28% GST Tax Invoice, Factory Requisition Slip, Cold-Chain Waybill, and 11-Agent Execution Trace.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'invoice', label: 'GST Tax Invoice' },
                        { id: 'receipt', label: 'Customer Receipt' },
                        { id: 'amazonLabel', label: 'Dispatch Label' },
                        { id: 'requisition', label: 'Factory Requisition' },
                        { id: 'shipment', label: 'Waybill' },
                        { id: 'trace', label: `11-Agent Trace (${latestTrace.length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveDocTab(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeDocTab === tab.id
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-white bg-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <a
                        href={buildWhatsAppInvoiceUrl(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                      >
                        <span>Share WhatsApp Summary</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: GST TAX INVOICE */}
                  {activeDocTab === 'invoice' && (
                    <div className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 shadow-2xl font-sans text-xs">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-extrabold block">
                            TAX INVOICE · HSN 22021010
                          </span>
                          <h4 className="text-xl font-black text-slate-900 mt-0.5">
                            RDNT Sparkle Industries LLP
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Sparkle Drinks &amp; Logistics · Guntur, Andhra Pradesh<br />
                            <strong>FSSAI Central Lic:</strong> #10126999000142
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-bold text-xs inline-block mb-1">
                            {selectedOrder.invoiceId}
                          </span>
                          <p className="text-[11px] text-slate-600">
                            Order: <strong>{selectedOrder.id}</strong><br />
                            Date: <strong>{selectedOrder.date}</strong><br />
                            Supply: <strong>{selectedOrder.state}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-bold block mb-0.5 uppercase">
                            Billed To:
                          </span>
                          <strong className="text-slate-900 text-xs block">
                            {selectedOrder.businessName}
                          </strong>
                          <p className="text-slate-600">
                            Attn: {selectedOrder.buyerName}<br />
                            City: {selectedOrder.city}, {selectedOrder.state}<br />
                            GSTIN: {selectedOrder.gstin || 'Unregistered B2C'}{' '}
                            {selectedOrder.gstin ? (selectedOrder.gstinValid ? '(Valid Format)' : '(Format Check Failed)') : ''}
                          </p>
                        </div>

                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-slate-500 font-bold block mb-0.5 uppercase">
                            Dispatch &amp; Trace:
                          </span>
                          <p className="text-slate-600">
                            Waybill: <strong>{selectedOrder.waybillId}</strong><br />
                            Vehicle Ref: <strong>{selectedOrder.vehicleNo}</strong><br />
                            IRN Hash: <strong className="font-mono text-[10px]">{selectedOrder.irnHash || 'SHA256'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                        <div className="space-y-1 text-[10px] text-slate-500 max-w-xs">
                          <p>
                            {selectedOrder.product} — {selectedOrder.cases} cases ({selectedOrder.totalCans} cans)
                          </p>
                          <p className="font-mono text-emerald-700">
                            FX Reference: $1 = ₹{selectedOrder.fxRateInrPerUsd?.toFixed(2) || fxRateUsed.toFixed(2)}
                          </p>
                        </div>

                        <div className="w-64 space-y-1 font-mono text-right text-[11px] tabular-nums">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                          </div>
                          {selectedOrder.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-700">
                              <span>Discount ({selectedOrder.discountPercent}%):</span>
                              <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {selectedOrder.isIntraState !== false ? (
                            <>
                              <div className="flex justify-between text-slate-600">
                                <span>CGST (14%):</span>
                                <span>₹{(selectedOrder.cgstAmount ?? selectedOrder.gstAmount / 2).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>SGST (14%):</span>
                                <span>₹{(selectedOrder.sgstAmount ?? selectedOrder.gstAmount / 2).toLocaleString('en-IN')}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-slate-600">
                              <span>IGST (28% Inter-State):</span>
                              <span>₹{(selectedOrder.igstAmount ?? selectedOrder.gstAmount).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-900 pt-1.5">
                            <span>Total (INR):</span>
                            <span className="text-blue-700">₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</span>
                          </div>
                          {selectedOrder.grandTotalUsd && (
                            <div className="flex justify-between text-[11px] font-bold text-slate-600">
                              <span>USD Equivalent:</span>
                              <span>${selectedOrder.grandTotalUsd.toFixed(2)} USD</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: RECEIPT */}
                  {activeDocTab === 'receipt' && (
                    <div className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 shadow-2xl font-sans text-xs">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">CUSTOMER ORDER RECEIPT</h4>
                          <p className="text-[11px] text-slate-600">
                            RDNT Sparkle Industries LLP · {selectedOrder.id}
                          </p>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <strong className="text-emerald-700 block">{selectedOrder.invoiceId}</strong>
                          <span>{selectedOrder.date}</span>
                        </div>
                      </div>
                      <p className="text-slate-700">
                        Consignee: <strong>{selectedOrder.buyerName}</strong> ({selectedOrder.businessName}) · {selectedOrder.city}, {selectedOrder.state}
                      </p>
                      <p className="text-slate-700 font-mono">
                        {selectedOrder.cases} Cases of {selectedOrder.product} — Total Paid / Invoiced: <strong>₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</strong>
                      </p>
                    </div>
                  )}

                  {/* TAB 3: SHIPPING LABEL */}
                  {activeDocTab === 'amazonLabel' && (
                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-white text-slate-950 space-y-4 shadow-2xl font-mono text-xs border-4 border-slate-950">
                      <div className="flex justify-between items-center border-b-4 border-slate-950 pb-2">
                        <strong className="text-base font-black">RDNT DISPATCH LABEL</strong>
                        <span className="font-bold">{selectedOrder.waybillId}</span>
                      </div>
                      <div className="border-b-2 border-slate-950 pb-3 leading-snug">
                        <span className="text-[9px] uppercase text-slate-500 font-bold block">SHIP TO:</span>
                        <strong className="text-sm text-slate-950 block font-sans font-black">
                          {selectedOrder.buyerName}
                        </strong>
                        <span className="text-xs font-bold block font-sans">{selectedOrder.businessName}</span>
                        <span className="text-xs block font-sans">
                          {selectedOrder.city}, {selectedOrder.state}
                        </span>
                      </div>
                      <div className="text-[11px] flex justify-between">
                        <span>Cases: <strong>{selectedOrder.cases}</strong></span>
                        <span>Weight Est: <strong>{Math.round(selectedOrder.cases * 6.2)} KG</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-600 pt-1">
                        Order Ref: {selectedOrder.id} · Vehicle: {selectedOrder.vehicleNo}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: REQUISITION */}
                  {activeDocTab === 'requisition' && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 text-slate-200 space-y-3 text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                        WORK REQUISITION · {selectedOrder.requisitionId}
                      </span>
                      <h4 className="text-base font-bold text-white">{selectedOrder.product}</h4>
                      <p className="text-slate-300">
                        Allocated {selectedOrder.cases} Cases ({selectedOrder.totalCans} Aluminum Cans) from Guntur / Vizag stock by Rajesh Varma &amp; Priya Sharma.
                      </p>
                    </div>
                  )}

                  {/* TAB 5: WAYBILL */}
                  {activeDocTab === 'shipment' && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/40 text-slate-200 space-y-3 text-xs">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                        CONSIGNMENT WAYBILL · {selectedOrder.waybillId}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        Carrier Vehicle {selectedOrder.vehicleNo} -&gt; {selectedOrder.city}, {selectedOrder.state}
                      </h4>
                      <p className="text-slate-300">
                        Managed by Capt. Vikram Naidu · Cold-Chain target 2°C–4°C.
                      </p>
                    </div>
                  )}

                  {/* TAB 6: 11-AGENT EXECUTION TRACE */}
                  {activeDocTab === 'trace' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2 text-xs font-mono max-h-96 overflow-y-auto">
                      {latestTrace.length === 0 ? (
                        <p className="text-slate-400">Run an order pipeline to inspect the 11-step agent trace.</p>
                      ) : (
                        latestTrace.map((st) => (
                          <div
                            key={`${st.step}-${st.agentId}`}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                          >
                            <div>
                              <strong className="text-cyan-300 block">
                                Step {st.step}: {st.agentName} ({st.department})
                              </strong>
                              <span className="text-slate-300 text-[11px] font-sans">{st.action}</span>
                            </div>
                            <span className="text-emerald-400 shrink-0 tabular-nums">
                              {st.durationMs}ms
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Persisted Orders Selector */}
              {orders.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">
                    Recent Persisted Orders ({orders.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {orders.slice(0, 6).map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                          selectedOrder?.id === ord.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {ord.id} · {ord.cases}cs · ₹{ord.grandTotal.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3.5: ENTERPRISE ERP SYNC & LEDGER STATUS               */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold mb-1">
                <span>
                  {oracleConfigured
                    ? 'ORACLE OIC WEBHOOK CONNECTED'
                    : 'PERSISTENT SERVER LEDGER + OPTIONAL ORACLE OIC WEBHOOK'}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Enterprise Ledger &amp; Webhook Synchronization
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {oracleConfigured
                  ? 'Dispatches verified orders and GST invoices directly to the configured ORACLE_OIC_WEBHOOK_URL.'
                  : 'Persists all order transactions, SKU stock deductions, and SHA-256 IRN signatures into durable server JSON storage. Set ORACLE_OIC_WEBHOOK_URL to stream externally.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleManualCloudSync()}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Sync Ledger Trace Now
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="text-slate-400">
              Status: <strong className="text-emerald-300">{cloudSyncStatus.status}</strong> · Trace:{' '}
              <strong className="text-cyan-300">{cloudSyncStatus.traceId}</strong> · Latency:{' '}
              <strong className="text-white tabular-nums">{cloudSyncStatus.latencyMs}ms</strong>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminConsole(!showAdminConsole)}
              className="text-[11px] font-mono text-slate-300 hover:text-white py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800"
            >
              {showAdminConsole ? 'Hide Schema & Details' : 'View Oracle Schema & Config'}
            </button>
          </div>

          {showAdminConsole && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-slate-300">{cloudSyncStatus.details}</span>
                <a
                  href="/oracle_schema.sql"
                  download="oracle_schema.sql"
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  Download oracle_schema.sql
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: INTERACTIVE AI BRAIN CHAT CONSOLE (GEMINI 4)        */}
      {/* ============================================================== */}
      <section ref={chatSectionRef} id="brain-chat" className="space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-2xl bg-cyan-950 border border-cyan-500/50">
                🧠
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Consult Any of the 11 AI Employees
                </h3>
                <p className="text-xs text-slate-400">
                  Powered by Gemini 4 Hydrogen ({geminiConfigured ? 'Live API Key Active' : 'Requires GEMINI_API_KEY for generative inference — still reports real backend metrics'}).
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
                {AI_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.avatar} {emp.name} ({emp.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                    {msg.sender}
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
                <span>Consulting Gemini 4 Hydrogen with live server context...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              ref={chatInputRef}
              id="brain-chat-input"
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="Ask about dealer orders, live USD/INR FX rates, SKU inventory, or GST breakdown..."
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
