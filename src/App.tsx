import './icons.css';
import { useState } from "react";

// Components
import { Header } from "@/src/components/Header";
import { LocationInput } from "@/src/components/ZipcodeInput";
import { BeeView } from "@/src/components/BeeView";
import { BeeFactCard } from "@/src/components/BeeFactCard";
import { Loader } from "@/src/components/Loader";
import { FunBeeIcon } from "@/src/components/icons/FunBeeIcon";

// Secure, consolidated V2 Service
import { callGenerateImageAndText } from "@/src/services/firebaseService";

// Types
import { AppState, ImageData, LocationSubmitData } from "@/src/types";

function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [imageData, setImageData] = useState<ImageData | null>(null);
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
          <div className="text-center flex flex-col items-center gap-8 mt-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <FunBeeIcon className="icon-100 text-yellow-600 relative z-10 animate-bounce" />
            </div>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Ready to discover?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Enter a US zipcode or city to generate a beautiful local bee scene and learn fascinating facts about the bees in your area!
              </p>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>AI-Generated Images</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Local Bee Facts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>Educational Content</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 text-white font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-orange-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-amber-300 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
      </div>
      
      {/* SIMPLE GREY BACKGROUND TEST */}
      <div className="bg-green-500 text-white text-center p-4 font-bold text-2xl">
        🟢 GREY BACKGROUND TEST - If you see a GREY background, the styling is working! 🟢
      </div>
      
      <Header />
      <main className="container mx-auto p-4 md:p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <LocationInput
            onSubmit={handleSubmit}
            isLoading={appState === "loading"}
          />
          <div className="mt-12">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
