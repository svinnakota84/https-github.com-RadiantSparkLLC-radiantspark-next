/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
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
app.use(
  express.json({
    limit: '256kb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

const SERVER_STARTED_AT = Date.now();
const DATA_DIR = path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const SUPPLIERS_FILE = path.join(DATA_DIR, 'suppliers.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const SESSION_SECRET =
  process.env.LIFESPARK_SESSION_SECRET ||
  crypto.createHash('sha256').update(`lifespark:${process.cwd()}:session-key`).digest('hex');

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const CURRENCY_RATES: Record<string, { rate: number; zeroDecimal?: boolean; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  INR: { rate: 84.5, symbol: '₹' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.78, symbol: '£' },
  AED: { rate: 3.67, symbol: 'AED ' },
  CAD: { rate: 1.39, symbol: 'CA$' },
  AUD: { rate: 1.52, symbol: 'A$' },
  SGD: { rate: 1.33, symbol: 'S$' },
  JPY: { rate: 154, zeroDecimal: true, symbol: '¥' },
};

interface BackendSubscriptionPlan {
  id: string;
  aliases: string[];
  name: string;
  priceUsd: number;
  interval: 'month' | 'year' | 'one_time';
  badge: string;
  description: string;
  features: string[];
}

const SUBSCRIPTION_PLANS: BackendSubscriptionPlan[] = [
  {
    id: 'lifestyle_spark_monthly',
    aliases: ['lifespark_monthly', 'lifestyle_spark_pro_monthly', 'lifespark_pro_monthly', 'monthly'],
    name: 'Lifestyle Spark Pro Monthly',
    priceUsd: 9.99,
    interval: 'month',
    badge: 'Most Flexible',
    description: 'Unlimited real-time diet plans, step-by-step recipe prep, workout timers, and cloud progress sync.',
    features: [
      'Custom calorie & macro meal matrix',
      'Full food-making recipes & ingredient lists',
      'Guided HIIT & low-impact weight-loss workouts',
      'Saved login profile across web & Lifestyle Spark app',
    ],
  },
  {
    id: 'lifestyle_spark_annual',
    aliases: ['lifespark_annual', 'lifestyle_spark_pro_annual', 'lifespark_pro_annual', 'annual'],
    name: 'Lifestyle Spark Pro Annual',
    priceUsd: 149.99,
    interval: 'year',
    badge: 'Full Year Access',
    description: 'Full year of continuous nutrition adjustments, recipe library updates, and weight tracking.',
    features: [
      'All Lifestyle Spark Pro Monthly features for 12 months',
      'Priority AI Coach custom meal swaps',
      'Multi-cuisine Indian, Mediterranean & Keto plans',
      'Direct Stripe receipt & instant access activation',
    ],
  },
  {
    id: 'lifestyle_spark_90day',
    aliases: ['lifespark_90day', '90_day_transformation_pass', 'lifestyle_spark_90_day_pass', '90day'],
    name: 'Lifestyle Spark 90-Day Pass',
    priceUsd: 49.99,
    interval: 'one_time',
    badge: 'One-Time Card Payment',
    description: 'Single one-time payment for a structured 12-week fat-loss meal & training roadmap with no recurring renewal.',
    features: [
      'Single non-recurring global card payment',
      '12-week progressive workout & meal schedule',
      'WhatsApp meal summary export',
      'Full Lifestyle Spark Mobile PWA access',
    ],
  },
];

function resolveSubscriptionPlan(planId?: string, planName?: string): BackendSubscriptionPlan {
  const normId = String(planId || '').trim().toLowerCase();
  const normName = String(planName || '').trim().toLowerCase();
  return (
    SUBSCRIPTION_PLANS.find(
      (p) =>
        p.id === normId ||
        p.aliases.includes(normId) ||
        p.name.toLowerCase() === normName
    ) || SUBSCRIPTION_PLANS[0]
  );
}

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

interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  phoneWhatsApp?: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  subscriptionStatus: 'free' | 'active';
  subscriptionPlan?: string | null;
  subscriptionCurrency?: string | null;
  stripeCustomerId?: string | null;
  stripeSessionId?: string | null;
  subscriptionUpdatedAt?: string | null;
  profile: {
    age: number;
    gender: string;
    currentWeightKg: number;
    targetWeightKg: number;
    heightCm: number;
    dietPreference: string;
    lifestyleGoal: string;
    dailyCalorieGoal: number;
  };
  savedPlan: any | null;
  favoriteRecipes: string[];
  workoutLogs: { id: string; title: string; minutes: number; estimatedCalories: number; completedAt: string }[];
  weightLogs: { date: string; weightKg: number }[];
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
    'DealNews Electronics RSS',
    'Slickdeals Black Friday Electronics',
    'Slickdeals Electronics Frontpage',
    'DealNews Verified RSS',
    'Slickdeals Black Friday 2026',
    'Slickdeals Frontpage Deals',
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

function hashPassword(password: string, salt?: string) {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { salt: usedSalt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function signSessionToken(userId: string, email: string) {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token?: string | null): { uid: string; email: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) return null;
    return { uid: parsed.uid, email: parsed.email };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string) {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      map[k] = decodeURIComponent(v);
    }
  }
  return map;
}

function extractRequestToken(req: express.Request): string | null {
  const authHeader = req.header('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.header('cookie'));
  return cookies.lifespark_session || null;
}

function sanitizeUser(u: StoredUser) {
  const { passwordHash: _ph, passwordSalt: _ps, ...rest } = u;
  return rest;
}

function resolveRequestOrigin(req: express.Request) {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const originHeader = req.header('origin');
  if (originHeader && /^https?:\/\//i.test(originHeader)) {
    return originHeader.replace(/\/$/, '');
  }
  const proto = req.header('x-forwarded-proto') || req.protocol || 'http';
  const host = req.header('x-forwarded-host') || req.header('host') || `localhost:${process.env.PORT || 3000}`;
  return `${proto}://${host}`;
}

async function activateUserSubscription({
  email,
  userId,
  planName,
  currency,
  customerId,
  sessionId,
}: {
  email?: string | null;
  userId?: string | null;
  planName?: string | null;
  currency?: string | null;
  customerId?: string | null;
  sessionId?: string | null;
}) {
  const users = await readJsonFile<StoredUser[]>(USERS_FILE, []);
  const normEmail = email ? email.trim().toLowerCase() : null;
  const idx = users.findIndex(
    (u) => (userId && u.id === userId) || (normEmail && u.email.toLowerCase() === normEmail)
  );
  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      subscriptionStatus: 'active',
      subscriptionPlan: planName || users[idx].subscriptionPlan || 'Lifestyle Spark Pro',
      subscriptionCurrency: currency || users[idx].subscriptionCurrency || 'USD',
      stripeCustomerId: customerId || users[idx].stripeCustomerId || null,
      stripeSessionId: sessionId || users[idx].stripeSessionId || null,
      subscriptionUpdatedAt: new Date().toISOString(),
    };
    await writeJsonFile(USERS_FILE, users);
    return users[idx];
  }
  return null;
}

function buildDeterministicDietPlan(input: {
  fullName?: string;
  age?: number;
  gender?: string;
  currentWeightKg?: number;
  targetWeightKg?: number;
  heightCm?: number;
  dietPreference?: string;
  lifestyleGoal?: string;
  dailyCalorieGoal?: number;
}) {
  const name = (input.fullName || '').trim() || 'Member';
  const weightKg = Number(input.currentWeightKg) > 30 ? Number(input.currentWeightKg) : 74;
  const targetWeightKg = Number(input.targetWeightKg) > 30 ? Number(input.targetWeightKg) : Math.max(50, weightKg - 6);
  const heightCm = Number(input.heightCm) > 100 ? Number(input.heightCm) : 170;
  const age = Number(input.age) >= 16 ? Number(input.age) : 30;
  const isMale = input.gender === 'male';

  // Mifflin-St Jeor BMR calculation for realistic macro math
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161);
  const maintenance = Math.round(bmr * 1.375);
  const requestedCal = Number(input.dailyCalorieGoal);
  const targetCalories =
    Number.isFinite(requestedCal) && requestedCal >= 1200 && requestedCal <= 3500
      ? requestedCal
      : input.lifestyleGoal === 'weight_loss'
      ? Math.max(1350, maintenance - 450)
      : input.lifestyleGoal === 'muscle_gain'
      ? maintenance + 250
      : maintenance;

  const proteinGrams =
    input.dietPreference === 'high_protein' || input.lifestyleGoal === 'muscle_gain'
      ? Math.round((targetCalories * 0.32) / 4)
      : Math.round((targetCalories * 0.26) / 4);
  const fatGrams =
    input.dietPreference === 'keto_lowcarb'
      ? Math.round((targetCalories * 0.58) / 9)
      : Math.round((targetCalories * 0.28) / 9);
  const carbsGrams = Math.max(30, Math.round((targetCalories - proteinGrams * 4 - fatGrams * 9) / 4));

  const mealByDiet: Record<
    string,
    { title: string; breakfast: string; lunch: string; snack: string; dinner: string; cookTip: string }
  > = {
    high_protein: {
      title: 'High Protein Botanical & Lean Fat-Loss Plan',
      breakfast: '2-Egg + 2 Egg-White Herb Omelet or 150g Spiced Paneer Scramble with 1 slice seeded sprouted toast (~360 kcal)',
      lunch: 'Lemon Herb Seared Salmon (or Chicken/Tofu) + 1/2 cup Tri-Color Quinoa + Spinach Avocado Greens (~465 kcal)',
      snack: 'Roasted Spiced Almonds (18 pcs) + Cucumber-Mint Lime Cooler (~180 kcal)',
      dinner: 'Ginger-Turmeric Red Lentil & Asparagus Soup with Steamed Vegetables (~315 kcal)',
      cookTip: 'Dry-sear proteins over medium-high heat with olive oil spray and citrus herbs instead of heavy butter sauces.',
    },
    vegetarian_sattvik: {
      title: 'Pure Sattvik Vegetarian Metabolic Plan',
      breakfast: 'High-Protein Moong Dal Chilla stuffed with 60g fresh grated paneer + Mint-Coriander Chutney (~340 kcal)',
      lunch: '1 cup Sprouted Moong Khichdi with Moringa Greens, Roasted Garlic Zucchini & Cucumber Raita (~440 kcal)',
      snack: '1.5 cups Cumin-Chili Dry-Roasted Makhana (Fox Nuts) + Green Herbal Tea (~165 kcal)',
      dinner: 'Warm Lauki (Bottle Gourd) & Lentil Soup with Sauteed Broccoli & Sesame (~310 kcal)',
      cookTip: 'Soak whole moong and lentils 4+ hours before cooking to improve digestibility and preserve micronutrients.',
    },
    vegan_organic: {
      title: '100% Organic Plant-Powered Lean Plan',
      breakfast: 'Unsweetened Almond-Milk Chia Pudding with Hemp Seeds, Cinnamon & Fresh Berries (~320 kcal)',
      lunch: 'Roasted Cumin Chickpea & Shredded Kale Bowl with 1 tbsp Lemon-Tahini Dressing (~410 kcal)',
      snack: 'Edamame Pods dusted with Sea Salt + Celery & Hummus (~190 kcal)',
      dinner: 'Tofu, Broccoli & Shiitake Ginger Stir-Fry over Cauliflower-Millet Rice (~350 kcal)',
      cookTip: 'Press extra-firm tofu 15 minutes under a skillet before searing so spices caramelize cleanly.',
    },
    keto_lowcarb: {
      title: 'Low-GI Keto & Healthy Fats Balance',
      breakfast: 'Spinach, Avocado & Walnut Herb Omelet Skillet (~325 kcal)',
      lunch: 'Grilled Herb Chicken or Paneer Tikka Salad with Olive Oil, Olives & Roasted Bell Peppers (~480 kcal)',
      snack: '10 Macadamia Nuts / Almonds + Electrolyte Lemon Salt Fizz (~170 kcal)',
      dinner: 'Garlic Butter Zoodles (Zucchini Noodles) with Seared Salmon or Grilled Mushrooms (~390 kcal)',
      cookTip: 'Keep daily hydration at 3.5L with electrolytes to stay energized on lower carbohydrate intake.',
    },
  };

  const selected = mealByDiet[input.dietPreference || 'high_protein'] || mealByDiet.high_protein;

  return {
    subscriberName: name,
    dietName: selected.title,
    dailyCalories: `${targetCalories} kcal`,
    estimatedMaintenanceKcal: maintenance,
    macros: {
      proteinGrams,
      carbsGrams,
      fatGrams,
    },
    waterIntake: '3.0 to 3.5 Liters Daily + Morning Warm Lemon Water',
    breakfast: selected.breakfast,
    lunch: selected.lunch,
    snack: selected.snack,
    dinner: selected.dinner,
    cookTip: selected.cookTip,
    exerciseFocus:
      input.lifestyleGoal === 'weight_loss'
        ? `Aim for ${weightKg > 85 ? '25-min Low-Impact Walk + Core' : '20-min Morning Metabolic HIIT'} 5x/week plus 8,000 daily steps toward ${targetWeightKg} kg.`
        : 'Alternate 3 strength sessions and 2 brisk cardio mobility sessions weekly.',
    aiCoachNote: `Coach Maya Chen calculated your BMR (~${Math.round(bmr)} kcal) and set a structured ${targetCalories} kcal target (${proteinGrams}g protein / ${carbsGrams}g carbs / ${fatGrams}g fat). Pair with our Recipes and Workouts tabs below.`,
    generatedAt: new Date().toISOString(),
  };
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

// ============================================================================
// SPARKDEALS LIVE API ENDPOINTS
// ============================================================================

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
    imageUrl: newDeal.imageUrl || '/assets/sparkdeals-tech.jpg',
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

// ============================================================================
// LIFESPARK CUSTOMER AUTH & REAL-TIME DIET / WORKOUT ENDPOINTS
// ============================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, phoneWhatsApp, dietPreference, lifestyleGoal, currentWeightKg, targetWeightKg, heightCm, age, gender } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(fullName || '').trim();
    const cleanPass = String(password || '');

    if (!cleanName || !cleanEmail.includes('@') || cleanPass.length < 6) {
      return res.status(400).json({ error: 'Full name, valid email, and password (minimum 6 characters) are required.' });
    }

    const users = await readJsonFile<StoredUser[]>(USERS_FILE, []);
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const { salt, hash } = hashPassword(cleanPass);
    const weightVal = Number(currentWeightKg) > 30 ? Number(currentWeightKg) : 74;
    const targetVal = Number(targetWeightKg) > 30 ? Number(targetWeightKg) : Math.max(50, weightVal - 6);
    const heightVal = Number(heightCm) > 100 ? Number(heightCm) : 170;
    const ageVal = Number(age) >= 16 ? Number(age) : 30;
    const dietVal = dietPreference || 'high_protein';
    const goalVal = lifestyleGoal || 'weight_loss';

    const initialPlan = buildDeterministicDietPlan({
      fullName: cleanName,
      age: ageVal,
      gender: gender || 'female',
      currentWeightKg: weightVal,
      targetWeightKg: targetVal,
      heightCm: heightVal,
      dietPreference: dietVal,
      lifestyleGoal: goalVal,
    });

    const newUser: StoredUser = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email: cleanEmail,
      fullName: cleanName,
      phoneWhatsApp: phoneWhatsApp ? String(phoneWhatsApp).trim() : '',
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      subscriptionStatus: 'free',
      subscriptionPlan: null,
      subscriptionCurrency: null,
      profile: {
        age: ageVal,
        gender: gender || 'female',
        currentWeightKg: weightVal,
        targetWeightKg: targetVal,
        heightCm: heightVal,
        dietPreference: dietVal,
        lifestyleGoal: goalVal,
        dailyCalorieGoal: parseInt(initialPlan.dailyCalories, 10) || 1750,
      },
      savedPlan: initialPlan,
      favoriteRecipes: [],
      workoutLogs: [],
      weightLogs: [{ date: new Date().toISOString().slice(0, 10), weightKg: weightVal }],
    };

    users.unshift(newUser);
    await writeJsonFile(USERS_FILE, users.slice(0, 500));

    const token = signSessionToken(newUser.id, newUser.email);
    res.setHeader(
      'Set-Cookie',
      `lifespark_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.json({
      success: true,
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Registration failed', details: err?.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '');
    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await readJsonFile<StoredUser[]>(USERS_FILE, []);
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || !verifyPassword(cleanPass, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signSessionToken(user.id, user.email);
    res.setHeader(
      'Set-Cookie',
      `lifespark_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login failed', details: err?.message });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'lifespark_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
  const token = extractRequestToken(req);
  const claims = verifySessionToken(token);
  if (!claims) {
    return res.status(401).json({ authenticated: false, user: null });
  }
  const users = await readJsonFile<StoredUser[]>(USERS_FILE, []);
  const user = users.find((u) => u.id === claims.uid);
  if (!user) {
    return res.status(401).json({ authenticated: false, user: null });
  }
  return res.json({ authenticated: true, user: sanitizeUser(user) });
});

