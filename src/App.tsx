import './icons.css';
import { useState } from "react";

// Components
import { Header } from "@/src/components/Header";
import { LocationInput } from "@/src/components/ZipcodeInput";
import { BeeView } from "@/src/components/BeeView";
import { BeeFactCard } from "@/src/components/BeeFactCard";
import { Loader } from "@/src/components/Loader";
import { FunBeeIcon } from "@/src/components/icons/FunBeeIcon";
import { GenerateVideoButton } from "@/src/components/GenerateVideoButton";
import { VideoViewer } from "@/src/components/VideoViewer";

// Secure, consolidated V2 Service
import { callGenerateImageAndText, generateVideo2 } from "@/src/services/firebaseService";

// Types
import { AppState, ImageData, LocationSubmitData, VideoData, VideoGenerationInput } from "@/src/types";

function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (locationData: LocationSubmitData) => {
    if (locationData.type === 'zipcode') {
        console.log("Starting V2 generation process for zipcode:", locationData.value);
    } else {
        console.log(`Starting V2 generation process for city/state: ${locationData.city}, ${locationData.state}`);
    }
    
    setAppState("loading");
    setError(null);
    setImageData(null);
    setVideoData(null);

    try {
      // Call the new, simplified service function that correctly handles the data payload.
      const result = await callGenerateImageAndText(locationData);

      console.log("V2 Generation complete.");

      // Backend returns either a public `imageUrl` (preferred) or an inline Base64 `image`.
      // Use the public URL when present; fall back to inline Base64 only if available.
      const imageUrl = result.imageUrl
        ? result.imageUrl
        : (result.image ? `data:image/png;base64,${result.image}` : null);

      setImageData({
        url: imageUrl,
        speciesName: result.speciesName,
        fact: result.fact,
      });
      setAppState("success");

    } catch (err: any) {
      console.error("An error occurred during the V2 generation process:", err);
      const errorMessage = err.message || "An unknown error occurred. Please try again.";
      setError(errorMessage);
      setAppState("error");
      setImageData(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!imageData?.url) {
      console.error("No image available for video generation");
      return;
    }

    setIsGeneratingVideo(true);
    setError(null);

    try {
      const videoInput: VideoGenerationInput = {
        imageUrl: imageData.url,
        duration: 4,
        prompt: `A cinematic macro video (4 seconds) showing bees pollinating bright wildflowers in natural light.`
      };

      console.log("Starting video generation...");
      const result = await generateVideo2(videoInput);
      
      console.log("Video generation complete:", result);
      setVideoData(result);
    } catch (err: any) {
      console.error("An error occurred during video generation:", err);
      const errorMessage = err.message || "An unknown error occurred during video generation. Please try again.";
      setError(errorMessage);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // ... (renderContent and JSX are unchanged) ...
  const renderContent = () => {
    switch (appState) {
      case "loading":
        return <Loader message="Locating bees near you..." />;
      case "success":
        if (!imageData) {
          return (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
              <p className="font-bold">Oops! Something went wrong.</p>
              <p>Image data is not available.</p>
            </div>
          );
        }
        return (
            <>
              <BeeView imageUrl={imageData.url} />
              <BeeFactCard
                speciesName={imageData.speciesName}
                fact={imageData.fact}
              />
              <GenerateVideoButton
                onGenerateVideo={handleGenerateVideo}
                isLoading={isGeneratingVideo}
                disabled={!imageData.url}
              />
              {videoData && (
                <div className="mt-8">
                  <VideoViewer
                    videoUrl={videoData.videoUrl}
                    duration={videoData.duration}
                    status={videoData.status}
                    message={videoData.message}
                  />
                </div>
              )}
            </>
        );
      case "error":
        return (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
            <p className="font-bold">Oops! A bee got in the wires.</p>
            <p>{error}</p>
          </div>
        );
      case "idle":
      default:
        return (
          <div className="text-center text-gray-500 flex flex-col items-center gap-4 mt-8">
            <FunBeeIcon className="icon-100" /> 
            <p>Enter a US zipcode to generate a local bee scene!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <LocationInput
            onSubmit={handleSubmit}
            isLoading={appState === "loading"}
          />
          <div className="mt-8">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
