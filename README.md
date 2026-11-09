# Radiant Spark Global

React/Vite corporate site with India divisions, merchant discovery and a local business task planner.

## Build

Node 24: `npm ci`, `npm run lint`, `npm run build`. Publish **dist**, never the source index or old ZIP files. GitHub Actions builds and deploys Pages on main; deployment requires repository Pages permission.

## Verified behavior and limits

- WebGL initialization failures fall back to a CSS glow instead of crashing React.
- A single React entrypoint replaces the previous competing static/React applications.
- Relative assets work under `/radiantspark/` and a future custom domain.
- No browser Gemini secret injection. No false success for Oracle dispatch.
- Random market ticks, fictional order books and fixed “live” prices are removed. No brokerage, betting, merchant feed or ERP is connected.
- SparkDeals is merchant discovery, with no unsupported current price, stock or discount claims.
- Ten AI roles are a local task planner, not hired employees. Tasks persist on this browser only. No payments, filings, purchase orders or shipments execute.
- Legal copy preserves consumer rights and does not promise immunity. Division licenses, tax rates and registrations require verification.

## Domain / Zoho

`radiantspark.com` redirected to a HugeDomains sale page during the 2026-11-07 audit. Ownership/control has not been established. Do not point an unowned domain or purchase it without authorization. No CNAME is published until ownership and hosting are confirmed.

Expected default Pages URL once deployment succeeds: https://svinnakota84.github.io/radiantspark/

After ownership is established and the custom domain is configured in GitHub Pages, Zoho DNS for the apex uses four separate A records (`@`): 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. `www` CNAME: svinnakota84.github.io. Preserve email MX, SPF, DKIM and DMARC records. Wait for DNS and TLS validation before enforcing HTTPS. See https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site.

## Activation requirements

Real markets require authorized provider access and timestamps, stale/error handling and integration tests. Trading/betting also requires provider agreements and jurisdiction review. “Aliena” is unidentified. Live deals require authorized feed credentials and verified offer expiry. Real staff operation requires authenticated accounts, roles, durable records and audit logs. Legal agreements require professional review against actual activities. See public/business-readiness.html.
