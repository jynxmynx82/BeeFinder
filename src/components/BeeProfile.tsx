import React from 'react';
import { useBee } from '../hooks/useBee';
import { BeeView } from './BeeView';
import { BeeFactCard } from './BeeFactCard';

interface BeeProfileProps {
  beeId?: string;
}

export const BeeProfile: React.FC<BeeProfileProps> = ({ beeId }) => {
  const { data, loading, error, refetch } = useBee(beeId);

  if (!beeId) return <div className="text-center text-sm text-gray-600">No Bee ID provided.</div>;
  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return (
    <div className="text-center text-red-600">
      Error loading bee data.
      <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
    </div>
  );

  if (!data) return <div className="text-center text-sm text-gray-600">No bee found.</div>;

  return (
    <div>
      {data.imageUrl ? <BeeView imageUrl={data.imageUrl} /> : (
        <div className="max-w-2xl mx-auto bg-gray-100 rounded-lg p-6 text-center">Image not available</div>
      )}
      <BeeFactCard fact={data.fact} speciesName={data.beeName} />
    </div>
  );
};
