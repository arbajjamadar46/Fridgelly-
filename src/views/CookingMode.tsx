import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from '../components/ui/Base';
import { 
  Check, ChevronLeft, ChevronRight, Play, Pause, 
  RotateCcw, Sparkles, MessageCircle, X, Loader2 
} from 'lucide-react';
import { geminiService } from '../lib/gemini';
import { Recipe } from '../types';
import confetti from 'canvas-confetti';

export const CookingModeView: React.FC<{ recipe: Recipe; onBack: () => void }> = ({ recipe, onBack }) => {
  const { completeCooking } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);
  const [morphText, setMorphText] = useState('');
  const [showMorphSheet, setShowMorphSheet] = useState(false);
  const [steps, setSteps] = useState(recipe.steps);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  
  const touchStart = useRef<number | null>(null);
  const synthesis = window.speechSynthesis;
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string) => {
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    currentUtterance.current = utterance;
    synthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      synthesis.cancel();
      setIsPlaying(false);
    } else {
      speak(steps[currentStep]);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      synthesis.cancel();
      setIsPlaying(false);
    } else {
      finish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      synthesis.cancel();
      setIsPlaying(false);
    }
  };

  const finish = () => {
    completeCooking();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF4D4D', '#FF9F1C', '#2EC4B6']
    });
    onBack();
  };

  const handleMorph = async () => {
    if (!morphText.trim()) return;
    setIsMorphing(true);
    try {
      const remainingSteps = steps.slice(currentStep);
      const updatedSteps = await geminiService.morphRecipe(remainingSteps, morphText);
      const newSteps = [...steps.slice(0, currentStep), ...updatedSteps];
      setSteps(newSteps);
      setShowMorphSheet(false);
      setMorphText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsMorphing(false);
    }
  };

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  // Swiping
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 60) handlePrev();
    if (delta < -60) handleNext();
    touchStart.current = null;
  };

  return (
    <div 
      className="fixed inset-0 bg-brand-bg z-50 overflow-y-auto px-6 py-8"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="max-w-3xl mx-auto flex flex-col min-h-full">
        <div className="flex items-center justify-between mb-8">
           <button onClick={onBack} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
             <X size={24} />
           </button>
           <div className="text-center">
             <h2 className="text-lg font-black uppercase tracking-tight">{recipe.title}</h2>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cooking Mode</p>
           </div>
           <div className="w-12" />
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-black uppercase text-brand-red tracking-widest">Step {currentStep + 1} of {steps.length}</span>
             <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-brand-red" 
               initial={false}
               animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
             />
          </div>
        </div>

        <div className="flex-1 space-y-12 mb-36">
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Preparation Checklist</h3>
            <div className="flex flex-wrap gap-2">
              {[...recipe.ingredients.available, ...recipe.ingredients.missing].map(ing => (
                <button 
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border-2 ${
                    checkedIngredients.includes(ing) 
                      ? "bg-brand-teal/10 border-brand-teal/20 text-brand-teal" 
                      : "bg-white border-white shadow-sm text-gray-500"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    checkedIngredients.includes(ing) ? "bg-brand-teal border-brand-teal text-white" : "border-gray-200"
                  }`}>
                    {checkedIngredients.includes(ing) && <Check size={10} strokeWidth={4} />}
                  </div>
                  {ing}
                </button>
              ))}
            </div>
          </section>

          <section className="relative px-2">
             <AnimatePresence mode="wait">
               <motion.div
                 key={currentStep}
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -50 }}
                 className="space-y-8"
               >
                 <h4 className="text-3xl md:text-4xl font-black leading-tight text-brand-dark">
                   {steps[currentStep]}
                 </h4>
                 
                 <div className="flex items-center gap-4">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={togglePlay}
                      className="h-16 w-16 rounded-full"
                    >
                      {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                    </Button>
                    {isPlaying && (
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-1.5 h-6 bg-brand-red/20 rounded-full animate-pulse" />
                        ))}
                      </div>
                    )}
                    <button onClick={togglePlay} className="text-sm font-bold text-gray-400 hover:text-brand-dark transition-colors px-4 py-2">
                      Repeat Step
                    </button>
                 </div>
               </motion.div>
             </AnimatePresence>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center gap-4 bg-brand-bg/80 backdrop-blur-xl border-t border-white/20">
           <Button variant="outline" size="lg" className="flex-1 h-16" onClick={handlePrev} disabled={currentStep === 0}>
             <ChevronLeft size={24} /> Back
           </Button>
           <Button variant="primary" size="lg" className="flex-[2] h-16" onClick={handleNext}>
             {currentStep === steps.length - 1 ? 'Complete Feast' : 'Next Step'} <ChevronRight size={24} />
           </Button>
        </div>
      </div>

      <button 
        onClick={() => setShowMorphSheet(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-teal text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50 group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {showMorphSheet && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
               onClick={() => setShowMorphSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-[40px] p-10 ring-1 ring-black/5"
            >
               <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black uppercase tracking-tight">Live Recipe Morph</h3>
                     <button onClick={() => setShowMorphSheet(false)}><X /></button>
                  </div>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    Something changed? Missing an ingredient or made a mistake? Type it below and Gemini will adapt the rest of your recipe.
                  </p>
                  <div className="relative">
                     <textarea 
                       value={morphText}
                       onChange={(e) => setMorphText(e.target.value)}
                       placeholder="e.g. I don't have butter, use olive oil instead..."
                       className="w-full h-32 bg-gray-50 rounded-3xl p-6 font-bold text-sm border-none focus:ring-4 focus:ring-brand-teal/5 transition-all outline-none"
                     />
                     <Button 
                       className="absolute bottom-4 right-4" 
                       variant="teal"
                       disabled={isMorphing || !morphText.trim()}
                       onClick={handleMorph}
                     >
                       {isMorphing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} Morph Recipe
                     </Button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
