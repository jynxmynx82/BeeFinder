
import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import fetch from "node-fetch";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Initialize Firebase Admin SDK
initializeApp();

// --- Helper Functions to safely get API keys from config ---
const getGeminiApiKey = () => {
  const key = functions.config().gemini?.api_key;
  if (!key) {
    throw new functions.https.HttpsError("internal", "Server configuration " +
      "error: Gemini API Key is missing.");
  }
  return key;
};

const getOpenWeatherMapApiKey = () => {
  const key = functions.config().openweathermap?.key;
  if (!key) {
    throw new functions.https.HttpsError("internal", "Server configuration " +
      "error: OpenWeatherMap API Key is missing.");
  }
  return key;
};

// --- Configurations for Gemini ---
const imageGenerationConfig = {
  temperature: 0.4,
  topP: 1,
  topK: 32,
  maxOutputTokens: 4096,
  responseMimeType: "image/png",
};

const textGenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// --- Constants for prompt construction ---
const BEE_PERSONALITIES = [
  "a busy", "a curious", "a friendly", "a fluffy",
  "a gentle", "a happy", "a sleepy", "a tiny", "a buzzy", "a cheerful",
];
const COMMON_FLOWERS = [
  "a sunflower", "a lavender flower", "a clover blossom", "a daisy",
  "a dandelion", "a poppy", "a coneflower", "an aster", "a salvia",
  "a bee balm flower",
];


// --- Main V2 Function ---
export const generateImageAndText = functions.https.onCall(async (data) => {
  const {zipcode, city, state} = data;

  if (
    (!zipcode && (!city || !state)) ||
    (zipcode && typeof zipcode !== "string") ||
    (city && typeof city !== "string") ||
    (state && typeof state !== "string")
  ) {
    throw new functions.https.HttpsError("invalid-argument", "The function " +
      "must be called with a 'zipcode' string, or 'city' and 'state' " +
      "strings.");
  }

  try {
    const openWeatherMapKey = getOpenWeatherMapApiKey();

    // 1. Get Location from Zipcode or City/State using Zippopotam.us API
    let locationApiUrl = "";
    if (zipcode) {
      locationApiUrl = `http://api.zippopotam.us/us/${zipcode}`;
    } else if (city && state) {
      const encodedCity = encodeURIComponent(city);
      locationApiUrl = `http://api.zippopotam.us/us/${state}/${encodedCity}`;
    }

    const locationResponse = await fetch(locationApiUrl);
    if (!locationResponse.ok) {
      throw new functions.https.HttpsError("not-found", "Invalid location " +
        "provided. Please check your input.");
    }
    const locationData = await locationResponse.json();
    const place = locationData.places[0];

    if (!place || !place.latitude || !place.longitude) {
      throw new functions.https.HttpsError("not-found", "Could not find " +
        "location data for the provided input.");
    }

    const locationStr = `${place["place name"]}, ` +
      `${place["state abbreviation"]}`;
    const latitude = place.latitude;
    const longitude = place.longitude;

    // 2. Get Weather from OpenWeatherMap API
    const weatherApi = "https://api.openweathermap.org/data/2.5/weather";
    const weatherResponse = await fetch(`${weatherApi}?lat=${latitude}&` +
      `lon=${longitude}&appid=${openWeatherMapKey}`);
    if (!weatherResponse.ok) {
      throw new functions.https.HttpsError("internal", "Failed to fetch weather data.");
    }
    const weatherData = await weatherResponse.json();
    const weatherStr = weatherData.weather[0].description;

    // 3. Construct the full prompt for Gemini
    const beePersonality = BEE_PERSONALITIES[
      Math.floor(Math.random() * BEE_PERSONALITIES.length)
    ];
    const flower = COMMON_FLOWERS[
      Math.floor(Math.random() * COMMON_FLOWERS.length)
    ];
    const prompt = "A hyper-realistic, award-winning photograph of " +
      `${beePersonality} native bee from ${locationStr} on ${flower}. ` +
      `The weather is ${weatherStr}. The image should be vibrant, detailed, ` +
      "and capture the bee in mid-action, collecting pollen.";

    // 4. Call Gemini APIs
    const genAI = new GoogleGenerativeAI(getGeminiApiKey());

    // --- 4a. Generate Text ---
    const textModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: textGenerationConfig,
      safetySettings,
    });
    const textResult = await textModel.generateContent([
      prompt,
      "From the preceding prompt, identify the bee species. Return a JSON " +
      "object with two keys: 'speciesName' (the common name of the bee) " +
      "and 'fact' (a surprising, one-sentence fact about that bee).",
    ]);
    const cleanedText = textResult.response.text()
      .replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedText = JSON.parse(cleanedText);

    // --- 4b. Generate Image ---
    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: imageGenerationConfig,
      safetySettings,
    });
    const imageResult = await imageModel.generateContent(prompt);
    const imagePart = imageResult.response.candidates?.[0]?.content.parts[0];
    if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData) {
      throw new Error("Image generation failed: No image data was " +
        "received from the model.");
    }
    const imageBase64 = imagePart.inlineData.data;

    // --- 5. Return Combined Result ---
    return {
      speciesName: parsedText.speciesName,
      fact: parsedText.fact,
      image: imageBase64,
    };
  } catch (error) {
    functions.logger.error("Error in generateImageAndText function:", error);
    // Propagate HttpsError or create a generic one
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An unexpected error " +
      "occurred during content generation.");
  }
});
