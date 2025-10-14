import type { LocationData, WeatherData, WeatherPointData, LocationSubmitData } from '../types';

const ZIPPOPOTAM_API_BASE = 'https://api.zippopotam.us/us/';
const WEATHER_API_BASE = 'https://api.weather.gov/points/';

export const getLocation = async (location: LocationSubmitData): Promise<LocationData> => {
    let url = '';
    let notFoundError = '';
    const isCityStateLookup = location.type === 'cityState';

    if (location.type === 'zipcode') {
        url = `${ZIPPOPOTAM_API_BASE}${location.value}`;
        notFoundError = "Invalid zipcode. Please try another.";
    } else { // cityState
        const encodedCity = encodeURIComponent(location.city);
        url = `${ZIPPOPOTAM_API_BASE}${location.state}/${encodedCity}`;
        notFoundError = "Invalid City/State combination. Please check your spelling and try again.";
    }

    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(notFoundError);
        }
        throw new Error('Could not fetch location data.');
    }
    
    const data: any = await response.json();

    if (!data.places || data.places.length === 0) {
        throw new Error(notFoundError);
    }

    // For City/State lookups, the API response structure is different.
    // We normalize it to match the structure of a zipcode lookup, which our LocationData type expects.
    if (isCityStateLookup) {
        const normalizedData: LocationData = {
            'post code': data.places[0]['post code'], // Hoist post code from the first place to the top level.
            country: data.country,
            'country abbreviation': data['country abbreviation'],
            places: data.places.map((place: any) => ({
                'place name': place['place name'],
                longitude: place.longitude,
                latitude: place.latitude,
                state: data.state, // Add state from top level into each place.
                'state abbreviation': data['state abbreviation'], // Add state abbreviation from top level into each place.
            }))
        };
        return normalizedData;
    }
    
    // Zipcode responses already match the LocationData type.
    return data as LocationData;
};

export const getWeather = async (lat: string, lon: string): Promise<{ weatherData: WeatherData, timeZone: string }> => {
  // Step 1: Get the forecast URL and timezone from the weather.gov points API
  const pointResponse = await fetch(`${WEATHER_API_BASE}${lat},${lon}`);
  if (!pointResponse.ok) {
    throw new Error('Could not fetch weather station data.');
  }
  const pointData: WeatherPointData = await pointResponse.json();
  const forecastUrl = pointData.properties.forecast;
  const timeZone = pointData.properties.timeZone;

  // Step 2: Get the actual forecast from the URL
  const forecastResponse = await fetch(forecastUrl);
  if (!forecastResponse.ok) {
    throw new Error('Could not fetch the weather forecast.');
  }
  const forecastData: WeatherData = await forecastResponse.json();
  if (!forecastData.properties.periods || forecastData.properties.periods.length === 0) {
      throw new Error('Weather data is currently unavailable for this location.');
  }
  return { weatherData: forecastData, timeZone };
};