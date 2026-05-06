import { GoogleGenAI } from "@google/genai";
import { Ingredient, Recipe, PalateFingerprint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-2.0-flash";

export const geminiService = {
  async analyzeFridgeImage(base64Image: string): Promise<Ingredient[]> {
    const prompt = `Analyze this fridge image. Return ONLY valid JSON: { "ingredients": [ { "name": "string", "confidence": number, "category": "string" } ] }. No markdown, no explanation.`;
    
    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: "image/jpeg"
            }
          }
        ]
      });
      const text = result.text || "{}";
      const cleanJson = text.replace(/```json|```/g, "").trim();
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
    const prompt = `Generate 4 creative Indian regional recipes using primarily these ingredients: ${ingredients.join(", ")}. 
    Dietary restrictions: ${filters.join(", ") || "Vegetarian (Default Indian context)"}. 
    Specific Indian regional style: ${cuisine}. 
    Focus on authentic Indian flavors, spices, and local home-style cooking techniques.
    Return ONLY a JSON array, each item: { "title": "string", "matchScore": number, "cookTime": "string", "difficulty": "Easy|Medium|Hard", "calories": number, "description": "string", "ingredients": { "available": ["string"], "missing": ["string"] }, "steps": ["string"], "nutritionFacts": { "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number }, "tags": ["string"] }. 
    No markdown, no explanation.`;

    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
      });
      const text = result.text || "[]";
      const cleanJson = text.replace(/```json|```/g, "").trim();
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
    const prompt = `Give 3 common cooking substitutes for ${ingredient}. Return ONLY a JSON string array like ["sub1", "sub2", "sub3"]. No markdown, no explanation.`;
    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
      });
      const text = result.text || "[]";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Substitutes fetch failed:", error);
      return [];
    }
  },

  async morphRecipe(originalSteps: string[], userChange: string): Promise<string[]> {
    const prompt = `Original steps: ${JSON.stringify(originalSteps)}. 
    User wants to change: ${userChange}. 
    Rewrite the remaining steps ONLY to accommodate this change while maintaining flow. 
    Return ONLY a JSON string array of the updated steps. No markdown, no explanation.`;
    
    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
      });
      const text = result.text || "[]";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Recipe morph failed:", error);
      return originalSteps;
    }
  },

  async decodeDish(base64Image: string, currentInventory: string[]): Promise<Recipe> {
    const prompt = `Analyze this food photo. Identify: dishName, estimatedCuisine, keyIngredients[], cookingTechniques[], difficulty. 
    Given user's current fridge inventory: ${currentInventory.join(", ")}, generate a home recipe maximizing available ingredients. Flag must-buy items in missing ingredients. 
    Return JSON: { "title": "string", "matchScore": number, "cookTime": "string", "difficulty": "Easy|Medium|Hard", "calories": number, "description": "string", "ingredients": { "available": ["string"], "missing": ["string"] }, "steps": ["string"], "nutritionFacts": { "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number }, "tags": ["string"] }.
    No markdown, no explanation.`;

    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: "image/jpeg"
            }
          }
        ]
      });
      const text = result.text || "{}";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return { ...JSON.parse(cleanJson), id: Math.random().toString(36).substr(2, 9), decoded: true };
    } catch (error) {
      console.error("Dish decoding failed:", error);
      throw error;
    }
  },

  async generatePalateFingerprint(history: any[]): Promise<PalateFingerprint> {
    const prompt = `Based on cooking history: ${JSON.stringify(history)}, describe this user's Indian taste profile. 
    Use Indian culinary terms and personas (e.g., "Masala Maestro", "Curry Connoisseur").
    Return ONLY JSON: { "flavorProfile": ["string"], "texturePrefs": ["string"], "cookingPersona": "string", "poeticTagline": "string" }.
    No markdown, no explanation.`;
    
    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
      });
      const text = result.text || "{}";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return { ...JSON.parse(cleanJson), updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Palate fingerprint failed:", error);
      throw error;
    }
  }
};
