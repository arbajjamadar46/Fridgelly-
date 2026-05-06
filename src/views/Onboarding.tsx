import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../lib/store';
import { Button, Card } from '../components/ui/Base';
import { ChevronRight, Check, Bell, Utensils, Heart } from 'lucide-react';

const DIETARY = ["Vegetarian", "Keto", "Vegan", "Gluten-Free", "Paleo", "High-Protein"];
const CUISINES = ["Indian", "Italian", "Mexican", "Chinese", "Mediterranean", "Japanese", "American", "Thai", "Middle Eastern"];

export const OnboardingView: React.FC = () => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<any>({ dietaryFilters: [], favoriteCuisines: [] });
  const { completeOnboarding } = useStore();

  const toggleDiet = (diet: string) => {
    setPrefs((prev: any) => ({
      ...prev,
      dietaryFilters: prev.dietaryFilters.includes(diet)
        ? prev.dietaryFilters.filter((d: string) => d !== diet)
        : [...prev.dietaryFilters, diet]
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setPrefs((prev: any) => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(cuisine)
        ? prev.favoriteCuisines.filter((c: string) => c !== cuisine)
        : [...prev.favoriteCuisines, cuisine].slice(0, 3)
    }));
  };

  const next = () => setStep(prev => prev + 1);
  const finish = () => completeOnboarding(prefs);

  const steps = [
    {
      title: "Dietary Preferences",
      desc: "Customize your experience to your needs.",
      content: (
        <div className="grid grid-cols-2 gap-3 mt-8">
          {DIETARY.map(diet => (
            <button
              key={diet}
              onClick={() => toggleDiet(diet)}
              className={`p-4 rounded-3xl border-2 transition-all text-left group ${
                prefs.dietaryFilters.includes(diet) 
                  ? "border-brand-red bg-brand-red/5" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors ${
                prefs.dietaryFilters.includes(diet) ? "bg-brand-red text-white" : "bg-gray-100 group-hover:bg-gray-200"
              }`}>
                {prefs.dietaryFilters.includes(diet) ? <Check size={16} /> : <Utensils size={16} />}
              </div>
              <p className="font-black text-sm uppercase tracking-tight">{diet}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Favorite Cuisines",
      desc: "Pick up to 3 cuisines you love the most.",
      content: (
        <div className="grid grid-cols-2 gap-3 mt-8">
          {CUISINES.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => toggleCuisine(cuisine)}
              className={`p-4 rounded-3xl border-2 transition-all text-left group ${
                prefs.favoriteCuisines.includes(cuisine) 
                  ? "border-brand-teal bg-brand-teal/5" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors ${
                prefs.favoriteCuisines.includes(cuisine) ? "bg-brand-teal text-white" : "bg-gray-100 group-hover:bg-gray-200"
              }`}>
                {prefs.favoriteCuisines.includes(cuisine) ? <Check size={16} /> : <Heart size={16} />}
              </div>
              <p className="font-black text-sm uppercase tracking-tight">{cuisine}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Stay Notified",
      desc: "Get rescue alerts for perishable items and streak reminders.",
      content: (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6">
            <Bell size={48} className="text-brand-orange" />
          </div>
          <p className="text-gray-500 max-w-xs mb-8">
            Enable notifications to keep your fridge healthy and your streaks alive.
          </p>
          <Button variant="orange" size="lg" className="w-full" onClick={finish}>
            Enable Notifications
          </Button>
          <button onClick={finish} className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
            Maybe Later
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-brand-bg overflow-y-auto flex md:items-center justify-center p-4 py-10">
      <Card className="w-full max-w-md p-6 md:p-8 relative">
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? "bg-brand-red" : "bg-gray-100"}`} />
          ))}
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-black text-brand-dark mb-2">{steps[step].title}</h2>
              <p className="text-gray-500 font-medium">{steps[step].desc}</p>
              {steps[step].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 2 && (
          <div className="mt-10 flex justify-between items-center border-t border-gray-50 pt-6">
            <button 
              onClick={step === 1 ? finish : next} 
              className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors h-12 flex items-center px-4"
            >
              Skip
            </button>
            <Button size="lg" onClick={next} className="shadow-lg shadow-brand-red/20 translate-y-0">
              Continue <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
