
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { LocationSubmitData } from "../types";

// --- Types ---
// This defines the shape of the data returned from our backend function.
interface GenerationResult {
    speciesName: string;
    fact: string;
    image: string; // This is a base64 encoded string
}

// --- Firebase Configuration ---
// Your web app's Firebase configuration, loaded from environment variables.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

// --- Secure V2 Cloud Function Caller ---

// 1. Create a reference to the raw callable function from Firebase.
const generateImageAndTextCallable = httpsCallable(functions, 'generateImageAndText');

// 2. Create a clean, easy-to-use async function that handles the data correctly.
export const callGenerateImageAndText = async (locationData: LocationSubmitData): Promise<GenerationResult> => {
    let payload = {};

    if (locationData.type === 'zipcode') {
        console.log(`Calling backend function with zipcode: ${locationData.value}`);
        payload = { zipcode: locationData.value };
    } else {
        console.log(`Calling backend function with city/state: ${locationData.city}, ${locationData.state}`);
        payload = { city: locationData.city, state: locationData.state };
    }

    // Call the function with the correctly structured payload.
    const result: HttpsCallableResult = await generateImageAndTextCallable(payload);

    console.log("Received response from backend.");

    // The actual data returned by the function is in the `data` property of the result.
    // We cast it to our GenerationResult type for type safety.
    return result.data as GenerationResult;
};

// --- Deprecated V1 Function ---
/**
 * @deprecated The V1 function is deprecated and will be removed in a future release.
 */
export const generateImageAndFactV1 = httpsCallable(functions, 'generateImageAndFact');
