import React from 'react';
import { FunBeeIcon } from './icons/FunBeeIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <FunBeeIcon className="w-16 h-16" />
        <h1 className="text-5xl font-bold text-gray-900">
          Bee Finder
        </h1>
        <FunBeeIcon className="w-16 h-16 transform -scale-x-100" />
      </div>
      <p className="mt-2 text-xl text-gray-600">A glimpse into a bee's world</p>
    </header>
  );
};
