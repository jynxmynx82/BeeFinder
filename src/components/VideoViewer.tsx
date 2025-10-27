import React from 'react';

interface VideoViewerProps {
  videoUrl?: string | null;
  duration?: number;
  status?: string;
  message?: string;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({ videoUrl, duration, status, message }) => {
  // If there's no video URL, render a friendly placeholder
  if (!videoUrl) {
    const isRateLimited = status === 'unavailable' || message?.includes('temporarily unavailable');
    
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-purple-300 flex items-center justify-center p-12">
        <div className="text-center text-purple-700">
          <svg className="mx-auto mb-3" width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-semibold">
            {isRateLimited ? 'Video generation temporarily unavailable' : 'No video available'}
          </p>
          <p className="text-sm text-purple-600">
            {message || 'Video generation failed or is still processing.'}
          </p>
          {isRateLimited && (
            <p className="text-xs text-purple-500 mt-2">
              Please try again in a few minutes
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-purple-300">
      <div className="relative">
        <video
          src={videoUrl}
          controls
          className="w-full h-auto"
          poster=""
        >
          Your browser does not support the video tag.
        </video>
        {duration && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-medium">
            {duration}s
          </div>
        )}
      </div>
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-center gap-2 text-purple-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Generated Video</span>
        </div>
      </div>
    </div>
  );
};
