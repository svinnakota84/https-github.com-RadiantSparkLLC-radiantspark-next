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
}

export interface SparkDrinkOrder {
  id: string;
  date: string;
  customerType: 'dealer' | 'consumer';
  buyerName: string;
  businessName: string;
  gstin?: string;
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
  grandTotal: number;
  status: 'received' | 'requisitioned' | 'invoiced' | 'dispatched' | 'delivered';
  requisitionId?: string;
  invoiceId?: string;
  waybillId?: string;
  vehicleNo?: string;
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
  category: 'energy' | 'electronics' | 'beverages' | 'food' | 'logistics';
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  merchant: string;
  merchantVerified: boolean;
  score: number;
  upvoted?: boolean;
  couponCode?: string;
  affiliateUrl: string;
  amazonUsaUrl?: string;
  amazonIndiaUrl?: string;
  walmartUrl?: string;
  flipkartUrl?: string;
  primaryStore?: 'Amazon USA' | 'Amazon India' | 'Walmart' | 'Flipkart' | 'Sparkle Direct' | 'Tata Neu';
  imageUrl: string;
  description: string;
  badges: string[];
  expiresInHours: number;
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
