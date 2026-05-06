import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from '../components/ui/Base';
import { Scan, Search, Camera, ChevronRight, X, Info, Heart, Plus } from 'lucide-react';
import { geminiService } from '../lib/gemini';
import { Recipe } from '../types';

export const HomeView: React.FC<{ setView: (v: string) => void; onCook: (r: Recipe) => void }> = ({ setView, onCook }) => {
  const { profile, inventory, updateCuisines, recipes, setRecipes, favorites, toggleFavorite, addToShopping } = useStore();
  const [loading, setLoading] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState(profile.favoriteCuisines[0] || 'South Indian');

  const CUISINES = ["South Indian", "Punjabi", "Bengali", "Rajasthani", "Maharashtrian", "Gujarati", "Indo-Chinese", "Mughlai", "Coastal"];

  const generate = async () => {
    if (inventory.length === 0) return;
    setLoading(true);
    try {
      const recs = await geminiService.generateRecipes(
        inventory.map(i => i.name),
        profile.dietaryFilters,
        activeCuisine
      );
      setRecipes(recs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inventory.length > 0 && recipes.length === 0) {
      generate();
    }
  }, [inventory, recipes.length]);

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">Hey, Chef!</h2>
            <p className="text-gray-500 font-medium">Ready to transform your fridge content into magic?</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => setView('scan')}>
              <Scan size={18} /> Scan Fridge
            </Button>
          </div>
        </div>

        {inventory.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {inventory.map(ing => (
              <div 
                key={ing.id} 
                className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 transition-all ${
                  ing.confidence < 70 ? "border-brand-orange bg-brand-orange/5" : "border-brand-teal/20 bg-brand-teal/5"
                }`}
              >
                <span className="text-sm font-bold">{ing.name}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  ing.confidence < 70 ? "bg-brand-orange text-white" : "bg-brand-teal text-white"
                }`}>
                  {Math.round(ing.confidence)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-4 no-scrollbar">
          {CUISINES.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => { setActiveCuisine(cuisine); generate(); }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all btn-press ${
                activeCuisine === cuisine 
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white/50 rounded-[40px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <Badge variant="teal">{recipe.cookTime}</Badge>
                        <Badge variant={recipe.difficulty === 'Easy' ? 'teal' : recipe.difficulty === 'Medium' ? 'orange' : 'red'}>
                          {recipe.difficulty}
                        </Badge>
                      </div>
                      <div className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-full text-xs font-black">
                        {recipe.matchScore}% MATCH
                      </div>
                    </div>

                    <h3 className="text-xl font-black mb-3 group-hover:text-brand-red transition-colors">{recipe.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-medium">{recipe.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.ingredients.missing.length > 0 && recipe.ingredients.missing.slice(0, 3).map(m => (
                        <div key={m} className="px-2 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-lg flex items-center gap-1">
                          <span className="text-[10px] font-bold text-brand-orange">{m}</span>
                          <button onClick={() => addToShopping([m])}>
                            <X size={10} className="text-brand-orange" />
                          </button>
                        </div>
                      ))}
                      {recipe.ingredients.missing.length > 3 && (
                        <span className="text-[10px] font-bold text-gray-400">+{recipe.ingredients.missing.length - 3} more</span>
                      )}
                    </div>

                    <div className="mb-6">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const el = document.getElementById(`recipe-nutri-${recipe.id}`);
                           if (el) el.classList.toggle('hidden');
                         }}
                         className="text-[10px] font-black uppercase text-gray-400 hover:text-brand-teal transition-colors tracking-widest"
                       >
                         View Nutrition Details
                       </button>
                       <div id={`recipe-nutri-${recipe.id}`} className="hidden mt-4 grid grid-cols-5 gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
                          {[
                            { l: 'Cal', v: recipe.nutritionFacts.calories },
                            { l: 'Pro', v: recipe.nutritionFacts.protein },
                            { l: 'Fat', v: recipe.nutritionFacts.fat },
                            { l: 'Carb', v: recipe.nutritionFacts.carbs },
                            { l: 'Fib', v: recipe.nutritionFacts.fiber }
                          ].map(stat => (
                            <div key={stat.l} className="bg-gray-50 p-2 rounded-xl text-center">
                               <p className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">{stat.l}</p>
                               <p className="text-xs font-black text-brand-dark leading-none">{stat.v}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleFavorite(recipe)}
                          className={`p-2 rounded-full transition-all ${
                            favorites.find(f => f.id === recipe.id) 
                              ? "bg-brand-red/10 text-brand-red" 
                              : "bg-gray-50 text-gray-400"
                          }`}
                        >
                          <Heart size={18} fill={favorites.find(f => f.id === recipe.id) ? "currentColor" : "none"} />
                        </button>
                        <button className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-brand-teal/10 hover:text-brand-teal transition-all">
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      <Button size="sm" onClick={() => onCook(recipe)}>
                        Start Cooking <ChevronRight size={16} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};
