/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SyncWorkflowJob } from '../types';

export const INITIAL_SYNC_JOBS: SyncWorkflowJob[] = [
  {
    id: 'job-crawler-in',
    name: 'India Curated Deal Scraper & Price Radar',
    status: 'scheduled',
    schedule: 'Every 15 mins',
    lastRun: '4 mins ago',
    itemsProcessed: 1420,
    successRate: '99.4%',
    description: 'Scrapes price fluctuations and discount codes across Amazon India, Flipkart, Tata Neu, and clean-energy vendors.'
  },
  {
    id: 'job-affiliate-cloaker',
    name: 'Affiliate URL Cloaker & UTM SubID Engine',
    status: 'idle',
    schedule: 'Real-time hook',
    lastRun: '12 mins ago',
    itemsProcessed: 890,
    successRate: '100%',
    description: 'Injects tracking tags (sparkdeal-21), validates merchant redirects, and attaches compliant #AffiliateDisclosure metadata.'
  },
  {
    id: 'job-telegram-broadcast',
    name: 'Telegram & WhatsApp Deal Alerts Broadcaster',
    status: 'scheduled',
    schedule: 'On Hot Deal (Score > 150)',
    lastRun: '22 mins ago',
    itemsProcessed: 48,
    successRate: '98.9%',
    description: 'Dispatches curated instant deal alerts with coupon codes to 18,400+ registered Indian subscribers.'
  },
  {
    id: 'job-legal-compliance',
    name: 'Legal Shield & Price Gouging Audit Sentinel',
    status: 'completed',
    schedule: 'Daily at 00:00 IST',
    lastRun: 'Today 00:00 IST',
    itemsProcessed: 320,
    successRate: '100%',
    description: 'Verifies intermediary disclosures, checks seller credentials, and ensures strict compliance with E-Commerce Rules 2020.'
  }
];
