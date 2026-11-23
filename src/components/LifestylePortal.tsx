/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Utensils,
  UserCheck,
  CreditCard,
  Globe,
  ExternalLink,
  Smartphone,
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  LogIn,
  LogOut,
  Bookmark,
  ChefHat,
  Timer,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  CurrencyConfig,
  LIFESTYLE_PLAN_TIERS,
  LIFESPARK_RECIPES,
  LIFESPARK_WORKOUTS,
  SUPPORTED_CURRENCIES,
  estimateWorkoutCalories,
  formatLocalizedCurrency,
} from '../data/lifesparkData';
import {
  auth,
  ensureAndLoadMemberProfile,
  firebaseConfig,
  logWorkoutToFirestore,
  saveDietPlanAndMetricsToFirestore,
  signInWithGoogleFirebase,
  signOutFirebase,
  subscribeFirebaseAuth,
  toggleFavoriteRecipeInFirestore,
} from '../firebase';
import { resolveApiUrl, safeFetchJson } from '../utils/apiBase';

interface LifestylePortalProps {
  onOpenStripeModal?: (
    planName: string,
    priceUsd: number,
    billingInterval?: 'month' | 'year' | 'one_time',
    planId?: string
  ) => void;
}

type ActiveTab = 'diet' | 'recipes' | 'workouts' | 'plans';

