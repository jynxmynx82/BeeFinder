import React, { useState } from 'react';
import type { BeeData } from '../types';
import { LocationIcon, InfoIcon, AnimateIcon, FilmIcon } from './icons/BeeIcon';
import { Loader } from './Loader';

interface BeeViewProps {
  beeData: BeeData;
  videoUrl: string | null;
  animationStep: 'idle' | 'animating' | 'done';
  animationMessage: string;
  onAnimate: () => void;
}

export const BeeView: React.FC<BeeViewProps> = ({ beeData, videoUrl, animationStep, animationMessage, onAnimate }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-yellow-300">
      <img 
        src={beeData.imageUrl} 
        alt={`A bee's view from ${beeData.location}`} 
        className="w-full h-auto" 
      />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">A message from {beeData.beeName}</h2>
          <p className="mt-2 text-lg italic text-gray-700">"{beeData.beeMessage}"</p>
          <div className="flex items-center mt-4 text-gray-600">
            <LocationIcon className="w-5 h-5 mr-2" />
            <p className="text-lg">{beeData.location}</p>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
              <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
              >
              <InfoIcon className="w-4 h-4 mr-2" />
              <span>{showPrompt ? 'Hide' : 'Show'} Prompt</span>
              </button>

              {animationStep === 'idle' && (
                <button
                  onClick={onAnimate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
                >
                  <AnimateIcon className="w-4 h-4" />
                  Animate Scene
                </button>
              )}
          </div>

          {showPrompt && (
            <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200 animate-fade-in-sm">
              <p><span className="font-semibold">Prompt:</span> {beeData.prompt}</p>
            </div>
          )}

          {(animationStep === 'animating' || (animationStep === 'done' && videoUrl)) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4 flex items-center justify-center gap-2">
                <FilmIcon className="w-5 h-5 text-purple-600" />
                Animated Scene
              </h3>
              {animationStep === 'animating' && (
                <Loader message={animationMessage} />
              )}
              {animationStep === 'done' && videoUrl && (
                <div className="rounded-lg overflow-hidden border-2 border-purple-200 shadow-inner mt-2">
                  <video 
                    src={videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-auto"
                    aria-label={`An animated bee's view from ${beeData.location}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add fade-in animation to tailwind config or a style tag if needed.
// For simplicity, adding it here.
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeInSmall {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in-sm {
    animation: fadeInSmall 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);