app.post('/api/lifespark/profile', async (req, res) => {
  const token = extractRequestToken(req);
  const claims = verifySessionToken(token);
  if (!claims) {
    return res.status(401).json({ error: 'Please sign in to save your LifeSpark progress.' });
  }
  const users = await readJsonFile<StoredUser[]>(USERS_FILE, []);
  const idx = users.findIndex((u) => u.id === claims.uid);
  if (idx < 0) return res.status(404).json({ error: 'User account not found.' });

  const { weightKg, toggleFavoriteRecipeId, workoutLog, profileUpdates } = req.body || {};
  const user = users[idx];

  if (profileUpdates && typeof profileUpdates === 'object') {
    user.profile = { ...user.profile, ...profileUpdates };
  }
  if (Number.isFinite(Number(weightKg)) && Number(weightKg) > 30 && Number(weightKg) < 250) {
    const val = Math.round(Number(weightKg) * 10) / 10;
    user.profile.currentWeightKg = val;
    user.weightLogs.unshift({ date: new Date().toISOString().slice(0, 10), weightKg: val });
    user.weightLogs = user.weightLogs.slice(0, 60);
  }
  if (typeof toggleFavoriteRecipeId === 'string' && toggleFavoriteRecipeId) {
    if (user.favoriteRecipes.includes(toggleFavoriteRecipeId)) {
      user.favoriteRecipes = user.favoriteRecipes.filter((id) => id !== toggleFavoriteRecipeId);
    } else {
      user.favoriteRecipes.unshift(toggleFavoriteRecipeId);
    }
  }
  if (workoutLog && workoutLog.title) {
    user.workoutLogs.unshift({
      id: `wo-${Date.now()}`,
      title: String(workoutLog.title),
      minutes: Number(workoutLog.minutes) || 20,
      estimatedCalories: Number(workoutLog.estimatedCalories) || 140,
      completedAt: new Date().toISOString(),
    });
    user.workoutLogs = user.workoutLogs.slice(0, 60);
  }

  users[idx] = user;
  await writeJsonFile(USERS_FILE, users);
  return res.json({ success: true, user: sanitizeUser(user) });
});

