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
    navBrain: 'AI BRAIN (10 AGENTS)',
    navApps: 'MOBILE APPS',
    navCompany: 'COMPANY',
    heroBadge: 'Radiant Spark Global · United States + India',
    heroTitle: 'Intelligence across',
    heroItalic: 'frontiers.',
    heroSub: 'Connecting U.S. technology services through Radiant Spark LLC with India clean energy, products, and distribution through RDNT Sparkle Industries LLP.',
    brainBadge: 'GLOBAL AUTONOMOUS AI BRAIN · 10 AI EMPLOYEES',
    brainTitle: 'Radiant Brain 10X OS',
    brainSub: 'Autonomous multi-agent intelligence taking care of global business operations: customer & dealer order intake, factory batch requisitions, instant GST invoicing, and refrigerated EV cold-chain dispatch.',
    pipelineTitle: 'Order Intake ➔ Requisition ➔ Tax Invoice ➔ EV Shipment',
    whatsappBadge: 'WhatsApp Business API Connected',
    whatsappBtn: '📲 Send WhatsApp Invoice & Live Tracking',
    whatsappSent: '✅ WhatsApp Business Invoice & Tracking Alert Delivered (+91 98480 22331)',
    dealerTab: '🏢 Wholesale Dealer (B2B)',
    consumerTab: '🛒 Direct Consumer (D2C)',
    runPipelineBtn: '⚡ Run Award-Winning Autonomous Pipeline',
  },
  te: {
    brandName: 'రేడియంట్ స్పార్క్ గ్లోబల్',
    brandSub: 'అమెరికా సంయుక్త రాష్ట్రాలు · భారతదేశం',
    navGlobal: 'రేడియంట్ స్పార్క్ గ్లోబల్',
    navUsa: 'సాంకేతికత యుఎస్ఏ',
    navIndia: 'పరిశ్రమలు భారతదేశం',
    navDeals: 'స్పార్క్ డీల్స్ పోర్టల్',
    navBrain: 'AI బ్రెయిన్ (10 ఏజెంట్లు)',
    navApps: 'మొబైల్ యాప్స్',
    navCompany: 'సంస్థ వివరాలు',
    heroBadge: 'రేడియంట్ స్పార్క్ గ్లోబల్ · అమెరికా + భారతదేశం',
    heroTitle: 'సరిహద్దులు దాటిన',
    heroItalic: 'విశిష్ట మేధస్సు.',
    heroSub: 'రేడియంట్ స్పార్క్ ఎల్ఎల్‌సి ద్వారా యు.ఎస్. సాంకేతిక సేవలను, ఆర్‌డిఎన్‌టి స్పార్కిల్ ఇండస్ట్రీస్ ఎల్ఎల్‌పి ద్వారా భారతదేశ స్వచ్ఛ ఇంధనం మరియు పంపిణీతో అనుసంధానిస్తుంది.',
    brainBadge: 'గ్లోబల్ స్వయంప్రతిపత్తి కలిగిన AI మేధస్సు · 10 మంది AI ఉద్యోగులు',
    brainTitle: 'రేడియంట్ బ్రెయిన్ 10X OS',
    brainSub: 'గ్లోబల్ వ్యాపార కార్యకలాపాలను నిర్వహించే స్వయంప్రతిపత్తి AI మేధస్సు: డీలర్ ఆర్డర్లు, ఫ్యాక్టరీ బ్యాచ్ రిక్విజిషన్లు, తక్షణ GST ఇన్‌వాయిస్‌లు మరియు శీతల రవాణా.',
    pipelineTitle: 'ఆర్డర్ స్వీకరణ ➔ ఫ్యాక్టరీ రిక్విజిషన్ ➔ 28% GST ఇన్‌వాయిస్ ➔ EV శీతల రవాణా',
    whatsappBadge: 'వాట్సాప్ బిజినెస్ API కనెక్ట్ చేయబడింది',
    whatsappBtn: '📲 వాట్సాప్ ఇన్‌వాయిస్ & లైవ్ ట్రాకింగ్ పంపండి',
    whatsappSent: '✅ వాట్సాప్ బిజినెస్ ఇన్‌వాయిస్ మరియు ట్రాకింగ్ అలర్ట్ పంపబడింది (+91 98480 22331)',
    dealerTab: '🏢 హోల్‌సేల్ డీలర్ (B2B)',
    consumerTab: '🛒 డైరెక్ట్ కస్టమర్ (D2C)',
    runPipelineBtn: '⚡ అవాంతరాలు లేని AI పైప్‌లైన్‌ను ప్రారంభించండి',
  },
  hi: {
    brandName: 'रेडिएंट स्पार्क ग्लोबल',
    brandSub: 'संयुक्त राज्य अमेरिका · भारत',
    navGlobal: 'रेडिएंट स्पार्क ग्लोबल',
    navUsa: 'प्रद्योगिकी यूएसए',
    navIndia: 'उद्योग भारत',
    navDeals: 'स्पार्क डील्स पोर्टल',
    navBrain: 'एआई ब्रेन (10 एजेंट)',
    navApps: 'मोबाइल ऐप्स',
    navCompany: 'कंपनी',
    heroBadge: 'रेडिएंट स्पार्क ग्लोबल · संयुक्त राज्य अमेरिका + भारत',
    heroTitle: 'सीमाओं के पार',
    heroItalic: 'उत्कृष्ट बुद्धिमत्ता।',
    heroSub: 'रेडिएंट स्पार्क एलएलसी के माध्यम से अमेरिकी प्रौद्योगिकी सेवाओं को आरडीएनटी स्पार्कल इंडस्ट्रीज एलएलपी के साथ भारत स्वच्छ ऊर्जा और वितरण से जोड़ना।',
    brainBadge: 'वैश्विक स्वायत्त एआई मस्तिष्क · 10 एआई कर्मचारी',
    brainTitle: 'रेडिएंट ब्रेन 10X OS',
    brainSub: 'वैश्विक व्यापार परिचालन की देखभाल करने वाली स्वायत्त बुद्धिमत्ता: ग्राहक और डीलर ऑर्डर, फ़ैक्टरी आवश्यकताएं, तुरंत जीएसटी चालान और ईवी कोल्ड-चेन प्रेषण।',
    pipelineTitle: 'ऑर्डर प्राप्ति ➔ फ़ैक्टरी आवश्यकता ➔ 28% जीएसटी चालान ➔ ईवी कोल्ड-चेन प्रेषण',
    whatsappBadge: 'व्हाट्सएप बिजनेस एपीआई कनेक्टेड',
    whatsappBtn: '📲 व्हाट्सएप चालान और लाइव ट्रैकिंग भेजें',
    whatsappSent: '✅ व्हाट्सएप बिजनेस चालान और ट्रैकिंग अलर्ट डिलीवर किया गया (+91 98480 22331)',
    dealerTab: '🏢 थोक डीलर (B2B)',
    consumerTab: '🛒 प्रत्यक्ष ग्राहक (D2C)',
    runPipelineBtn: '⚡ स्वायत्त एआई पाइपलाइन चलाएं',
  },
};

/**
 * Prepares a direct WhatsApp share URL with pre-filled GST invoice details & live tracking link
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
  const phone = order.phone || '919848022331';
  const text = `⚡ *RDNT SPARKLE INDUSTRIES LLP — OFFICIAL INVOICE & DISPATCH*

📄 *Invoice:* ${order.invoiceId || 'INV-2026-9041'}
🏢 *Customer:* ${order.businessName} (${order.buyerName})
📍 *City:* ${order.city}
📦 *Product:* ${order.cases} Cases of ${order.product}
💰 *Grand Total:* ₹${order.grandTotal.toLocaleString('en-IN')} (Includes 28% GST)
🚚 *EV Reefer Van:* ${order.vehicleNo || 'AP-07-EV-8842'} (3.2°C Active Cold-Chain)
📜 *Waybill:* ${order.waybillId || 'WB-SPK-9041'}
🛡️ *FSSAI Central Lic:* #10126999000142
🔗 *Live Tracking Link:* https://radiantsparkllc.com/app.html#tracking

_Automated Dispatch by Radiant Spark Global AI Brain_`;

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
}
