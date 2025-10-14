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

export const generateBeeVideo = async (
  base64ImageData: string,
  mimeType: string,
  onProgress: (message: string) => void
): Promise<string> => {
  const messages = [
    "Waking up the digital hive...",
    "Choreographing a waggle dance...",
    "Sprinkling a little pollen pixie dust...",
    "Painting each frame with liquid sunshine...",
    "Tuning the buzz to the perfect frequency...",
    "Teaching your bee its flight path...",
    "Brewing a bit of animation nectar...",
    "Spinning honeycomb into video frames...",
    "Adding a touch of wildflower magic...",
    "Polishing the bee's fuzzy coat...",
    "Making sure the scene is the bee's knees...",
    "Just a few more buzzes until it's ready...",
    "Our animator bees are working their magic...",
    "Composing a tiny symphony of buzzing...",
    "Bringing your bee's world to life...",
  ];
  let messageIndex = 0;

  try {
    const genAI = getAi();
    let operation = await genAI.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: 'Animate the scene with a gentle, cinematic subtle motion.',
      image: {
        bytesBase64Encoded: base64ImageData,
        mimeType: "image/png",
      },
      config: {
        numberOfVideos: 1,
      },
    });

    onProgress(messages[messageIndex]);
    
    while (!operation.done) {
      // Adjusted polling time to 10 seconds to align with documentation examples and reduce polling frequency.
      await new Promise(resolve => setTimeout(resolve, 10000));
      messageIndex = (messageIndex + 1) % messages.length;
      onProgress(messages[messageIndex]);
      operation = await genAI.operations.getVideosOperation({ operation });
    }

    // Check for errors in the completed operation
    if (operation.error) {
      console.error("Video Generation Operation Error:", operation.error);
      const apiError = operation.error as { message?: string };
      throw new Error(`Animation failed: ${apiError.message || 'Unknown API error.'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
      onProgress('Downloading your animation...');
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) {
        throw new Error(`Failed to download video. Status: ${response.status}`);
      }
      const videoBlob = await response.blob();
      return URL.createObjectURL(videoBlob);
    } else {
      throw new Error('Animation finished, but no download link was returned.');
    }
  } catch (error) {
    // Enhanced error logging to help debug issues in deployed environments.
    console.error("Video Generation Error (raw):", error);
    console.error("Video Generation Error (stringified):", JSON.stringify(error, null, 2));

    if (error instanceof Error) {
        // Pass a more specific error message up to the UI.
        const apiError = error as any;
        // The detailed message from the server is often nested. This attempts to find it.
        let detail = apiError.message || 'Unknown error.';
        if (typeof apiError.cause === 'object' && apiError.cause !== null && apiError.cause.message) {
            detail = apiError.cause.message;
        } else if (apiError.details) {
            detail = apiError.details;
        }
        throw new Error(`Animation failed. ${detail}`);
    }
    // Fallback for non-Error types.
    throw new Error("Our animator bee is on a break. An unknown error occurred during animation.");
  }
};