app.post('/api/lifespark/plan', async (req, res) => {
  try {
    const body = req.body || {};
    const plan = buildDeterministicDietPlan(body);

    if (ai) {
      try {
        const prompt = `Create 1 concise motivational coaching sentence and 1 practical cooking preparation tip tailored to:
Goal=${body.lifestyleGoal || 'weight_loss'}, Diet=${body.dietPreference || 'high_protein'}, TargetCalories=${plan.dailyCalories}, WeightKg=${body.currentWeightKg || 74}, TargetKg=${body.targetWeightKg || 65}.
Return plain text under 60 words with no markdown symbols.`;
        const aiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        if (aiRes.text) {
          plan.aiCoachNote = aiRes.text.trim();
        }
      } catch {
        // Fallback smoothly to deterministic Coach Maya calculation
      }
    }

    // Persist plan if authenticated
    const token = extractRequestToken(req);
    const claims = verifySessionToken(token);
    if (claims) {
      const users = await readJsonFile<StoredUser[]>(USERS_FILE, []);
      const idx = users.findIndex((u) => u.id === claims.uid);
      if (idx >= 0) {
        users[idx].savedPlan = plan;
        users[idx].profile = {
          ...users[idx].profile,
          age: Number(body.age) || users[idx].profile.age,
          gender: body.gender || users[idx].profile.gender,
          currentWeightKg: Number(body.currentWeightKg) || users[idx].profile.currentWeightKg,
          targetWeightKg: Number(body.targetWeightKg) || users[idx].profile.targetWeightKg,
          dietPreference: body.dietPreference || users[idx].profile.dietPreference,
          lifestyleGoal: body.lifestyleGoal || users[idx].profile.lifestyleGoal,
          dailyCalorieGoal: parseInt(plan.dailyCalories, 10) || users[idx].profile.dailyCalorieGoal,
        };
        await writeJsonFile(USERS_FILE, users);
      }
    }

    return res.json({ success: true, plan });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate diet plan', details: err?.message });
  }
});

