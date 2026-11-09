# Radiant Spark LLC & SparkSync — Production Deployment Guide

This package contains the complete website for **radiantsparkllc.com** and the standalone **SparkSync** web & mobile app.

## File Structure
- `index.html`: Radiant Spark LLC Corporate Website (Global Overview, USA Tech Services, India Divisions, Robinhood-style Trading & Kalshi Prediction Safe Harbor, Atlanta GA Arbitration Shield)
- `styles.css`: Full cinematic stylesheet
- `site.js`: Client-side navigation, mobile menu & interactive tabs
- `app.html`: SparkSync Web & Mobile Application (PWA Standalone ready)
- `portal.html`: Enterprise Client Portal
- `manifest.json`: Web App Manifest for iOS Add-to-Home-Screen and Android PWA
- `icon.svg`: Vector branding icon
- `sw.js`: Service worker caching offline support
- `assets/`: App code bundle (index-*.js, index-*.css) and branding artwork

## Deployment Options

### 1. Upload to Web Hosting (cPanel, GoDaddy, Namecheap, Hostinger, Apache, Nginx)
1. Log in to your hosting cPanel or FTP client.
2. Navigate to your website's root directory (`public_html/` or `www/`).
3. Upload all files from this ZIP package directly into `public_html/`.
4. Visit `https://radiantsparkllc.com` to see the corporate site.
5. Visit `https://radiantsparkllc.com/app.html` to run the SparkSync mobile application.

### 2. Upload to GitHub Pages
1. Push all files in this ZIP to the `main` branch of your GitHub repository.
2. In GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch** -> `main` / `/(root)`.
4. Click **Save**. Your site and app will be live within 60 seconds with free SSL.

### 3. Customer Plan Activation & Subscriptions
- Subscriptions are processed via Stripe Checkout ($9.99/mo for Pro, $19.99/mo for Enterprise).
- Payouts route automatically to Radiant Spark LLC's Chase Business Checking Account via ACH Direct Deposit.
- Customers can click 'Stripe Checkout ($9.99/mo)' in the app header or overview dashboard to activate their plan.

## Legal Protection & Regulatory Compliance
- Governed by the laws of the State of Georgia.
- Mandatory individual binding arbitration before the AAA in Atlanta, Fulton County, GA 30350.
- Class action waiver and complete covenant not to sue Radiant Spark LLC.
- CFTC Rule 40.2 event contract safe harbor & SEC Reg NMS compliance disclosures included.
