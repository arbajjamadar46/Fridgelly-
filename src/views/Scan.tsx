import React, { useState, useRef } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card } from '../components/ui/Base';
import { Camera, X, Upload, Check, Loader2, RefreshCw } from 'lucide-react';
import { geminiService } from '../lib/gemini';
import { Ingredient } from '../types';

export const ScanView: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { saveScan } = useStore();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<Ingredient[]>([]);
  const [mode, setMode] = useState<'fridge' | 'dish'>('fridge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      if (mode === 'fridge') {
        const ingredients = await geminiService.analyzeFridgeImage(image);
        setResults(ingredients);
      } else {
        const decoded = await geminiService.decodeDish(image, []);
        // For dish vision, we navigate directly to cooking or recipe detail
        // For this demo, let's just show ingredients found
        setResults(decoded.ingredients.available.map(name => ({
          id: Math.random().toString(36).substr(2, 9),
          name,
          confidence: 90,
          category: 'decoded'
        })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  const confirm = () => {
    if (image) {
      saveScan(results, image);
      setView('home');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tight">
          {mode === 'fridge' ? 'Scan Fridge' : 'Decode Dish'}
        </h2>
        <button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setMode('fridge')}
          className={`flex-1 py-4 rounded-3xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
            mode === 'fridge' ? "border-brand-red bg-brand-red text-white" : "border-gray-100 text-gray-400"
          }`}
        >
          Fridge Scan
        </button>
        <button 
          onClick={() => setMode('dish')}
          className={`flex-1 py-4 rounded-3xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
            mode === 'dish' ? "border-brand-teal bg-brand-teal text-white" : "border-gray-100 text-gray-400"
          }`}
        >
          Dish Vision
        </button>
      </div>

      {!image ? (
        <label className="block w-full border-4 border-dashed border-gray-100 rounded-[40px] p-20 text-center cursor-pointer hover:border-brand-red/20 hover:bg-brand-red/5 transition-all">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} ref={fileInputRef} />
          <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera size={40} className="text-brand-red" />
          </div>
          <p className="text-xl font-black text-brand-dark mb-2">Snap a Photo</p>
          <p className="text-gray-400 font-medium">Capture your fridge or any delicious dish</p>
        </label>
      ) : (
        <div className="space-y-8">
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-black aspect-square md:aspect-video flex items-center justify-center">
            <img src={image} className={`w-full h-full object-cover transition-all ${scanning ? "blur-md opacity-50" : ""}`} alt="Capture" />
            
            {scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">Gemini is analyzing...</p>
              </div>
            )}

            {!scanning && results.length === 0 && (
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                <Button size="lg" onClick={startScan}>
                  <RefreshCw size={18} /> Analyze Image
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase">We found...</h3>
                  <p className="text-xs font-bold text-gray-400">{results.length} items identified</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {results.map(ing => (
                    <div 
                      key={ing.id} 
                      className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 transition-all ${
                        ing.confidence < 70 ? "border-brand-orange bg-white" : "border-brand-teal/20 bg-white shadow-sm"
                      }`}
                    >
                      <span className="text-sm font-bold">{ing.name}</span>
                      <X size={14} className="text-gray-300 cursor-pointer hover:text-brand-red" />
                    </div>
                  ))}
                  <button className="px-4 py-2 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-black uppercase tracking-widest hover:border-brand-red/20 transition-all">
                    + Add Item
                  </button>
                </div>

                <Button size="lg" className="w-full" onClick={confirm}>
                  <Check size={20} /> Use these ingredients
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button onClick={() => setImage(null)} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-4">
             Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};
