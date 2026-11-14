/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Globe,
  X,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  CurrencyConfig,
  SUPPORTED_CURRENCIES,
  formatLocalizedCurrency,
} from '../data/lifesparkData';
import { safeFetchJson } from '../utils/apiBase';

interface StripeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  planName?: string;
  priceUsd?: number;
  billingInterval?: 'month' | 'year' | 'one_time';
  defaultEmail?: string;
  defaultName?: string;
  returnPath?: string;
}

export const StripeSubscriptionModal: React.FC<StripeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  planId,
  planName = 'Lifestyle Spark Pro Monthly',
  priceUsd = 9.99,
  billingInterval = 'month',
  defaultEmail = '',
  defaultName = '',
  returnPath = '/#lifestyle',
}) => {
  const [customerName, setCustomerName] = useState(defaultName);
  const [customerEmail, setCustomerEmail] = useState(defaultEmail);
  const [currency, setCurrency] = useState<CurrencyConfig['code']>('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<{
    checked: boolean;
    configured: boolean;
    paymentLinkConfigured: boolean;
    paymentLinkUrl: string | null;
    staticHostDetected: boolean;
  }>({
    checked: false,
    configured: false,
    paymentLinkConfigured: false,
    paymentLinkUrl: null,
    staticHostDetected: false,
  });

  useEffect(() => {
    if (defaultName && !customerName) setCustomerName(defaultName);
    if (defaultEmail && !customerEmail) setCustomerEmail(defaultEmail);
  }, [defaultName, defaultEmail]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    safeFetchJson('/api/stripe/config').then((res) => {
      if (res.ok && res.data) {
        setStripeStatus({
          checked: true,
          configured: Boolean(res.data.configured),
          paymentLinkConfigured: Boolean(res.data.paymentLinkConfigured),
          paymentLinkUrl: res.data.paymentLinkUrl || null,
          staticHostDetected: false,
        });
      } else {
        setStripeStatus((s) => ({
          ...s,
          checked: true,
          staticHostDetected: res.isStaticHtmlHost,
        }));
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedCurrencyCfg =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
  const formattedLocal = formatLocalizedCurrency(priceUsd, currency);
  const intervalLabel =
    billingInterval === 'year'
      ? '/ year'
      : billingInterval === 'one_time'
      ? 'one-time'
      : '/ month';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address for your Stripe payment receipt and Lifestyle Spark account.');
      return;
    }

    setIsProcessing(true);
    try {
      const resolvedPlanId = planId || `${planName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      const res = await safeFetchJson('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: resolvedPlanId,
          planName,
          priceUsd,
          currency,
          billingInterval,
          email: customerEmail.trim(),
          fullName: customerName.trim(),
          returnPath,
        }),
      });

      if (res.ok && res.data?.url) {
        window.location.assign(res.data.url);
        return;
      }

      const fallbackLink =
        stripeStatus.paymentLinkUrl ||
        (import.meta as any).env?.VITE_STRIPE_PAYMENT_LINK_URL ||
        '';
      if (fallbackLink) {
        const u = new URL(fallbackLink);
        if (customerEmail.trim()) u.searchParams.set('prefilled_email', customerEmail.trim());
        window.location.assign(u.toString());
        return;
      }

      if (res.isStaticHtmlHost) {
        setErrorMsg(
          'This domain is serving static files without the Node Stripe server. Host server.ts (or set VITE_API_BASE_URL / VITE_STRIPE_PAYMENT_LINK_URL) so Checkout Sessions create securely with your Stripe account.'
        );
      } else {
        setErrorMsg(
          res.data?.error ||
            'Live Stripe server key (STRIPE_SECRET_KEY) is not configured in this environment yet.'
        );
      }
    } catch {
      setErrorMsg(
        'Could not reach the payment server. Verify the backend server is running with STRIPE_SECRET_KEY configured.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Multi-Currency Stripe Checkout"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-slate-950 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300 shadow-md">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Stripe Global Hosted Checkout
              </h3>
              <p className="text-xs text-slate-400">
                PCI-compliant worldwide card &amp; wallet settlement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout modal"
            className="w-9 h-9 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Server Connection Status */}
          {stripeStatus.checked && (
            <div
              className={`p-3 rounded-2xl border flex items-start gap-2.5 text-[11px] ${
                stripeStatus.configured || stripeStatus.paymentLinkConfigured
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              {stripeStatus.configured || stripeStatus.paymentLinkConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                {stripeStatus.configured ? (
                  <span>
                    <strong>Stripe Live Checkout Ready:</strong> Continuing redirects to Stripe&apos;s encrypted Checkout Session where funds settle directly to your linked Radiant Spark Stripe business account.
                  </span>
                ) : stripeStatus.paymentLinkConfigured ? (
                  <span>
                    <strong>Stripe Payment Link Ready:</strong> Continuing redirects to your configured Stripe hosted payment link.
                  </span>
                ) : (
                  <span>
                    <strong>One-Time Server Key Needed:</strong> Set <code className="text-white font-mono">STRIPE_SECRET_KEY</code> in your server environment (or <code className="text-white font-mono">STRIPE_PAYMENT_LINK_URL</code> for static hosting) to collect real card payments worldwide. Card fields are intentionally hosted by Stripe—never stored locally.
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Order Summary & Currency Selector */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-slate-400">
                <span>Selected Plan</span>
                <strong className="text-white font-bold">{planName}</strong>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">
                    Pay in Local Global Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyConfig['code'])}
                    className="w-full sm:w-52 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Estimated Charge</span>
                  <strong className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                    {formattedLocal}
                  </strong>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {intervalLabel} · Base ${priceUsd} USD
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{selectedCurrencyCfg.localMethodsNote}</span>
              </div>
            </div>

            {/* Member Email & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Member full name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Receipt &amp; Account Email *
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                You will enter card or Apple Pay / Google Pay details directly on Stripe&apos;s PCI-DSS Level 1 hosted page—never inside unverified browser inputs—and immediately return here with verified membership status.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Creating Secure Stripe Checkout Session...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Continue to Stripe Checkout ({formattedLocal})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
