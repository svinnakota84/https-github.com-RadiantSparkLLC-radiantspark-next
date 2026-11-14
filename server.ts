/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  refreshLiveDealsFeed,
  AFFILIATE_DISCLOSURE,
  FRESHNESS_LIMIT_MINUTES,
  REFRESH_INTERVAL_MINUTES,
} from './scripts/deals-fetcher.mjs';
import { DealItem } from './src/types';

dotenv.config();

const app = express();
app.use(express.json({ limit: '256kb' }));

const SERVER_STARTED_AT = Date.now();
const DATA_DIR = path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const SUPPLIERS_FILE = path.join(DATA_DIR, 'suppliers.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Initialize Gemini Client only if configured
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface SourceHealthItem {
  id: string;
  name: string;
  status: 'ok' | 'degraded' | 'error';
  itemCount: number;
  durationMs: number;
  checkedAt: string;
  error?: string;
}

interface ServerDealState {
  status: 'online' | 'partial' | 'degraded' | 'initializing';
  lastRefreshedAt: string;
  lastSuccessfulSyncAt: string | null;
  refreshCount: number;
  refreshIntervalMinutes: number;
  freshnessLimitMinutes: number;
  isStale: boolean;
  connectedSources: string[];
  sourcesStatus: SourceHealthItem[];
  affiliateDisclosure: string;
  deals: DealItem[];
  lastError?: string | null;
}

let dealState: ServerDealState = {
  status: 'initializing',
  lastRefreshedAt: new Date().toISOString(),
  lastSuccessfulSyncAt: null,
  refreshCount: 0,
  refreshIntervalMinutes: REFRESH_INTERVAL_MINUTES,
  freshnessLimitMinutes: FRESHNESS_LIMIT_MINUTES,
  isStale: false,
  connectedSources: [
    'DealNews Verified RSS',
    'Slickdeals Frontpage Deals',
    'Slickdeals Black Friday 2026',
  ],
  sourcesStatus: [],
  affiliateDisclosure: AFFILIATE_DISCLOSURE,
  deals: [],
  lastError: null,
};

let refreshPromise: Promise<void> | null = null;
let lastManualRefreshMs = 0;

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function hydrateInitialCache() {
  const cachedPath = path.resolve(process.cwd(), 'public/deals-feed.json');
  const cached = await readJsonFile<any>(cachedPath, null);
  if (cached && Array.isArray(cached.deals) && cached.deals.length > 0) {
    dealState = {
      ...dealState,
      status: cached.status || 'online',
      lastRefreshedAt: cached.lastRefreshedAt || new Date().toISOString(),
      lastSuccessfulSyncAt: cached.lastSuccessfulSyncAt || cached.lastRefreshedAt || null,
      isStale: Boolean(cached.isStale),
      connectedSources: cached.connectedSources || dealState.connectedSources,
      sourcesStatus: cached.sourcesStatus || [],
      deals: cached.deals,
    };
  }
}

async function runServerDealsRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const result = await refreshLiveDealsFeed({ writePublicJson: true });
      const mappedStatus: ServerDealState['status'] =
        result.status === 'partial'
          ? 'partial'
          : result.status === 'degraded'
          ? 'degraded'
          : 'online';
      dealState = {
        status: mappedStatus,
        lastRefreshedAt: result.lastRefreshedAt,
        lastSuccessfulSyncAt: result.lastSuccessfulSyncAt,
        refreshCount: dealState.refreshCount + 1,
        refreshIntervalMinutes: result.refreshIntervalMinutes,
        freshnessLimitMinutes: result.freshnessLimitMinutes,
        isStale: result.isStale,
        connectedSources: result.connectedSources,
        sourcesStatus: result.sourcesStatus as SourceHealthItem[],
        affiliateDisclosure: result.affiliateDisclosure,
        deals: result.deals,
        lastError:
          result.status === 'degraded'
            ? 'Upstream feed sync degraded; monitoring freshness window.'
            : null,
      };
      console.log(
        `[SparkDeals Scheduler] Status=${dealState.status} Deals=${dealState.deals.length} Cycle=#${dealState.refreshCount} At=${dealState.lastRefreshedAt}`
      );
    } catch (err: any) {
      console.error('[SparkDeals Scheduler] Refresh failed:', err?.message || err);
      const lastOk = dealState.lastSuccessfulSyncAt ? Date.parse(dealState.lastSuccessfulSyncAt) : 0;
      const ageMin = lastOk ? Math.round((Date.now() - lastOk) / 60000) : FRESHNESS_LIMIT_MINUTES + 1;
      const exceeded = ageMin > FRESHNESS_LIMIT_MINUTES;
      dealState = {
        ...dealState,
        status: 'degraded',
        isStale: exceeded,
        deals: exceeded ? [] : dealState.deals,
        lastError: err?.message || 'Deal feed refresh failed',
      };
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

// Start 15-Minute Scheduled Background Sync
const REFRESH_MS = REFRESH_INTERVAL_MINUTES * 60 * 1000;
setInterval(() => {
  void runServerDealsRefresh();
}, REFRESH_MS);

function formatLastCheckedLabel(isoDate: string) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  const min = Math.floor(diffSec / 60);
  if (diffSec < 45) return 'Just now';
  if (min < 1) return `${diffSec}s ago`;
  if (min === 1) return '1 min ago';
  if (min < 60) return `${min} mins ago`;
  const hrs = Math.floor(min / 60);
  return `${hrs}h ${min % 60}m ago`;
}

