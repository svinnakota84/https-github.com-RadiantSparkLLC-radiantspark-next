/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CountryView = 'global' | 'india' | 'usa' | 'sparkdeals' | 'brain' | 'lifestyle';

export interface AiEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: 'active' | 'processing' | 'standby';
  systemPrompt: string;
  currentTask: string;
  tasksCompleted: number;
  accuracy: string;
  skills: string[];
  connectedUpstream?: string[];
  connectedDownstream?: string[];
  handshakeProtocol?: string;
  businessValue?: string;
  runsCount?: number;
  lastAction?: string | null;
  lastDurationMs?: number;
}

export interface SparkDrinkOrder {
  id: string;
  date: string;
  customerType: 'dealer' | 'consumer';
  buyerName: string;
  businessName: string;
  gstin?: string;
  gstinValid?: boolean;
  isIntraState?: boolean;
  city: string;
  state: string;
  product: string;
  unitPrice: number;
  cases: number;
  totalCans: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstRate: number; // 28%
  gstAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  grandTotal: number;
  grandTotalUsd?: number;
  fxRateInrPerUsd?: number;
  status: 'received' | 'requisitioned' | 'invoiced' | 'dispatched' | 'delivered';
  requisitionId?: string;
  invoiceId?: string;
  irnHash?: string;
  waybillId?: string;
  vehicleNo?: string;
  traceId?: string;
  syncStatus?: string;
  durationMs?: number;
  agentTrace?: Array<{
    step: number;
    agentId: string;
    name?: string;
    agentName?: string;
    role?: string;
    department?: string;
    action: string;
    durationMs?: number;
    status: string;
  }>;
}

export interface RequisitionSlip {
  id: string;
  orderId: string;
  generatedBy: string;
  date: string;
  division: string;
  warehouse: string;
  rawMaterialsAllocated: {
    item: string;
    quantity: string;
    batchNo: string;
  }[];
  fssaiLicense: string;
  status: 'allocated' | 'staged_for_dispatch';
}

export interface TaxInvoice {
  id: string;
  orderId: string;
  generatedBy: string;
  invoiceDate: string;
  dueDate: string;
  sellerEntity: string;
  sellerGSTIN: string;
  sellerAddress: string;
  buyerName: string;
  buyerGSTIN?: string;
  hsnCode: string;
  itemDescription: string;
  cases: number;
  ratePerCase: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalInvoiceValue: number;
  paymentTerms: string;
  qrCodeSignature: string;
}

export interface ShipmentDispatch {
  waybillNo: string;
  orderId: string;
  invoiceId: string;
  managedBy: string;
  dispatchDate: string;
  estimatedDelivery: string;
  originHub: string;
  destinationCity: string;
  carrierFleet: string;
  vehicleNumber: string;
  driverName: string;
  temperatureReading: string;
  transitStatus: 'Dispatched - En Route' | 'Out for Delivery' | 'Delivered';
  gpsCoordinates: string;
}

export interface DealItem {
  id: string;
  title: string;
  category:
    | 'energy'
    | 'electronics'
    | 'beverages'
    | 'food'
    | 'logistics'
    | 'home'
    | 'apparel'
    | 'gaming'
    | 'lifestyle';
  currentPrice: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  currency?: 'USD' | 'INR';
  merchant: string;
  merchantVerified: boolean;
  score: number;
  upvoted?: boolean;
  couponCode?: string | null;
  affiliateUrl: string;
  directMerchantUrl?: string | null;
  monetizationStatus?: 'affiliate_tagged' | 'direct_merchant_untagged' | 'aggregator_source_only';
  affiliateNetwork?: string | null;
  amazonUsaUrl?: string;
  amazonIndiaUrl?: string;
  walmartUrl?: string;
  flipkartUrl?: string;
  primaryStore?:
    | 'Amazon USA'
    | 'Amazon India'
    | 'Walmart'
    | 'Flipkart'
    | 'Sparkle Direct'
    | 'Tata Neu'
    | string;
  imageUrl: string;
  description: string;
  badges: string[];
  expiresInHours?: number | null;
  expiresAt?: string | null;
  publishedAt?: string;
  availability?: string;
  sourceFeed?: string;
  isBlackFriday?: boolean;
  lastChecked?: string;
  specifications: string[];
  highlight: string;
}

export interface DivisionInfo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  features: string[];
  image: string;
  linkText: string;
}

export interface ServicePractice {
  number: string;
  badge: string;
  title: string;
  description: string;
  technologies: string[];
}

export interface LegalShieldSection {
  id: string;
  title: string;
  icon: string;
  shortSummary: string;
  statuteReference: string;
  fullClause: string;
  complianceKeyPoints: string[];
}

export interface SyncWorkflowJob {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'scheduled';
  schedule: string;
  lastRun: string;
  itemsProcessed: number;
  successRate: string;
  description: string;
}