// ============================================================================
// REAL GLOBAL MULTI-CURRENCY STRIPE CHECKOUT & WEBHOOKS
// ============================================================================

app.get('/api/stripe/plans', (req, res) => {
  const requestedCurrency = String(req.query.currency || 'USD').toUpperCase();
  const currencyCfg = CURRENCY_RATES[requestedCurrency] || CURRENCY_RATES.USD;
  const paymentLinkUrl = process.env.STRIPE_PAYMENT_LINK_URL || process.env.VITE_STRIPE_PAYMENT_LINK_URL || null;

  const plans = SUBSCRIPTION_PLANS.map((plan) => {
    const rawAmount = plan.priceUsd * currencyCfg.rate;
    const localizedAmount = currencyCfg.zeroDecimal ? Math.round(rawAmount) : Number(rawAmount.toFixed(2));
    return {
      id: plan.id,
      name: plan.name,
      priceUsd: plan.priceUsd,
      interval: plan.interval,
      badge: plan.badge,
      description: plan.description,
      features: plan.features,
      currency: requestedCurrency in CURRENCY_RATES ? requestedCurrency : 'USD',
      localizedAmount,
    };
  });

  return res.json({
    appName: 'Lifestyle Spark',
    connectedPortalUrl: 'https://lifestyle.radiantsparkllc.com/',
    stripeConnected: Boolean(stripeClient),
    paymentLinkConfigured: Boolean(paymentLinkUrl),
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    mode: stripeClient ? 'checkout_session' : paymentLinkUrl ? 'payment_link' : 'unconfigured',
    supportedCurrencies: Object.keys(CURRENCY_RATES),
    plans,
  });
});

