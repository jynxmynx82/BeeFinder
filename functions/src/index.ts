
import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {getStorage} from "firebase-admin/storage";
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
  // Do not set responseMimeType for the image-capable model; some
  // image models don't support JSON/text-only modes. Let the client
  // use the SDK defaults so the model returns image parts inline.
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
  functions.logger.info('Function execution started', { data });
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
    functions.logger.info('Starting Gemini API calls');
    const genAI = new GoogleGenerativeAI(getGeminiApiKey());

    // --- 4a. Generate Text ---
    functions.logger.info('Generating text content');
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
    const rawText = textResult.response.text();
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsedText;
    try {
      parsedText = JSON.parse(cleanedText);
    } catch (e) {
      // Attempt to extract a JSON object from the response if the model
      // wrapped it in text or added explanation. This helps when models
      // respond with extra commentary before/after the JSON blob.
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/m);
      if (jsonMatch) {
        try {
          parsedText = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse extracted JSON from Gemini response:', jsonMatch[0]);
        }
      }
      if (!parsedText) {
        console.error('Gemini response is not valid JSON:', rawText);
        // Include the raw response in the error message for easier debugging
        throw new functions.https.HttpsError('internal', 'Gemini API did not return valid JSON. Raw response: ' + String(rawText).slice(0, 200));
      }
    }

    // --- 4b. Generate Image ---
    functions.logger.info('Generating image content');
    // Ensure we never pass a responseMimeType to the image model. Some
    // image-capable models don't support JSON/text mode; remove that key
    // if present to force SDK/model defaults for image output.
    const imageGenConfig = { ...imageGenerationConfig } as any;
    if ('responseMimeType' in imageGenConfig) {
      delete imageGenConfig.responseMimeType;
    }
    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: imageGenConfig,
      safetySettings,
    });
    let imageResult;
    // Log the actual generation config being used (after removing responseMimeType)
    functions.logger.info('Calling imageModel.generateContent with generationConfig:', imageGenConfig);
    try {
      imageResult = await imageModel.generateContent(prompt);
    } catch (err: any) {
      // If the error indicates the response_mime_type was invalid, retry
      // with a permissive text mime type. This addresses cases where some
      // image-capable models reject non-text mime types sent in
      // generationConfig.
      const message = String(err?.message || err);
      // Serialize error object more fully for logs
      let serializedErr = message;
      try {
        const plain = JSON.stringify(err, Object.getOwnPropertyNames(err));
        serializedErr = plain;
      } catch (sErr) {
        // fall back to message
      }
      functions.logger.warn('Initial image generation failed, inspecting error for retry. err=', serializedErr);
      // Retry when the error indicates JSON/text mode or response_mime_type
      // is not supported by this model (covers variations like
      // "JSON mode is not enabled for this model" or messages about
      // allowed mimetypes).
      if (
        message.includes('response_mime_type') ||
        message.includes('allowed mimetypes') ||
        /json mode/i.test(message)
      ) {
        functions.logger.info('Retrying image generation with responseMimeType="text/plain"');
        try {
          const fallbackConfig = {
            ...imageGenerationConfig,
            responseMimeType: 'text/plain',
          };
          const fallbackImageModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-image',
            generationConfig: fallbackConfig,
            safetySettings,
          });
          imageResult = await fallbackImageModel.generateContent(prompt);
        } catch (err2) {
          functions.logger.error('Fallback image generation also failed:', err2);
          throw new functions.https.HttpsError('internal', 'Image generation failed after retry. See logs for details.');
        }
      } else {
        // Surface other failures
        functions.logger.error('Image generation call failed:', err);
        throw new functions.https.HttpsError('internal', 'Image generation failed. See logs for details.');
      }
    }
    
    // Log the raw response structure immediately after generation
    functions.logger.info('Raw image generation response:', {
      hasResponse: !!imageResult.response,
      hasCandidates: !!imageResult.response?.candidates,
      candidatesLength: imageResult.response?.candidates?.length || 0,
      firstCandidate: imageResult.response?.candidates?.[0] ? 'exists' : 'missing',
      firstCandidateContent: imageResult.response?.candidates?.[0]?.content ? 'exists' : 'missing',
      firstCandidateParts: imageResult.response?.candidates?.[0]?.content?.parts ? 'exists' : 'missing',
      partsLength: imageResult.response?.candidates?.[0]?.content?.parts?.length || 0
    });
    
    let imageResultCandidate = imageResult;
    
    // Log the initial response structure
    functions.logger.info('Initial image generation response structure:', {
      hasCandidates: !!imageResultCandidate.response.candidates,
      candidatesLength: imageResultCandidate.response.candidates?.length || 0,
      hasContent: !!imageResultCandidate.response.candidates?.[0]?.content,
      hasParts: !!imageResultCandidate.response.candidates?.[0]?.content?.parts,
      partsLength: imageResultCandidate.response.candidates?.[0]?.content?.parts?.length || 0,
      firstPartKeys: imageResultCandidate.response.candidates?.[0]?.content?.parts?.[0] ? Object.keys(imageResultCandidate.response.candidates[0].content.parts[0]) : 'no first part'
    });
    
    // Look for image data in all parts, not just the first one
    let imagePart = null;
    const parts = imageResultCandidate.response.candidates?.[0]?.content?.parts || [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part && 'inlineData' in part && part.inlineData && part.inlineData.data) {
        imagePart = part;
        functions.logger.info(`Found image data in part ${i}`);
        break;
      }
    }
    
    // If no image data found, retry once
    if (!imagePart) {
      functions.logger.warn('Image generation returned no inlineData on first attempt. Retrying once.');
      try {
        imageResultCandidate = await imageModel.generateContent(prompt);
        const retryParts = imageResultCandidate.response.candidates?.[0]?.content?.parts || [];
        
        for (let i = 0; i < retryParts.length; i++) {
          const part = retryParts[i];
          if (part && 'inlineData' in part && part.inlineData && part.inlineData.data) {
            imagePart = part;
            functions.logger.info(`Found image data in retry part ${i}`);
            break;
          }
        }
      } catch (retryErr) {
        functions.logger.warn('Retry for image generation failed:', retryErr);
      }
    }

    // If after retry there is still no inline image data, don't throw an INTERNAL
    // error. Return the parsed text and a null imageUrl so the client can handle
    // missing images gracefully.
    if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData || !imagePart.inlineData.data) {
      functions.logger.error('Image generation returned unexpected response after retry:', {
        hasImagePart: !!imagePart,
        imagePartKeys: imagePart ? Object.keys(imagePart) : 'no imagePart',
        hasInlineData: imagePart && 'inlineData' in imagePart,
        inlineDataKeys: imagePart && 'inlineData' in imagePart && imagePart.inlineData ? Object.keys(imagePart.inlineData) : 'no inlineData'
      });
      return {
        speciesName: parsedText.speciesName,
        fact: parsedText.fact,
        imageUrl: null,
      };
    }

    functions.logger.info('Image data found, proceeding to storage upload');

    const imageBase64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    // Log image data info for debugging
    functions.logger.info('Image data extracted successfully', {
      hasImageData: !!imageBase64,
      dataLength: imageBase64?.length || 0,
      mimeType: mimeType
    });

    // --- 5. Upload image to Cloud Storage and return public URL ---
    // Assumption: either a default bucket is configured for the Admin SDK
    // or a bucket name is provided via functions.config().storage.bucket
    try {
      functions.logger.info('Starting Cloud Storage upload process');
      const bucketNameFromConfig = functions.config().storage?.bucket;
      functions.logger.info('Storage configuration', {
        bucketNameFromConfig: bucketNameFromConfig,
        hasConfig: !!functions.config().storage
      });
      
      const storage = getStorage();
      const bucket = bucketNameFromConfig ? storage.bucket(bucketNameFromConfig) : storage.bucket();

      functions.logger.info('Bucket resolved', {
        bucketName: bucket?.name,
        bucketExists: !!bucket
      });

      if (!bucket) {
        throw new functions.https.HttpsError('internal', 'Cloud Storage bucket not configured. Set functions.config().storage.bucket or configure a default bucket in your Firebase project.');
      }

      // Build filename under images/ so we can later separate from video outputs
      const timestamp = Date.now();
      const rnd = Math.random().toString(36).slice(2, 8);
      const extension = mimeType.split('/')[1] || 'png';
      const filePath = `images/generated/${timestamp}-${rnd}.${extension}`;

      functions.logger.info('Preparing file upload', {
        filePath: filePath,
        bufferSize: imageBase64.length,
        mimeType: mimeType
      });

      const file = bucket.file(filePath);
      const buffer = Buffer.from(imageBase64, 'base64');

      functions.logger.info('Buffer created successfully', {
        bufferLength: buffer.length
      });

      // Save buffer to GCS
      functions.logger.info('Saving file to Cloud Storage...');
      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
        },
      });

      functions.logger.info('File saved successfully, making public...');
      // Make the file publicly readable
      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURI(filePath)}`;

      // Log only size and path to avoid spamming logs with the Base64 payload
      functions.logger.info('Uploaded generated image to Cloud Storage', {
        bucket: bucket.name,
        path: filePath,
        bytes: buffer.length,
        publicUrl: publicUrl
      });

      return {
        speciesName: parsedText.speciesName,
        fact: parsedText.fact,
        imageUrl: publicUrl,
      };
    } catch (storageErr) {
      functions.logger.error('Failed to upload image to Cloud Storage:', storageErr);
      throw new functions.https.HttpsError('internal', 'Failed to store generated image. See logs for details.');
    }
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
