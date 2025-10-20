
import React from 'react';
import { BeeIcon } from './icons/BeeIcon';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="mt-12 flex flex-col items-center justify-center text-center">
      <BeeIcon className="icon-100 text-yellow-500 animate-bounce" />
      <p className="mt-4 text-xl font-semibold text-gray-700">{message}</p>
    </div>
  );
};
