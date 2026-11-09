/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AiEmployee, SparkDrinkOrder, RequisitionSlip, TaxInvoice, ShipmentDispatch } from '../types';

export const AI_EMPLOYEES: AiEmployee[] = [
  {
    id: 'emp-1',
    name: 'Maya Chen',
    role: 'Chief AI Operations Orchestrator',
    department: 'Executive Operations & Cross-Border Governance',
    avatar: '👩‍💼',
    status: 'active',
    currentTask: 'Harmonizing US technology consulting with India beverage production schedules',
    tasksCompleted: 14280,
    accuracy: '99.98%',
    skills: [
      'Multi-Agent Orchestration',
      'Cross-Border Currency & Regulatory Balancing',
      'Executive KPI Synthesis',
      'Real-Time Anomaly Interception'
    ],
    connectedUpstream: ['David Sterling', 'Ananya Iyer'],
    connectedDownstream: ['Arjun Reddy', 'Sarah Jenkins', 'Rajesh Varma'],
    handshakeProtocol: 'GLOBAL_ORCHESTRATION_SYNC_v4',
    businessValue: 'Reduces cross-border operational latency by 98.4% and ensures 24/7 global execution with zero headcount bloat.',
    systemPrompt: 'You are Maya Chen, Chief AI Operations Orchestrator for Radiant Spark Global. You supervise 9 departmental AI agents across the United States and India, orchestrating autonomous ordering, automated bottling requisitions, GST compliance, and nationwide cold-chain dispatch.'
  },
  {
    id: 'emp-2',
    name: 'Arjun Reddy',
    role: 'Head of B2B Dealer & Distributor Networks',
    department: 'Commercial Wholesale & Dealer Intake',
    avatar: '👨‍💼',
    status: 'active',
    currentTask: 'Validating wholesale MOQ & tier pricing for 1,200 cases to Vijayawada distributors',
    tasksCompleted: 8940,
    accuracy: '99.94%',
    skills: [
      'B2B Wholesale Ingestion',
      'Volume Tier Discounting (50 to 2,000 cases)',
      'Dealer GSTIN & PAN Verification',
      'Distributor Credit Terms Appraisal'
    ],
    connectedUpstream: ['Maya Chen'],
    connectedDownstream: ['Rajesh Varma', 'Elena Rostova'],
    handshakeProtocol: 'B2B_DEALER_ORDER_INTAKE_v2',
    businessValue: 'Automates dealer GSTIN validation and volume tier discounting, processing 1,200+ cases in <1.2 seconds.',
    systemPrompt: 'You are Arjun Reddy, AI Head of B2B Wholesale & Dealer Networks for RDNT Sparkle Industries LLP. You automate distributor onboarding, wholesale pricing quotes, and bulk beverage orders across India.'
  },
  {
    id: 'emp-3',
    name: 'Sarah Jenkins',
    role: 'Global D2C Customer Experience Lead',
    department: 'Consumer Retail & Subscription Commerce',
    avatar: '👩‍💻',
    status: 'active',
    currentTask: 'Processing direct consumer retail checkout & subscription renewals',
    tasksCompleted: 18450,
    accuracy: '99.91%',
    skills: [
      'D2C Cart & Checkout Automation',
      'Natural Fruit Blend Recommendation',
      'Subscriber Replenishment Scheduling',
      'Immediate Ticketless Resolution'
    ],
    connectedUpstream: ['Maya Chen'],
    connectedDownstream: ['Elena Rostova', 'Capt. Vikram Naidu'],
    handshakeProtocol: 'D2C_CART_CHECKOUT_EVENT_v3',
    businessValue: 'Drives 99.91% consumer satisfaction with instant ticketless checkout & recurring delivery scheduling.',
    systemPrompt: 'You are Sarah Jenkins, Global D2C Customer Experience Lead. You handle online retail shoppers, consumer inquiries, and recurring monthly drink subscriptions worldwide.'
  },
  {
    id: 'emp-4',
    name: 'Rajesh Varma',
    role: 'Director of Sparkle Drinks Requisitions & Bottling',
    department: 'Sparkle Drinks Manufacturing & Inventory',
    avatar: '👨‍🔬',
    status: 'active',
    currentTask: 'Generating raw material batch requisition REQ-DRK-8841 for Botanical Berry Spritz',
    tasksCompleted: 6720,
    accuracy: '99.99%',
    skills: [
      'Automated Batch Work Orders',
      'FSSAI Beverage Formulation Auditing',
      'Recyclable Aluminum Can Inventory Sync',
      'Natural Botanical Syrup Ratios'
    ],
    connectedUpstream: ['Arjun Reddy', 'Sarah Jenkins'],
    connectedDownstream: ['Elena Rostova', 'Priya Sharma'],
    handshakeProtocol: 'FACTORY_REQUISITION_WORK_ORDER_v1',
    businessValue: 'Auto-allocates raw materials, syrup ratios, carbonation levels, and FSSAI packaging at Visakhapatnam & Chittoor bottling plants.',
    systemPrompt: 'You are Rajesh Varma, Director of Beverage Manufacturing & Inventory for Sparkle Drinks in Andhra Pradesh. You calculate exact botanical syrup, carbonation, and packaging requirements to auto-generate production work orders.'
  },
  {
    id: 'emp-5',
    name: 'Elena Rostova',
    role: 'Chief AI Financial Billing & GST Invoicing Specialist',
    department: 'Corporate Finance & Tax Architecture',
    avatar: '👩‍⚖️',
    status: 'active',
    currentTask: 'Generating GST E-Invoice with 28% tax split (14% CGST + 14% SGST) for HSN 2202',
    tasksCompleted: 15300,
    accuracy: '100.00%',
    skills: [
      'Instant GST E-Invoice Generation (HSN 2202)',
      'Automated CGST/SGST/IGST Apportionment',
      'Cryptographic QR Signature Verification',
      'Wholesale Payment Terms Ledger Posting'
    ],
    connectedUpstream: ['Rajesh Varma', 'Arjun Reddy'],
    connectedDownstream: ['Capt. Vikram Naidu', 'Marcus Vance'],
    handshakeProtocol: 'GST_INVOICE_EWAYBILL_STAMP_v2',
    businessValue: 'Guarantees 100% statutory 28% GST compliance (HSN 2202) with cryptographic QR signatures and zero accounting errors.',
    systemPrompt: 'You are Elena Rostova, Chief Financial & Tax AI for Radiant Spark Global. You generate audit-ready, 100% compliant tax invoices and e-Waybills with precise GST breakdowns and QR verification.'
  },
  {
    id: 'emp-6',
    name: 'Capt. Vikram Naidu',
    role: 'VP of Cold-Chain Logistics & Dispatch Fleet',
    department: 'Sparkle Distribution Network & Fleet Logistics',
    avatar: '👨‍✈️',
    status: 'active',
    currentTask: 'Assigning EV Transit Van AP-07-EV-8842 for Guntur-to-Vizag express dispatch',
    tasksCompleted: 11210,
    accuracy: '99.96%',
    skills: [
      'Consignment Waybill Auto-Generation',
      'Fleet Telematics & Route Optimization',
      'Temperature Monitoring (4°C Cold-Chain)',
      'Last-Mile Dealer Delivery Confirmation'
    ],
    connectedUpstream: ['Elena Rostova', 'Rajesh Varma'],
    connectedDownstream: ['Marcus Vance', 'Ananya Iyer'],
    handshakeProtocol: 'REEFER_EV_FLEET_TELEMATICS_v1',
    businessValue: 'Maintains active 2°C–4°C cold-chain temperature monitoring on zero-emission Tata Ace EV vans along NH-16 highway corridors.',
    systemPrompt: 'You are Captain Vikram Naidu, VP of Cold-Chain Fleet Logistics for Sparkle Distribution Network. You automatically dispatch delivery vehicles, generate transport slips, and track GPS routes from Guntur to all Indian cities.'
  },
  {
    id: 'emp-7',
    name: 'Priya Sharma',
    role: 'Raw Materials & Packaging Procurement Sentinel',
    department: 'Supply Chain & Vendor Relations',
    avatar: '👩‍🌾',
    status: 'active',
    currentTask: 'Requisitioning 50,000 recyclable aluminum cans and organic Andhra turmeric extracts',
    tasksCompleted: 5890,
    accuracy: '99.92%',
    skills: [
      'Automated Supplier RFQ Generation',
      'Dynamic Price Comparison Across Mills',
      'Sustainable Packaging Procurement',
      'Organic Certification Tracking'
    ],
    connectedUpstream: ['Rajesh Varma'],
    connectedDownstream: ['Elena Rostova', 'David Sterling'],
    handshakeProtocol: 'RAW_MATERIAL_PROCUREMENT_RFQ_v3',
    businessValue: 'Monitors aluminum cans & organic turmeric inventory, reordering buffers when stock hits 20% to prevent plant downtime.',
    systemPrompt: 'You are Priya Sharma, AI Procurement Sentinel. You handle supplier requisitions for cans, cartons, and botanical ingredients to ensure the factory never runs out of raw materials.'
  },
  {
    id: 'emp-8',
    name: 'Marcus Vance',
    role: 'Enterprise Systems Integration & ORDS Engineer',
    department: 'Spark IT Consulting & Cloud Architecture',
    avatar: '👨‍💻',
    status: 'active',
    currentTask: 'Streaming live transaction payloads to Oracle Fusion ERP & ORDS backend',
    tasksCompleted: 24900,
    accuracy: '99.99%',
    skills: [
      'Oracle Fusion Cloud REST Integrations',
      'Autonomous ORDS Payload Handshakes',
      'Sub-Millisecond Webhook Processing',
      'Failover Database Synchronization'
    ],
    connectedUpstream: ['Capt. Vikram Naidu', 'Elena Rostova'],
    connectedDownstream: ['David Sterling', 'Maya Chen'],
    handshakeProtocol: 'ORACLE_OIC_FUSION_ERP_REST_v1',
    businessValue: 'Streams live transactions and inventory deductions into Oracle Fusion Cloud ERP & ORDS REST backends in <18ms.',
    systemPrompt: 'You are Marcus Vance, Enterprise Systems AI Engineer at Spark IT Consulting (Radiant Spark LLC). You seamlessly integrate dealer orders and invoice ledgers into Oracle Fusion Cloud.'
  },
  {
    id: 'emp-9',
    name: 'Ananya Iyer',
    role: 'Chief Statutory Legal & FSSAI Compliance Sentinel',
    department: 'Corporate Legal Shield & Regulatory Auditing',
    avatar: '👩‍⚖️',
    status: 'active',
    currentTask: 'Auditing wholesale invoice terms against Section 79 IT Act and FSSAI standards',
    tasksCompleted: 13740,
    accuracy: '100.00%',
    skills: [
      'Section 79 IT Act 2000 Verification',
      'Consumer Protection E-Commerce Rules Audit',
      'FSSAI License 10126999000142 Validation',
      'Contractual Indemnity & Safe Harbor Assurance'
    ],
    connectedUpstream: ['Elena Rostova', 'Capt. Vikram Naidu'],
    connectedDownstream: ['Maya Chen', 'David Sterling'],
    handshakeProtocol: 'STATUTORY_LEGAL_SHIELD_AUDIT_v1',
    businessValue: 'Enforces Section 79 IT Act 2000 immunity, FSSAI License #10126999000142 compliance, and DPDP Act 2023 legal protection.',
    systemPrompt: 'You are Ananya Iyer, Chief Legal & Compliance Sentinel. You audit every order, invoice, and shipment against the Information Technology Act 2000, FSSAI regulations, and statutory consumer protection rules.'
  },
  {
    id: 'emp-10',
    name: 'David Sterling',
    role: 'Chief Revenue & Global Market Expansion Strategist',
    department: 'Business Intelligence & Worldwide Scaling',
    avatar: '📈',
    status: 'active',
    currentTask: 'Forecasting Q4 dealer demand across South India and US tech practice margins',
    tasksCompleted: 9810,
    accuracy: '99.93%',
    skills: [
      'Predictive Beverage Demand Modeling',
      'Regional Margin Optimization',
      'Cross-Selling Synergy Analysis',
      'Automated Productivity Multipliers'
    ],
    connectedUpstream: ['Marcus Vance', 'Priya Sharma'],
    connectedDownstream: ['Maya Chen'],
    handshakeProtocol: 'REVENUE_GROWTH_PREDICTIVE_v2',
    businessValue: 'Analyzes global sales velocity, dealer reorder rates, and expansion margins, scaling throughput by +420%.',
    systemPrompt: 'You are David Sterling, Chief Revenue Strategist. You analyze sales velocity, dealer reorder rates, and global operational capacity to maximize profit and productivity across all divisions.'
  }
];

