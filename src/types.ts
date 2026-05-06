export type Ingredient = {
  id: string;
  name: string;
  confidence: number;
  category: string;
};

export type Recipe = {
  id: string;
  title: string;
  matchScore: number;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  description: string;
  ingredients: {
    available: string[];
    missing: string[];
  };
  steps: string[];
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  isFavorite?: boolean;
  notes?: string;
  decoded?: boolean;
};

export type ScanHistory = {
  id: string;
  date: string;
  ingredients: Ingredient[];
  thumbnail: string;
};

export type UserProfile = {
  dietaryFilters: string[];
  favoriteCuisines: string[];
  onboardingComplete: boolean;
  streak: number;
  lastCookDate: string | null;
  cookCount: number;
  streakFreezeUsed: boolean;
  lastFreezeDate: string | null;
};

export type PalateFingerprint = {
  flavorProfile: string[];
  texturePrefs: string[];
  cookingPersona: string;
  poeticTagline: string;
  updatedAt: string;
};

export type MealPlan = {
  [day: string]: {
    breakfast: Recipe | null;
    lunch: Recipe | null;
    dinner: Recipe | null;
  };
};

export type ShoppingItem = {
  id: string;
  name: string;
  completed: boolean;
};
