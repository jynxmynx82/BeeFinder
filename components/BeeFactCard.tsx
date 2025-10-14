import React from 'react';
import { HiveIcon } from './icons/BeeIcon';

interface BeeFactCardProps {
  fact: string;
}

export const BeeFactCard: React.FC<BeeFactCardProps> = ({ fact }) => {
  return (
    <div className="mt-8 max-w-2xl mx-auto bg-yellow-100 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-2 flex items-center justify-center text-yellow-800">
          <HiveIcon className="w-6 h-6 mr-3 text-yellow-600"/>
          Did You Know?
        </h3>
        <p className="text-base text-yellow-900">{fact}</p>
      </div>
    </div>
  );
};