import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const FRESHNESS_LIMIT_MINUTES = 360; // 6 hours max price trustworthiness window
export const REFRESH_INTERVAL_MINUTES = 15;

export const AFFILIATE_DISCLOSURE =
  'Disclosure: SparkDeals links directly to third-party retailer offers and deal listings. Some outbound links may contain affiliate tracking parameters at no extra cost to buyers. Verify final pricing, taxes, shipping, and stock directly on the merchant checkout page.';

const DEFAULT_FALLBACK_IMAGES = {
  electronics: './assets/sparkdeals-tech.jpg',
  home: './assets/spark-it.jpg',
  gaming: './assets/sparkdeals-tech.jpg',
  apparel: './assets/radiant-sparkle-logo.png',
  energy: './assets/spark-ev.jpg',
  beverages: './assets/sparkle-drinks.jpg',
  food: './assets/spicy-sparkle-naturals.jpg',
  lifestyle: './assets/lifespark-meal-prep.jpg',
  logistics: './assets/sparkle-distribution.jpg',
};

function decodeEntities(str = '') {
  return String(str)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(str = '') {
  return decodeEntities(str)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTagValue(xml, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function getTagAttribute(xml, tagName, attrName) {
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedAttr = attrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = xml.match(new RegExp(`<${escapedTag}[^>]*\\s${escapedAttr}=["']([^"']+)["']`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function normalizePriceNumber(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const num = Number(String(raw).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}

function extractPricesFromText(title, description, explicitPriceStr = '') {
  const explicitPrice = normalizePriceNumber(explicitPriceStr);

  // Look for current price in title if explicit tag wasn't provided
  let currentPrice = explicitPrice;
  if (!currentPrice) {
    const titlePriceMatch = title.match(/\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|\d+(?:\.\d{1,2})?)/);
    if (titlePriceMatch) {
      currentPrice = normalizePriceNumber(titlePriceMatch[1]);
    }
  }
  if (!currentPrice) {
    const descPriceMatch = description.match(/(?:for|on sale for|price(?: is)?|now)\s*\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|\d+(?:\.\d{1,2})?)/i);
    if (descPriceMatch) {
      currentPrice = normalizePriceNumber(descPriceMatch[1]);
    }
  }

  // Only extract an original / reference price when explicitly stated
  let originalPrice = null;
  const combined = `${title} ${description}`;
  const refPatterns = [
    /off\s+(?:the\s+|its\s+)?\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(?:list|reg|regular|original|msrp)?/i,
    /(?:list price|reg\.?|regular(?:ly)?|was|msrp|usually|compare at|retail price)[:\s]*(?:of\s*)?\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,
    /\(\s*(?:reg\.?|was|list)\s*\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*\)/i,
  ];

  for (const pat of refPatterns) {
    const m = combined.match(pat);
    if (m && m[1]) {
      const candidate = normalizePriceNumber(m[1]);
      if (candidate && currentPrice && candidate > currentPrice && candidate < currentPrice * 15) {
        originalPrice = candidate;
        break;
      }
    }
  }

  let discountPercent = null;
  if (currentPrice && originalPrice && originalPrice > currentPrice) {
    discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    if (discountPercent <= 0 || discountPercent >= 95) {
      originalPrice = null;
      discountPercent = null;
    }
  }

  return { currentPrice, originalPrice, discountPercent };
}

function extractCouponCode(text) {
  const m = text.match(/(?:apply\s+)?(?:coupon|promo)\s+code\s*[:\-]?\s*["']?([A-Z0-9]{4,20})["']?/i);
  return m ? m[1].toUpperCase() : null;
}

function mapCategory(rawCategory = '', title = '') {
  const hay = `${rawCategory} ${title}`.toLowerCase();
  if (/\b(tv|oled|qled|laptop|macbook|ipad|tablet|headphone|headphones|earbud|earbuds|airpod|airpods|ssd|nvme|monitor|usb|charger|router|camera|speaker|smartwatch|watch|iphone|pixel|gpu|cpu|pc|keyboard|mouse|tech|electronic|electronics|computer|audio|roku|fire stick|kindle)\b/.test(hay)) {
    return 'electronics';
  }
  if (/\b(playstation|ps5|xbox|nintendo|switch|gaming|game|controller|steam|rtx)\b/.test(hay)) {
    return 'gaming';
  }
  if (/\b(solar|ev|battery|batteries|power station|inverter|generator|panel|ups|ecoflow|jackery)\b/.test(hay)) {
    return 'energy';
  }
  if (/\b(shirt|jacket|shoe|shoes|sneaker|sneakers|jeans|pant|pants|hoodie|apparel|clothing|boot|boots|backpack|travel pack|pack|luggage|bag|sunglass|sunglasses|coat|sweater|socks)\b/.test(hay)) {
    return 'apparel';
  }
  if (/\b(drink|coffee|tea|tumbler|bottle|beverage|espresso|water|yeti|stanley)\b/.test(hay)) {
    return 'beverages';
  }
  if (/\b(food|snack|snacks|almond|almonds|cashew|grocery|protein|chocolate|kitchen|air fryer|blender|cookware|skillet|pan|knife|coffee maker|instant pot)\b/.test(hay)) {
    return 'food';
  }
  if (/\b(tool|tools|drill|dewalt|milwaukee|ryobi|spotlight|light|bulb|vacuum|mattress|chair|desk|patio|home|garden|furniture|heater|fan|storage|shelf)\b/.test(hay)) {
    return 'home';
  }
  return 'lifestyle';
}

const AGGREGATOR_HOSTS = ['dealnews.com', 'slickdeals.net', 'slickdeals.com', 'feedburner.com'];

const DIRECT_RETAILER_DOMAINS = [
  'amazon.com',
  'amazon.in',
  'amzn.to',
  'walmart.com',
  'bestbuy.com',
  'target.com',
  'homedepot.com',
  'lowes.com',
  'costco.com',
  'newegg.com',
  'ebay.com',
  'bhphotovideo.com',
  'adorama.com',
  'samsung.com',
  'apple.com',
  'lenovo.com',
  'dell.com',
  'hp.com',
  'woot.com',
  'flipkart.com',
  'staples.com',
  'officedepot.com',
  'macys.com',
  'kohls.com',
  'nike.com',
  'adidas.com',
  'lego.com',
];

function unwrapCandidateUrl(rawUrl) {
  try {
    const cleaned = decodeEntities(String(rawUrl || '').trim())
      .replace(/\u200B|%E2%80%8B/gi, '');
    if (!cleaned || cleaned.includes('...')) return null;
    let current = new URL(cleaned);
    // Unwrap nested redirect params commonly embedded in Slickdeals / DealNews HTML links
    for (let depth = 0; depth < 3; depth++) {
      const nested =
        current.searchParams.get('u2') ||
        current.searchParams.get('mpre') ||
        current.searchParams.get('url') ||
        current.searchParams.get('u') ||
        current.searchParams.get('dest') ||
        current.searchParams.get('rd');
      if (nested && /^https?:\/\//i.test(nested) && !nested.includes('...')) {
        current = new URL(nested.replace(/\u200B|%E2%80%8B/gi, ''));
      } else {
        break;
      }
    }
    const host = current.hostname.toLowerCase();
    const parts = host.split('.').filter(Boolean);
    if (parts.length < 2) return null;
    if (parts[0] === 'www' && parts.length < 3) return null;
    const tld = parts[parts.length - 1];
    if (!/^[a-z]{2,6}$/i.test(tld)) return null;
    return current;
  } catch {
    return null;
  }
}

function isAggregatorHost(hostname = '') {
  const h = hostname.toLowerCase();
  return AGGREGATOR_HOSTS.some((agg) => h === agg || h.endsWith(`.${agg}`));
}

function isDirectRetailerHost(hostname = '') {
  const h = hostname.toLowerCase();
  return DIRECT_RETAILER_DOMAINS.some((dom) => h === dom || h.endsWith(`.${dom}`));
}

export function getEnvMonetizationConfig() {
  return {
    amazonUsTag: (process.env.AMAZON_AFFILIATE_TAG || '').trim(),
    amazonInTag: (process.env.AMAZON_INDIA_TAG || '').trim(),
    walmartImpactId: (process.env.WALMART_IMPACT_ID || '').trim(),
    bestBuyImpactId: (process.env.BESTBUY_IMPACT_ID || '').trim(),
    ebayCampId: (process.env.EBAY_CAMPAIGN_ID || '').trim(),
    skimlinksPubId: (process.env.SKIMLINKS_PUBLISHER_ID || '').trim(),
    sovrnKey: (process.env.SOVRN_API_KEY || '').trim(),
  };
}

export function applyAffiliateTagToUrl(rawUrl, cfg = getEnvMonetizationConfig()) {
  const parsed = unwrapCandidateUrl(rawUrl);
  if (!parsed || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
    return {
      url: String(rawUrl || ''),
      isDirectMerchant: false,
      isTagged: false,
      network: null,
    };
  }

  const host = parsed.hostname.toLowerCase();
  const isAgg = isAggregatorHost(host);
  let isTagged = false;
  let network = null;

  if (host.includes('amazon.com')) {
    if (cfg.amazonUsTag) {
      parsed.searchParams.set('tag', cfg.amazonUsTag);
      isTagged = true;
      network = 'Amazon Associates US';
    }
  } else if (host.includes('amazon.in')) {
    if (cfg.amazonInTag) {
      parsed.searchParams.set('tag', cfg.amazonInTag);
      isTagged = true;
      network = 'Amazon Associates IN';
    }
  } else if (host.includes('walmart.com')) {
    if (cfg.walmartImpactId) {
      parsed.searchParams.set('wmlspartner', cfg.walmartImpactId);
      isTagged = true;
      network = 'Walmart Creator / Impact';
    }
  } else if (host.includes('bestbuy.com')) {
    if (cfg.bestBuyImpactId) {
      parsed.searchParams.set('irgwc', '1');
      parsed.searchParams.set('mpid', cfg.bestBuyImpactId);
      isTagged = true;
      network = 'Best Buy Affiliate / Impact';
    }
  } else if (host.includes('ebay.com')) {
    if (cfg.ebayCampId) {
      parsed.searchParams.set('mkcid', '1');
      parsed.searchParams.set('campid', cfg.ebayCampId);
      isTagged = true;
      network = 'eBay Partner Network';
    }
  }

  if (!isAgg) {
    if (!parsed.searchParams.has('utm_source')) {
      parsed.searchParams.set('utm_source', 'radiantspark');
      parsed.searchParams.set('utm_medium', 'sparkdeals');
    }

    // Universal sub-affiliate wrapper when retailer doesn't have an explicit 1P tag configured
    if (!isTagged && cfg.skimlinksPubId) {
      const wrapped = `https://go.redirectingat.com/?id=${encodeURIComponent(cfg.skimlinksPubId)}&url=${encodeURIComponent(parsed.toString())}`;
      return {
        url: wrapped,
        isDirectMerchant: true,
        isTagged: true,
        network: 'Skimlinks Multi-Merchant',
      };
    }
    if (!isTagged && cfg.sovrnKey) {
      const wrapped = `https://redirect.viglink.com?key=${encodeURIComponent(cfg.sovrnKey)}&u=${encodeURIComponent(parsed.toString())}`;
      return {
        url: wrapped,
        isDirectMerchant: true,
        isTagged: true,
        network: 'Sovrn //Commerce',
      };
    }
  }

  return {
    url: parsed.toString(),
    isDirectMerchant: !isAgg,
    isTagged,
    network,
  };
}

function extractDirectMerchantLinks(htmlOrText = '', fallbackUrl = '', cfg = getEnvMonetizationConfig()) {
  const decodedHtml = decodeEntities(String(htmlOrText || ''));
  const hrefMatches = Array.from(decodedHtml.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi), (m) => m[1]);
  const textMatches = decodedHtml.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const rawUrls = [...hrefMatches, ...textMatches, ...(fallbackUrl ? [fallbackUrl] : [])];
  let amazonUsaUrl;
  let amazonIndiaUrl;
  let walmartUrl;
  let directMerchantUrl;
  let bestNetwork = null;
  let bestTagged = false;

  for (const raw of rawUrls) {
    const u = unwrapCandidateUrl(raw);
    if (!u) continue;
    const host = u.hostname.toLowerCase();
    if (isAggregatorHost(host)) continue;

    // Skip image/CDN asset URLs that are not checkout/product pages
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg|css|js|ico)(\?|$)/i.test(u.pathname)) continue;
    if (
      host.includes('slickdealscdn') ||
      host.includes('d3gqasl9vmjfd8') ||
      host.includes('dlnws.com') ||
      host.includes('dealnews')
    ) {
      continue;
    }

    const tagged = applyAffiliateTagToUrl(u.toString(), cfg);
    if (host.includes('amazon.com') && !amazonUsaUrl) {
      amazonUsaUrl = tagged.url;
    } else if (host.includes('amazon.in') && !amazonIndiaUrl) {
      amazonIndiaUrl = tagged.url;
    } else if (host.includes('walmart.com') && !walmartUrl) {
      walmartUrl = tagged.url;
    }

    if (!directMerchantUrl && (isDirectRetailerHost(host) || !isAggregatorHost(host))) {
      directMerchantUrl = tagged.url;
      bestNetwork = tagged.network;
      bestTagged = tagged.isTagged;
    }
  }

  return {
    amazonUsaUrl,
    amazonIndiaUrl,
    walmartUrl,
    directMerchantUrl: directMerchantUrl || amazonUsaUrl || amazonIndiaUrl || walmartUrl || null,
    isTagged: bestTagged,
    affiliateNetwork: bestNetwork,
  };
}

function normalizeMerchantName(raw = '', link = '') {
  const s = String(raw || '').trim();
  const lower = s.toLowerCase();
  if (lower.includes('amazon.in')) return 'Amazon India';
  if (lower.includes('amazon')) return 'Amazon USA';
  if (lower.includes('walmart')) return 'Walmart';
  if (lower.includes('homedepot') || lower.includes('home depot')) return 'Home Depot';
  if (lower.includes('bestbuy') || lower.includes('best buy')) return 'Best Buy';
  if (lower.includes('target')) return 'Target';
  if (lower.includes('lowes') || lower.includes("lowe's")) return "Lowe's";
  if (lower.includes('costco')) return 'Costco';
  if (lower.includes('newegg')) return 'Newegg';
  if (lower.includes('ebay')) return 'eBay';
  if (lower.includes('woot')) return 'Woot';
  if (lower.includes('lenovo')) return 'Lenovo';
  if (lower.includes('samsung')) return 'Samsung';
  if (lower.includes('flipkart')) return 'Flipkart';
  if (lower.includes('bhphotovideo') || lower.includes('b&h')) return 'B&H Photo';
  if (lower.includes('adorama')) return 'Adorama';
  if (s) {
    return s
      .replace(/^www\./i, '')
      .replace(/\.com$/i, '')
      .replace(/^\w/, (c) => c.toUpperCase());
  }
  if (link.includes('amazon.in')) return 'Amazon India';
  if (link.includes('amazon.com')) return 'Amazon USA';
  return 'Verified Merchant';
}

function buildDirectDealUrl(rawUrl) {
  const tagged = applyAffiliateTagToUrl(rawUrl);
  return tagged.url;
}

function isDealExpiredOrUnavailable(title, description, expiresIso) {
  const hay = `${title} ${description}`.toLowerCase();
  if (/\b(expired|out of stock|sold out|no longer available|deal ended|ood)\b/.test(hay)) {
    return true;
  }
  if (expiresIso) {
    const expMs = Date.parse(expiresIso);
    if (!Number.isNaN(expMs) && expMs <= Date.now()) {
      return true;
    }
  }
  return false;
}

async function fetchWithRetry(url, retries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const started = Date.now();
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'RadiantSparkDealsSync/2.0 (+https://radiantsparkllc.com)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(9000),
      });

      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after')) || (attempt + 1) * 1.5;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, Math.min(retryAfter * 1000, 4000)));
          continue;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const text = await res.text();
      return { text, durationMs: Date.now() - started };
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 800));
      }
    }
  }
  throw lastError || new Error('Feed fetch failed');
}

