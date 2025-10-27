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
    <div className="mt-8 max-w-lg mx-auto">
      <div className="flex justify-center mb-4 rounded-lg p-1 bg-gray-200">
        <button 
            onClick={() => { setMode('zipcode'); setError('')}} 
            className={`w-1/2 py-2 px-4 rounded-md font-semibold transition ${mode === 'zipcode' ? activeTabClass : inactiveTabClass}`}
            aria-pressed={mode === 'zipcode'}
        >
            By Zipcode
        </button>
        <button 
            onClick={() => { setMode('cityState'); setError('')}} 
            className={`w-1/2 py-2 px-4 rounded-md font-semibold transition ${mode === 'cityState' ? activeTabClass : inactiveTabClass}`}
            aria-pressed={mode === 'cityState'}
        >
            By City / State
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'zipcode' ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full">
              <input
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Enter your 5-digit zipcode"
                disabled={isLoading}
                maxLength={5}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                aria-label="Zipcode input"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200 disabled:bg-gray-400 disabled:cursor-wait whitespace-nowrap"
            >
              {isLoading ? 'Searching...' : 'Find a Bee'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <div className="sm:col-span-2">
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name"
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    aria-label="City input"
                />
             </div>
             <div className="w-full">
                <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed appearance-none bg-white bg-no-repeat bg-right-2.5"
                    style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
                    aria-label="State selection"
                >
                    <option value="" disabled>State</option>
                    {US_STATES.map(s => (
                        <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>
                    ))}
                </select>
             </div>
             <div className="sm:col-span-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200 disabled:bg-gray-400 disabled:cursor-wait whitespace-nowrap"
                >
                    {isLoading ? 'Searching...' : 'Find a Bee'}
                </button>
             </div>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-2 text-center" role="alert">{error}</p>}
      </form>
    </div>
  );
};