// GET /api/deals (Returns verified server-refreshed deal feed)
app.get('/api/deals', async (_req, res) => {
  if (dealState.deals.length === 0 && dealState.status === 'initializing') {
    await hydrateInitialCache();
    if (dealState.deals.length === 0) {
      await runServerDealsRefresh();
    }
  }

  const lastOkMs = dealState.lastSuccessfulSyncAt
    ? Date.parse(dealState.lastSuccessfulSyncAt)
    : Date.parse(dealState.lastRefreshedAt);
  const ageMinutes = Math.max(0, Math.floor((Date.now() - lastOkMs) / 60000));
  const isStale = dealState.isStale || ageMinutes > FRESHNESS_LIMIT_MINUTES;

  // Filter out expired offers at read time
  const activeDeals = isStale
    ? []
    : dealState.deals.filter((d) => {
        if (d.expiresAt) {
          const expMs = Date.parse(d.expiresAt);
          if (!Number.isNaN(expMs) && expMs <= Date.now()) return false;
        }
        return true;
      });

  return res.json({
    status: isStale ? 'stale' : dealState.status,
    lastRefreshedAt: dealState.lastRefreshedAt,
    lastSuccessfulSyncAt: dealState.lastSuccessfulSyncAt,
    lastCheckedMinutesAgo: ageMinutes,
    lastCheckedLabel: formatLastCheckedLabel(dealState.lastRefreshedAt),
    refreshIntervalMinutes: dealState.refreshIntervalMinutes,
    freshnessLimitMinutes: dealState.freshnessLimitMinutes,
    isStale,
    refreshCount: dealState.refreshCount,
    totalDeals: activeDeals.length,
    connectedSources: dealState.connectedSources,
    sourcesStatus: dealState.sourcesStatus,
    affiliateDisclosure: dealState.affiliateDisclosure,
    lastError: dealState.lastError || null,
    deals: activeDeals,
  });
});

// POST /api/deals/refresh (Rate-limited manual live feed refresh trigger)
app.post('/api/deals/refresh', async (_req, res) => {
  const now = Date.now();
  if (now - lastManualRefreshMs < 15000 && dealState.deals.length > 0) {
    return res.json({
      message: 'Recent live feed cache returned (15s rate limit active)',
      lastRefreshedAt: dealState.lastRefreshedAt,
      refreshCount: dealState.refreshCount,
      totalDeals: dealState.deals.length,
      status: dealState.status,
    });
  }

  lastManualRefreshMs = now;
  await runServerDealsRefresh();
  return res.json({
    message: 'SparkDeals live feeds refreshed',
    status: dealState.status,
    lastRefreshedAt: dealState.lastRefreshedAt,
    refreshCount: dealState.refreshCount,
    totalDeals: dealState.deals.length,
  });
});

