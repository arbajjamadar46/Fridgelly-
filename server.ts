import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Lazy initialize Gemini
  let ai: GoogleGenAI | null = null;
  const getAI = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
      }
      console.log("Initializing Gemini with API Key (length):", apiKey.length);
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  };

  const MODEL_NAME = "gemini-3-flash-preview";

  // API Routes
  app.post("/api/gemini/analyze-fridge", async (req, res) => {
    try {
      const { image } = req.body;
      const prompt = `Analyze this fridge image. Return ONLY valid JSON: { "ingredients": [ { "name": "string", "confidence": number, "category": "string" } ] }. No markdown, no explanation.`;
      
      const genAI = getAI();
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: image.split(',')[1],
              mimeType: "image/jpeg"
            }
          }
        ],
        config: { responseMimeType: "application/json" }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/generate-recipes", async (req, res) => {
    try {
      const { ingredients, filters, cuisine } = req.body;
      const prompt = `Generate 4 creative Indian regional recipes using primarily these ingredients: ${ingredients.join(", ")}. 
      Dietary restrictions: ${filters.join(", ") || "Vegetarian (Default Indian context)"}. 
      Specific Indian regional style: ${cuisine}. 
      Focus on authentic Indian flavors, spices, and local home-style cooking techniques.
      Return ONLY a JSON array, each item: { "title": "string", "matchScore": number, "cookTime": "string", "difficulty": "Easy|Medium|Hard", "calories": number, "description": "string", "ingredients": { "available": ["string"], "missing": ["string"] }, "steps": ["string"], "nutritionFacts": { "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number }, "tags": ["string"] }. 
      No markdown, no explanation.`;

      const genAI = getAI();
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error (Generate Recipes):", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/get-substitutes", async (req, res) => {
    try {
      const { ingredient } = req.body;
      const prompt = `Give 3 common cooking substitutes for ${ingredient}. Return ONLY a JSON string array like ["sub1", "sub2", "sub3"]. No markdown, no explanation.`;
      
      const genAI = getAI();
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error (Get Substitutes):", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/morph-recipe", async (req, res) => {
    try {
      const { originalSteps, userChange } = req.body;
      const prompt = `Original steps: ${JSON.stringify(originalSteps)}. 
      User wants to change: ${userChange}. 
      Rewrite the remaining steps ONLY to accommodate this change while maintaining flow. 
      Return ONLY a JSON string array of the updated steps. No markdown, no explanation.`;
      
      const genAI = getAI();
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error (Morph Recipe):", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/decode-dish", async (req, res) => {
    try {
      const { image, currentInventory } = req.body;
      const prompt = `Analyze this food photo. Identify: dishName, estimatedCuisine, keyIngredients[], cookingTechniques[], difficulty. 
      Given user's current fridge inventory: ${currentInventory.join(", ")}, generate a home recipe maximizing available ingredients. Flag must-buy items in missing ingredients. 
      Return JSON: { "title": "string", "matchScore": number, "cookTime": "string", "difficulty": "Easy|Medium|Hard", "calories": number, "description": "string", "ingredients": { "available": ["string"], "missing": ["string"] }, "steps": ["string"], "nutritionFacts": { "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number }, "tags": ["string"] }.
      No markdown, no explanation.`;

      const genAI = getAI();
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: image.split(',')[1],
              mimeType: "image/jpeg"
            }
          }
        ],
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error (Decode Dish):", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/generate-fingerprint", async (req, res) => {
    try {
      const { history } = req.body;
      const prompt = `Based on cooking history: ${JSON.stringify(history)}, describe this user's Indian taste profile. 
      Use Indian culinary terms and personas (e.g., "Masala Maestro", "Curry Connoisseur").
      Return ONLY JSON: { "flavorProfile": ["string"], "texturePrefs": ["string"], "cookingPersona": "string", "poeticTagline": "string" }.
      No markdown, no explanation.`;
      
      const genAI = getAI();
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error (Generate Fingerprint):", error);
      res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