app.get('/api/stripe/config', (_req, res) => {
  const paymentLinkUrl = process.env.STRIPE_PAYMENT_LINK_URL || process.env.VITE_STRIPE_PAYMENT_LINK_URL || null;
  return res.json({
    appName: 'Lifestyle Spark',
    connectedPortalUrl: 'https://lifestyle.radiantsparkllc.com/',
    configured: Boolean(stripeClient),
    paymentLinkConfigured: Boolean(paymentLinkUrl),
    paymentLinkUrl,
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    mode: stripeClient ? 'checkout_session' : paymentLinkUrl ? 'payment_link' : 'unconfigured',
    supportedCurrencies: Object.keys(CURRENCY_RATES),
    zeroDecimalCurrencies: ['JPY'],
    plansCount: SUBSCRIPTION_PLANS.length,
    settlementNote:
      'Charges process through official Stripe Checkout (Visa, Mastercard, Amex, Apple Pay, Google Pay, Link) and settle directly to your linked Radiant Spark Stripe business account.',
  });
});

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const {
      planId,
      planName,
      currency = 'USD',
      email,
      fullName,
      returnPath = '/#lifestyle',
    } = req.body || {};

    const resolvedPlan = resolveSubscriptionPlan(planId, planName);
    const cleanCurrency = String(currency || 'USD').toUpperCase();
    const currencyCfg = CURRENCY_RATES[cleanCurrency] || CURRENCY_RATES.USD;

    if (!stripeClient) {
      const paymentLinkUrl = process.env.STRIPE_PAYMENT_LINK_URL || process.env.VITE_STRIPE_PAYMENT_LINK_URL;
      if (paymentLinkUrl) {
        const u = new URL(paymentLinkUrl);
        if (email) u.searchParams.set('prefilled_email', String(email).trim());
        return res.json({
          mode: 'payment_link',
          url: u.toString(),
          planId: resolvedPlan.id,
          planName: resolvedPlan.name,
          currency: cleanCurrency,
        });
      }
      return res.status(503).json({
        code: 'STRIPE_NOT_CONFIGURED',
        planId: resolvedPlan.id,
        planName: resolvedPlan.name,
        error:
          'STRIPE_SECRET_KEY is not configured in server secrets yet. Add your Stripe secret key (sk_live_... or sk_test_...) in environment variables (or configure STRIPE_PAYMENT_LINK_URL) to enable live global card charges into your Stripe business account.',
      });
    }

    const origin = resolveRequestOrigin(req);
    const cleanReturnPath = String(returnPath).startsWith('/') ? String(returnPath) : '/#lifestyle';
    const separator = cleanReturnPath.includes('?') ? '&' : '?';
    const hashSplit = cleanReturnPath.split('#');
    const basePart = hashSplit[0] || '/';
    const hashPart = hashSplit[1] ? `#${hashSplit[1]}` : '';

    const successUrl = `${origin}${basePart}${basePart.includes('?') ? '&' : '?'}checkout=success&session_id={CHECKOUT_SESSION_ID}${hashPart}`;
    const cancelUrl = `${origin}${basePart}${separator}checkout=cancelled${hashPart}`;

    const rawAmount = resolvedPlan.priceUsd * currencyCfg.rate;
    const unitAmount = currencyCfg.zeroDecimal ? Math.round(rawAmount) : Math.round(rawAmount * 100);

    const token = extractRequestToken(req);
    const claims = verifySessionToken(token);

    const isRecurring = resolvedPlan.interval === 'month' || resolvedPlan.interval === 'year';

    const session = await stripeClient.checkout.sessions.create({
      mode: isRecurring ? 'subscription' : 'payment',
      customer_email: email && String(email).includes('@') ? String(email).trim() : claims?.email || undefined,
      client_reference_id: claims?.uid || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: cleanCurrency.toLowerCase(),
            unit_amount: unitAmount,
            product_data: {
              name: resolvedPlan.name,
              description: `Radiant Spark Lifestyle Spark Global Plan (${cleanCurrency}) — Diet Plans, Recipes & Workouts`,
            },
            ...(isRecurring
              ? {
                  recurring: {
                    interval: resolvedPlan.interval === 'year' ? 'year' : 'month',
                  },
                }
              : {}),
          },
        },
      ],
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        appName: 'Lifestyle Spark',
        portalUrl: 'https://lifestyle.radiantsparkllc.com/',
        planId: resolvedPlan.id,
        planName: resolvedPlan.name,
        customerName: fullName ? String(fullName) : '',
        userId: claims?.uid || '',
        currency: cleanCurrency,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({
      mode: 'checkout_session',
      sessionId: session.id,
      url: session.url,
      planId: resolvedPlan.id,
      planName: resolvedPlan.name,
      currency: cleanCurrency,
    });
  } catch (err: any) {
    console.error('[Stripe Checkout Error]:', err);
    return res.status(500).json({
      error: err?.message || 'Unable to create Stripe checkout session.',
    });
  }
});

