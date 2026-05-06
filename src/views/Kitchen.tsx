import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from '../components/ui/Base';
import { Heart, Hash, Clock, Flame, Award, Share2, Download, History, ChevronRight } from 'lucide-react';
import { getLevel } from '../lib/utils';
import html2canvas from 'html2canvas';

export const KitchenView: React.FC<{ setView: (v: string) => void; onCook: (r: any) => void }> = ({ setView, onCook }) => {
  const { favorites, profile, fingerprint, toggleFavorite, history } = useStore();
  const level = getLevel(profile.cookCount);
  const [activeTab, setActiveTab] = useState<'favs' | 'profile' | 'history'>('favs');

  const shareFingerprint = async () => {
    const el = document.getElementById('fingerprint-card');
    if (el) {
      const canvas = await html2canvas(el);
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'my-fridgelly-palate.png';
      link.href = imgData;
      link.click();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-2">My Kitchen</h2>
          <p className="text-gray-500 font-medium">Your culinary journey, leveled up.</p>
        </div>

        <div className="flex bg-white/50 p-1.5 rounded-3xl self-start">
          <button 
            onClick={() => setActiveTab('favs')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'favs' ? "bg-white text-brand-red shadow-sm" : "text-gray-400 font-bold"}`}
          >
            Favorites
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? "bg-white text-brand-red shadow-sm" : "text-gray-400 font-bold"}`}
          >
            Palate
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? "bg-white text-brand-red shadow-sm" : "text-gray-400 font-bold"}`}
          >
            History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'favs' && (
          <motion.div 
            key="favs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.length > 0 ? favorites.map(recipe => (
              <Card key={recipe.id} className="relative group">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="teal">{recipe.cookTime}</Badge>
                  <button onClick={() => toggleFavorite(recipe)} className="text-brand-red">
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
                <h3 className="text-lg font-black mb-2 group-hover:text-brand-red transition-colors">{recipe.title}</h3>
                <p className="text-xs text-gray-500 font-medium mb-4 line-clamp-2">{recipe.description}</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => onCook(recipe)}>
                  Cook again <ChevronRight size={14} />
                </Button>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center bg-white/30 rounded-[40px] border-2 border-dashed border-gray-100">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No favorites yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 flex flex-col items-center text-center p-10 bg-brand-red text-white border-none shadow-brand-red/20 shadow-xl">
                 <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 border-4 border-white/10">
                    <Award size={48} className="text-white" />
                 </div>
                 <h3 className="text-3xl font-black uppercase mb-1">{level.name}</h3>
                 <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-6">Level {level.min}</p>
                 <div className="w-full bg-white/20 h-2 rounded-full mb-2">
                    <div className="bg-white h-full rounded-full" style={{ width: `${Math.min(100, (profile.cookCount / (level.min + 30)) * 100)}%` }} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Next: {level.min + 30} meals</p>
              </Card>

              <div id="fingerprint-card" className="lg:col-span-2 rounded-[40px] p-10 flex flex-col justify-between aspect-[16/9] lg:aspect-auto border-4 border-brand-red bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <UtensilsIcon size={200} />
                  </div>
                  
                  {fingerprint ? (
                    <>
                      <div>
                        <Badge variant="red">Palate Fingerprint</Badge>
                        <h3 className="text-5xl font-black text-brand-dark mt-4 mb-6 leading-tight max-w-lg italic">
                          "{fingerprint.poeticTagline}"
                        </h3>
                        <div className="flex flex-wrap gap-4 mb-8">
                          {fingerprint.flavorProfile.map(f => (
                            <div key={f} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                                <span className="text-sm font-black uppercase tracking-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-black text-brand-red">Fridgelly</h4>
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Taste Profile v2.4</p>
                         </div>
                         <div className="flex gap-2">
                            <Button size="icon" variant="outline" onClick={shareFingerprint}><Download size={18} /></Button>
                            <Button size="icon" variant="outline"><Share2 size={18} /></Button>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                       <p className="text-gray-400 font-bold mb-4 uppercase tracking-widest">Cook 5 more meals to unlock your biometric palate</p>
                       <Button onClick={() => setView('home')}>Start Cooking</Button>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {history.length > 0 ? history.map(scan => (
              <Card key={scan.id} className="flex flex-col md:flex-row gap-6 items-center p-4">
                <img src={scan.thumbnail} className="w-full md:w-40 h-40 md:h-24 rounded-2xl object-cover" alt="Scan" />
                <div className="flex-1">
                  <p className="text-xs font-black text-brand-red uppercase tracking-widest mb-1">{new Date(scan.date).toLocaleDateString()}</p>
                  <p className="font-bold text-lg mb-2">{scan.ingredients.map(i => i.name).join(', ')}</p>
                  <div className="flex gap-2">
                    <Badge variant="gray">{scan.ingredients.length} items</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setView('home'); }}>Restore Scan</Button>
              </Card>
            )) : (
              <div className="py-20 text-center bg-white/30 rounded-[40px]">
                <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No scan history</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UtensilsIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
