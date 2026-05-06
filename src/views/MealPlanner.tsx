import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from '../components/ui/Base';
import { ChevronLeft, Plus, Download, Trash2, Calendar, MoreVertical, Check } from 'lucide-react';
import { Recipe } from '../types';

export const MealPlannerView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { mealPlan, favorites, updateMealPlan } = useStore();
  const [copied, setCopied] = useState(false);
  const days = Object.keys(mealPlan);
  const slots = ['breakfast', 'lunch', 'dinner'] as const;

  const exportPlan = () => {
    let text = "My Fridgelly Weekly Plan\n\n";
    days.forEach(day => {
      text += `${day.toUpperCase()}\n`;
      slots.forEach(slot => {
        const recipe = mealPlan[day][slot];
        text += `- ${slot.charAt(0).toUpperCase() + slot.slice(1)}: ${recipe ? recipe.title : 'Not planned'}\n`;
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight">Week Plan</h2>
            <p className="text-gray-500 font-medium">Structure your nutrition with ease.</p>
          </div>
        </div>

        <Button variant={copied ? "teal" : "secondary"} onClick={exportPlan}>
          {copied ? <><Check size={18} /> Copied</> : <><Download size={18} /> Export Plan</>}
        </Button>
      </div>

      <div className="overflow-x-auto pb-10 no-scrollbar -mx-4 px-4">
        <div className="flex gap-6 min-w-max">
          {days.map(day => (
            <div key={day} className="w-80 space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark">{day}</h3>
                 <button onClick={() => {
                   slots.forEach(s => updateMealPlan(day, s, null));
                 }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-red">Clear Day</button>
              </div>

              {slots.map(slot => (
                <Card key={slot} className="relative p-0 overflow-hidden ring-1 ring-gray-50 shadow-sm min-h-[120px] flex flex-col group">
                   <div className="absolute top-3 left-3 z-10">
                      <Badge variant="gray">{slot}</Badge>
                   </div>
                   
                   {mealPlan[day][slot] ? (
                     <div className="p-6 pt-10 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-sm leading-tight text-brand-dark line-clamp-2">{mealPlan[day][slot]?.title}</h4>
                        <div className="mt-4 flex items-center justify-between">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mealPlan[day][slot]?.cookTime}</span>
                           <button onClick={() => updateMealPlan(day, slot, null)}>
                              <Trash2 size={14} className="text-gray-300 hover:text-brand-red" />
                           </button>
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 transition-all group-hover:bg-gray-50/50">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-red/10 group-hover:text-brand-red transition-all">
                           <Plus size={16} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-brand-red/40 transition-colors">Plan {slot}</p>
                        
                        {favorites.length > 0 && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 bg-gradient-to-t from-white to-transparent">
                             <button 
                               onClick={() => updateMealPlan(day, slot, favorites[0])}
                               className="w-full bg-white shadow-lg text-[10px] font-black uppercase tracking-widest py-2 rounded-xl text-brand-red border border-brand-red/10"
                             >
                               Quick Add Favorite
                             </button>
                          </div>
                        )}
                     </div>
                   )}
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section>
        <h3 className="text-xl font-black uppercase tracking-widest text-gray-400 mb-6">Quick-Add Favorites</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map(recipe => (
            <Card key={recipe.id} className="p-4 cursor-pointer hover:border-brand-red/20 border-2 border-transparent transition-all">
              <p className="text-xs font-black uppercase tracking-tight truncate">{recipe.title}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