// POST /api/deals/webhook (Authenticated real-time merchant webhook ingestion)
app.post('/api/deals/webhook', async (req, res) => {
  const expectedSecret = process.env.DEALS_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = req.header('x-webhook-secret') || req.header('authorization')?.replace(/^Bearer\s+/i, '');
    if (provided !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized webhook signature' });
    }
  }

  const newDeal = req.body;
  const price = Number(newDeal?.currentPrice);
  const urlStr = String(newDeal?.affiliateUrl || newDeal?.url || '').trim();
  let validUrl = '';
  try {
    const u = new URL(urlStr);
    if (u.protocol === 'http:' || u.protocol === 'https:') validUrl = u.toString();
  } catch {
    validUrl = '';
  }

  if (!newDeal?.title || !Number.isFinite(price) || price <= 0 || !validUrl) {
    return res.status(400).json({ error: 'Invalid deal payload: requires title, positive currentPrice, and valid http(s) url' });
  }

  const orig = Number(newDeal.originalPrice);
  const hasValidRef = Number.isFinite(orig) && orig > price;
  const validDiscount = hasValidRef ? Math.round(((orig - price) / orig) * 100) : null;

  const item: DealItem = {
    id: newDeal.id || `wh-${Date.now()}`,
    title: String(newDeal.title).trim(),
    category: newDeal.category || 'electronics',
    currentPrice: price,
    originalPrice: hasValidRef ? orig : null,
    discountPercent: validDiscount,
    currency: newDeal.currency === 'INR' ? 'INR' : 'USD',
    merchant: String(newDeal.merchant || 'Partner Merchant'),
    merchantVerified: true,
    score: 300,
    couponCode: newDeal.couponCode || null,
    affiliateUrl: validUrl,
    amazonUsaUrl: newDeal.amazonUsaUrl,
    amazonIndiaUrl: newDeal.amazonIndiaUrl,
    walmartUrl: newDeal.walmartUrl,
    primaryStore: newDeal.primaryStore || newDeal.merchant || 'Retail Partner',
    imageUrl:
      newDeal.imageUrl ||
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: String(newDeal.description || 'Verified merchant webhook offer.'),
    badges: Array.isArray(newDeal.badges) ? newDeal.badges : [String(newDeal.merchant || 'Webhook Push')],
    expiresInHours: typeof newDeal.expiresInHours === 'number' ? newDeal.expiresInHours : null,
    expiresAt: newDeal.expiresAt || null,
    publishedAt: new Date().toISOString(),
    availability: String(newDeal.availability || 'Verified via Webhook'),
    sourceFeed: 'Merchant Webhook Push',
    isBlackFriday: Boolean(newDeal.isBlackFriday),
    specifications: Array.isArray(newDeal.specifications)
      ? newDeal.specifications
      : ['Verified Webhook Offer', 'Direct Merchant Link'],
    highlight: String(newDeal.highlight || 'Real-time offer pushed via verified merchant webhook.'),
    lastChecked: 'Just now (Webhook)',
  };

  dealState.deals.unshift(item);
  dealState.lastRefreshedAt = new Date().toISOString();
  dealState.lastSuccessfulSyncAt = dealState.lastRefreshedAt;
  return res.json({
    message: 'Webhook deal received and added',
    dealId: item.id,
    totalDeals: dealState.deals.length,
  });
});

// GET /api/health
app.get('/api/health', async (_req, res) => {
  if (dealState.deals.length === 0 && dealState.status === 'initializing') {
    await hydrateInitialCache();
  }
  return res.json({
    status: dealState.status,
    uptimeSeconds: Math.floor((Date.now() - SERVER_STARTED_AT) / 1000),
    dealsCount: dealState.deals.length,
    lastRefresh: dealState.lastRefreshedAt,
    lastSuccessfulSyncAt: dealState.lastSuccessfulSyncAt,
    refreshIntervalMinutes: dealState.refreshIntervalMinutes,
    isStale: dealState.isStale,
    sourcesStatus: dealState.sourcesStatus,
  });
});

