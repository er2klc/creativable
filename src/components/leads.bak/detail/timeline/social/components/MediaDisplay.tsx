interface MediaDisplayProps {
  mediaUrls: string[];
  hasVideo: boolean;
  isSidecar: boolean;
}

export const MediaDisplay = ({ mediaUrls, hasVideo, isSidecar }: MediaDisplayProps) => {
  if (mediaUrls.length === 0) return null;

  return (
    <div className="w-full">
      {hasVideo ? (
        <video 
          src={mediaUrls[0]} 
          controls 
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className={`grid ${isSidecar ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          {mediaUrls.map((url, index) => (
            <img 
              key={index}
              src={url} 
              alt={`Media ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};