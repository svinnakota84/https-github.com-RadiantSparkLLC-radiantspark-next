/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'en' | 'te' | 'hi';

export interface TranslationDictionary {
  brandName: string;
  brandSub: string;
  navGlobal: string;
  navUsa: string;
  navIndia: string;
  navDeals: string;
  navBrain: string;
  navApps: string;
  navCompany: string;
  heroBadge: string;
  heroTitle: string;
  heroItalic: string;
  heroSub: string;
  brainBadge: string;
  brainTitle: string;
  brainSub: string;
  pipelineTitle: string;
  whatsappBadge: string;
  whatsappBtn: string;
  whatsappSent: string;
  dealerTab: string;
  consumerTab: string;
  runPipelineBtn: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    brandName: 'Radiant Spark Global',
    brandSub: 'UNITED STATES · INDIA',
    navGlobal: 'RADIANT SPARK GLOBAL',
    navUsa: 'TECHNOLOGY USA',
    navIndia: 'INDUSTRIES INDIA',
    navDeals: 'SPARKDEALS PORTAL',
    navBrain: 'AI BRAIN (11 AGENTS)',
    navApps: 'MOBILE APPS',
    navCompany: 'COMPANY',
    heroBadge: 'Radiant Spark Global · United States + India',
    heroTitle: 'Intelligence across',
    heroItalic: 'frontiers.',
    heroSub: 'Connecting U.S. technology services through Radiant Spark LLC with India clean energy, products, and distribution through RDNT Sparkle Industries LLP.',
    brainBadge: 'CONNECTED AI WORKFORCE · 11 AGENTS',
    brainTitle: 'Radiant Brain 11X OS',
    brainSub: 'Multi-agent operations pipeline handling customer & dealer order intake, warehouse stock allocation, 28% GST invoicing, SparkDeals attribution, and logistics dispatch.',
    pipelineTitle: 'Order Intake -> Requisition -> Tax Invoice -> Waybill Dispatch',
    whatsappBadge: 'Dispatch Summary Share',
    whatsappBtn: 'Share Invoice & Tracking Summary',
    whatsappSent: 'Invoice & Waybill Summary Prepared',
    dealerTab: 'Wholesale Dealer (B2B)',
    consumerTab: 'Direct Consumer (D2C)',
    runPipelineBtn: 'Execute 11-Agent AI Pipeline',
  },
  te: {
    brandName: 'రేడియంట్ స్పార్క్ గ్లోబల్',
    brandSub: 'అమెరికా సంయుక్త రాష్ట్రాలు · భారతదేశం',
    navGlobal: 'రేడియంట్ స్పార్క్ గ్లోబల్',
    navUsa: 'సాంకేతికత యుఎస్ఏ',
    navIndia: 'పరిశ్రమలు భారతదేశం',
    navDeals: 'స్పార్క్ డీల్స్ పోర్టల్',
    navBrain: 'AI బ్రెయిన్ (11 ఏజెంట్లు)',
    navApps: 'మొబైల్ యాప్స్',
    navCompany: 'సంస్థ వివరాలు',
    heroBadge: 'రేడియంట్ స్పార్క్ గ్లోబల్ · అమెరికా + భారతదేశం',
    heroTitle: 'సరిహద్దులు దాటిన',
    heroItalic: 'విశిష్ట మేధస్సు.',
    heroSub: 'రేడియంట్ స్పార్క్ ఎల్ఎల్‌సి ద్వారా యు.ఎస్. సాంకేతిక సేవలను, ఆర్‌డిఎన్‌టి స్పార్కిల్ ఇండస్ట్రీస్ ఎల్ఎల్‌పి ద్వారా భారతదేశ స్వచ్ఛ ఇంధనం మరియు పంపిణీతో అనుసంధానిస్తుంది.',
    brainBadge: '11 AI ఏజెంట్ల వర్క్‌ఫోర్స్',
    brainTitle: 'రేడియంట్ బ్రెయిన్ 11X OS',
    brainSub: 'డీలర్ ఆర్డర్లు, వేర్‌హౌస్ స్టాక్ కేటాయింపు, 28% GST ఇన్‌వాయిస్‌లు మరియు రవాణా వేబిల్‌లను నిర్వహించే AI పైప్‌లైన్.',
    pipelineTitle: 'ఆర్డర్ స్వీకరణ -> ఫ్యాక్టరీ రిక్విజిషన్ -> GST ఇన్‌వాయిస్ -> వేబిల్ పంపిణీ',
    whatsappBadge: 'ఇన్‌వాయిస్ సారాంశం షేర్',
    whatsappBtn: 'ఇన్‌వాయిస్ & ట్రాకింగ్ సారాంశం షేర్ చేయండి',
    whatsappSent: 'ఇన్‌వాయిస్ & వేబిల్ సారాంశం సిద్ధంగా ఉంది',
    dealerTab: 'హోల్‌సేల్ డీలర్ (B2B)',
    consumerTab: 'డైరెక్ట్ కస్టమర్ (D2C)',
    runPipelineBtn: '11-ఏజెంట్ AI పైప్‌లైన్‌ను అమలు చేయండి',
  },
  hi: {
    brandName: 'रेडिएंट स्पार्क ग्लोबल',
    brandSub: 'संयुक्त राज्य अमेरिका · भारत',
    navGlobal: 'रेडिएंट स्पार्क ग्लोबल',
    navUsa: 'प्रद्योगिकी यूएसए',
    navIndia: 'उद्योग भारत',
    navDeals: 'स्पार्क डील्स पोर्टल',
    navBrain: 'एआई ब्रेन (11 एजेंट)',
    navApps: 'मोबाइल ऐप्स',
    navCompany: 'कंपनी',
    heroBadge: 'रेडिएंट स्पार्क ग्लोबल · संयुक्त राज्य अमेरिका + भारत',
    heroTitle: 'सीमाओं के पार',
    heroItalic: 'उत्कृष्ट बुद्धिमत्ता।',
    heroSub: 'रेडिएंट स्पार्क एलएलसी के माध्यम से अमेरिकी प्रौद्योगिकी सेवाओं को आरडीएनटी स्पार्कल इंडस्ट्रीज एलएलपी के साथ भारत स्वच्छ ऊर्जा और वितरण से जोड़ना।',
    brainBadge: '11 कनेक्टेड एआई एजेंट्स',
    brainTitle: 'रेडिएंट ब्रेन 11X OS',
    brainSub: 'डीलर ऑर्डर, वेयरहाउस स्टॉक आवंटन, 28% जीएसटी चालान और लॉजिस्टिक्स वेबिल संचालन करने वाली एआई पाइपलाइन।',
    pipelineTitle: 'ऑर्डर प्राप्ति -> फ़ैक्टरी आवश्यकता -> 28% जीएसटी चालान -> वेबिल प्रेषण',
    whatsappBadge: 'चालान सारांश साझा करें',
    whatsappBtn: 'चालान और ट्रैकिंग सारांश साझा करें',
    whatsappSent: 'चालान और वेबिल सारांश तैयार',
    dealerTab: 'थोक डीलर (B2B)',
    consumerTab: 'प्रत्यक्ष ग्राहक (D2C)',
    runPipelineBtn: '11-एजेंट एआई पाइपलाइन चलाएं',
  },
};

/**
 * Prepares a plain WhatsApp share URL with real invoice & waybill details (no hardcoded placeholder phone number)
 */
export function buildWhatsAppInvoiceUrl(order: {
  id: string;
  buyerName: string;
  businessName: string;
  city: string;
  product: string;
  cases: number;
  grandTotal: number;
  invoiceId?: string;
  waybillId?: string;
  vehicleNo?: string;
  phone?: string;
}): string {
  const sanitizedPhone = order.phone ? order.phone.replace(/[^0-9]/g, '') : '';
  const text = `RDNT SPARKLE INDUSTRIES LLP — TAX INVOICE & DISPATCH SUMMARY

Invoice: ${order.invoiceId || order.id}
Customer: ${order.businessName} (${order.buyerName})
Destination: ${order.city}
Product: ${order.cases} Cases of ${order.product}
Grand Total: ₹${order.grandTotal.toLocaleString('en-IN')} (Incl. 28% GST)
Waybill: ${order.waybillId || 'Pending'}
Vehicle Ref: ${order.vehicleNo || 'Assigned upon dispatch'}
FSSAI Central Lic: #10126999000142`;

  if (sanitizedPhone.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
