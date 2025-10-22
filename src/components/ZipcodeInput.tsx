import React, { useState } from 'react';
import { US_STATES } from '@/src/constants';
import type { LocationSubmitData } from '@/src/types';

interface LocationInputProps {
  onSubmit: (data: LocationSubmitData) => void;
  isLoading: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'zipcode' | 'cityState'>('zipcode');
  const [zipcode, setZipcode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'zipcode') {
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipcode)) {
        setError('Please enter a valid 5-digit US zipcode.');
        return;
      }
      onSubmit({ type: 'zipcode', value: zipcode });
    } else {
      if (!city.trim()) {
        setError('Please enter a city name.');
        return;
      }
      if (!state) {
        setError('Please select a state.');
        return;
      }
      onSubmit({ type: 'cityState', city: city.trim(), state });
    }
  };
  
  const activeTabClass = "bg-yellow-500 text-white";
  const inactiveTabClass = "bg-white text-gray-600 hover:bg-yellow-100";

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 rounded-2xl p-2 shadow-lg border-2 border-yellow-200 mb-6">
        <div className="flex justify-center">
          <button 
              onClick={() => { setMode('zipcode'); setError('')}} 
              className={`w-1/2 py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${mode === 'zipcode' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:text-yellow-600'}`}
              aria-pressed={mode === 'zipcode'}
          >
              📍 By Zipcode
          </button>
          <button 
              onClick={() => { setMode('cityState'); setError('')}} 
              className={`w-1/2 py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${mode === 'cityState' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'text-gray-600 hover:text-yellow-600'}`}
              aria-pressed={mode === 'cityState'}
          >
              🏙️ By City / State
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-200">
          {mode === 'zipcode' ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏠 Enter your zipcode
                </label>
                <input
                  type="text"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  placeholder="12345"
                  disabled={isLoading}
                  maxLength={5}
                  className="w-full px-6 py-4 text-xl border-2 border-yellow-300 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-inner"
                  aria-label="Zipcode input"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-wait whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? '🔍 Searching...' : '🐝 Find a Bee'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏙️ City name
                  </label>
                  <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      disabled={isLoading}
                      className="w-full px-6 py-4 text-xl border-2 border-yellow-300 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-inner"
                      aria-label="City input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🗺️ State
                  </label>
                  <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-6 py-4 text-xl border-2 border-yellow-300 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white bg-no-repeat bg-right-4 shadow-inner"
                      style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
                      aria-label="State selection"
                  >
                      <option value="" disabled>Select a state</option>
                      {US_STATES.map(s => (
                          <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-wait shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                  {isLoading ? '🔍 Searching...' : '🐝 Find a Bee'}
              </button>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 text-center font-semibold" role="alert">
                ⚠️ {error}
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};