function parseDealNewsXml(xmlText, sourceName) {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const parsed = [];

  for (const itemXml of items) {
    const rawTitle = stripHtml(getTagValue(itemXml, 'title'));
    const link = buildDirectDealUrl(getTagValue(itemXml, 'link'));
    const rawDescHtml = getTagValue(itemXml, 'description');
    const summaryAttrMatch = rawDescHtml.match(/title="([^"]+)"/i);
    const description = stripHtml(summaryAttrMatch ? decodeEntities(summaryAttrMatch[1]) : rawDescHtml)
      .replace(/Buy Now at .*$/i, '')
      .trim();

    const retailerRaw = getTagValue(itemXml, 'dealnews:retailer');
    const merchant = normalizeMerchantName(retailerRaw, link);
    const expiresRaw = getTagValue(itemXml, 'dealnews:expires');
    const priceAttrCurrency = getTagAttribute(itemXml, 'dealnews:price', 'currency') || 'USD';
    const priceRaw = getTagValue(itemXml, 'dealnews:price');
    const rawCat = getTagValue(itemXml, 'dealnews:category');
    const pubDate = getTagValue(itemXml, 'pubDate');
    const imageAttr = getTagAttribute(itemXml, 'media:content', 'url');
    const imgFallbackMatch = rawDescHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    const rawImage = imageAttr || (imgFallbackMatch ? decodeEntities(imgFallbackMatch[1]) : '');

    if (!rawTitle || !link) continue;
    if (isDealExpiredOrUnavailable(rawTitle, description, expiresRaw)) continue;

    const { currentPrice, originalPrice, discountPercent } = extractPricesFromText(rawTitle, description, priceRaw);
    if (!currentPrice) continue;

    const category = mapCategory(rawCat, rawTitle);
    const couponCode = extractCouponCode(description);
    const isBlackFriday = /(black friday|cyber monday|thanksgiving|holiday|doorbuster)/i.test(`${rawTitle} ${description} ${rawCat}`);
    const isStaffPick = getTagValue(itemXml, 'dealnews:staffPick').toLowerCase() === 'true';

    let expiresInHours = null;
    let expiresAt = null;
    if (expiresRaw) {
      const expMs = Date.parse(expiresRaw);
      if (!Number.isNaN(expMs)) {
        expiresAt = new Date(expMs).toISOString();
        expiresInHours = Math.max(1, Math.round((expMs - Date.now()) / 3600000));
      }
    }

    const badges = [merchant];
    if (isBlackFriday) badges.unshift('Black Friday 2026');
    else if (isStaffPick) badges.unshift('Editor Pick');
    if (discountPercent && discountPercent >= 15) badges.push(`${discountPercent}% OFF`);
    if (/free shipping|free s&h/i.test(`${rawTitle} ${description}`)) badges.push('Free Shipping');

    const idHash = crypto.createHash('sha1').update(`dn:${rawTitle}:${merchant}`).digest('hex').slice(0, 10);
    const merchantLinks = extractDirectMerchantLinks(rawDescHtml, link);
    const preferredOutbound = merchantLinks.directMerchantUrl || link;
    const monetizationStatus = merchantLinks.isTagged
      ? 'affiliate_tagged'
      : merchantLinks.directMerchantUrl
      ? 'direct_merchant_untagged'
      : 'aggregator_source_only';

    parsed.push({
      id: `dn-${idHash}`,
      title: rawTitle.replace(/\s+for\s+\$[\d,.]+.*$/i, '').trim() || rawTitle,
      category,
      currentPrice,
      originalPrice,
      discountPercent,
      currency: priceAttrCurrency === 'INR' ? 'INR' : 'USD',
      merchant: merchant === 'Verified Merchant' && merchantLinks.directMerchantUrl ? normalizeMerchantName('', merchantLinks.directMerchantUrl) : merchant,
      merchantVerified: true,
      score: isStaffPick ? 280 : isBlackFriday ? 220 : 140,
      couponCode,
      affiliateUrl: preferredOutbound,
      directMerchantUrl: merchantLinks.directMerchantUrl,
      monetizationStatus,
      affiliateNetwork: merchantLinks.affiliateNetwork,
      amazonUsaUrl: merchantLinks.amazonUsaUrl,
      amazonIndiaUrl: merchantLinks.amazonIndiaUrl,
      walmartUrl: merchantLinks.walmartUrl,
      primaryStore: merchant === 'Verified Merchant' && merchantLinks.directMerchantUrl ? normalizeMerchantName('', merchantLinks.directMerchantUrl) : merchant,
      imageUrl: rawImage || DEFAULT_FALLBACK_IMAGES[category],
      description: description || `${rawTitle} available at ${merchant}.`,
      badges: badges.slice(0, 3),
      expiresInHours,
      expiresAt,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      availability: 'Listed In Stock at Check Time',
      sourceFeed: sourceName,
      isBlackFriday,
      specifications: [
        `Retailer: ${merchant}`,
        rawCat ? `Category: ${rawCat}` : `Department: ${category}`,
        couponCode ? `Coupon Code: ${couponCode}` : 'No coupon code required',
        `Source: ${sourceName}`,
      ],
      highlight: `Verified from ${sourceName} for ${merchant}. Click View Deal to confirm current checkout availability.`,
    });
  }

  return parsed;
}

