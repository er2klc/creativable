
import { MapPin } from "lucide-react";

interface ViewInfoProps {
  id?: string;
  ip?: string; 
  location?: string;
}

export const ViewInfo = ({ id, ip, location }: ViewInfoProps) => {
  if (!ip && !location) return null;
  
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
      {location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
      )}
      {ip && <span className="text-gray-400">IP: {ip}</span>}
    </div>
  );
};
