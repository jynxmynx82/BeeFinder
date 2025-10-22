export interface LocationData {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: {
    'place name': string;
    longitude: string;
    state: string;
    'state abbreviation': string;
    latitude: string;
  }[];
}

export interface OpenWeatherData {
  weather: {
    main: string;
    description: string;
  }[];
  main: {
    temp: number;
  };
  timezone: number;
}

export interface BeeData {
  imageUrl: string;
  base64ImageData: string;
  mimeType: string;
  beeName: string;
  location: string;
  fact: string;
  prompt: string;
  beeMessage: string;
}

export interface BeeCharacter {
  name: string;
  description: string;
  color: string;
  flipped: boolean;
}

// For storing intermediate data between steps
export interface LocationInfo {
  locationString: string;
  stateAbbreviation: string;
}

export interface WeatherInfo {
  weatherDescription: string;
  currentHour: number;
}

export type LocationSubmitData = 
  | { type: 'zipcode'; value: string }
  | { type: 'cityState'; city: string; state: string };

// UI state for the app
export type AppState = 'idle' | 'loading' | 'success' | 'error';

// Lightweight image data passed to the UI
export interface ImageData {
  url: string | null;
  speciesName?: string;
  fact?: string;
}