import React from 'react';
import { HiveIcon } from '@/src/components/icons/BeeIcon';

interface BeeFactCardProps {
  fact: string;
  speciesName?: string; // Make speciesName optional for a smoother transition
}

export const BeeFactCard: React.FC<BeeFactCardProps> = ({ fact, speciesName }) => {
  return (
    <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden border-2 border-yellow-200 relative group hover:shadow-3xl transition-all duration-300">
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-300 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-orange-300 rounded-full opacity-50 animate-pulse delay-500"></div>
      <div className="absolute top-1/2 right-8 w-3 h-3 bg-amber-300 rounded-full opacity-70 animate-pulse delay-1000"></div>
      
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-4">
        <h3 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center">
          <HiveIcon className="icon-100 mr-4 text-white animate-pulse"/>
          {speciesName ? `Meet the ${speciesName}` : "🐝 Bee Knowledge"}
        </h3>
      </div>
      
      <div className="p-8 text-center relative">
        {/* Floating pollen particles */}
        <div className="absolute top-2 left-8 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-6 right-12 w-1 h-1 bg-orange-400 rounded-full opacity-80 animate-bounce delay-300"></div>
        <div className="absolute bottom-4 left-12 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-70 animate-bounce delay-700"></div>
        
        <div className="relative z-10">
          <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
            {fact}
          </p>
          
          {/* Bottom accent line */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};