// POST /api/inquiries/submit
app.post('/api/inquiries/submit', async (req, res) => {
  try {
    const { name, company, email, phone, country, category, volumeUsd, message, website } = req.body || {};
    if (website) {
      return res.status(400).json({ error: 'Spam check triggered' });
    }
    if (!name || !email || !company || !String(email).includes('@')) {
      return res.status(400).json({ error: 'Name, company, and valid email are required' });
    }

    const existing = await readJsonFile<any[]>(INQUIRIES_FILE, []);
    const normalizedEmail = String(email).trim().toLowerCase();
    const recentDuplicate = existing.find(
      (item) =>
        item.email?.toLowerCase() === normalizedEmail &&
        item.category === category &&
        Date.now() - Date.parse(item.createdAt) < 5 * 60 * 1000
    );
    if (recentDuplicate) {
      return res.status(409).json({
        error: 'Duplicate inquiry submitted recently',
        ticketId: recentDuplicate.id,
      });
    }

    const record = {
      id: `INQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
      createdAt: new Date().toISOString(),
      name: String(name).trim(),
      company: String(company).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      country: country || 'USA',
      category: category || 'Enterprise Consulting',
      volumeUsd: Number(volumeUsd) || 0,
      message: message ? String(message).trim() : '',
      status: 'Received - Pending Human Review',
      emailNotificationConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    };

    existing.unshift(record);
    await writeJsonFile(INQUIRIES_FILE, existing.slice(0, 200));

    return res.json({
      success: true,
      ticketId: record.id,
      record,
      message: 'Inquiry logged for review by Radiant Spark leadership.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to persist inquiry', details: err?.message });
  }
});

// POST /api/suppliers/submit
app.post('/api/suppliers/submit', async (req, res) => {
  try {
    const { companyName, contactName, email, category, region, capacityMoq, message, website } = req.body || {};
    if (website) {
      return res.status(400).json({ error: 'Spam check triggered' });
    }
    if (!companyName || !contactName || !email || !String(email).includes('@')) {
      return res.status(400).json({ error: 'Company name, contact name, and valid email are required' });
    }

    const existing = await readJsonFile<any[]>(SUPPLIERS_FILE, []);
    const normalizedEmail = String(email).trim().toLowerCase();
    const record = {
      id: `SUP-${Math.floor(100000 + Math.random() * 899999)}`,
      createdAt: new Date().toISOString(),
      companyName: String(companyName).trim(),
      contactName: String(contactName).trim(),
      email: normalizedEmail,
      category: category || 'General Vendor Supply',
      region: region || 'Global',
      capacityMoq: capacityMoq ? String(capacityMoq).trim() : 'Not specified',
      message: message ? String(message).trim() : '',
      status: 'Pending Qualification Review (No Purchase Commitment)',
    };

    existing.unshift(record);
    await writeJsonFile(SUPPLIERS_FILE, existing.slice(0, 200));

    return res.json({
      success: true,
      ticketId: record.id,
      record,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to persist supplier intake', details: err?.message });
  }
});

// POST /api/analytics/event (Separates outbound clicks vs inquiry leads; never counts clicks as revenue)
app.post('/api/analytics/event', async (req, res) => {
  try {
    const { type, label, dealId } = req.body || {};
    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Event type is required' });
    }
    const analytics = await readJsonFile<any>(ANALYTICS_FILE, {
      dealClicks: 0,
      inquirySubmissions: 0,
      supplierSubmissions: 0,
      recentEvents: [],
    });

    if (type === 'deal_click') analytics.dealClicks += 1;
    else if (type === 'inquiry_submit') analytics.inquirySubmissions += 1;
    else if (type === 'supplier_submit') analytics.supplierSubmissions += 1;

    analytics.recentEvents.unshift({
      type,
      label: label || null,
      dealId: dealId || null,
      at: new Date().toISOString(),
    });
    analytics.recentEvents = analytics.recentEvents.slice(0, 100);

    await writeJsonFile(ANALYTICS_FILE, analytics);
    return res.json({ recorded: true });
  } catch {
    return res.status(500).json({ error: 'Analytics logging failed' });
  }
});

// GET /api/owner/overview (Returns real persisted server records)
app.get('/api/owner/overview', async (_req, res) => {
  const [inquiries, suppliers, analytics] = await Promise.all([
    readJsonFile<any[]>(INQUIRIES_FILE, []),
    readJsonFile<any[]>(SUPPLIERS_FILE, []),
    readJsonFile<any>(ANALYTICS_FILE, {
      dealClicks: 0,
      inquirySubmissions: 0,
      supplierSubmissions: 0,
      recentEvents: [],
    }),
  ]);

  return res.json({
    inquiries,
    suppliers,
    analytics,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    affiliateTagsConfigured: Boolean(process.env.AMAZON_AFFILIATE_TAG || process.env.AMAZON_INDIA_TAG),
  });
});

// Real-Time Gemini AI Server Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, employeeName = 'Maya Chen', employeeRole = 'AI Operations Lead', systemInstruction } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const defaultInstruction = `You are ${employeeName}, ${employeeRole} at Radiant Spark Global (United States & India).
Provide concise, factual, non-binding operational information based strictly on user questions. Never invent contracts, licenses, stock numbers, or revenue guarantees.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || defaultInstruction,
        },
      });

      const responseText =
        response.text || 'Your inquiry has been noted. For formal commitments or quotes, please use the Enterprise RFQ form.';
      return res.json({
        employeeName,
        employeeRole,
        response: responseText,
        source: 'gemini-2.5-flash',
      });
    }

    return res.json({
      employeeName,
      employeeRole,
      response: `Automated preview response from ${employeeName} (${employeeRole}): Server GEMINI_API_KEY is not configured in this environment. Please submit a B2B RFQ or contact info@radiantsparkllc.com for verified human follow-up.`,
      source: 'local-advisory',
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: 'AI generation failed',
      details: err.message,
    });
  }
});

// Mount Vite middleware in dev or serve static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  await hydrateInitialCache();
  // Trigger initial background live deal sync right at server boot
  void runServerDealsRefresh();

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Explicitly serve index.html for root / Vite SPA paths
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) return next();
      try {
        const htmlPath = path.resolve(process.cwd(), 'index.html');
        let html = await fs.readFile(htmlPath, 'utf8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
