import React from 'react';

interface BeeViewProps {
  imageUrl?: string | null;
}

export const BeeView: React.FC<BeeViewProps> = ({ imageUrl }) => {
  // If there's no image URL, render a friendly placeholder instead of a broken image.
  if (!imageUrl) {
    return (
      <div className="max-w-3xl mx-auto bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-gradient-to-r from-yellow-300 to-orange-300 flex items-center justify-center p-16 relative">
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-200 rounded-full opacity-60"></div>
        <div className="absolute bottom-6 left-6 w-6 h-6 bg-orange-200 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-4 w-4 h-4 bg-amber-200 rounded-full opacity-60"></div>
        
        <div className="text-center text-yellow-700 relative z-10">
          <div className="mb-6">
            <svg className="mx-auto animate-bounce" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v6" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12h14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="16" r="4" stroke="#D97706" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">No image available</h3>
          <p className="text-lg text-yellow-600">Try again or check backend logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-gradient-to-r from-yellow-300 to-orange-300 relative group">
      {/* Decorative pollen particles */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-300 rounded-full opacity-70 animate-pulse"></div>
      <div className="absolute top-8 right-8 w-2 h-2 bg-orange-300 rounded-full opacity-60 animate-pulse delay-300"></div>
      <div className="absolute bottom-6 left-6 w-4 h-4 bg-amber-300 rounded-full opacity-50 animate-pulse delay-700"></div>
      <div className="absolute bottom-4 left-12 w-2 h-2 bg-yellow-400 rounded-full opacity-80 animate-pulse delay-1000"></div>
      
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt="A beautiful bee in its natural habitat"
          className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Bottom accent */}
      <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400"></div>
    </div>
  );
};