app.get('/api/stripe/verify-session', async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }
    if (!stripeClient) {
      return res.status(503).json({ error: 'Stripe server key not configured' });
    }

    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    const isPaid = session.payment_status === 'paid' || session.status === 'complete';

    if (isPaid) {
      await activateUserSubscription({
        email: session.customer_details?.email || session.customer_email,
        userId: session.metadata?.userId || session.client_reference_id,
        planName: session.metadata?.planName || 'Lifestyle Spark Pro',
        currency: session.currency?.toUpperCase() || session.metadata?.currency || 'USD',
        customerId: typeof session.customer === 'string' ? session.customer : null,
        sessionId: session.id,
      });
    }

    return res.json({
      verified: isPaid,
      paymentStatus: session.payment_status,
      status: session.status,
      amountTotal: session.amount_total,
      currency: session.currency?.toUpperCase() || 'USD',
      planName: session.metadata?.planName || 'Lifestyle Spark Pro',
      customerEmail: session.customer_details?.email || session.customer_email || null,
      sessionId: session.id,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to verify Stripe session' });
  }
});

app.post('/api/stripe/webhook', async (req: any, res) => {
  if (!stripeClient) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    const sig = req.header('stripe-signature');
    if (!sig) return res.status(400).send('Missing stripe-signature');
    try {
      event = stripeClient.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Signature Error: ${err?.message}`);
    }
  } else {
    event = req.body as Stripe.Event;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await activateUserSubscription({
      email: session.customer_details?.email || session.customer_email,
      userId: session.metadata?.userId || session.client_reference_id,
      planName: session.metadata?.planName || 'Lifestyle Spark Pro',
      currency: session.currency?.toUpperCase() || 'USD',
      customerId: typeof session.customer === 'string' ? session.customer : null,
      sessionId: session.id,
    });
  }

  return res.json({ received: true });
});

// ============================================================================
// PLATFORM HEALTH, B2B INQUIRIES, ANALYTICS & GEMINI ENDPOINTS
// ============================================================================

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
    stripeConfigured: Boolean(stripeClient),
    sourcesStatus: dealState.sourcesStatus,
  });
});

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

app.get('/api/owner/overview', async (_req, res) => {
  const [inquiries, suppliers, analytics, users] = await Promise.all([
    readJsonFile<any[]>(INQUIRIES_FILE, []),
    readJsonFile<any[]>(SUPPLIERS_FILE, []),
    readJsonFile<any>(ANALYTICS_FILE, {
      dealClicks: 0,
      inquirySubmissions: 0,
      supplierSubmissions: 0,
      recentEvents: [],
    }),
    readJsonFile<StoredUser[]>(USERS_FILE, []),
  ]);

  return res.json({
    inquiries,
    suppliers,
    analytics,
    lifesparkMembersCount: users.length,
    activeSubscriptionsCount: users.filter((u) => u.subscriptionStatus === 'active').length,
    stripeConfigured: Boolean(stripeClient),
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    affiliateTagsConfigured: Boolean(process.env.AMAZON_AFFILIATE_TAG || process.env.AMAZON_INDIA_TAG),
  });
});

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
  void runServerDealsRefresh();

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

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
