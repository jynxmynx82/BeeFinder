import React from 'react';
import { HiveIcon } from '@/src/components/icons/BeeIcon';

interface BeeFactCardProps {
  fact: string;
  speciesName?: string; // Make speciesName optional for a smoother transition
}

export const BeeFactCard: React.FC<BeeFactCardProps> = ({ fact, speciesName }) => {
  return (
    <div className="mt-8 max-w-2xl mx-auto bg-yellow-100 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-2 flex items-center justify-center text-yellow-800">
          <HiveIcon className="icon-100 mr-3 text-yellow-600"/>
          {speciesName ? `A Fact About the ${speciesName}` : "Did You Know?"}
        </h3>
        <p className="text-base text-yellow-900">{fact}</p>
      </div>
    </div>
  );
};