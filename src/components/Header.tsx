import React from 'react';
import { FunBeeIcon } from '@/src/components/icons/FunBeeIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-12 px-4 relative bg-blue-500 text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 opacity-10 rounded-3xl mx-4"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="transform hover:scale-110 transition-transform duration-300">
            <FunBeeIcon className="icon-100 text-yellow-600" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-lg" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            Bee Finder
          </h1>
          <div className="transform hover:scale-110 transition-transform duration-300 -scale-x-100">
            <FunBeeIcon className="icon-100 text-yellow-600" />
          </div>
        </div>
        <p className="text-2xl md:text-3xl text-gray-700 font-light tracking-wide">
          Discover the buzzing world around you
        </p>
        <div className="mt-4 text-lg font-bold text-yellow-300">
          🔵 HEADER COMPONENT TEST - If you see this blue background, the Header is updating!
        </div>
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};
