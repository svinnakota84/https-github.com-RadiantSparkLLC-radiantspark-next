/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Volume2,
  Utensils,
  UserCheck,
  CreditCard,
  Send,
  Heart,
  Flame,
  Globe,
} from 'lucide-react';

interface LifestylePortalProps {
  onOpenStripeModal?: (planName: string, priceUsd: number) => void;
}

export const LifestylePortal: React.FC<LifestylePortalProps> = ({ onOpenStripeModal }) => {
  // BLANK Intake Form State (Direct Customer Entry)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneWhatsApp: '',
    age: '28',
    gender: 'female',
    currentWeight: '',
    targetWeight: '',
    dietPreference: 'high_protein',
    dailyCalorieGoal: '1800',
    lifestyleGoal: 'weight_loss',
    preferredCurrency: 'USD',
  });

  const [generatedPlan, setGeneratedPlan] = useState<any | null>({
    subscriberName: 'Valued Customer',
    dietName: 'Personalized 7-Day High Protein Botanical & Lean Plan (Weight Loss & Toning)',
    dailyCalories: '1800 kcal',
    waterIntake: '3.5 Liters Daily + RDNT Sparkle Electrolyte Tonic',
    breakfast: 'Avocado Toast with Pumpkin Seeds & Botanical Berry Spritz (280 kcal)',
    lunch: 'Quinoa & Herb Bowl with Grilled Tofu / Lean Protein & Lemon Grass Tea (450 kcal)',
    snack: 'Spicy Sparkle Gourmet Almonds & Green Detox Juice (180 kcal)',
    dinner: 'Steamed Asparagus, Herbal Lentil Soup & Chamomile Infusion (320 kcal)',
    aiCoachNote: 'Welcome! Adjust your health goals and metrics on the left, then click "Generate Custom Diet Plan" to refresh your personalized meal breakdown in real-time.',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      const nameStr = formData.fullName.trim() || 'Valued Customer';
      const goalStr =
        formData.lifestyleGoal === 'weight_loss'
          ? 'Weight Loss & Toning'
          : formData.lifestyleGoal === 'muscle_gain'
          ? 'Lean Muscle & Performance'
          : formData.lifestyleGoal === 'detox_glow'
          ? 'Botanical Herbal Detox & Radiance'
          : 'Low-GI Metabolic Balance';

      const dietType =
        formData.dietPreference === 'high_protein'
          ? 'High Protein Botanical & Lean Plan'
          : formData.dietPreference === 'vegetarian_sattvik'
          ? 'Pure Sattvik Herbal Plan'
          : formData.dietPreference === 'vegan_organic'
          ? '100% Organic Vegan Plan'
          : 'Keto & Healthy Fats Plan';

      setGeneratedPlan({
        subscriberName: nameStr,
        dietName: `Personalized 7-Day ${dietType} (${goalStr})`,
        dailyCalories: `${formData.dailyCalorieGoal || '1800'} kcal`,
        waterIntake: '3.5 Liters Daily + RDNT Sparkle Electrolyte Tonic',
        breakfast:
          formData.dietPreference === 'vegan_organic'
            ? 'Organic Açai & Coconut Chia Pudding with Fresh Berries (260 kcal)'
            : formData.dietPreference === 'keto_lowcarb'
            ? 'Avocado & Spinach Egg White Omelet with Walnut Salad (310 kcal)'
            : 'Avocado Toast with Pumpkin Seeds & Botanical Berry Spritz (280 kcal)',
        lunch:
          formData.dietPreference === 'vegetarian_sattvik'
            ? 'Moong Dal & Moringa Herbal Stew with Brown Rice & Cucumber Raitha (420 kcal)'
            : 'Quinoa & Herb Bowl with Grilled Tofu / Lean Protein & Lemon Grass Tea (450 kcal)',
        snack: 'Spicy Sparkle Gourmet Almonds & Green Detox Juice (180 kcal)',
        dinner:
          formData.lifestyleGoal === 'muscle_gain'
            ? 'Herbal Spiced Quinoa, Grilled Mushrooms & Sparkle Electrolyte Water (480 kcal)'
            : 'Steamed Asparagus, Herbal Lentil Soup & Chamomile Infusion (320 kcal)',
        aiCoachNote: `Hello ${nameStr}! Coach Maya Chen & Dr. Ananya Iyer have calculated your customized daily macros for ${goalStr}. Enjoy your clean, zero-sugar, nutrient-dense diet plan!`,
      });
    }, 600);
  };

  const toggleElevenLabsVoice = () => {
    setVoicePlaying(true);
    setTimeout(() => {
      setVoicePlaying(false);
    }, 4500);
  };

  const handleSendWhatsAppPlan = () => {
    const phone = formData.phoneWhatsApp.replace(/[^0-9]/g, '') || '919848022331';
    const msg = encodeURIComponent(
      `🥦 *RDNT Lifestyle & Diet Plan for ${generatedPlan?.subscriberName}*\n\n` +
      `📋 *Plan:* ${generatedPlan?.dietName}\n` +
      `🔥 *Target Calories:* ${generatedPlan?.dailyCalories}\n` +
      `💧 *Hydration:* ${generatedPlan?.waterIntake}\n\n` +
      `🌅 *Breakfast:* ${generatedPlan?.breakfast}\n` +
      `🥗 *Lunch:* ${generatedPlan?.lunch}\n` +
      `🍏 *Snack:* ${generatedPlan?.snack}\n` +
      `🍲 *Dinner:* ${generatedPlan?.dinner}\n\n` +
      `🧘 *Coach Maya Note:* ${generatedPlan?.aiCoachNote}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 4000);
  };

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-200">
      
      {/* Compact Top Header Navigation Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI LIFESTYLE &amp; NUTRITION HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personalized AI Diet &amp; Daily Lifestyle Plan
          </h1>
          <p className="text-xs text-slate-300">
            Powered by <strong className="text-emerald-400">Coach Maya Chen &amp; Dr. Ananya Iyer</strong>. Enter your preferences below to generate your custom meal plan instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleElevenLabsVoice}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Volume2 className={`w-4 h-4 ${voicePlaying ? 'animate-bounce text-amber-300' : ''}`} />
            <span>{voicePlaying ? 'Playing Maya AI Voice...' : 'Listen to Voice Coach 🔊'}</span>
          </button>
        </div>
      </div>

      {/* Main Intake & Plan Generation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Customer Health Profile & Meal Preferences */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Direct Customer Profile Entry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Enter Your Health Profile &amp; Preferences
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fill in your details below to generate and customize your AI diet plan in real-time.
            </p>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name..."
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  WhatsApp Mobile Number
                </label>
                <input
                  type="tel"
                  name="phoneWhatsApp"
                  placeholder="+1 (555) 000-0000 or +91 9876543210..."
                  value={formData.phoneWhatsApp}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Current Weight (kg/lbs)
                </label>
                <input
                  type="text"
                  name="currentWeight"
                  placeholder="e.g. 72 kg"
                  value={formData.currentWeight}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Target Weight (kg/lbs)
                </label>
                <input
                  type="text"
                  name="targetWeight"
                  placeholder="e.g. 62 kg"
                  value={formData.targetWeight}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Daily Calorie Target
                </label>
                <select
                  name="dailyCalorieGoal"
                  value={formData.dailyCalorieGoal}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="1400">1400 kcal (Deficit)</option>
                  <option value="1600">1600 kcal (Moderate)</option>
                  <option value="1800">1800 kcal (Balanced)</option>
                  <option value="2200">2200 kcal (Active)</option>
                  <option value="2500">2500 kcal (Muscle Gain)</option>
                </select>
              </div>
            </div>

            {/* Instant Action Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                  <span>Calculating Macros &amp; Generating Meal Matrix...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>⚡ GENERATE INSTANT CUSTOM AI DIET PLAN</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (5 cols): AI Coach Assistant & Live Plan Matrix */}
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

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "{generatedPlan?.aiCoachNote || 'Welcome! Adjust your health goals and metrics on the left to refresh your personalized meal breakdown in real-time.'}"
            </p>
          </div>

          {/* Generated Plan Display Panel */}
          {generatedPlan && (
            <div className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/60 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Live Custom Diet Matrix
                </div>
                <span className="text-[10px] font-mono text-slate-400">User: {generatedPlan.subscriberName}</span>
              </div>

              <h4 className="text-base font-extrabold text-white">{generatedPlan.dietName}</h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Daily Calorie Target</span>
                  <strong className="text-amber-300 text-xs block">{generatedPlan.dailyCalories}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Hydration Goal</span>
                  <strong className="text-cyan-300 text-xs block">3.5 Liters/Day</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">🌅 Breakfast:</strong>
                  <span className="text-slate-200">{generatedPlan.breakfast}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">🥗 Lunch:</strong>
                  <span className="text-slate-200">{generatedPlan.lunch}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">🍏 Evening Snack:</strong>
                  <span className="text-slate-200">{generatedPlan.snack}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <strong className="text-emerald-400 text-[11px] block">🍲 Dinner:</strong>
                  <span className="text-slate-200">{generatedPlan.dinner}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSendWhatsAppPlan}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>📱 Send Plan to WhatsApp</span>
                </button>

                {onOpenStripeModal && (
                  <button
                    type="button"
                    onClick={() => onOpenStripeModal('Pro Daily WhatsApp Diet Subscription', 29)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                    <span>Optional Daily Push ($29/mo)</span>
                  </button>
                )}
              </div>

              {whatsappSent && (
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-[11px] text-center font-mono">
                  ✅ Diet Plan dispatch opened in WhatsApp!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
