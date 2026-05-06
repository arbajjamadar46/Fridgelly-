import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from '../components/ui/Base';
import { ShoppingBag, Check, Trash2, Plus, Sparkles, X } from 'lucide-react';
import { generateId } from '../lib/utils';

export const ShoppingListView: React.FC = () => {
  const { shoppingList, toggleShopping, clearCompletedShopping, addToShopping } = useStore();
  const [newItem, setNewItem] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addToShopping([newItem.trim()]);
      setNewItem('');
    }
  };

  const completedCount = shoppingList.filter(i => i.completed).length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Cart</h2>
          <p className="text-gray-500 font-medium">Items you need for your next masterpiece.</p>
        </div>

        {completedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompletedShopping} className="text-brand-red hover:bg-brand-red/5">
             Clear Completed ({completedCount})
          </Button>
        )}
      </div>

      <Card className="p-2">
        <form onSubmit={handleAdd} className="flex gap-2 p-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add Paneer, Atta, Masala..."
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-sm focus:ring-2 focus:ring-brand-red/20"
            />
            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <Button type="submit" size="lg" className="px-10">Add</Button>
        </form>
      </Card>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {shoppingList.length > 0 ? shoppingList.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div 
                onClick={() => toggleShopping(item.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  item.completed 
                    ? "bg-gray-50 border-gray-100 opacity-60" 
                    : "bg-white border-white shadow-sm hover:border-brand-red/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    item.completed ? "bg-brand-teal border-brand-teal text-white" : "border-gray-200"
                  }`}>
                    {item.completed && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className={`font-black text-sm uppercase tracking-tight transition-all ${
                    item.completed ? "line-through text-gray-400" : "text-brand-dark"
                  }`}>
                    {item.name}
                  </span>
                </div>
                
                {!item.completed && (
                  <Badge variant="gray">To Buy</Badge>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-gray-200" />
              </div>
              <p className="font-black text-gray-300 uppercase tracking-widest text-sm">Your cart is empty</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {shoppingList.length > 0 && (
         <Card className="bg-brand-teal p-8 border-none text-white relative overflow-hidden group">
            <Sparkles className="absolute top-4 right-4 text-white/20 group-hover:rotate-12 transition-transform" size={100} />
            <h3 className="text-2xl font-black uppercase mb-2">Smart Shop</h3>
            <p className="text-white/80 font-bold max-w-sm mb-6">Based on your meal plan, you'll save approx. ₹420 by buying these at BigBasket.</p>
            <Button variant="secondary" size="lg" className="bg-white text-brand-teal border-none">Check Best Prices</Button>
         </Card>
      )}
    </div>
  );
};
