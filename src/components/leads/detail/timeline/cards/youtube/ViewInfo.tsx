
interface ViewInfoProps {
  id?: string;
  ip?: string;
  location?: string;
  progress?: number;
}

export const ViewInfo = ({ id, ip, location, progress }: ViewInfoProps) => {
  if (!ip && !location) return null;
  
  const locationInfo = `${ip || 'Unknown IP'} | ${location || 'Unknown Location'}`;
  
  return (
    <div className="space-y-2">
      <div className="text-gray-500 text-sm">
        View ID: {id || 'No ID'}
      </div>
      <div className="text-gray-500 text-sm flex items-center gap-2">
        {locationInfo}
      </div>
      {typeof progress === 'number' && (
        <div className="text-sm font-medium text-blue-600">
          Fortschritt: {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};
