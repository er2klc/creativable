
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
    <>
      <div className="text-gray-500 text-sm">
        View ID: {id || 'No ID'}
      </div>
      <div className="text-gray-500 text-sm flex items-center gap-2">
        {locationInfo}
      </div>
      {typeof progress === 'number' && progress > 0 && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">
            Fortschritt: {Math.round(progress)}%
          </div>
          <div className="h-2 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-500 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
};

