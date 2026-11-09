/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Volume2,
  Heart,
  Flame,
  Utensils,
  UserCheck,
  Calendar,
  Send,
  MessageSquare,
  Lock,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface LifestylePortalProps {
  onOpenStripeModal?: (planName: string, priceUsd: number) => void;
}

export const LifestylePortal: React.FC<LifestylePortalProps> = ({ onOpenStripeModal }) => {
  // BLANK Intake Form State (No hardcoded sample data!)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneWhatsApp: '',
    age: '',
    gender: 'female',
    currentWeight: '',
    targetWeight: '',
    dietPreference: 'high_protein',
    dailyCalorieGoal: '1800',
    lifestyleGoal: 'weight_loss',
    preferredCurrency: 'USD',
  });

  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'diet' | 'lifestyle' | 'coach'>('diet');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phoneWhatsApp) {
      alert('Please fill in your name, email, and WhatsApp number to create your subscription.');
      return;
    }

    if (onOpenStripeModal) {
      onOpenStripeModal('Pro Lifestyle & Diet Subscription', 29);
    } else {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setSubscribedPlan('pro_active');
        generateAiDietPlan();
      }, 1500);
    }
  };

  const generateAiDietPlan = () => {
    const nameStr = formData.fullName || 'Valued Subscriber';
    const goalStr = formData.lifestyleGoal === 'weight_loss' ? 'Weight Loss & Toning' : 'Muscle Gain & Vitality';
    const dietType = formData.dietPreference === 'high_protein' ? 'High Protein Botanical & Lean Plan' : 'Pure Sattvik Herbal Plan';

    setGeneratedPlan({
      subscriberName: nameStr,
      dietName: `Personalized 7-Day ${dietType} (${goalStr})`,
      dailyCalories: formData.dailyCalorieGoal || '1800 kcal',
      waterIntake: '3.5 Liters Daily + RDNT Sparkle Electrolyte Tonic',
      breakfast: 'Avocado Toast with Pumpkin Seeds & Botanical Berry Spritz (280 kcal)',
      lunch: 'Quinoa & Herb Bowl with Grilled Tofu / Lean Protein & Lemon Grass Tea (450 kcal)',
      snack: 'Spicy Sparkle Gourmet Almonds & Green Detox Juice (180 kcal)',
      dinner: 'Steamed Asparagus, Herbal Lentil Soup & Chamomile Infusion (320 kcal)',
      aiCoachNote: `Hello ${nameStr}! I am Coach Maya Chen. Your customized daily macros and lifestyle workouts are synced automatically to your WhatsApp. No manual logging required!`,
    });
  };

  const toggleElevenLabsVoice = () => {
    setVoicePlaying(true);
    setTimeout(() => {
      setVoicePlaying(false);
    }, 4500);
  };

  return (
    <div className="space-y-10 py-6">
      {/* Portal Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIFESTYLE.RADIANTSPARKLLC.COM · AI HEALTH &amp; WELLNESS PLATFORM</span>
              </div>

              <a
                href="https://github.com/svinnakota84/lifestylehub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all hover:scale-105"
                title="View GitHub Repository svinnakota84/lifestylehub"
              >
                <span>📦</span>
                <span>GitHub: svinnakota84/lifestylehub ↗</span>
              </a>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Personalized AI Diet, Fashion &amp; Daily Lifestyle Subscription
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Powered by <strong className="text-white">Coach Maya Chen &amp; Dr. Ananya Iyer</strong>. Integrated directly from <a href="https://github.com/svinnakota84/lifestylehub" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">svinnakota84/lifestylehub</a> into Radiant Spark LLC. Subscribe once to receive automated daily diet plans, workout schedules, and fashion trend updates directly to your WhatsApp with zero manual effort.
            </p>
          </div>

          {/* ElevenLabs WhatsApp Voice Badge */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-center shrink-0 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              ElevenLabs Voice AI Agent
            </span>
            <button
              onClick={toggleElevenLabsVoice}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Volume2 className={`w-4 h-4 ${voicePlaying ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{voicePlaying ? 'Playing Maya AI Voice...' : 'Listen to Voice Coach 🔊'}</span>
            </button>
            <span className="text-[9px] text-slate-400 block font-mono">
              WhatsApp Voice Audio Ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Intake & Subscription Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): BLANK Customer Intake Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">
              <UserCheck className="w-4 h-4" />
              <span>New Customer Registration &amp; Diet Customizer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Enter Your Health Profile for Real-Time Plan Generation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fields are clean and unpopulated. Enter your unique body metrics to subscribe.
            </p>
          </div>

          <form onSubmit={handleSubscribeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name..."
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com..."
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  WhatsApp Mobile Number (With Country Code) *
                </label>
                <input
                  type="tel"
                  name="phoneWhatsApp"
                  placeholder="+1 (555) 000-0000 or +91 9876543210..."
                  value={formData.phoneWhatsApp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Health &amp; Lifestyle Goal
                </label>
                <select
                  name="lifestyleGoal"
                  value={formData.lifestyleGoal}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="weight_loss">Weight Loss &amp; Fat Toning (7-Day Program)</option>
                  <option value="muscle_gain">Lean Muscle &amp; Athletic Performance</option>
                  <option value="detox_glow">Botanical Herbal Detox &amp; Skin Radiance</option>
                  <option value="diabetic_keto">Low-GI Keto &amp; Metabolic Balance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Current Weight (kg / lbs)
                </label>
                <input
                  type="text"
                  name="currentWeight"
                  placeholder="e.g. 72 kg..."
                  value={formData.currentWeight}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Target Weight (kg / lbs)
                </label>
                <input
                  type="text"
                  name="targetWeight"
                  placeholder="e.g. 62 kg..."
                  value={formData.targetWeight}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Dietary Preference
                </label>
                <select
                  name="dietPreference"
                  value={formData.dietPreference}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="high_protein">High Protein &amp; Lean Botanical</option>
                  <option value="vegetarian_sattvik">Pure Vegetarian &amp; Sattvik Herbal</option>
                  <option value="vegan_organic">100% Organic Vegan</option>
                  <option value="keto_lowcarb">Keto &amp; Healthy Fats</option>
                </select>
              </div>
            </div>

            {/* Currency & Stripe Multi-Currency Info */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Stripe Multi-Currency Billing (USD Base)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Auto Currency Conversion Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Payments are processed in USD ($29/mo). If paying with INR (₹2,400), EUR (€26), GBP (£22), or AED (106 AED), Stripe automatically converts your local card currency to USD seamlessly.
              </p>
            </div>

            {/* Submit & Subscribe Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                  <span>Generating Custom AI Diet &amp; Activating Stripe...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>Subscribe to AI Diet &amp; Lifestyle ($29/mo via Stripe)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (5 cols): AI Coach Assistant & Dynamic Plan Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Coach Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-lg shadow-md">
                  🧘‍♀️
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Coach Maya Chen</h3>
                  <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                    Lead AI Health &amp; Nutrition Specialist
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active 24/7</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              "Welcome! Every morning at 6:00 AM, our autonomous AI pipeline generates your exact daily meal macro breakdown, hydration targets, and seasonal fashion trends. You never have to log data manually."
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Direct WhatsApp Dispatch Capabilities:
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Daily 6:00 AM Calorie &amp; Recipe Push to WhatsApp</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ElevenLabs Voice AI Audio Guidance Clips</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-time Food &amp; Lifestyle trend alerts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Generated Plan Display Panel */}
          {generatedPlan ? (
            <div className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/60 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Live Custom Diet Matrix
                </div>
                <span className="text-[10px] font-mono text-slate-400">Subscriber: {generatedPlan.subscriberName}</span>
              </div>

              <h4 className="text-base font-extrabold text-white">{generatedPlan.dietName}</h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Daily Energy Target</span>
                  <strong className="text-amber-300 text-xs block">{generatedPlan.dailyCalories}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Hydration Goal</span>
                  <strong className="text-cyan-300 text-xs block">3.5 Liters/Day</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">Breakfast:</strong>
                  <span className="text-slate-200">{generatedPlan.breakfast}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">Lunch:</strong>
                  <span className="text-slate-200">{generatedPlan.lunch}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">Evening Snack:</strong>
                  <span className="text-slate-200">{generatedPlan.snack}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">Dinner:</strong>
                  <span className="text-slate-200">{generatedPlan.dinner}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
              <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Submit the form on the left with your name and WhatsApp number to generate your instant AI Diet &amp; Lifestyle Plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
