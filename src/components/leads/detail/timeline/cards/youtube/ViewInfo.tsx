
interface ViewInfoProps {
  id?: string;
  ip?: string;
  location?: string;
}

export const ViewInfo = ({ id, ip, location }: ViewInfoProps) => {
  if (!ip && !location) return null;
  
  return (
    <div className="space-y-1 text-gray-500 text-xs">
      {id && (
        <div>
          View ID: <span className="font-mono">{id.slice(0, 8)}...</span>
        </div>
      )}
      {ip && (
        <div>
          IP-Adresse: <span className="font-mono">{ip}</span>
        </div>
      )}
      {location && (
        <div>
          Standort: {location}
        </div>
      )}
    </div>
  );
};
