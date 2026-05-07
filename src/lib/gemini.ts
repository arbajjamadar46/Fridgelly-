import { Ingredient, Recipe, PalateFingerprint } from "../types";

export const geminiService = {
  async analyzeFridgeImage(base64Image: string): Promise<Ingredient[]> {
    try {
      const response = await fetch("/api/gemini/analyze-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(cleanJson);
      return (parsed.ingredients || []).map((ing: any) => ({ 
        ...ing, 
        id: Math.random().toString(36).substr(2, 9) 
      }));
    } catch (error) {
      console.error("Fridge scan failed:", error);
      throw error;
    }
  },

  async generateRecipes(ingredients: string[], filters: string[], cuisine: string): Promise<Recipe[]> {
    try {
      const response = await fetch("/api/gemini/generate-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, filters, cuisine }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || "[]";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(cleanJson);
      return (Array.isArray(parsed) ? parsed : []).map((r: any) => ({ 
        ...r, 
        id: Math.random().toString(36).substr(2, 9) 
      }));
    } catch (error) {
      console.error("Recipe generation failed:", error);
      throw error;
    }
  },

  async getSubstitutes(ingredient: string): Promise<string[]> {
    try {
      const response = await fetch("/api/gemini/get-substitutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || "[]";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Substitutes fetch failed:", error);
      return [];
    }
  },

  async morphRecipe(originalSteps: string[], userChange: string): Promise<string[]> {
    try {
      const response = await fetch("/api/gemini/morph-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalSteps, userChange }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || "[]";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Recipe morph failed:", error);
      return originalSteps;
    }
  },

  async decodeDish(base64Image: string, currentInventory: string[]): Promise<Recipe> {
    try {
      const response = await fetch("/api/gemini/decode-dish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, currentInventory }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      return { ...JSON.parse(cleanJson), id: Math.random().toString(36).substr(2, 9), decoded: true };
    } catch (error) {
      console.error("Dish decoding failed:", error);
      throw error;
    }
  },

  async generatePalateFingerprint(history: any[]): Promise<PalateFingerprint> {
    try {
      const response = await fetch("/api/gemini/generate-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      return { ...JSON.parse(cleanJson), updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Palate fingerprint failed:", error);
      throw error;
    }
  }
};
