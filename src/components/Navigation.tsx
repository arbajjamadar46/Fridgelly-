import React from 'react';
import { cn } from '../lib/utils';
import { Home, Scan, ShoppingBag, ChefHat, MessageCircle } from 'lucide-react';

interface NavProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navigation: React.FC<NavProps> = ({ currentView, setView }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scan', icon: Scan, label: 'Scan' },
    { id: 'kitchen', icon: ChefHat, label: 'Kitchen' },
    { id: 'shopping', icon: ShoppingBag, label: 'Shop' },
    { id: 'coach', icon: MessageCircle, label: 'Coach' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass z-40 md:hidden flex items-center justify-around px-2 pb-safe">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            currentView === id ? "text-brand-red" : "text-gray-400"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            currentView === id && "bg-brand-red/10"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </button>
      ))}
    </nav>
  );
};
