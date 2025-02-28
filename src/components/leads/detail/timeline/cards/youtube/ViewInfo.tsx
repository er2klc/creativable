
interface ViewInfoProps {
  id?: string;
  ip?: string;
  location?: string;
}

export const ViewInfo = ({ id, ip, location }: ViewInfoProps) => {
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
    </>
  );
};
