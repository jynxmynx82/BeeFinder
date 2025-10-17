import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const generateBeeImage = async (prompt: string): Promise<{ imageUrl: string, base64Data: string, mimeType: string }> => {
  try {
    const genAI = getAi();
    // Per user request, using gemini-2.5-flash-image to perform research and image generation.
    const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          return {
              imageUrl: `data:${mimeType};base64,${base64ImageBytes}`,
              base64Data: base64ImageBytes,
              mimeType: mimeType,
          };
        }
      }
    }

    throw new Error("Image generation failed, no image returned from the model.");

  } catch(error) {
    console.error("Gemini API Error:", error);
    throw new Error("Our artist bee is taking a nap. Could not generate image.");
  }
};