function parseSlickdealsXml(xmlText, sourceName, forceBlackFriday = false) {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const parsed = [];

  for (const itemXml of items) {
    const rawTitle = stripHtml(getTagValue(itemXml, 'title'));
    const link = buildDirectDealUrl(getTagValue(itemXml, 'link'));
    const contentHtml = getTagValue(itemXml, 'content:encoded') || getTagValue(itemXml, 'description');
    const description = stripHtml(contentHtml)
      .replace(/^Thumb Score:\s*\+?-?\d+\s*/i, '')
      .slice(0, 320);
    const pubDate = getTagValue(itemXml, 'pubDate');

    const exitSiteMatch = contentHtml.match(/data-product-exitWebsite=["']([^"']+)["']/i);
    const bracketSiteMatch = description.match(/([A-Za-z0-9 '&.-]+?)\s*\[([a-z0-9.-]+\.[a-z]{2,})\]/i);
    const retailerRaw = exitSiteMatch ? exitSiteMatch[1] : bracketSiteMatch ? bracketSiteMatch[2] : '';
    const merchant = normalizeMerchantName(retailerRaw, link);

    const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    const rawImage = imgMatch ? decodeEntities(imgMatch[1]) : '';

    const thumbMatch = contentHtml.match(/Thumb Score:\s*\+?(-?\d+)/i);
    const thumbScore = thumbMatch ? Number(thumbMatch[1]) : 0;
    if (thumbScore < -2) continue;

    if (!rawTitle || !link) continue;
    if (isDealExpiredOrUnavailable(rawTitle, description, null)) continue;

    const { currentPrice, originalPrice, discountPercent } = extractPricesFromText(rawTitle, description);
    if (!currentPrice) continue;

    const category = mapCategory('', rawTitle);
    const couponCode = extractCouponCode(description);
    const isBlackFriday =
      forceBlackFriday || /(black friday|cyber monday|thanksgiving|holiday|doorbuster)/i.test(`${rawTitle} ${description}`);

    const badges = [merchant];
    if (isBlackFriday) badges.unshift('Black Friday 2026');
    if (discountPercent && discountPercent >= 15) badges.push(`${discountPercent}% OFF`);
    if (/free shipping|free s&h/i.test(`${rawTitle} ${description}`)) badges.push('Free Shipping');

    const idHash = crypto.createHash('sha1').update(`sd:${rawTitle}:${merchant}`).digest('hex').slice(0, 10);
    const merchantLinks = extractDirectMerchantLinks(contentHtml, link);
    const resolvedMerchant =
      merchant === 'Verified Merchant' && merchantLinks.directMerchantUrl
        ? normalizeMerchantName('', merchantLinks.directMerchantUrl)
        : merchant;
    const preferredOutbound = merchantLinks.directMerchantUrl || link;
    const monetizationStatus = merchantLinks.isTagged
      ? 'affiliate_tagged'
      : merchantLinks.directMerchantUrl
      ? 'direct_merchant_untagged'
      : 'aggregator_source_only';

    const cleanTitle = rawTitle
      .replace(/\s+\$[\d,.]+(?:\s*\+\s*Free\s*(?:Shipping|S&H))?$/i, '')
      .trim() || rawTitle;

    parsed.push({
      id: `sd-${idHash}`,
      title: cleanTitle,
      category,
      currentPrice,
      originalPrice,
      discountPercent,
      currency: 'USD',
      merchant: resolvedMerchant,
      merchantVerified: true,
      score: Math.max(50, 120 + thumbScore * 12),
      couponCode,
      affiliateUrl: preferredOutbound,
      directMerchantUrl: merchantLinks.directMerchantUrl,
      monetizationStatus,
      affiliateNetwork: merchantLinks.affiliateNetwork,
      amazonUsaUrl: merchantLinks.amazonUsaUrl,
      amazonIndiaUrl: merchantLinks.amazonIndiaUrl,
      walmartUrl: merchantLinks.walmartUrl,
      primaryStore: resolvedMerchant,
      imageUrl: rawImage || DEFAULT_FALLBACK_IMAGES[category],
      description: description || `${cleanTitle} listed at ${resolvedMerchant}.`,
      badges: badges.slice(0, 3),
      expiresInHours: null,
      expiresAt: null,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      availability: 'Listed Active at Check Time',
      sourceFeed: sourceName,
      isBlackFriday,
      specifications: [
        `Retailer: ${resolvedMerchant}`,
        `Community Votes: +${Math.max(0, thumbScore)}`,
        couponCode ? `Coupon Code: ${couponCode}` : 'Direct Store Offer',
        `Source: ${sourceName}`,
      ],
      highlight: `Live community-vetted offer from ${sourceName} at ${resolvedMerchant}. Confirm final price & stock on retailer page.`,
    });
  }

  return parsed;
}

function deduplicateDeals(deals) {
  const map = new Map();
  for (const deal of deals) {
    const normTitle = deal.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 6)
      .join(' ');
    const key = `${normTitle}|${deal.merchant.toLowerCase()}|${Math.round(deal.currentPrice)}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, deal);
    } else {
      // Keep the richer entry (prefer one with originalPrice / expiration / higher score)
      const existingRank = (existing.originalPrice ? 50 : 0) + (existing.expiresAt ? 20 : 0) + existing.score;
      const newRank = (deal.originalPrice ? 50 : 0) + (deal.expiresAt ? 20 : 0) + deal.score;
      if (newRank > existingRank) {
        map.set(key, deal);
      }
    }
  }
  return Array.from(map.values());
}

export async function refreshLiveDealsFeed({ writePublicJson = true } = {}) {
  const sources = [
    {
      id: 'dealnews-electronics',
      name: 'DealNews Electronics RSS',
      url: 'https://www.dealnews.com/c142/Electronics/?rss=1',
      parser: (xml) => parseDealNewsXml(xml, 'DealNews Electronics RSS'),
    },
    {
      id: 'slickdeals-bf-electronics',
      name: 'Slickdeals Black Friday Electronics',
      url: 'https://slickdeals.net/newsearch.php?q=black+friday+tv+laptop+apple+headphones&searcharea=deals&searchin=first&rss=1',
      parser: (xml) => parseSlickdealsXml(xml, 'Slickdeals Black Friday Electronics', true),
    },
    {
      id: 'slickdeals-electronics',
      name: 'Slickdeals Electronics Frontpage',
      url: 'https://slickdeals.net/newsearch.php?category=electronics&mode=frontpage&searcharea=deals&searchin=first&rss=1',
      parser: (xml) => parseSlickdealsXml(xml, 'Slickdeals Electronics Frontpage', false),
    },
    {
      id: 'dealnews-live',
      name: 'DealNews Verified RSS',
      url: 'https://www.dealnews.com/?rss=1',
      parser: (xml) => parseDealNewsXml(xml, 'DealNews Verified RSS'),
    },
    {
      id: 'slickdeals-blackfriday',
      name: 'Slickdeals Black Friday 2026',
      url: 'https://slickdeals.net/newsearch.php?q=black+friday&searcharea=deals&searchin=first&rss=1',
      parser: (xml) => parseSlickdealsXml(xml, 'Slickdeals Black Friday 2026', true),
    },
    {
      id: 'slickdeals-frontpage',
      name: 'Slickdeals Frontpage Deals',
      url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',
      parser: (xml) => parseSlickdealsXml(xml, 'Slickdeals Frontpage Deals', false),
    },
  ];

  const sourcesStatus = [];
  const allFetched = [];
  const nowIso = new Date().toISOString();

  await Promise.all(
    sources.map(async (src) => {
      try {
        const { text, durationMs } = await fetchWithRetry(src.url, 2);
        const items = src.parser(text);
        allFetched.push(...items);
        sourcesStatus.push({
          id: src.id,
          name: src.name,
          status: items.length > 0 ? 'ok' : 'degraded',
          itemCount: items.length,
          durationMs,
          checkedAt: nowIso,
        });
      } catch (err) {
        sourcesStatus.push({
          id: src.id,
          name: src.name,
          status: 'error',
          itemCount: 0,
          durationMs: 0,
          checkedAt: nowIso,
          error: err?.message || 'Source unavailable',
        });
      }
    })
  );

  // Deduplicate & sort newest/Black Friday electronics offers prominently
  const deduped = deduplicateDeals(allFetched).sort((a, b) => {
    const aBfElec = (a.isBlackFriday && (a.category === 'electronics' || a.category === 'gaming')) ? 1 : 0;
    const bBfElec = (b.isBlackFriday && (b.category === 'electronics' || b.category === 'gaming')) ? 1 : 0;
    if (bBfElec !== aBfElec) return bBfElec - aBfElec;
    const tA = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tB = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tB - tA || b.score - a.score;
  });

  const healthySources = sourcesStatus.filter((s) => s.status === 'ok').length;
  const anyHealthy = healthySources > 0 && deduped.length > 0;

  const publicJsonPath = path.resolve(process.cwd(), 'public/deals-feed.json');
  let previousPayload = null;
  try {
    const existingRaw = await fs.readFile(publicJsonPath, 'utf8');
    previousPayload = JSON.parse(existingRaw);
  } catch {
    previousPayload = null;
  }

  const lastSuccessfulSyncAt = anyHealthy
    ? nowIso
    : previousPayload?.lastSuccessfulSyncAt || null;

  const ageMinutes = lastSuccessfulSyncAt
    ? Math.max(0, Math.round((Date.now() - Date.parse(lastSuccessfulSyncAt)) / 60000))
    : FRESHNESS_LIMIT_MINUTES + 1;

  const isStale = !anyHealthy && ageMinutes > FRESHNESS_LIMIT_MINUTES;

  // Never serve stale prices if freshness limit exceeded
  const finalDeals = anyHealthy
    ? deduped.slice(0, 96)
    : !isStale && Array.isArray(previousPayload?.deals)
    ? previousPayload.deals
    : [];

  const payload = {
    status: anyHealthy ? (healthySources === sources.length ? 'online' : 'partial') : 'degraded',
    lastRefreshedAt: nowIso,
    lastSuccessfulSyncAt,
    refreshIntervalMinutes: REFRESH_INTERVAL_MINUTES,
    freshnessLimitMinutes: FRESHNESS_LIMIT_MINUTES,
    isStale,
    totalDeals: finalDeals.length,
    connectedSources: sourcesStatus.map((s) => s.name),
    sourcesStatus,
    affiliateDisclosure: AFFILIATE_DISCLOSURE,
    deals: finalDeals,
  };

  if (writePublicJson) {
    await fs.mkdir(path.dirname(publicJsonPath), { recursive: true });
    await fs.writeFile(publicJsonPath, JSON.stringify(payload, null, 2), 'utf8');
  }

  return payload;
}
