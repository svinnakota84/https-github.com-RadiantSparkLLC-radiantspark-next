/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LegalShieldSection } from '../types';

export const INDIA_LEGAL_SHIELD_SECTIONS: LegalShieldSection[] = [
  {
    id: 'intermediary-safe-harbour',
    title: 'Intermediary Status & Section 79 Safe Harbour Framework',
    icon: 'ShieldCheck',
    shortSummary: 'Statutory Intermediary safe harbour under Section 79 of the Information Technology Act, 2000.',
    statuteReference: 'Section 79, Information Technology Act, 2000 & IT Intermediary Rules, 2021',
    fullClause: `RDNT Sparkle Industries LLP operates solely as an 'Intermediary' as defined under Section 2(1)(w) of the Information Technology Act, 2000. In accordance with Section 79 of the IT Act, RDNT Sparkle Industries LLP shall observe reasonable statutory due diligence and maintain intermediary safe harbour protections regarding third-party information, product listings, or communication links made available or hosted on SparkDeals Hub or Radiant Spark Global platforms.

Safe Harbour Conditions Fulfilled:
1. RDNT Sparkle Industries LLP does not initiate the transmission of third-party deals or products;
2. RDNT Sparkle Industries LLP does not select the receiver of the transmission;
3. RDNT Sparkle Industries LLP does not modify the underlying information in the transmission, acting as an informational curation portal;
4. RDNT Sparkle Industries LLP observes due diligence as mandated under Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.

Disclaimer & Risk Allocation:
Nothing herein shall be construed as a promise of total immunity or absolute exemption from applicable statutory laws. Each party remains liable for its own statutory non-compliance, willful misconduct, or gross negligence.`,
    complianceKeyPoints: [
      'Statutory due diligence under IT Intermediary Guidelines Rules 2021',
      'No direct possession, warehousing, or direct retail invoicing of third-party merchant inventory',
      'Automated syndication links redirect consumers directly to registered third-party vendor platforms',
      'Prompt compliance with verified statutory takedown notices under Rule 3(1)(d)'
    ]
  },
  {
    id: 'consumer-protection-act',
    title: 'Consumer Protection Act (E-Commerce Rules 2020) Framework',
    icon: 'Scale',
    shortSummary: 'Alignment with Consumer Protection (E-Commerce) Rules, 2020 and Consumer Protection Act 2019.',
    statuteReference: 'Consumer Protection Act, 2019 & Consumer Protection (E-Commerce) Rules, 2020',
    fullClause: `In compliance with the Consumer Protection (E-Commerce) Rules, 2020 framed under the Consumer Protection Act, 2019:

1. Platform Characterization: SparkDeals Hub is an informational directory and affiliate referral portal. It does not engage in the inventory-based model of e-commerce.
2. Direct Contract of Sale: Every contract for the sale of goods or services discovered on SparkDeals Hub is entered into strictly between the consumer and the respective third-party merchant (such as Amazon India, Flipkart, Walmart, or direct manufacturers). RDNT Sparkle Industries LLP is not a party to such merchant transactions.
3. Pricing & Warranties: Third-party merchants are exclusively responsible for accurate pricing, merchantability, warranties, after-sales service, and order fulfillment. Prices displayed on SparkDeals Hub are indicative and refreshed periodically via official feeds; source merchant prices govern checkout.
4. Unfair Trade Practice Bar: RDNT Sparkle Industries LLP does not manipulate search results or artificially inflate deal ratings.`,
    complianceKeyPoints: [
      'Express disclaimer that contracts of sale are strictly bilateral with third-party merchants',
      'Clear merchant identity transparency prior to external checkout redirect',
      'Periodic deal refresh with last-checked timestamps',
      'Structured refund and return recourse directly through verified merchant platforms'
    ]
  },
  {
    id: 'affiliate-disclosure-asci',
    title: 'Commercial Affiliate Disclosure & ASCI Guidelines Compliance',
    icon: 'FileBadge',
    shortSummary: 'Transparency under ASCI Digital Media Guidelines and FTC 16 CFR § 255.5.',
    statuteReference: 'ASCI Guidelines for Influencer & Affiliate Advertising (2021) & FTC Disclosures',
    fullClause: `SparkDeals Hub operates on an affiliate marketing model. In adherence to the Advertising Standards Council of India (ASCI) Code and international digital trade transparency standards:

1. Material Connection Disclosure: RDNT Sparkle Industries LLP maintains commercial affiliate agreements with e-commerce platforms, including Amazon India (Amazon Associates Program), Walmart, and direct partner merchants.
2. Commission Mechanism: When users click on outbound deal links and complete qualifying purchases, RDNT Sparkle Industries LLP may receive a variable affiliate referral commission from the seller.
3. No Surcharge to Consumer: The affiliate commission is paid entirely by the merchant out of their customer acquisition budget; at no point does using our links increase the price paid by the user.
4. Editorial Curation: Curation teams review deals based on price drops, availability, and merchant quality. Merchant commission rates do not guarantee front-page placement.`,
    complianceKeyPoints: [
      'Prominent affiliate and sponsored content tagging on commercial redirects',
      'Transparent disclosure that commissions carry zero surcharge for buyers',
      'Editorial curation independent of commercial affiliate commission rates',
      'Adherence to Section 4 of ASCI Code for Self-Regulation in Advertising'
    ]
  },
  {
    id: 'grievance-redressal-desk',
    title: 'Statutory Grievance Redressal Mechanism & Officer Details',
    icon: 'AlertCircle',
    shortSummary: 'Grievance Officer contact details under IT Rules 2021 with 24-hr acknowledgment.',
    statuteReference: 'Rule 3(2) of Information Technology (Intermediary Guidelines) Rules, 2021',
    fullClause: `Pursuant to Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, RDNT Sparkle Industries LLP has designated a Grievance Officer in India to receive user concerns and takedown notices:

Grievance Redressal Contact Details:
- Designated Grievance Officer: Legal Compliance & Consumer Affairs Secretariat
- Entity: RDNT Sparkle Industries LLP
- Registered Address: D.No. 4-12-88, Main Commercial Arterial Road, Guntur, Andhra Pradesh, PIN: 522002, India
- Dedicated Compliance Email: grievance@radiantsparkllc.com / legal@radiantsparkllc.com
- Working Hours: Monday to Friday, 09:30 IST to 18:00 IST (excluding statutory public holidays)

Statutory Timelines:
- Written Acknowledgment: Within 24 (twenty-four) hours of receipt with unique reference ID.
- Resolution & Redressal: Disposal within 15 (fifteen) days from receipt date.`,
    complianceKeyPoints: [
      'Grievance Officer designated in Andhra Pradesh, India',
      'Guaranteed 24-hour written acknowledgment of received legal inquiries',
      'Formal 15-day maximum dispute investigation window',
      'Regular compliance auditing and record logging'
    ]
  }
];

