/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LegalShieldSection } from '../types';

export const INDIA_LEGAL_SHIELD_SECTIONS: LegalShieldSection[] = [
  {
    id: 'intermediary-safe-harbour',
    title: 'Intermediary Status & Section 79 Safe Harbour Immunity',
    icon: 'ShieldCheck',
    shortSummary: 'Statutory immunity under Section 79 of the Information Technology Act, 2000.',
    statuteReference: 'Section 79, Information Technology Act, 2000 & IT Intermediary Rules, 2021',
    fullClause: `RDNT Sparkle Industries LLP operates solely as an 'Intermediary' as defined under Section 2(1)(w) of the Information Technology Act, 2000. In accordance with Section 79 of the IT Act, RDNT Sparkle Industries LLP shall not be liable for any third-party information, data, or communication link made available or hosted on the SparkDeal Hub or Radiant Spark Global platforms.

Safe Harbour Conditions Fulfilled:
1. RDNT Sparkle Industries LLP does not initiate the transmission of third-party deals or products;
2. RDNT Sparkle Industries LLP does not select the receiver of the transmission;
3. RDNT Sparkle Industries LLP does not select or modify the information contained in the transmission, acting strictly as an informational curation and syndication portal;
4. RDNT Sparkle Industries LLP observes due diligence as mandated under Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.

No vendor, merchant, or third party shall be deemed an agent, partner, or joint venturer of RDNT Sparkle Industries LLP.`,
    complianceKeyPoints: [
      'Zero liability for third-party product specs, defects, or pricing errors',
      'No physical possession, warehousing, or direct invoicing of merchant inventory',
      'Automated syndication links direct consumers to original registered vendors',
      'Prompt compliance with lawful takedown notices under Rule 3(1)(d)'
    ]
  },
  {
    id: 'consumer-protection-act',
    title: 'Consumer Protection Act (E-Commerce Rules 2020) Compliance',
    icon: 'Scale',
    shortSummary: 'Full alignment with Consumer Protection (E-Commerce) Rules, 2020 and 2019 Act.',
    statuteReference: 'Consumer Protection Act, 2019 & Consumer Protection (E-Commerce) Rules, 2020',
    fullClause: `In compliance with the Consumer Protection (E-Commerce) Rules, 2020 framed under the Consumer Protection Act, 2019:

1. Platform Characterization: SparkDeal Hub is an informational and affiliate directory. It does not engage in the inventory-based model of e-commerce.
2. Direct Contract of Sale: Every commercial contract for the sale of goods or services discovered on SparkDeal Hub is entered into strictly between the consumer and the respective third-party merchant (such as Amazon India, Flipkart, Tata Neu, or certified manufacturers). RDNT Sparkle Industries LLP is not a party to such transactions.
3. Pricing & Warranties: Third-party vendors are exclusively responsible for accurate pricing, merchantability, warranties, after-sales service, and order fulfillment. Prices displayed on SparkDeal Hub are indicative and subject to instantaneous variation by the source seller.
4. Unfair Trade Practice Bar: RDNT Sparkle Industries LLP does not manipulate the search results or artificially inflate ratings, and all reviews and upvote tallies reflect authentic user interactions.`,
    complianceKeyPoints: [
      'Express disclaimer that contracts of sale are strictly bilateral with third-party vendors',
      'Clear indication of merchant identity prior to external checkout redirect',
      'Zero deceptive pricing guarantee; live source price governs all checkouts',
      'Structured refund and return recourse directly through verified merchant platforms'
    ]
  },
  {
    id: 'affiliate-disclosure-asci',
    title: 'Commercial Affiliate Disclosure & ASCI Guidelines Compliance',
    icon: 'FileBadge',
    shortSummary: 'Transparency under ASCI Digital Media Guidelines and FTC 16 CFR § 255.5.',
    statuteReference: 'ASCI Guidelines for Influencer & Affiliate Advertising (2021) & FTC Disclosures',
    fullClause: `SparkDeal Hub operates on a sustainable, revenue-generating affiliate marketing model. In full adherence to the Advertising Standards Council of India (ASCI) Code and international digital trade transparency standards:

1. Material Connection Disclosure: RDNT Sparkle Industries LLP maintains commercial affiliate agreements with leading e-commerce platforms, including but not limited to Amazon India (Amazon Associates Program), Flipkart Affiliate Network, and selected direct brands.
2. Commission Mechanism: When you click on outbound links designated with 'Get Deal ↗' or utilize specific promotional coupon codes, we may receive a variable affiliate referral commission from the seller upon a successful qualifying purchase.
3. No Cost to Consumer: The affiliate commission is paid entirely by the merchant out of their customer acquisition budget; at no point does using our links increase the price paid by the user. In many instances, exclusive partner coupon codes result in net savings below public retail prices.
4. Editorial Autonomy: The curation team reviews deals based on price history, product reliability, and community value. Merchant affiliate commission rates do not influence deal validation status.`,
    complianceKeyPoints: [
      'Prominent #AffiliateLink and #Sponsored tagging on commercial redirects',
      'Transparent disclosure that commissions carry zero surcharge for buyers',
      'Strict editorial independence from commercial affiliate commissions',
      'Adherence to Section 4 of ASCI Code for Self-Regulation in Advertising'
    ]
  },
  {
    id: 'grievance-redressal-desk',
    title: 'Statutory Grievance Redressal Mechanism & Officer Details',
    icon: 'AlertCircle',
    shortSummary: 'Mandatory Grievance Officer details under IT Rules 2021 with 24-hr acknowledgment.',
    statuteReference: 'Rule 3(2) of Information Technology (Intermediary Guidelines) Rules, 2021',
    fullClause: `Pursuant to Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, RDNT Sparkle Industries LLP has appointed a dedicated Resident Grievance Officer in India to address user grievances, complaints, and legal takedown requests:

Grievance Redressal Desk Information:
- Appointed Grievance Officer: Legal Compliance & Consumer Affairs Secretariat
- Entity: RDNT Sparkle Industries LLP
- Registered Address: D.No. 4-12-88, Main Commercial Arterial Road, Guntur, Andhra Pradesh, PIN: 522002, India
- Dedicated Compliance Email: grievance@radiantsparkllc.com / legal@radiantsparkllc.com
- Working Hours: Monday to Friday, 09:30 IST to 18:00 IST (excluding statutory public holidays)

Statutory Timelines:
- Acknowledgment: Within 24 (twenty-four) hours of complaint receipt with unique ticket reference number.
- Resolution & Redressal: Complete disposal within 15 (fifteen) days from receipt date.`,
    complianceKeyPoints: [
      'Resident Grievance Officer physically located in Andhra Pradesh, India',
      'Guaranteed 24-hour statutory written acknowledgment of all consumer grievances',
      'Formal 15-day maximum dispute investigation and resolution window',
      'Quarterly compliance auditing and transparency logging'
    ]
  }
];