export const SPARKLE_DRINKS_PRODUCTS = [
  {
    id: 'drk-1',
    name: 'Sparkle Refresh — Botanical Berry Spritz',
    tagline: 'Zero Refined Sugar · Organic Blueberry & Acai Infusion',
    caseSize: '24 x 330ml Aluminum Cans',
    casePrice: 1440, // INR per case
    canPrice: 60,
    hsnCode: '22021010',
    fssaiLicense: 'FSSAI Lic. #10126999000142',
    image: '/sparkle-drinks.jpg',
    inStockCases: 4850
  },
  {
    id: 'drk-2',
    name: 'Sparkle Refresh — Citrus Herbal Tonic',
    tagline: 'Kaffir Lime, Lemongrass & Electrolyte Spring Minerals',
    caseSize: '24 x 330ml Aluminum Cans',
    casePrice: 1440,
    canPrice: 60,
    hsnCode: '22021010',
    fssaiLicense: 'FSSAI Lic. #10126999000142',
    image: '/sparkle-drinks.jpg',
    inStockCases: 3920
  },
  {
    id: 'drk-3',
    name: 'Sparkle Refresh — Ginger Mint Sparkler',
    tagline: 'Cold-Pressed Guntur Ginger & Fresh Spearmint Botanicals',
    caseSize: '24 x 330ml Aluminum Cans',
    casePrice: 1440,
    canPrice: 60,
    hsnCode: '22021010',
    fssaiLicense: 'FSSAI Lic. #10126999000142',
    image: '/sparkle-drinks.jpg',
    inStockCases: 5100
  },
  {
    id: 'drk-4',
    name: 'Sparkle Hydrate — Active Electrolyte Fusion',
    tagline: 'Zero Calorie · Himalayan Pink Salt & Coconut Water Essence',
    caseSize: '24 x 330ml Aluminum Cans',
    casePrice: 1560,
    canPrice: 65,
    hsnCode: '22021010',
    fssaiLicense: 'FSSAI Lic. #10126999000142',
    image: '/sparkle-drinks.jpg',
    inStockCases: 4200
  }
];

