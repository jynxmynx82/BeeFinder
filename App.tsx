import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LocationInput } from './components/ZipcodeInput';
import { Loader } from './components/Loader';
import { BeeView } from './components/BeeView';
import { BeeFactCard } from './components/BeeFactCard';
import { BeeSelector } from './components/BeeSelector';
import { getLocation, getWeather } from './services/locationService';
import { generateBeeImage, generateBeeVideo } from './services/geminiService';
import { BEE_CHARACTERS, BEE_FACTS, FLOWER_DATA } from './constants';
import type { BeeData, LocationData, BeeCharacter, LocationInfo, WeatherInfo, LocationSubmitData } from './types';
import { BeeIcon, DownloadIcon } from './components/icons/BeeIcon';

type AppStep = 'idle' | 'loadingLocation' | 'selectBee' | 'loadingImage' | 'results' | 'error';
type AnimationStep = 'idle' | 'animating' | 'done';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('idle');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [beeData, setBeeData] = useState<BeeData | null>(null);
  const [availableBees, setAvailableBees] = useState<BeeCharacter[]>([]);

  // State for animation
  const [animationStep, setAnimationStep] = useState<AnimationStep>('idle');
  const [animationMessage, setAnimationMessage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // State to hold data between steps
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  
  const getRandomItem = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const createPrompt = (location: string, weather: string, flower: string, beeName: string, hour: number): string => {
    const timeOfDay = getTimeOfDay(hour);
    const base = `An ultra-realistic, stunning, cinematic macro photograph of a native bee, its appearance subtly inspired by the personality of "${beeName}".`;
    const style = "Incredibly detailed, vibrant colors, dramatic lighting, shallow depth of field, capturing the intricate details of the bee and its environment.";

    let scenario = '';
    let lighting = '';
    const isRaining = weather.toLowerCase().includes('rain') || weather.toLowerCase().includes('shower') || weather.toLowerCase().includes('storm');
  
    // Check for daytime rain first
    if (isRaining && (hour >= 7 && hour < 19)) {
        scenario = `The bee is taking shelter from a gentle rain shower under a vibrant ${flower} petal in ${location}. Glistening raindrops cling to the flower and the bee's fuzzy body.`;
        lighting = "The lighting is soft and diffused due to the overcast, rainy sky."
    }
    // Early Morning (7am - 9am)
    else if (hour >= 7 && hour < 10) { 
        const weatherAdjective = weather.toLowerCase().includes('cloud') ? 'softly lit' : 'early morning sun';
        scenario = `It's early morning in ${location}. The bee is just starting its day, warming its wings on a ${flower} under the ${weatherAdjective}. Dew drops are still visible on the petals.`;
        lighting = "The lighting is gentle and golden, characteristic of sunrise."
    }
    // Morning Rush (10am - 1pm)
    else if (hour >= 10 && hour <= 13) { 
        const weatherAdjective = weather.toLowerCase().includes('cloud') ? 'an overcast but bright' : 'a bright and sunny';
        scenario = `It's peak morning rush in ${location}. The bee is actively collecting nectar, its head buried deep inside a blooming ${flower}. Its legs are covered with colorful clumps of pollen. The scene is set in a garden under ${weatherAdjective} sky.`;
        lighting = "The lighting is bright and clear."
    } 
    // Midday Hustle (2pm - 5pm)
    else if (hour >= 14 && hour <= 17) {
        const weatherAdjective = weather.toLowerCase().includes('cloud') ? 'a hazy' : 'a high and bright';
        scenario = `During the midday hustle in ${location}, the bee is pictured deep within a field of wildflowers, hovering over a beautiful ${flower}. The sun is ${weatherAdjective}. In the distance, younger bees can be seen on swirling 'orientation flights' near their hive.`;
        lighting = "The lighting is direct and intense, casting short shadows."
    } 
    // Evening Slowdown (6pm - 9pm)
    else if (hour >= 18 && hour <= 21) { 
        scenario = `As the sun sets over ${location}, foraging is stopping. The bee is seen returning to the hive entrance. Other bees are clustering on the outside of the hive ('bearding') to help regulate its temperature on a warm evening.`;
        lighting = "The lighting is golden and warm, with long shadows from the setting sun."
    } 
    // Night Shift & Very Early Morning
    else { 
        scenario = `It is dark in ${location}. Inside the hive, which never truly sleeps, this bee is in a short rest cycle, its antennae drooping. Other worker bees around it are busy building new honeycomb, fanning their wings to control temperature, and tending to the queen.`;
        lighting = "The scene is illuminated only by the warm, internal glow of the hive, creating a dark and moody atmosphere."
    }

    const researchPrompt = `Task: Create an image of a bee on a specific flower, ensuring botanical accuracy.

Step 1: Research.
Before generating the image, perform internal research to understand the precise visual characteristics of the flower: "${flower}". Analyze its typical colors, petal shape and count, stamen/pistil structure, leaf appearance, and overall blossom arrangement (e.g., single flower, clustered inflorescence). For example, your research on 'Joe Pye Weed' should identify it as having large clusters of small, fuzzy, mauve-pink flowers.

Step 2: Generate Image.
Using your detailed visual understanding from Step 1, generate the following scene:`;

    const imageGenerationDetails = `${base} ${scenario} ${lighting} ${style}`;

    return `${researchPrompt}\n\n${imageGenerationDetails}`;
  };

  const createBeeMessage = (location: string, weather: string, flower: string, hour: number): string => {
    const isRaining = weather.toLowerCase().includes('rain') || weather.toLowerCase().includes('shower') || weather.toLowerCase().includes('storm');

    // Check for daytime rain first
    if (isRaining && (hour >= 7 && hour < 19)) {
        return `Phew, it's a bit wet out here in ${location}! I'm taking a little break from the rain under this big ${flower} petal. I'll be back to work as soon as the sun comes out again!`;
    } 
    // Early Morning (7am - 9am)
    else if (hour >= 7 && hour < 10) {
        return `Good morning from a dew-covered ${location}! I'm just warming up my wings on this ${flower}. It's a bit chilly but I'll be buzzing around for pollen soon!`;
    }
    // Morning Rush (10am - 1pm)
    else if (hour >= 10 && hour <= 13) { 
        return `It's a busy morning in ${location}! The sun is out and I'm super busy collecting nectar from this yummy ${flower}. My legs are getting so full of pollen! It's a busy day at the office.`;
    } 
    // Midday Hustle (2pm - 5pm)
    else if (hour >= 14 && hour <= 17) {
        return `It's a beautiful afternoon here in ${location}! I've traveled pretty far from my hive to find the best flowers, like this lovely ${flower}. I can see some of the younger bees learning how to fly back home. So much to do!`;
    } 
    // Evening Slowdown (6pm - 9pm)
    else if (hour >= 18 && hour <= 21) { 
        return `The sun is going down over ${location}, so it's time to head back to the hive after a long day. It's getting cozy here at the entrance with all my friends. We're getting ready to turn all this nectar into honey tonight!`;
    } 
    // Night Shift & Very Early Morning
    else { 
        return `Shhh, I'm taking a quick nap inside my warm hive in ${location}. It's dark outside, but some of my friends are still working hard, taking care of the queen and making honey. I'll be up soon to go and collect pollen!`;
    }
  };

  const handleLocationSubmit = useCallback(async (location: LocationSubmitData) => {
    setStep('loadingLocation');
    setError(null);
    setBeeData(null);
    setAvailableBees([]);
    setLoadingMessage('Bee-lining to your location...');
    setAnimationStep('idle');
    setVideoUrl(null);

    try {
      // 1. Get Location
      const locationData: LocationData = await getLocation(location);
      const place = locationData.places[0];
      const locInfo: LocationInfo = {
        locationString: `${place['place name']}, ${place['state abbreviation']}`,
        stateAbbreviation: place['state abbreviation'],
      };
      setLocationInfo(locInfo);

      // 2. Get Weather
      setLoadingMessage('Checking the weather forecast...');
      const { weatherData, timeZone } = await getWeather(place.latitude, place.longitude);
      const currentForecast = weatherData.properties.periods[0];

      // Calculate local hour based on the timezone from the API
      const now = new Date();
      const localHourString = now.toLocaleString('en-US', {
        timeZone: timeZone,
        hour: '2-digit',
        hour12: false
      });
      // The result can be "24" for midnight, which we should treat as 0.
      const currentHour = parseInt(localHourString.replace('24', '0'), 10);
      
      const weathInfo: WeatherInfo = {
        weatherDescription: currentForecast.shortForecast,
        timeZone: timeZone,
        currentHour: currentHour,
      };
      setWeatherInfo(weathInfo);
      
      // 3. Select Available Bees
      const shuffledBees = [...BEE_CHARACTERS].sort(() => 0.5 - Math.random());
      setAvailableBees(shuffledBees.slice(0, 3));
      
      setStep('selectBee');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred. Our bees are confused!';
      setError(errorMessage);
      setStep('error');
    }
  }, []);

  const handleBeeSelect = useCallback(async (bee: BeeCharacter) => {
    if (!locationInfo || !weatherInfo) {
      setError('Missing location or weather data. Please start over.');
      setStep('error');
      return;
    }
    
    setStep('loadingImage');
    setLoadingMessage(`Waking up ${bee.name}...`);
    setAnimationStep('idle');
    setVideoUrl(null);

    try {
      // 1. Get current hour for time-of-day context from our timezone-aware state
      const currentHour = weatherInfo.currentHour;
        
      // 2. Select Flower
      const stateFlowers = FLOWER_DATA[locationInfo.stateAbbreviation as keyof typeof FLOWER_DATA] || FLOWER_DATA['default'];
      const flower = getRandomItem(stateFlowers);

      // 3. Create Prompt and Message
      const prompt = createPrompt(locationInfo.locationString, weatherInfo.weatherDescription, flower, bee.name, currentHour);
      const beeMessage = createBeeMessage(locationInfo.locationString, weatherInfo.weatherDescription, flower, currentHour);

      // 4. Generate Image
      setLoadingMessage('Our artist bee is painting your picture...');
      const { imageUrl, base64Data, mimeType } = await generateBeeImage(prompt);

      // 5. Assemble Bee Data
      const newBeeData: BeeData = {
        imageUrl,
        base64ImageData: base64Data,
        mimeType,
        beeName: bee.name,
        location: locationInfo.locationString,
        fact: getRandomItem(BEE_FACTS),
        prompt: prompt,
        beeMessage: beeMessage,
      };

      setBeeData(newBeeData);
      setStep('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred. Our bees are confused!';
      setError(errorMessage);
      setStep('error');
    }
  }, [locationInfo, weatherInfo]);
  
  const handleAnimate = useCallback(async () => {
    if (!beeData?.base64ImageData || !beeData.mimeType) return;

    setAnimationStep('animating');
    setError(null);
    setVideoUrl(null);

    try {
      const objectUrl = await generateBeeVideo(
        beeData.base64ImageData,
        beeData.mimeType,
        (message) => setAnimationMessage(message)
      );
      setVideoUrl(objectUrl);
      setAnimationStep('done');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'The animation failed. The bee might be camera shy!';
      setError(errorMessage);
      setAnimationStep('idle'); // Revert to allow another try
    }
  }, [beeData]);

  const handleReset = () => {
    setStep('idle');
    setBeeData(null);
    setError(null);
    setAvailableBees([]);
    setLocationInfo(null);
    setWeatherInfo(null);
    setAnimationStep('idle');
    setVideoUrl(null);
  }
  
  const handleDownloadImage = useCallback(() => {
    if (!beeData?.base64ImageData) return;

    const link = document.createElement('a');
    link.href = `data:${beeData.mimeType};base64,${beeData.base64ImageData}`;
    const fileExtension = beeData.mimeType.split('/')[1] || 'jpeg';
    const fileName = `${beeData.beeName.replace(/\s+/g, '_').toLowerCase()}_scene.${fileExtension}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [beeData]);

  const handleDownloadAnimation = useCallback(() => {
    if (!videoUrl || !beeData?.beeName) return;

    const link = document.createElement('a');
    link.href = videoUrl;
    const fileName = `${beeData.beeName.replace(/\s+/g, '_').toLowerCase()}_animation.mp4`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [videoUrl, beeData]);

  const getTimeOfDay = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  const isLoading = step === 'loadingLocation' || step === 'loadingImage';

  return (
    <div className="bg-yellow-50 min-h-screen text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          {step === 'idle' && (
            <p className="text-center text-lg text-gray-700 max-w-2xl mx-auto">
              Bees are vital to our ecosystem. To highlight their world, we can imagine what a bee might be doing in your area right now based on local flowers and weather. Enter your location to generate a unique scene.
            </p>
          )}

          {(step === 'idle' || step === 'selectBee') && <LocationInput onSubmit={handleLocationSubmit} isLoading={isLoading} />}
          
          {(step === 'error' || (step === 'results' && animationStep === 'idle' && error)) && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto" role="alert">
              <strong className="font-bold">Oh no!</strong>
              <span className="block sm:inline ml-2">{error}</span>
              <button onClick={step === 'error' ? handleReset : () => setError(null)} className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                {step === 'error' ? 'Try Again' : 'Dismiss'}
              </button>
            </div>
          )}

          {isLoading && <Loader message={loadingMessage} />}
          
          {step === 'selectBee' && <BeeSelector bees={availableBees} onSelect={handleBeeSelect} />}
          
          {step === 'results' && beeData && (
            <div className="mt-12 animate-fade-in text-center">
              <BeeView 
                beeData={beeData}
                videoUrl={videoUrl}
                animationStep={animationStep}
                animationMessage={animationMessage}
                onAnimate={handleAnimate}
              />
              <BeeFactCard fact={beeData.fact} />
              <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
                <button onClick={handleDownloadImage} className="flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200">
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download Image</span>
                </button>
                <button onClick={handleReset} className="px-6 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200">
                    Start Over
                </button>
                {animationStep === 'done' && videoUrl && (
                    <button onClick={handleDownloadAnimation} className="flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download Animation</span>
                    </button>
                )}
              </div>
            </div>
          )}

          {step === 'idle' && !beeData && !error && (
             <div className="text-center mt-12 text-gray-500">
                <BeeIcon className="w-24 h-24 mx-auto opacity-50" />
                <p className="mt-4 text-xl">Waiting for a location to imagine a local bee scene...</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;