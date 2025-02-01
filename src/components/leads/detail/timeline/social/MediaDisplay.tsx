interface MediaDisplayProps {
  urls: string[];
  type: string;
}

export const MediaDisplay = ({ urls, type }: MediaDisplayProps) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      {urls.map((url, index) => (
        <div key={index} className="relative aspect-video">
          {type === 'video' ? (
            <video 
              src={url} 
              controls 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <img 
              src={url} 
              alt={`Media ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
      ))}
    </div>
  );
};