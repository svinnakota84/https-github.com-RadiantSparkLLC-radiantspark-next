# New Standalone SparkDeals Website — GitHub Pages + Zoho Domain Guide

**Zero impact on `radiantsparkllc.com`:** Deploy this package into a **brand-new GitHub repository** (for example `sparkdeals-live`). Do **not** upload this package to your `RadiantSparkLLC/radiantspark-site` repository.

## Step 1: Launch on GitHub Pages
1. Create a new public repository on GitHub (e.g. `RadiantSparkLLC/sparkdeals-live`).
2. Unzip all files from `sparkdeals-github-pages-site.zip` (`index.html`, `deals-feed.json`, `assets/`, `scripts/`, `.github/workflows/pages.yml`, `.nojekyll`) and upload/commit them to the `main` branch.
3. In your new GitHub repo, go to **Settings → Pages**:
   - Under **Build and deployment → Source**, choose **GitHub Actions** (recommended so live deals refresh automatically every 15 minutes).
   - *(Optional)* Or choose **Deploy from a branch → `main` / `(root)`** for static hosting.
4. Wait ~60 seconds for **Actions** to finish. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Step 2: Connect Your New Zoho Domain
Once you register/select your new domain in **Zoho Domains** (for example `sparkdealsdaily.com`):
1. Open **Zoho Domains → Manage Domain → DNS Zone / DNS Records**.
2. Add **4 `A` records** for Host `@` (root domain) pointing to GitHub Pages IPv4 addresses:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add **1 `CNAME` record** for Host `www` pointing to:
   - `<your-github-username>.github.io` (e.g. `radiantsparkllc.github.io`)
4. *(Optional IPv6)* Add **4 `AAAA` records** for Host `@`:
   - `2606:50c0:8000::153`
   - `2606:50c0:8001::153`
   - `2606:50c0:8002::153`
   - `2606:50c0:8003::153`
5. Go back to your new GitHub repo → **Settings → Pages → Custom domain**, type your new domain (`www.yourdomain.com` or `yourdomain.com`), click **Save**, and check **Enforce HTTPS** once DNS verification turns green.

## Step 3 (Optional): Affiliate Tracking Secrets
In your new GitHub repo → **Settings → Secrets and variables → Actions**, you may add any of your own affiliate IDs so every 15-minute refresh tags merchant links automatically:
- `AMAZON_AFFILIATE_TAG`
- `AMAZON_INDIA_TAG`
- `WALMART_IMPACT_ID`
- `BESTBUY_IMPACT_ID`
- `EBAY_CAMPAIGN_ID`
- `SKIMLINKS_PUBLISHER_ID`
- `SOVRN_API_KEY`