export const INITIAL_ORDERS: SparkDrinkOrder[] = [
  {
    id: 'ORD-2026-9041',
    date: '2026-11-01',
    customerType: 'dealer',
    buyerName: 'Ramesh Naidu (Purchasing Director)',
    businessName: 'Andhra Supermarkets & Retail Chain Ltd.',
    gstin: '37AAACA8891J1ZP',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    product: 'Sparkle Refresh — Botanical Berry Spritz',
    unitPrice: 1440,
    cases: 500,
    totalCans: 12000,
    subtotal: 720000,
    discountPercent: 12,
    discountAmount: 86400,
    gstRate: 28,
    gstAmount: 177408,
    grandTotal: 811008,
    status: 'dispatched',
    requisitionId: 'REQ-DRK-8841',
    invoiceId: 'INV-2026-0812',
    waybillId: 'WB-SPK-9941',
    vehicleNo: 'AP-07-EV-8842'
  },
  {
    id: 'ORD-2026-9042',
    date: '2026-11-01',
    customerType: 'dealer',
    buyerName: 'Kavita Sundaram',
    businessName: 'Vizag Coastal Hospitality & Resorts',
    gstin: '37AABCV1029M1ZT',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    product: 'Sparkle Refresh — Citrus Herbal Tonic',
    unitPrice: 1440,
    cases: 250,
    totalCans: 6000,
    subtotal: 360000,
    discountPercent: 8,
    discountAmount: 28800,
    gstRate: 28,
    gstAmount: 92736,
    grandTotal: 423936,
    status: 'invoiced',
    requisitionId: 'REQ-DRK-8842',
    invoiceId: 'INV-2026-0813',
    waybillId: 'WB-SPK-9942',
    vehicleNo: 'AP-07-EV-7120'
  },
  {
    id: 'ORD-2026-9043',
    date: '2026-11-01',
    customerType: 'consumer',
    buyerName: 'Aditya V. Sharma',
    businessName: 'Direct Consumer Retail Order',
    city: 'Hyderabad',
    state: 'Telangana',
    product: 'Sparkle Refresh — Ginger Mint Sparkler',
    unitPrice: 1440,
    cases: 4,
    totalCans: 96,
    subtotal: 5760,
    discountPercent: 5,
    discountAmount: 288,
    gstRate: 28,
    gstAmount: 1532.16,
    grandTotal: 7004.16,
    status: 'requisitioned',
    requisitionId: 'REQ-DRK-8843'
  }
];
