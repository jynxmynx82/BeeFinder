import React from 'react';

interface GenerateVideoButtonProps {
  onGenerateVideo: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const GenerateVideoButton: React.FC<GenerateVideoButtonProps> = ({ 
  onGenerateVideo, 
  isLoading, 
  disabled = false 
}) => {
  return (
    <div className="mt-6 text-center">
      <button
        onClick={onGenerateVideo}
        disabled={disabled || isLoading}
        className="px-8 py-4 text-lg font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Video...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Generate Video
          </>
        )}
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Create a cinematic video from your bee image
      </p>
    </div>
  );
};
