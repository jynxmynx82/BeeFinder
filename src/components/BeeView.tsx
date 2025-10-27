import React from 'react';

interface BeeViewProps {
  imageUrl?: string | null;
}

export const BeeView: React.FC<BeeViewProps> = ({ imageUrl }) => {
  // If there's no image URL, render a friendly placeholder instead of a broken image.
  if (!imageUrl) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-yellow-300 flex items-center justify-center p-12">
        <div className="text-center text-yellow-700">
          <svg className="mx-auto mb-3" width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v6" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12h14" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="16" r="4" stroke="#D97706" strokeWidth="1.5"/>
          </svg>
          <p className="font-semibold">No image available</p>
          <p className="text-sm text-yellow-600">Try again or check backend logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-yellow-300">
      <img
        src={imageUrl}
        alt="A generated bee image"
        className="w-full h-auto"
      />
    </div>
  );
};