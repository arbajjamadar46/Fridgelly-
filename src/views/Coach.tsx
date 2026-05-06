import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from '../components/ui/Base';
import { MessageCircle, Send, Sparkles, Target, Zap, Waves, Trash2, ArrowRight } from 'lucide-react';
import { geminiService } from '../lib/gemini';

export const CoachView: React.FC = () => {
  const { profile, inventory } = useStore();
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: `Hey ${profile.lastCookDate ? 'back' : ''}! I'm Coach, your culinary co-pilot. I've scanned your current fridge (${inventory.length} items). What's the goal today?` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const goalIcons: any = {
    "Lose weight": <Waves />,
    "Build muscle": <Zap />,
    "Eat cleaner": <Sparkles />,
    "Reduce waste": <Trash2 />,
    "Cook more variety": <Target />,
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      // For this applet, Coach chat is specifically for recipe recommendation from current fridge
      const res = await geminiService.generateRecipes(
        inventory.map(i => i.name),
        profile.dietaryFilters,
        `Respond to user: "${userText}". Recommend one recipe from their items.`
      );
      
      const rec = res[0];
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Based on your goal, I recommend making ${rec.title}. It's ${rec.cookTime} and hits your ${profile.dietaryFilters.join(', ') || 'health'} target perfectly.`,
        recipe: rec 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having a bit of brain fog, check your connection!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-1">Fridgelly Coach</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <p className="text-xs font-black text-brand-teal uppercase tracking-widest">Active & Ready</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-3">
          <Card className="flex items-center gap-4 py-3 px-6 h-auto">
             <div className="text-brand-red font-black text-2xl">84</div>
             <div className="text-[10px] font-black uppercase text-gray-400">Coach<br/>Score</div>
          </Card>
        </div>
      </div>

      <div className="flex-1 bg-white/40 rounded-[40px] border border-white/60 glass overflow-hidden flex flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-5 rounded-[32px] ${
                  msg.role === 'user' 
                    ? "bg-brand-red text-white rounded-tr-none" 
                    : "bg-white text-brand-dark shadow-sm border border-gray-50 rounded-tl-none font-medium"
                }`}>
                  <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                  
                  {msg.recipe && (
                    <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-1">Recommended</p>
                        <p className="text-sm font-black text-brand-dark uppercase tracking-tight truncate">{msg.recipe.title}</p>
                      </div>
                      <ArrowRight size={20} className="text-brand-red" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/50 p-4 rounded-3xl flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-red animate-bounce" />
                   <div className="w-2 h-2 rounded-full bg-brand-red animate-bounce [animation-delay:0.2s]" />
                   <div className="w-2 h-2 rounded-full bg-brand-red animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white/60 border-t border-white/20">
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your ingredients..."
              className="flex-1 bg-white rounded-2xl py-4 pl-6 pr-16 font-bold text-sm shadow-inner transition-all focus:ring-4 focus:ring-brand-red/5 outline-none"
            />
            <Button 
              type="submit"
              size="icon" 
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(goalIcons).map(([goal, icon]: [string, any]) => (
          <button 
            key={goal}
            className="flex flex-col items-center gap-2 p-4 bg-white/50 rounded-3xl border border-white hover:border-brand-red/20 transition-all group"
          >
            <div className="text-brand-red group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-gray-500">{goal}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
