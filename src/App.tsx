import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StoreProvider, useStore } from './lib/store';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';

// Views (to be implemented)
import { HomeView } from './views/Home';
import { ScanView } from './views/Scan';
import { KitchenView } from './views/Kitchen';
import { ShoppingListView } from './views/ShoppingList';
import { CoachView } from './views/Coach';
import { CookingModeView } from './views/CookingMode';
import { OnboardingView } from './views/Onboarding';
import { MealPlannerView } from './views/MealPlanner';

const AppContent: React.FC = () => {
  const [view, setView] = useState('home');
  const [activeRecipe, setActiveRecipe] = useState<any>(null);
  const { profile } = useStore();

  if (!profile.onboardingComplete) {
    return <OnboardingView />;
  }

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView setView={setView} onCook={(r: any) => { setActiveRecipe(r); setView('cooking'); }} />;
      case 'scan': return <ScanView setView={setView} />;
      case 'kitchen': return <KitchenView setView={setView} onCook={(r: any) => { setActiveRecipe(r); setView('cooking'); }} />;
      case 'shopping': return <ShoppingListView />;
      case 'coach': return <CoachView />;
      case 'cooking': return <CookingModeView recipe={activeRecipe} onBack={() => { setView('home'); setActiveRecipe(null); }} />;
      case 'mealplanner': return <MealPlannerView onBack={() => setView('home')} />;
      default: return <HomeView setView={setView} onCook={(r: any) => { setActiveRecipe(r); setView('cooking'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 md:pb-0 md:pl-64 pt-16">
      <Header />
      <Sidebar setView={setView} />
      
      <main className="p-4 lg:p-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation currentView={view} setView={setView} />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