export const USA_LEGAL_SHIELD_SECTIONS: LegalShieldSection[] = [
  {
    id: 'section-230-cda',
    title: 'Section 230 Communications Decency Act Safe Harbor',
    icon: 'ShieldCheck',
    shortSummary: 'Protection under 47 U.S.C. § 230 for third-party curated content.',
    statuteReference: '47 U.S.C. § 230(c)(1) - Communications Decency Act',
    fullClause: `Radiant Spark LLC (Georgia, USA) operates digital platforms subject to 47 U.S.C. § 230. Radiant Spark LLC shall not be treated as the publisher or speaker of any information provided by third-party deal feeds, merchant syndicators, or external content creators.

Disclaimer of Warranties & Limitation of Liability:
EXCEPT AS EXPRESSLY SET FORTH IN A DULY EXECUTED WRITTEN STATEMENT OF WORK (SOW), ALL PLATFORM SERVICES, INFORMATIONAL FEEDS, AND DEMONSTRATION WORKFLOWS ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RADIANT SPARK LLC DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL RADIANT SPARK LLC'S AGGREGATE LIABILITY EXCEED THE TOTAL FEES PAID BY CLIENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`,
    complianceKeyPoints: [
      'Section 230 safe harbor classification for syndicated merchant content',
      'Mutual limitation of liability capped at fees paid in preceding 12 months',
      'Standard AS-IS platform disclaimers for unauthenticated public browsing',
      'Enforceable governing law and jurisdiction in Fulton County, Georgia, USA'
    ]
  }
];

