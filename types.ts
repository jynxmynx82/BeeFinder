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

export interface WeatherPointData {
    properties: {
        forecast: string;
        timeZone: string;
    }
}

export interface WeatherData {
    properties: {
        periods: {
            number: number;
            name: string;
            isDaytime: boolean;
            temperature: number;
            temperatureUnit: string;
            windSpeed: string;
            windDirection: string;
            shortForecast: string;
            detailedForecast: string;
        }[];
    };
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
  timeZone: string;
  currentHour: number;
}

export type LocationSubmitData = 
  | { type: 'zipcode'; value: string }
  | { type: 'cityState'; city: string; state: string };