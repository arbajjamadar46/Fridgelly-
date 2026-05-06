import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Ingredient, Recipe, UserProfile, MealPlan, 
  ShoppingItem, ScanHistory, PalateFingerprint 
} from '../types';
import { generateId } from './utils';

interface AppState {
  inventory: Ingredient[];
  recipes: Recipe[];
  favorites: Recipe[];
  shoppingList: ShoppingItem[];
  history: ScanHistory[];
  mealPlan: MealPlan;
  profile: UserProfile;
  fingerprint: PalateFingerprint | null;
  setInventory: (inv: Ingredient[]) => void;
  setRecipes: (recs: Recipe[]) => void;
  toggleFavorite: (recipe: Recipe) => void;
  addToShopping: (items: string[]) => void;
  toggleShopping: (id: string) => void;
  clearCompletedShopping: () => void;
  updateMealPlan: (day: string, slot: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe | null) => void;
  completeCooking: () => void;
  saveScan: (ingredients: Ingredient[], thumbnail: string) => void;
  updateFilters: (tag: string) => void;
  updateCuisines: (tag: string) => void;
  completeOnboarding: (prefs: Partial<UserProfile>) => void;
}

const StoreContext = createContext<AppState | undefined>(undefined);

const INITIAL_PROFILE: UserProfile = {
  dietaryFilters: [],
  favoriteCuisines: [],
  onboardingComplete: false,
  streak: 0,
  lastCookDate: null,
  cookCount: 0,
  streakFreezeUsed: false,
  lastFreezeDate: null,
};

const INITIAL_MEAL_PLAN: MealPlan = {
  "Monday": { breakfast: null, lunch: null, dinner: null },
  "Tuesday": { breakfast: null, lunch: null, dinner: null },
  "Wednesday": { breakfast: null, lunch: null, dinner: null },
  "Thursday": { breakfast: null, lunch: null, dinner: null },
  "Friday": { breakfast: null, lunch: null, dinner: null },
  "Saturday": { breakfast: null, lunch: null, dinner: null },
  "Sunday": { breakfast: null, lunch: null, dinner: null },
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('fridgelly_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('fridgelly_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('fridgelly_shopping');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<ScanHistory[]>(() => {
    const saved = localStorage.getItem('fridgelly_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [mealPlan, setMealPlan] = useState<MealPlan>(() => {
    const saved = localStorage.getItem('fridgelly_mealplan');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_PLAN;
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fridgelly_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  const [fingerprint, setFingerprint] = useState<PalateFingerprint | null>(() => {
    const saved = localStorage.getItem('fridgelly_fingerprint');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('fridgelly_inventory', JSON.stringify(inventory));
    localStorage.setItem('fridgelly_favorites', JSON.stringify(favorites));
    localStorage.setItem('fridgelly_shopping', JSON.stringify(shoppingList));
    localStorage.setItem('fridgelly_history', JSON.stringify(history));
    localStorage.setItem('fridgelly_mealplan', JSON.stringify(mealPlan));
    localStorage.setItem('fridgelly_profile', JSON.stringify(profile));
    if (fingerprint) localStorage.setItem('fridgelly_fingerprint', JSON.stringify(fingerprint));
  }, [inventory, favorites, shoppingList, history, mealPlan, profile, fingerprint]);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) return prev.filter(r => r.id !== recipe.id);
      return [...prev, { ...recipe, isFavorite: true }];
    });
  }, []);

  const addToShopping = useCallback((items: string[]) => {
    setShoppingList(prev => [
      ...prev,
      ...items.map(name => ({ id: generateId(), name, completed: false }))
    ]);
  }, []);

  const toggleShopping = useCallback((id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }, []);

  const clearCompletedShopping = useCallback(() => {
    setShoppingList(prev => prev.filter(item => !item.completed));
  }, []);

  const updateMealPlan = useCallback((day: string, slot: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe | null) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: recipe }
    }));
  }, []);

  const saveScan = useCallback((ingredients: Ingredient[], thumbnail: string) => {
    setHistory(prev => {
      const newScan = { id: generateId(), date: new Date().toISOString(), ingredients, thumbnail };
      return [newScan, ...prev].slice(0, 5);
    });
    setInventory(ingredients);
  }, []);

  const completeCooking = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => {
      let newStreak = prev.streak;
      if (prev.lastCookDate !== today) {
        newStreak = (prev.lastCookDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) 
          ? prev.streak + 1 
          : 1;
      }
      return {
        ...prev,
        streak: newStreak,
        lastCookDate: today,
        cookCount: prev.cookCount + 1
      };
    });
  }, []);

  const updateFilters = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      dietaryFilters: prev.dietaryFilters.includes(tag) 
        ? prev.dietaryFilters.filter(t => t !== tag)
        : [...prev.dietaryFilters, tag]
    }));
  }, []);

  const updateCuisines = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteCuisines: [tag] // Specified as one active at a time in requirements
    }));
  }, []);

  const completeOnboarding = useCallback((prefs: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...prefs,
      onboardingComplete: true
    }));
  }, []);

  return (
    <StoreContext.Provider value={{
      inventory, recipes, favorites, shoppingList, history, mealPlan, profile, fingerprint,
      setInventory, setRecipes, toggleFavorite, addToShopping, toggleShopping, 
      clearCompletedShopping, updateMealPlan, completeCooking, saveScan,
      updateFilters, updateCuisines, completeOnboarding
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
