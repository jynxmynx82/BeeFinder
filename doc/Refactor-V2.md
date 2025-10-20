Coding Agent Design Specification: BeeFinder Application (Refactored V2)

This specification outlines the core, approved design and technology stack for the **BeeFinder** application. \*\*The coding agent must adhere strictly to these architectural and model requirements to ensure security, scalability, and feature functionality.\*\*

Core Application Features

The user flow must include the following steps and components:

1. **Location Input:** The application must accept the user's location via a single text field, supporting either a **5-digit US Zipcode or City field and State drop down.**  
2. **Bee Selection:** The user is presented with a choice of **three (3) different "Bee Personalities” \-** each personality must be an ‘at risk’ bee with a visually correct cropped icon and its own 'personality story' in a static list to influence the image prompt. The 'at-risk' bee types are:
Franklin's Bumble Bee: (Bombus franklini)
Rusty Patched Bumble Bee: (Bombus affinis)
American Bumble Bee: (Bombus pensylvanicus)
There is a static list of 'Cute Bee names' and cute descriptions of personalities, and a random selection of an 'at risk' bee from these three types (an small square icon of the bee is located on the left of the name and description).
3. **Image Generation and Prompt Logic:**  
   * **Trigger:** The process begins upon user selection of a bee personality.  
   * **Prompt Construction:** The application must construct a natural language prompt that is dynamically built using existing code and the following four (4) contextual data points using existing API authentication, adding code where necessary:  
     * \[Location\]  
        (City and State)  
     * \[Weather Report\]  
        (Current local weather conditions)  
     * \[Bee Personality\]  
        (The selected bee and its species)  
     * \[Common Local Flower\]  
        (A native flower to the user's state, used to ensure botanical accuracy).  
   * **Output:** The final result must be an ultra-realistic image of the selected bee gathering pollen on the local flower under the specified weather conditions.  
4. **Media Options:** The **BeeFinder** application uses a secure call for authentication to Firebase to create an initial image. These buttons are listed in order:  
   * **Download Image:** Save the generated static image.  
   * **Start Over:** Reset the application  
   * **See Your Bee:** Using existing Firebase/Firestore coding send an API request to Gemini / Vertex for a  Veo 2 \[veo-2.0-generate-001\] video and with a \[duration: 5 seconds\]

II. Critical Technology & Model Requirements

\*\*The following model and architecture choices are non-negotiable and must be implemented as documented in the "Refactor-V2" document to prevent security vulnerabilities and ensure compatibility.\*\*1. 

Image Generation Model (Text-to-Image)

* **Model:**  
  gemini-2.5-flash-image  
* **Requirement:** This model is mandatory. It is specifically chosen for its multi-modal capability to handle the **two-step image prompt**—performing internal research on a flower's botanical characteristics *before* generating the final image. **The agent must NOT revert to any older or different models that lack this capability or require a multi-call process.**

2\. Video Generation Model (Image-to-Video)

* **Model:**  
  veo-2.0-generate-001  
* **Requirement:** This model is mandatory for the "Animate Scene" feature, which converts the static image into a short video.

3\. Secure Architecture (Authentication & Backend)

* **This is a Hybrid app:** the image generation is direct to \[gemini-2.5-flash-image\] but authenticated using existing coding for the backend calls via Firebase. This allows for a quick image turnaround.  
* **Authentication & Security:** Using existing coding, image and video generation **MUST** be routed through Firebase / Firestore / Firebase Hosting existing coding.  
* **Implementation:** Using existing code **Backend-for-Frontend (BFF)** pattern is required, specifically using **Firebase Cloud Functions**.  
* **Key Security Point:** The  
  GEMINI\_API\_KEY  
   **must be stored securely in the Firebase Cloud Function environment variables** and must **NEVER** be bundled with or exposed to the client-side (React/Vite) frontend code.  
* **Video Storage:** Upon successful video generation, the final video is stored in a public FireStore bucket using existing coding, and the public URL returned to the client for display.

