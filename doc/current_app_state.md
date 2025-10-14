# Bee Finder Application Documentation

This document outlines the current state of the "Bee Finder" web application.

## 1. Project Overview

**Bee Finder** is a React-based web application designed to highlight the plight and daily life of bees. It generates a unique, localized, and context-aware image of a bee, which can then be brought to life as a short, animated video.

The user provides a US zipcode, and the application uses external APIs to fetch location and weather data. This information, combined with the current time of day and a user-selected bee personality, is used to construct a detailed prompt for the Google Gemini API.

A key feature is its advanced image generation method. The application uses a two-step prompt with the **`gemini-2.5-flash-image`** model. This prompt first instructs the model to internally research the visual characteristics of a flower native to the user's state for botanical accuracy. Then, using that research, it generates a unique scene depicting a bee on that flower under the current weather conditions. The user can then animate this scene using the **`veo-2.0-generate-001`** model.

## 2. Core Functionality & User Flow

The application follows a simple, multi-step process:

1.  **Idle State:** The user is greeted with an introduction and a zipcode input field.
2.  **Zipcode Submission:** The user enters a 5-digit US zipcode.
    - The app validates the input format.
    - It calls a service to get the city, state, latitude, and longitude.
    - It then calls another service to get the current weather forecast for that location.
3.  **Bee Selection:** The user is presented with three randomly selected "bee personalities" (e.g., "Bumble Bill," "Zippy"). Each has a short description.
4.  **Image Generation:** Upon selecting a bee:
    - The application constructs a detailed, two-step prompt. This prompt is the core of the application's logic for ensuring accuracy. (See Section 5 for details). It considers:
        - **Location:** City and State.
        - **Weather:** Current forecast (e.g., "sunny," "rainy," "cloudy").
        - **Time of Day:** The current hour determines the scenario (e.g., "early morning," "midday hustle," "night").
        - **Flora:** A native flower is randomly selected based on the user's state.
        - **Bee Personality:** The chosen bee's name is incorporated to influence the image subtly.
    - A corresponding "message from the bee" is also generated based on the same contextual data.
    - The `generateBeeImage` service is called, which communicates with the Gemini API.
5.  **Results Display:**
    - The generated image is displayed prominently.
    - The bee's message and location are overlaid on the image.
    - A random bee fact is shown below the image in a separate card.
    - The user has the option to view the exact prompt used for generation and an option to animate the scene.
6.  **Animate Scene (Optional):** The user can click the "Animate Scene" button.
    - The application enters an animating state, showing a series of progress messages (e.g., "Teaching the bee to fly...").
    - The `generateBeeVideo` service is called, passing the base64 data of the generated image.
    - This service communicates with the Gemini API, using the `veo-2.0-generate-001` model to create a short animation.
    - The service polls the API until the video generation operation is complete.
    - Once finished, the video is downloaded as a blob, converted to an object URL, and displayed in a video player that auto-plays and loops.
7.  **Download Media (Optional):**
    - A "Download Image" button appears, allowing the user to save the static image as a JPEG file.
    - If an animation is created, a "Download Animation" button appears, allowing the user to save the video as an MP4 file.
8.  **Reset:** The user can click "Start Over" to return to the initial state.

## 3. Technology Stack

-   **Frontend Framework:** React with TypeScript
-   **Styling:** Tailwind CSS for utility-first styling.
-   **AI Model:** Google Gemini API (`@google/genai` library)
    -   **Image Generation Model:** `gemini-2.5-flash-image`. This model is chosen for its multi-modal capabilities, allowing it to perform internal research based on a text prompt and then generate an image within a single call. This is critical for achieving botanical accuracy.
    -   **Video Generation Model:** `veo-2.0-generate-001`. This model takes the generated static image and a text prompt to create a short, cinematic animation.
-   **External APIs:**
    -   `zippopotam.us`: To convert a zipcode to location data (latitude, longitude, city, state).
    -   `weather.gov`: To get weather forecasts based on latitude and longitude.

## 4. File Structure

```
.
├── components/
│   ├── icons/
│   │   ├── BeeIcon.tsx               # SVG icons for bees, UI elements (including DownloadIcon)
│   │   ├── reshot-icon-bee-*.svg     # Unused SVG assets
│   ├── BeeFactCard.tsx             # Displays a random bee fact.
│   ├── BeeSelector.tsx             # Displays the three bee personality choices.
│   ├── BeeView.tsx                 # Displays the final generated image, message, and handles the UI for the video animation feature.
│   ├── Header.tsx                  # Application header component.
│   ├── Loader.tsx                  # Loading indicator with a message.
│   └── ZipcodeInput.tsx            # Zipcode input form.
├── services/
│   ├── geminiService.ts            # Handles communication with the Gemini API for both image and video generation.
│   └── locationService.ts          # Handles calls to Zippopotam and Weather.gov APIs.
├── App.tsx                         # Main application component, manages state and logic.
├── constants.ts                    # Contains static data like bee characters, facts, and flower data.
├── index.html                      # Main HTML entry point.
├── index.tsx                       # React root renderer.
├── metadata.json                   # Application metadata.
└── types.ts                        # TypeScript type definitions for data structures.
```

## 5. Core Logic: The Two-Step Image Prompt

**This is a critical update for all developers.** To address previous issues with botanical inaccuracy, the image generation prompt has been completely redesigned. The `createPrompt` function in `App.tsx` now builds a two-step prompt that leverages the `gemini-2.5-flash-image` model's ability to process complex instructions.

**New Prompt Structure:**

1.  **Task Definition:** The prompt begins by defining the overall goal.
2.  **Step 1: Research:** This step explicitly instructs the model to use its internal knowledge to research the visual characteristics of the specified flower *before* generating anything. This forces the model to analyze details like color, petal shape, and blossom arrangement. This is the key to improving accuracy.
3.  **Step 2: Generate Image:** Only after the research step does the prompt provide the detailed creative brief for the image itself. This brief is dynamically built from the location, weather, time, and bee personality, just as before.

**Example Prompt Breakdown:**

-   **Flower:** "Joe Pye Weed"
-   **Scenario:** A rainy day in Connecticut.

The final prompt sent to the model looks like this:

```
Task: Create an image of a bee on a specific flower, ensuring botanical accuracy.

Step 1: Research.
Before generating the image, perform internal research to understand the precise visual characteristics of the flower: "Joe Pye Weed". Analyze its typical colors, petal shape and count, stamen/pistil structure, leaf appearance, and overall blossom arrangement (e.g., single flower, clustered inflorescence). For example, your research on 'Joe Pye Weed' should identify it as having large clusters of small, fuzzy, mauve-pink flowers.

Step 2: Generate Image.
Using your detailed visual understanding from Step 1, generate the following scene:

An ultra-realistic, stunning, cinematic macro photograph of a native bee... [The bee is taking shelter from a gentle rain shower under a vibrant Joe Pye Weed petal in Danbury, CT...] [The lighting is soft and diffused...] Incredibly detailed, vibrant colors...
```

This new structure significantly increases the likelihood of producing a botanically correct image, which is a core goal of the application.