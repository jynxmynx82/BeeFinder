
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, Firestore } from "firebase/firestore";
import { LocationSubmitData, BeeData, VideoGenerationInput, VideoData } from "../types";

// --- Types ---
// This defines the shape of the data returned from our backend function.
interface GenerationResult {
    speciesName: string;
    fact: string;
    // Backend may return either a public imageUrl or an inline base64 `image`.
    image?: string; // base64 encoded string
    imageUrl?: string; // public URL to the uploaded image
}

// --- Firebase Configuration ---
// Read env vars from Vite's `import.meta.env` when available. In some
// TypeScript or Node contexts (tests, SSR) `import.meta.env` may not be
// present. We provide a fallback to `process.env` for those cases.
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? (import.meta as any).env
    : (typeof process !== 'undefined' ? process.env : {});

// Your web app's Firebase configuration, loaded from environment variables.
const firebaseConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
const analytics = getAnalytics(app);
// Initialize Firestore and export it for app-wide usage
export const db: Firestore = getFirestore(app);

/**
 * Fetch a bee document from the 'bees' collection by its ID.
 * Returns the document data object or null if not found.
 */
export async function fetchBeeData(beeId: string): Promise<BeeData | null> {
    if (!beeId) return null;
    try {
        const beeDocRef = doc(db, "bees", beeId);
        const docSnap = await getDoc(beeDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as BeeData;
        }
        return null;
    } catch (err) {
        console.error("Error getting bee document:", err);
        throw err;
    }
}

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

// --- Video Generation Function ---
const generateVideo3Callable = httpsCallable(functions, 'generateVideo3');
const generateVideoFallbackCallable = httpsCallable(functions, 'generateVideoFallback');

export const generateVideo2 = async (input: VideoGenerationInput): Promise<VideoData> => {
    try {
        const result = await generateVideo3Callable(input);
        return result.data as VideoData;
    } catch (error: any) {
        // If it's a rate limit error, try the fallback function
        if (error.code === 'resource-exhausted' || 
            error.message?.includes('temporarily unavailable') ||
            error.message?.includes('high demand')) {
            console.log('Video generation rate limited, using fallback...');
            const fallbackResult = await generateVideoFallbackCallable({ imageUrl: input.imageUrl });
            return fallbackResult.data as VideoData;
        }
        // Re-throw other errors
        throw error;
    }
};

// --- Deprecated V1 Function ---
/**
 * @deprecated The V1 function is deprecated and will be removed in a future release.
 */
export const generateImageAndFactV1 = httpsCallable(functions, 'generateImageAndFact');
