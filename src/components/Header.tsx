import React from 'react';
import { useStore } from '../lib/store';
import { Flame, User } from 'lucide-react';
import { getLevel } from '../lib/utils';

export const Header: React.FC = () => {
  const { profile } = useStore();
  const level = getLevel(profile.cookCount);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-6 lg:px-12">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-black text-brand-red tracking-tight">Fridgelly</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-brand-red/10 px-3 py-1 rounded-full">
          <Flame className="w-4 h-4 text-brand-red fill-brand-red" />
          <span className="text-sm font-bold text-brand-red">{profile.streak}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{level.name}</p>
            <p className="text-sm font-bold leading-none">{profile.cookCount} Cooke{profile.cookCount === 1 ? 'd' : 's'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center border-2 border-brand-red/20 shadow-sm">
            <User className="w-5 h-5 text-brand-red" />
          </div>
        </div>
      </div>
    </header>
  );
};