export const DRAFT_AGREEMENTS_FOR_REVIEW = [
  {
    id: 'draft-master-consulting-sow',
    title: 'Draft Master Consulting Statement of Work (SOW)',
    jurisdiction: 'United States (Radiant Spark LLC, Georgia)',
    notice: '⚠️ DRAFT AGREEMENT FOR INDEPENDENT LEGAL COUNSEL REVIEW. NOT A BINDING CONTRACT UNTIL DULY EXECUTED BY AUTHORIZED CORPORATE OFFICERS.',
    summary: 'Balanced Master Services Agreement for Oracle Fusion Cloud, OIC Integration, and AI Architecture Consulting Services.',
    content: `DRAFT MASTER CONSULTING SERVICES AGREEMENT & STATEMENT OF WORK (SOW)

This Master Consulting Services Agreement ("Agreement") is entered into as of [Date] ("Effective Date"), by and between Radiant Spark LLC, a Georgia limited liability company with principal offices in Atlanta, GA ("Consultant"), and [Client Company Name], a [State/Country] corporation ("Client").

1. SERVICES & DELIVERABLES
Consultant shall perform Cloud Advisory, Oracle Fusion ERP, Oracle Integration Cloud (OIC), and Enterprise AI Consulting Services as specified in mutually executed Statements of Work ("SOW").

2. COMPENSATION & PAYMENT TERMS
Client shall compensate Consultant in accordance with the fee schedule in the applicable SOW. Invoices are payable Net 30 days from invoice date. Overdue balances shall accrue interest at 1.5% per month or the maximum statutory rate.

3. INTELLECTUAL PROPERTY RIGHTS
(a) Pre-Existing IP: Each party retains all rights in its pre-existing intellectual property, tools, methodologies, and source frameworks.
(b) Client Deliverables: Upon full payment of all applicable fees, Client shall own the custom work product developed specifically for Client under an active SOW, excluding Consultant's pre-existing software, generic code libraries, and AI agent frameworks.

4. CONFIDENTIALITY
Each party agrees to protect the other party's Confidential Information with reasonable care and shall not disclose such information to third parties except to employees, advisors, or subcontractors who require access and are bound by confidentiality obligations.

5. WARRANTIES & REALISTIC RISK ALLOCATION
(a) Performance Standard: Consultant warrants that Services will be performed in a professional and workmanlike manner in accordance with industry standards.
(b) Disclaimer: EXCEPT AS EXPRESSLY PROVIDED HEREIN, CONSULTANT DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR SYSTEM UP-TIME. CONSULTANT DOES NOT GUARANTEE THAT SOFTWARE WILL BE 100% ERROR-FREE OR UNINTERRUPTED.

6. LIMITATION OF LIABILITY & INDEMNIFICATION
(a) Liability Cap: TO THE FULLEST EXTENT PERMITTED BY LAW, NEITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL EXCEED THE TOTAL FEES PAID OR PAYABLE BY CLIENT TO CONSULTANT UNDER THE APPLICABLE SOW IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
(b) Consequential Damages Waiver: NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS.
(c) Mutual Indemnification: Each party agrees to defend and indemnify the other party against third-party claims arising from gross negligence, willful misconduct, or breach of confidentiality.

7. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of the State of Georgia, USA, without regard to conflict of law principles. Any dispute shall be resolved in the state or federal courts located in Fulton County, Georgia.

[DRAFT ONLY - SUBJECT TO REVIEW AND FINAL REVISION BY LEGAL COUNSEL]`
  },
  {
    id: 'draft-vendor-terms-of-supply',
    title: 'Draft Vendor Terms of Supply Agreement',
    jurisdiction: 'Republic of India (RDNT Sparkle Industries LLP, Andhra Pradesh)',
    notice: '⚠️ DRAFT AGREEMENT FOR INDEPENDENT LEGAL COUNSEL REVIEW. NOT A BINDING CONTRACT UNTIL DULY EXECUTED BY AUTHORIZED CORPORATE OFFICERS.',
    summary: 'Balanced Vendor Supply Agreement for clean energy equipment, beverage ingredients, packaging materials, and cold-chain logistics.',
    content: `DRAFT VENDOR TERMS OF SUPPLY AGREEMENT

This Vendor Terms of Supply Agreement ("Agreement") is entered into as of [Date], by and between RDNT Sparkle Industries LLP, a limited liability partnership registered under the LLP Act, 2008, with registered office in Guntur, Andhra Pradesh, India ("Buyer"), and [Vendor/Supplier Name], a company registered in [Jurisdiction] ("Supplier").

1. PURPOSE & SCOPE OF SUPPLY
Supplier agrees to supply goods, materials, or services (including solar hardware, botanical beverage extracts, aluminum cans, or refrigerated EV transport) in accordance with Purchase Orders ("PO") issued by Buyer from time to time.

2. ORDER ACCEPTANCE & PRICING
(a) Purchase Orders issued by Buyer become binding only upon written confirmation or delivery dispatch by Supplier.
(b) Prices specified in an executed PO are firm for the duration of the PO and include applicable statutory taxes, GST, and packaging costs unless stated otherwise.

3. QUALITY ASSURANCE, FSSAI & STATUTORY COMPLIANCE
(a) Specifications: Supplier warrants that all supplied goods strictly conform to agreed technical specifications, safety standards, and statutory regulations (including FSSAI standards for beverage ingredients and Bureau of Indian Standards (BIS) for electrical hardware).
(b) Inspection & Rejection: Buyer reserves the right to inspect shipments upon arrival. Defective, damaged, or non-conforming goods may be rejected within 14 days of receipt for replacement or full credit at Supplier's expense.

4. PAYMENT TERMS & GST E-INVOICING
Buyer shall pay valid, undisputed tax invoices within Net 45 days from receipt of conforming goods and statutory E-Invoice generated in accordance with GST Rules. Supplier shall ensure timely filing of GST returns to allow Buyer input tax credit (ITC) claims.

5. LIMITATION OF LIABILITY & FORCE MAJEURE
(a) Neither party shall be liable for indirect, special, or consequential damages.
(b) Liability Cap: Except for breach of confidentiality, gross negligence, or statutory compliance obligations, each party's maximum cumulative liability shall be capped at the total value of the Purchase Order under which the claim arose.
(c) Force Majeure: Neither party shall be held liable for delay in performance caused by acts of God, extreme natural disasters, pandemic lock-downs, or statutory government mandates beyond reasonable control.

6. GOVERNING LAW & ARBITRATION
This Agreement shall be governed by the laws of the Republic of India. Any dispute arising out of or in connection with this Agreement shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with seat and venue at Vijayawada / Guntur, Andhra Pradesh.

[DRAFT ONLY - SUBJECT TO REVIEW AND FINAL REVISION BY LEGAL COUNSEL]`
  }
];
