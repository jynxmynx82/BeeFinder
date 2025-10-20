import React from 'react';

interface BeeViewProps {
  imageUrl: string;
}

export const BeeView: React.FC<BeeViewProps> = ({ imageUrl }) => {
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