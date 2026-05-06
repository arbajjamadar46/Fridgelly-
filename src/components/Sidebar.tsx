import React from 'react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { Filter, History, Heart, Calendar } from 'lucide-react';

export const Sidebar: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { profile, updateFilters, history } = useStore();

  const dietaryOptions = [
    "Pure Veg", "Jain", "Vegan", "High-Protein", "Keto", "Gluten-Free"
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 glass hidden md:flex flex-col p-6 overflow-y-auto z-30">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-brand-red" />
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Dietary Filters</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map(tag => (
            <button
              key={tag}
              onClick={() => updateFilters(tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all btn-press",
                profile.dietaryFilters.includes(tag)
                  ? "bg-brand-red text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <button 
          onClick={() => setView('kitchen')}
          className="flex items-center gap-3 w-full text-left p-3 rounded-2xl hover:bg-white/50 transition-colors group"
        >
          <Heart className="w-5 h-5 text-brand-red group-hover:fill-brand-red transition-all" />
          <span className="font-bold">Favorites</span>
        </button>

        <button 
          onClick={() => setView('mealplanner')}
          className="flex items-center gap-3 w-full text-left p-3 rounded-2xl hover:bg-white/50 transition-colors group"
        >
          <Calendar className="w-5 h-5 text-brand-teal group-hover:fill-brand-teal transition-all" />
          <span className="font-bold">Meal Planner</span>
        </button>

        <div>
          <div className="flex items-center gap-2 mb-4 p-3">
            <History className="w-4 h-4 text-brand-orange" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Recent Scans</h2>
          </div>
          <div className="space-y-3 px-3">
            {history.length > 0 ? history.map(scan => (
              <button 
                key={scan.id}
                className="w-full text-left bg-white/40 p-2 rounded-xl flex items-center gap-3 hover:bg-white/60 transition-all border border-transparent hover:border-brand-red/20"
              >
                <img src={scan.thumbnail} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="Scan" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{scan.ingredients.map(i => i.name).join(', ')}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{new Date(scan.date).toLocaleDateString()}</p>
                </div>
              </button>
            )) : (
              <p className="text-xs text-gray-400 px-1">No scans yet</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