export const LifestylePortal: React.FC<LifestylePortalProps> = ({ onOpenStripeModal }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('diet');
  const [showLiveSiteEmbed, setShowLiveSiteEmbed] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig['code']>('USD');
  const [liveFxRates, setLiveFxRates] = useState<Record<string, number> | undefined>(undefined);
  const [backendPlans, setBackendPlans] = useState(LIFESTYLE_PLAN_TIERS);
  const [stripeBackendState, setStripeBackendState] = useState<{
    loaded: boolean;
    connected: boolean;
    mode: string;
    webhookConfigured: boolean;
    activeBackend: string;
    staticHostDetected: boolean;
  }>({
    loaded: false,
    connected: false,
    mode: 'checking',
    webhookConfigured: false,
    activeBackend: 'firebase',
    staticHostDetected: false,
  });

  // Customer Auth State (Firebase Auth + Express Session fallback)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('lifespark_token');
    } catch {
      return null;
    }
  });
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [showAuthPanel, setShowAuthPanel] = useState(false);

  // Stripe Verification Banner
  const [checkoutNotice, setCheckoutNotice] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Real-time Diet Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneWhatsApp: '',
    age: '29',
    gender: 'female',
    heightCm: '168',
    currentWeightKg: '74',
    targetWeightKg: '63',
    dietPreference: 'high_protein',
    dailyCalorieGoal: '1650',
    lifestyleGoal: 'weight_loss',
  });

  const [generatedPlan, setGeneratedPlan] = useState<any>({
    subscriberName: 'Guest Preview',
    dietName: 'High Protein Botanical & Lean Fat-Loss Plan',
    dailyCalories: '1650 kcal',
    macros: { proteinGrams: 132, carbsGrams: 145, fatGrams: 51 },
    waterIntake: '3.0 to 3.5 Liters Daily + Morning Warm Lemon Water',
    breakfast:
      '2-Egg + 2 Egg-White Herb Omelet or 150g Spiced Paneer Scramble with 1 slice seeded sprouted toast (~360 kcal)',
    lunch:
      'Lemon Herb Seared Salmon (or Chicken/Tofu) + 1/2 cup Tri-Color Quinoa + Spinach Avocado Greens (~465 kcal)',
    snack: 'Roasted Spiced Almonds (18 pcs) + Cucumber-Mint Lime Cooler (~180 kcal)',
    dinner: 'Ginger-Turmeric Red Lentil & Asparagus Soup with Steamed Vegetables (~315 kcal)',
    cookTip:
      'Dry-sear proteins over medium-high heat with olive oil spray and citrus herbs instead of heavy butter sauces.',
    exerciseFocus: 'Aim for 20-min Morning Metabolic HIIT 5x/week plus 8,000 daily steps.',
    aiCoachNote:
      'Coach Maya Chen: Enter your metrics and click Generate Live Diet Plan to calculate your Mifflin-St Jeor calorie deficit, macros, recipes, and daily workouts.',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [recipeFilter, setRecipeFilter] = useState<string>('all');
  const [activeWorkoutId, setActiveWorkoutId] = useState<string>(LIFESPARK_WORKOUTS[0].id);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(45);
  const [workoutStatusMsg, setWorkoutStatusMsg] = useState<string | null>(null);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Subscribe to live Firebase Authentication & Cloud Firestore member profile
  useEffect(() => {
    const unsubscribe = subscribeFirebaseAuth(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const workspace = await ensureAndLoadMemberProfile(fbUser);
          let stripeSub = workspace.subscriptionStatus;
          let stripePlan = workspace.subscriptionPlan;

          const idToken = await fbUser.getIdToken().catch(() => null);
          if (idToken) {
            const memRes = await safeFetchJson('/api/membership', {
              headers: { Authorization: `Bearer ${idToken}` },
            });
            if (memRes.ok && memRes.data?.membership?.status === 'active') {
              stripeSub = 'active';
              stripePlan = memRes.data.membership.planName || stripePlan;
            }
          }

          setCurrentUser({
            id: workspace.uid,
            fullName: workspace.fullName,
            email: workspace.email,
            phoneWhatsApp: workspace.phoneWhatsApp,
            subscriptionStatus: stripeSub,
            subscriptionPlan: stripePlan,
            favoriteRecipes: workspace.favoriteRecipes,
            workoutLogs: workspace.workoutLogs,
            authProvider: 'firebase_google',
          });
          if (workspace.latestDietPlan) {
            setGeneratedPlan(workspace.latestDietPlan);
          }
          setFormData((prev) => ({
            ...prev,
            fullName: workspace.fullName || prev.fullName,
            email: workspace.email || prev.email,
            phoneWhatsApp: workspace.phoneWhatsApp || prev.phoneWhatsApp,
            currentWeightKg: String(workspace.currentWeightKg || prev.currentWeightKg),
            targetWeightKg: String(workspace.targetWeightKg || prev.targetWeightKg),
            heightCm: String(workspace.heightCm || prev.heightCm),
            age: String(workspace.age || prev.age),
            gender: workspace.gender || prev.gender,
            dietPreference: workspace.dietPreference || prev.dietPreference,
            lifestyleGoal: workspace.lifestyleGoal || prev.lifestyleGoal,
            dailyCalorieGoal: String(workspace.dailyCalorieGoal || prev.dailyCalorieGoal),
          }));
        } catch (err) {
          console.error('Firebase member sync failed:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Hydrate server membership / session + check Stripe return session & backend plans
  useEffect(() => {
    const token = authToken;
    safeFetchJson('/api/membership', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).then((memRes) => {
      if (memRes.isStaticHtmlHost) {
        setStripeBackendState((s) => ({
          ...s,
          loaded: true,
          staticHostDetected: true,
          activeBackend: 'firebase_cloud',
        }));
      } else if (memRes.ok && memRes.data) {
        const stripeInfo = memRes.data.stripe || {};
        setStripeBackendState((s) => ({
          ...s,
          loaded: true,
          connected: Boolean(stripeInfo.connected || stripeInfo.paymentLinkConfigured),
          mode: stripeInfo.mode || s.mode,
          webhookConfigured: Boolean(stripeInfo.webhookConfigured),
          activeBackend: memRes.data.activeBackend || 'node+firebase',
          staticHostDetected: false,
        }));
      }
    });

    if (!firebaseUser) {
      safeFetchJson('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then((res) => {
        if (res.ok && res.data?.authenticated && res.data.user) {
          const data = res.data;
          setCurrentUser(data.user);
          if (data.user.savedPlan) setGeneratedPlan(data.user.savedPlan);
          setFormData((prev) => ({
            ...prev,
            fullName: data.user.fullName || prev.fullName,
            email: data.user.email || prev.email,
            phoneWhatsApp: data.user.phoneWhatsApp || prev.phoneWhatsApp,
            currentWeightKg: String(data.user.profile?.currentWeightKg || prev.currentWeightKg),
            targetWeightKg: String(data.user.profile?.targetWeightKg || prev.targetWeightKg),
            dietPreference: data.user.profile?.dietPreference || prev.dietPreference,
            lifestyleGoal: data.user.profile?.lifestyleGoal || prev.lifestyleGoal,
            dailyCalorieGoal: String(data.user.profile?.dailyCalorieGoal || prev.dailyCalorieGoal),
          }));
        }
      });
    }

    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get('checkout');
    const sessionId = params.get('session_id');
    if (checkoutState === 'success' && sessionId) {
      safeFetchJson(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`).then((vRes) => {
        const v = vRes.data;
        if (vRes.ok && v?.verified) {
          setCheckoutNotice({
            type: 'success',
            message: `Stripe payment confirmed (${v.planName} · ${v.currency}). Your membership is active!`,
          });
          setCurrentUser((prev: any) =>
            prev ? { ...prev, subscriptionStatus: 'active', subscriptionPlan: v.planName } : prev
          );
          setActiveTab('plans');
        } else {
          setCheckoutNotice({
            type: 'info',
            message: 'Checkout returned cleanly. If payment is still settling, refresh in a moment.',
          });
        }
      });
    } else if (checkoutState === 'cancelled') {
      setCheckoutNotice({
        type: 'info',
        message: 'Stripe checkout was cancelled. No card charge was placed.',
      });
    }

    // Fetch authoritative subscription plans & live Stripe connection status from backend
    safeFetchJson(`/api/stripe/plans?currency=${encodeURIComponent(selectedCurrency)}`).then((res) => {
      const data = res.data;
      if (res.ok && data && Array.isArray(data.plans) && data.plans.length > 0) {
        setBackendPlans(data.plans);
        if (data.fxRates) setLiveFxRates(data.fxRates);
        setStripeBackendState((s) => ({
          ...s,
          loaded: true,
          connected: Boolean(data.stripeConnected || data.paymentLinkConfigured),
          mode: data.mode || 'unconfigured',
          webhookConfigured: Boolean(data.webhookConfigured),
        }));
      } else {
        setStripeBackendState((s) => ({
          ...s,
          loaded: true,
          mode: 'static_fallback',
          staticHostDetected: res.isStaticHtmlHost || s.staticHostDetected,
        }));
      }
    });
  }, [authToken, selectedCurrency, firebaseUser]);

  // Workout Interval Timer
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signInWithGoogleFirebase();
      setShowAuthPanel(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In did not complete. Please allow popups and try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        authMode === 'register'
          ? {
              fullName: authName,
              email: authEmail,
              password: authPassword,
              dietPreference: formData.dietPreference,
              lifestyleGoal: formData.lifestyleGoal,
              currentWeightKg: Number(formData.currentWeightKg),
              targetWeightKg: Number(formData.targetWeightKg),
            }
          : { email: authEmail, password: authPassword };

      const res = await safeFetchJson(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.isStaticHtmlHost) {
        setAuthError(
          'Email/password requires the Node API server, which is inactive on this static host. Use "Continue with Google (Cloud Sync)" below — it works anywhere via Firebase!'
        );
        return;
      }

      if (!res.ok || !res.data) {
        setAuthError(res.data?.error || 'Authentication failed.');
      } else {
        const data = res.data;
        setAuthToken(data.token);
        try {
          localStorage.setItem('lifespark_token', data.token);
        } catch {
          // ignore
        }
        setCurrentUser(data.user);
        if (data.user?.savedPlan) setGeneratedPlan(data.user.savedPlan);
        setShowAuthPanel(false);
      }
    } catch {
      setAuthError('Could not reach authentication server. Try Continue with Google above.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOutFirebase().catch(() => {});
    setFirebaseUser(null);
    await fetch(resolveApiUrl('/api/auth/logout'), { method: 'POST' }).catch(() => {});
    setAuthToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('lifespark_token');
    } catch {
      // ignore
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    let computedPlan: any = null;

    const res = await safeFetchJson('/api/lifespark/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        fullName: formData.fullName || currentUser?.fullName || 'Member',
        age: Number(formData.age),
        gender: formData.gender,
        heightCm: Number(formData.heightCm),
        currentWeightKg: Number(formData.currentWeightKg),
        targetWeightKg: Number(formData.targetWeightKg),
        dietPreference: formData.dietPreference,
        lifestyleGoal: formData.lifestyleGoal,
        dailyCalorieGoal: Number(formData.dailyCalorieGoal),
      }),
    });

    if (res.ok && res.data?.plan) {
      computedPlan = res.data.plan;
    } else {
      const weightKg = Number(formData.currentWeightKg) || 74;
      const heightCm = Number(formData.heightCm) || 168;
      const age = Number(formData.age) || 29;
      const targetCal = Number(formData.dailyCalorieGoal) || 1650;
      const proteinGrams = Math.round((targetCal * 0.3) / 4);
      const fatGrams = Math.round((targetCal * 0.28) / 9);
      const carbsGrams = Math.max(40, Math.round((targetCal - proteinGrams * 4 - fatGrams * 9) / 4));
      computedPlan = {
        ...generatedPlan,
        subscriberName: formData.fullName || currentUser?.fullName || 'Member',
        dailyCalories: `${targetCal} kcal`,
        macros: { proteinGrams, carbsGrams, fatGrams },
        aiCoachNote: `Coach Maya Chen calculated ${targetCal} kcal (${proteinGrams}g P / ${carbsGrams}g C / ${fatGrams}g F) for ${weightKg} kg at ${heightCm} cm (Age ${age}).`,
      };
    }

    setGeneratedPlan(computedPlan);

    if (auth.currentUser) {
      saveDietPlanAndMetricsToFirestore(
        auth.currentUser,
        {
          fullName: formData.fullName || currentUser?.fullName || 'Member',
          phoneWhatsApp: formData.phoneWhatsApp,
          dietPreference: formData.dietPreference,
          lifestyleGoal: formData.lifestyleGoal,
          dailyCalorieGoal: Number(formData.dailyCalorieGoal) || 1650,
          currentWeightKg: Number(formData.currentWeightKg) || 74,
          targetWeightKg: Number(formData.targetWeightKg) || 63,
          heightCm: Number(formData.heightCm) || 168,
          age: Number(formData.age) || 29,
          gender: formData.gender || 'female',
        },
        computedPlan
      ).catch((err) => console.error('Cloud plan sync failed:', err));
    }

    setIsGenerating(false);
  };

  const handleLogCompletedWorkout = async (title: string, durationMinutes: number, cal: number) => {
    setWorkoutStatusMsg(null);
    if (!authToken && !auth.currentUser) {
      setWorkoutStatusMsg(
        `Session complete (~${cal} kcal). Sign in above to save workout history to your Cloud profile.`
      );
      return;
    }

    if (auth.currentUser) {
      try {
        await logWorkoutToFirestore(auth.currentUser, {
          title,
          minutes: durationMinutes,
          estimatedCalories: cal,
        });
        const newEntry = {
          id: `wo_${Date.now()}`,
          title,
          minutes: durationMinutes,
          estimatedCalories: cal,
          completedAt: new Date().toISOString(),
        };
        setCurrentUser((prev: any) =>
          prev ? { ...prev, workoutLogs: [newEntry, ...(prev.workoutLogs || [])] } : prev
        );
        setWorkoutStatusMsg(`Saved "${title}" (~${cal} kcal burned) to Cloud Firestore.`);
        return;
      } catch {
        setWorkoutStatusMsg('Could not sync workout to Firestore right now.');
        return;
      }
    }

    const res = await safeFetchJson('/api/lifespark/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        workoutLog: { title, minutes: durationMinutes, estimatedCalories: cal },
      }),
    });
    if (res.ok && res.data?.user) {
      setCurrentUser(res.data.user);
      setWorkoutStatusMsg(`Saved "${title}" (~${cal} kcal burned) to your Lifestyle Spark log.`);
    } else {
      setWorkoutStatusMsg('Could not sync workout right now.');
    }
  };

  const handleToggleFavoriteRecipe = async (recipeId: string) => {
    if (!authToken && !auth.currentUser) {
      setShowAuthPanel(true);
      return;
    }

    if (auth.currentUser) {
      const rec = LIFESPARK_RECIPES.find((r) => r.id === recipeId);
      const currentlySaved = Boolean(currentUser?.favoriteRecipes?.includes(recipeId));
      try {
        const nowSaved = await toggleFavoriteRecipeInFirestore(
          auth.currentUser,
          recipeId,
          rec?.title || 'Healthy Recipe',
          currentlySaved
        );
        setCurrentUser((prev: any) => {
          if (!prev) return prev;
          const prevFavs: string[] = prev.favoriteRecipes || [];
          const nextFavs = nowSaved
            ? [recipeId, ...prevFavs.filter((id) => id !== recipeId)]
            : prevFavs.filter((id) => id !== recipeId);
          return { ...prev, favoriteRecipes: nextFavs };
        });
      } catch {
        // handled by handleFirestoreError logging
      }
      return;
    }

    const res = await safeFetchJson('/api/lifespark/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ toggleFavoriteRecipeId: recipeId }),
    });
    if (res.ok && res.data?.user) {
      setCurrentUser(res.data.user);
    }
  };

  const handleSendWhatsAppPlan = () => {
    const phone = formData.phoneWhatsApp.replace(/[^0-9]/g, '') || '919848022331';
    const msg = encodeURIComponent(
      `LifeSpark Diet Plan for ${generatedPlan.subscriberName}\n` +
        `Plan: ${generatedPlan.dietName}\n` +
        `Target: ${generatedPlan.dailyCalories}\n` +
        `Breakfast: ${generatedPlan.breakfast}\n` +
        `Lunch: ${generatedPlan.lunch}\n` +
        `Snack: ${generatedPlan.snack}\n` +
        `Dinner: ${generatedPlan.dinner}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 3500);
  };

  const filteredRecipes =
    recipeFilter === 'all'
      ? LIFESPARK_RECIPES
      : LIFESPARK_RECIPES.filter((r) => r.dietStyle === recipeFilter);

  const selectedWorkout =
    LIFESPARK_WORKOUTS.find((w) => w.id === activeWorkoutId) || LIFESPARK_WORKOUTS[0];
  const userWeightKg = Number(formData.currentWeightKg) || 74;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Checkout Return Status Notice */}
      {checkoutNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            checkoutNotice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{checkoutNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutNotice(null)}
            className="text-xs underline text-slate-300 hover:text-white shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Split Banner + Direct Link & Live Embed to lifestyle.radiantsparkllc.com */}
      <section className="rounded-3xl bg-slate-900/90 border border-emerald-500/35 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-400 font-mono">
              <span>lifestyle.radiantsparkllc.com</span>
              <span aria-hidden="true">·</span>
              <span>Lifestyle Spark Mobile App</span>
              <span aria-hidden="true">·</span>
              <span>Global Stripe Checkout</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight text-balance">
              Lifestyle Spark: Diet Plans, Food Making &amp; Weight-Loss App
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Connected live with{' '}
              <a
                href="https://lifestyle.radiantsparkllc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline font-semibold"
              >
                https://lifestyle.radiantsparkllc.com/
              </a>{' '}
              and our backend Stripe Subscription Plans. Calculate real-time calories &amp; macros, cook healthy weight-loss meals, follow workouts, and pay in any global currency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/lifespark.html"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open Lifestyle Spark App ↗</span>
            </a>

            <button
              type="button"
              onClick={() => setShowLiveSiteEmbed((v) => !v)}
              className="px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              {showLiveSiteEmbed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>
                {showLiveSiteEmbed
                  ? 'Collapse Live Subdomain Frame'
                  : 'Show lifestyle.radiantsparkllc.com Live'}
              </span>
            </button>

            <a
              href="https://lifestyle.radiantsparkllc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Visit Full Subdomain</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[240px] bg-slate-950">
          <img
            src="/assets/lifespark-meal-prep.jpg"
            alt="Fresh balanced high-protein healthy meal prep bowls"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-mono">
            <span>Lifestyle Spark PWA · Recipes &amp; Fitness</span>
            <span className="text-emerald-300 font-bold">USD · INR · EUR · GBP · AED</span>
          </div>
        </div>
      </section>

      {/* Connected Live Subdomain (https://lifestyle.radiantsparkllc.com/) + Subscription Plans Grid */}
      {showLiveSiteEmbed && (
        <section className="rounded-3xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-2xl">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-300 font-bold">
                Connected Live Portal: https://lifestyle.radiantsparkllc.com/
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/lifespark.html"
                className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
              >
                Open Lifestyle Spark App ↗
              </a>
              <a
                href="https://lifestyle.radiantsparkllc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline flex items-center gap-1"
              >
                Open in New Tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <iframe
            src="https://lifestyle.radiantsparkllc.com/"
            title="Lifestyle Spark Portal - lifestyle.radiantsparkllc.com"
            className="w-full h-[520px] bg-[#FAF7F2]"
            loading="lazy"
          />
        </section>
      )}

      {/* Always-Visible Backend-Connected Stripe Subscription Plans Section */}
      <section className="space-y-5 p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-bold">
                Backend Stripe Subscriptions (/api/stripe/plans &amp; Checkout)
              </span>
              <span className="text-slate-600">·</span>
              <span
                className={
                  stripeBackendState.connected
                    ? 'text-emerald-400 font-bold'
                    : 'text-amber-300 font-semibold'
                }
              >
                {stripeBackendState.connected
                  ? 'Backend Connected: Ready for Global Charges'
                  : 'Backend Verified (Add STRIPE_SECRET_KEY in Env for Live Charges)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Lifestyle Spark Subscription Plans · Global Card Checkout
            </h2>
            <p className="text-xs text-slate-300">
              Select a plan below to connect directly to our Node Stripe backend, calculate localized currency pricing, and complete PCI-compliant Visa, Mastercard, Amex, Apple Pay, or Google Pay settlement into your Radiant Spark Stripe account.
            </p>
          </div>

          <div className="shrink-0">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Display &amp; Billing Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyConfig['code'])}
              className="w-full sm:w-56 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs font-bold focus:border-blue-500 focus:outline-none"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {backendPlans.map((tier) => {
            const formatted = formatLocalizedCurrency(tier.priceUsd, selectedCurrency);
            return (
              <div
                key={tier.id}
                className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <span className="text-xs font-mono text-emerald-400 font-bold block">
                    {tier.badge}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 font-mono">
                    <strong className="text-3xl font-black text-white tabular-nums">
                      {formatted}
                    </strong>
                    <span className="text-xs text-slate-400">
                      {tier.interval === 'year'
                        ? '/ year'
                        : tier.interval === 'one_time'
                        ? 'one-time'
                        : '/ month'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{tier.description}</p>
                  <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenStripeModal) {
                      onOpenStripeModal(tier.name, tier.priceUsd, tier.interval, tier.id);
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Enter Plan · Pay {formatted}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Member Account & Session Bar */}
      <section className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {currentUser ? (
          <>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <strong className="text-white font-bold text-sm">
                  Welcome back, {currentUser.fullName}
                </strong>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {currentUser.subscriptionStatus === 'active'
                    ? `Active Plan: ${currentUser.subscriptionPlan || 'Lifestyle Spark Pro'}`
                    : 'Free Member Account'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {currentUser.email} · {currentUser.workoutLogs?.length || 0} workouts logged ·{' '}
                {currentUser.favoriteRecipes?.length || 0} saved recipes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentUser.subscriptionStatus !== 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenStripeModal) {
                      onOpenStripeModal(
                        'Lifestyle Spark Pro Monthly',
                        9.99,
                        'month',
                        'lifestyle_spark_monthly'
                      );
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap"
                >
                  Upgrade via Stripe Pro
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-400 mb-1">
                <span>Active DB &amp; Auth: Cloud Firestore + Firebase Auth ({firebaseConfig.projectId})</span>
              </div>
              <strong className="text-white text-sm font-bold block">
                Member Login &amp; Sync Across Web + Lifestyle Spark App
              </strong>
              <p className="text-xs text-slate-400">
                Sign in with Google (works everywhere via Firebase Cloud) or your member account to save custom meal plans, recipes, workout logs, and Stripe subscriptions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authBusy}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center gap-2 whitespace-nowrap shadow-md"
              >
                <span>G</span>
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthPanel((v) => !v);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Email Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthPanel(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap"
              >
                Create Free Account
              </button>
            </div>
          </>
        )}
      </section>

      {/* Expandable Login / Sign Up Panel */}
      {showAuthPanel && !currentUser && (
        <form
          onSubmit={handleAuthSubmit}
          className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 space-y-4 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                {authMode === 'register'
                  ? 'Create Your Lifestyle Spark Member Account'
                  : 'Sign In to Your Lifestyle Spark Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Instant Google Cloud Sign-In (Firebase) or server Email/Password session
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authBusy}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs"
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                className="text-xs text-emerald-400 underline font-semibold"
              >
                {authMode === 'register'
                  ? 'Already have an account? Sign In'
                  : 'New here? Create Account'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
              {authError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={authBusy}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
            >
              {authBusy
                ? 'Please wait...'
                : authMode === 'register'
                ? 'Create Account & Save Plan'
                : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setShowAuthPanel(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Workspace Segmented Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('diet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'diet'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Real-Time Diet &amp; Macros</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'recipes'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Food Making &amp; Recipes ({LIFESPARK_RECIPES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'workouts'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Weight-Loss Workouts ({LIFESPARK_WORKOUTS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'plans'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Enter Diet Plan · Global Card Payment</span>
        </button>
      </div>

      {/* TAB 1: REAL-TIME DIET PLAN BUILDER */}
      {activeTab === 'diet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleGeneratePlan}
            className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4"
          >
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Body Metrics &amp; Diet Preferences
              </h2>
              <p className="text-xs text-slate-400">
                Calculates personalized BMR, macro split, meal swaps, and cooking approach immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  WhatsApp (for plan export)
                </label>
                <input
                  type="tel"
                  value={formData.phoneWhatsApp}
                  onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                  placeholder="+1 or +91 number"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  min={16}
                  max={90}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={220}
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Current (kg)</label>
                <input
                  type="number"
                  min={35}
                  max={220}
                  value={formData.currentWeightKg}
                  onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Goal (kg)</label>
                <input
                  type="number"
                  min={35}
                  max={200}
                  value={formData.targetWeightKg}
                  onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Goal</label>
                <select
                  value={formData.lifestyleGoal}
                  onChange={(e) => setFormData({ ...formData, lifestyleGoal: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="weight_loss">Weight Loss &amp; Toning</option>
                  <option value="muscle_gain">Lean Muscle Gain</option>
                  <option value="detox_glow">Botanical Detox</option>
                  <option value="diabetic_keto">Low-GI Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Diet Style</label>
                <select
                  value={formData.dietPreference}
                  onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="high_protein">High Protein Lean</option>
                  <option value="vegetarian_sattvik">Vegetarian / Sattvik</option>
                  <option value="vegan_organic">100% Organic Vegan</option>
                  <option value="keto_lowcarb">Keto Low-Carb</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Calories</label>
                <select
                  value={formData.dailyCalorieGoal}
                  onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs"
                >
                  <option value="1400">1,400 kcal</option>
                  <option value="1650">1,650 kcal</option>
                  <option value="1850">1,850 kcal</option>
                  <option value="2100">2,100 kcal</option>
                  <option value="2400">2,400 kcal</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Calculating Live Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Live Diet Plan</span>
                  </>
                )}
              </button>

              {onOpenStripeModal && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenStripeModal(
                      'Lifestyle Spark Pro Monthly',
                      9.99,
                      'month',
                      'lifestyle_spark_monthly'
                    )
                  }
                  className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Join Pro ($9.99/mo Card)</span>
                </button>
              )}
            </div>
          </form>

          {/* Live Plan Output Card */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400">
                  Custom Nutrition Matrix · {generatedPlan.subscriberName}
                </span>
                <h3 className="text-lg font-extrabold text-white">{generatedPlan.dietName}</h3>
              </div>
              <strong className="text-lg font-black text-amber-300 font-mono tabular-nums">
                {generatedPlan.dailyCalories}
              </strong>
            </div>

            {generatedPlan.macros && (
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Protein</span>
                  <strong className="text-base font-bold text-emerald-300 tabular-nums">
                    {generatedPlan.macros.proteinGrams}g
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Carbs</span>
                  <strong className="text-base font-bold text-cyan-300 tabular-nums">
                    {generatedPlan.macros.carbsGrams}g
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Healthy Fats</span>
                  <strong className="text-base font-bold text-amber-300 tabular-nums">
                    {generatedPlan.macros.fatGrams}g
                  </strong>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Breakfast</strong>
                <span className="text-slate-200">{generatedPlan.breakfast}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Lunch</strong>
                <span className="text-slate-200">{generatedPlan.lunch}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Evening Snack</strong>
                <span className="text-slate-200">{generatedPlan.snack}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Light Dinner</strong>
                <span className="text-slate-200">{generatedPlan.dinner}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
              <strong className="text-emerald-300 block">Coach Maya Chen Guidance:</strong>
              <p>{generatedPlan.aiCoachNote}</p>
              {generatedPlan.cookTip && (
                <p className="text-slate-300">
                  <strong>Cooking Tip:</strong> {generatedPlan.cookTip}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendWhatsAppPlan}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                {whatsappSent ? 'Opened WhatsApp Export' : 'Send Meal Plan to WhatsApp'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recipes')}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                See Step-by-Step Recipes →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOD MAKING & RECIPES */}
      {activeTab === 'recipes' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Step-by-Step Food Making &amp; Weight-Loss Recipes
              </h2>
              <p className="text-xs text-slate-400">
                Measured ingredients, fast prep steps, and macro breakdown tailored to fat loss.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Recipes' },
                { id: 'high_protein', label: 'High Protein' },
                { id: 'vegetarian_sattvik', label: 'Vegetarian' },
                { id: 'vegan_organic', label: 'Vegan' },
                { id: 'keto_lowcarb', label: 'Keto Low-Carb' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setRecipeFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    recipeFilter === btn.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((rec) => {
              const isSaved = currentUser?.favoriteRecipes?.includes(rec.id);
              return (
                <article
                  key={rec.id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>
                        {rec.mealSlot} · Prep {rec.prepMinutes}m · Cook {rec.cookMinutes}m
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleFavoriteRecipe(rec.id)}
                        aria-label="Save recipe"
                        className={`p-1.5 rounded-lg border ${
                          isSaved
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug">
                      {rec.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-emerald-300 border-y border-slate-800 py-2">
                      <span>{rec.calories} kcal</span>
                      <span className="text-slate-600">·</span>
                      <span>P {rec.proteinGrams}g</span>
                      <span className="text-slate-600">·</span>
                      <span>C {rec.carbsGrams}g</span>
                      <span className="text-slate-600">·</span>
                      <span>F {rec.fatGrams}g</span>
                    </div>

                    <div>
                      <strong className="text-xs text-white block mb-1">Ingredients</strong>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                        {rec.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong className="text-xs text-white block mb-1">How to Make</strong>
                      <ol className="space-y-1.5 text-xs text-slate-300 list-decimal pl-4">
                        {rec.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-200">
                    <strong>Prep Tip:</strong> {rec.chefTip}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: WEIGHT-LOSS EXERCISES & WORKOUT TIMER */}
      {activeTab === 'workouts' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
              <img
                src="/assets/lifespark-workout.jpg"
                alt="Weight-loss fitness training mat and kettlebell"
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-5 space-y-2">
                <h2 className="text-lg font-extrabold text-white">
                  Guided Weight-Loss Exercise Programs
                </h2>
                <p className="text-xs text-slate-400">
                  Calorie burn estimates adjust dynamically to your current weight ({userWeightKg} kg).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {LIFESPARK_WORKOUTS.map((wo) => {
                const estCal = estimateWorkoutCalories(wo.metValue, userWeightKg, wo.durationMinutes);
                const active = wo.id === selectedWorkout.id;
                return (
                  <button
                    key={wo.id}
                    type="button"
                    onClick={() => {
                      setActiveWorkoutId(wo.id);
                      setTimerRunning(false);
                      setTimerSecondsLeft(wo.exercises[0]?.durationSec || 45);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      active
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1">
                      <span>
                        {wo.level} · {wo.durationMinutes} min
                      </span>
                      <span className="tabular-nums">~{estCal} kcal est.</span>
                    </div>
                    <strong className="text-sm font-bold block">{wo.title}</strong>
                    <span className="text-xs text-slate-400 block mt-0.5">{wo.focusArea}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400">
                  {selectedWorkout.level} · {selectedWorkout.durationMinutes} Minutes
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedWorkout.title}</h3>
              </div>

              {/* Interactive Interval Timer */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-black text-lg text-white tabular-nums w-14 text-center">
                  {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
                  {String(timerSecondsLeft % 60).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{timerRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSecondsLeft(selectedWorkout.exercises[0]?.durationSec || 45);
                  }}
                  aria-label="Reset timer"
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {selectedWorkout.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-emerald-400 font-bold">0{idx + 1}.</span>
                      <strong className="text-sm text-white">{ex.name}</strong>
                    </div>
                    <p className="text-xs text-slate-400">{ex.formCue}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTimerSecondsLeft(ex.durationSec);
                      setTimerRunning(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 whitespace-nowrap shrink-0"
                  >
                    Set {ex.repsOrRest}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>
                  Estimated burn for {userWeightKg} kg:{' '}
                  <strong className="text-white tabular-nums">
                    ~
                    {estimateWorkoutCalories(
                      selectedWorkout.metValue,
                      userWeightKg,
                      selectedWorkout.durationMinutes
                    )}{' '}
                    kcal
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleLogCompletedWorkout(
                    selectedWorkout.title,
                    selectedWorkout.durationMinutes,
                    estimateWorkoutCalories(
                      selectedWorkout.metValue,
                      userWeightKg,
                      selectedWorkout.durationMinutes
                    )
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap"
              >
                Complete &amp; Log Workout
              </button>
            </div>

            {workoutStatusMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200">
                {workoutStatusMsg}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: ENTER DIET PLAN WITH GLOBAL MULTI-CURRENCY STRIPE CHECKOUT */}
      {activeTab === 'plans' && (
        <section className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                <Globe className="w-4 h-4" />
                <span>Worldwide Card Processing · Linked Radiant Spark Stripe Business Account</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Choose Your Lifestyle Spark Plan &amp; Pay Globally
              </h2>
              <p className="text-xs text-slate-300">
                Customers worldwide can enter their diet plan via Visa, Mastercard, Amex, Apple Pay, or Google Pay on Stripe&apos;s encrypted Checkout page. Proceeds route directly into your linked Stripe account.
              </p>
            </div>

            <div className="shrink-0">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Display &amp; Billing Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyConfig['code'])}
                className="w-full sm:w-56 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs font-bold focus:border-blue-500 focus:outline-none"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {backendPlans.map((tier) => {
              const formatted = formatLocalizedCurrency(tier.priceUsd, selectedCurrency, liveFxRates);
              return (
                <div
                  key={tier.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold block">
                      {tier.badge}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-2 font-mono">
                      <strong className="text-3xl font-black text-white tabular-nums">
                        {formatted}
                      </strong>
                      <span className="text-xs text-slate-400">
                        {tier.interval === 'year'
                          ? '/ year'
                          : tier.interval === 'one_time'
                          ? 'one-time'
                          : '/ month'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{tier.description}</p>
                    <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenStripeModal) {
                        onOpenStripeModal(tier.name, tier.priceUsd, tier.interval, tier.id);
                      }
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Enter Plan · Pay {formatted}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
