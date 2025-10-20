# Coding Agent Action Plan: BeeFinder V2 Refactor Implementation

This document outlines the step-by-step plan for refactoring the **BeeFinder** application to align with the **Refactor-V2** design specification. The coding agent will execute these steps sequentially.

**Primary Goal:** To transition the application from an insecure V1 client-side architecture to a secure V2 backend-for-frontend (BFF) architecture, leveraging a Firebase Cloud Function as a secure proxy for all Generative AI API calls.

---

## Phase 1: Harden & Align Backend Cloud Function

This phase ensures the backend is fully compliant with the security and model requirements of the V2 specification.

*   **File:** `functions/src/index.ts`
*   **Action (VERIFIED):** The `generateImageAndText` function is confirmed to be using the correct model and securely retrieving the `GEMINI_API_KEY` from its server-side environment.

**Status: Completed & Verified. The backend is V2 compliant.**

---

## Phase 2: Modernize Configuration & Purge Insecure Logic

This phase removes all hardcoded keys and insecure code patterns from the client-side application.

*   **Action 1 (COMPLETED): Centralize Configuration in `.env`**
    *   **Source File:** `config.ts`
    *   **Target File:** `.env` (at project root)
    *   **Steps:**
        *   **[COMPLETED]** Move the `OPENWEATHERMAP_API_KEY` value to `.env` as `VITE_OPENWEATHERMAP_API_KEY`.
        *   **[COMPLETED]** Move the `FIREBASE_FUNCTIONS_URL` value to `.env` as `VITE_FIREBASE_FUNCTIONS_URL`.

*   **Action 2 (COMPLETED): Refactor Services to Use Environment Variables**
    *   **File:** `services/locationService.ts`
        *   **Change:** **[COMPLETED]** Modify the `getWeather` function to read the API key from `import.meta.env.VITE_OPENWEATHERMAP_API_KEY`.
    *   **File:** `services/firebaseService.ts`
        *   **Change:** **[COMPLETED]** Modify the service to read the function URL from `import.meta.env.VITE_FIREBASE_FUNCTIONS_URL`.

*   **Action 3 (COMPLETED): Purge Obsolete and Insecure Assets**
    *   **File:** `config.ts`
        *   **Change:** **[COMPLETED]** This file will be **deleted** after its values are migrated.
    *   **File:** `vite.config.ts`
        *   **Change:** **[COMPLETED]** The `define` property used to inject the secret `GEMINI_API_KEY` will be **removed**.
    *   **File:** `services/geminiService.ts`
        *   **Change:** **[COMPLETED]** This file, which makes insecure client-side API calls, will be **deleted**.
    *   **File:** `package.json`
        *   **Change:** **[COMPLETED]** The `@google/generative-ai` dependency will be **removed** from the client-side `dependencies`.

---

## Phase 3: Refactor Frontend Application (`App.tsx`)

This is the central phase of the refactor, connecting the user interface to the secure V2 backend.

*   **File:** `App.tsx`
*   **Action: Re-architect the `handleGenerateImage` Function**
    *   The core image generation logic will be rebuilt inside this function.
    *   **Step A (Data Gathering):** The function will call the existing `locationService.getWeather(location)` to get the current weather conditions.
    *   **Step B (Prompt Construction):** The function will construct the detailed, natural language prompt string required by the V2 spec, dynamically combining the Location, Weather Report, Bee Personality, and a Common Local Flower.
    *   **Step C (Secure Backend Call):** The function will now call the V2-compliant backend. It will **remove all references to `geminiService`** and instead use `firebaseService.generateImageAndText({ prompt: constructedPrompt })`.
    *   **Step D (Update UI):** The result from the `firebaseService` call (containing the image data and fun fact) will be used to update the application's state and render the results to the user.

---

## Phase 4: Future Feature Implementation (Post-Refactor)

Once the core V2 refactor is complete and stable, work can begin on additional features outlined in the specification.

*   **Feature:** "Animate Scene"
*   **Model:** `veo-2.0-generate-001`
*   **Action:** This will require a new Cloud Function and a corresponding client-side service and UI element (`Animate Scene` button) to implement. This is noted as out-of-scope for the immediate security refactor but is the logical next step.

---

This plan is now ready for discussion.
