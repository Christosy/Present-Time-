
import { GoogleGenAI, Type } from "@google/genai";
import { PresentStats } from "../types";

// Helper function to generate romantic Pokémon-style metadata for a gift using Gemini 3 Flash
export const generateGiftData = async (presentTitle: string): Promise<{ description: string; stats: PresentStats }> => {
  try {
    // Initializing the Gemini client using the environment variable directly as per the coding guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate romantic Pokémon-style metadata for a gift: "${presentTitle}". 
      Return a JSON object with:
      1. 'description': a poetic 1-sentence romantic caption.
      2. 'catchphrase': a dramatic introductory shout or catchphrase (e.g. "THE FLAMES OF PASSION AWAKEN!").
      3. 'stats': an object with 'hp' (10-200), 'romance' (10-999), 'joy' (1-100), and 'rarity' (Common, Rare, Epic, Legendary, or Mythical).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            catchphrase: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                hp: { type: Type.INTEGER },
                romance: { type: Type.INTEGER },
                joy: { type: Type.INTEGER },
                rarity: { type: Type.STRING }
              },
              required: ['hp', 'romance', 'joy', 'rarity']
            }
          },
          required: ['description', 'catchphrase', 'stats']
        }
      }
    });
    
    // Accessing response.text as a property as per GenAI SDK guidelines
    const data = JSON.parse(response.text || "{}");
    return {
      description: data.description || "A special surprise just for you.",
      stats: {
        ...(data.stats || { hp: 100, romance: 500, joy: 100, rarity: 'Epic' }),
        catchphrase: data.catchphrase || "A NEW SURPRISE APPEARS!"
      }
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      description: "A special surprise just for you, my love.",
      stats: { hp: 100, romance: 100, joy: 100, rarity: 'Rare', catchphrase: "LOVE IS IN THE AIR!" }
    };
  }
};
