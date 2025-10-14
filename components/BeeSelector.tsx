import React from 'react';
import type { BeeCharacter } from '../types';
import { FunBeeIcon } from './icons/FunBeeIcon';

interface BeeSelectorProps {
  bees: BeeCharacter[];
  onSelect: (bee: BeeCharacter) => void;
}

export const BeeSelector: React.FC<BeeSelectorProps> = ({ bees, onSelect }) => {
  return (
    <div className="mt-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-gray-800">Choose a Bee Personality</h2>
        <p className="text-center text-gray-600 mt-2">These bee archetypes are active in your area. Select one to inspire the generated image.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {bees.map((bee) => {
                return (
                    <button
                        key={bee.name}
                        onClick={() => onSelect(bee)}
                        className="text-left p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-yellow-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                        <div className="flex items-center gap-4">
                            <FunBeeIcon
                              color={bee.color}
                              className={`w-16 h-16 ${bee.flipped ? 'transform -scale-x-100' : ''}`}
                            />
                            <h3 className="text-xl font-bold text-gray-900">{bee.name}</h3>
                        </div>
                        <p className="mt-3 text-gray-600">{bee.description}</p>
                    </button>
                )
            })}
        </div>
    </div>
  );
};
