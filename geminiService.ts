
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "./types";

/**
 * Checks if the AI Studio API key has been selected.
 */
export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

/**
 * Opens the AI Studio API key selection dialog.
 */
export const openKeySelector = async (): Promise<void> => {
  if (typeof window.aistudio?.openSelectKey === 'function') {
    await window.aistudio.openSelectKey();
  }
};

/**
 * Generates a video from a text prompt and a starting image using Veo.
 */
export const generateHeroVideo = async (
  imageB64: string,
  prompt: string,
  aspectRatio: AspectRatio,
  onStatusUpdate: (msg: string) => void
): Promise<string> => {
  // Always create a new instance to ensure we have the latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  onStatusUpdate("Initializing video generation engine...");
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageB64.split(',')[1], // Remove metadata prefix if present
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
      },
    });

    const messages = [
      "Analyzing facial structure and wardrobe details...",
      "Lighting the virtual sun-drenched atrium...",
      "Simulating high-tech data displays...",
      "Adding cinematic depth and lens flares...",
      "Polishing the charcoal tailored suit textures...",
      "Fine-tuning visionary expressions...",
      "Almost ready for the premiere..."
    ];

    let messageIndex = 0;
    while (!operation.done) {
      onStatusUpdate(messages[messageIndex % messages.length]);
      messageIndex++;
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (err: any) {
        if (err.message?.includes("Requested entity was not found")) {
          throw new Error("API_KEY_EXPIRED");
        }
        throw err;
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("No video generated in the response");
    }

    onStatusUpdate("Downloading final master cut...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
    
  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message === "API_KEY_EXPIRED") {
      throw new Error("Your API Session has expired. Please re-select your key.");
    }
    throw error;
  }
};
