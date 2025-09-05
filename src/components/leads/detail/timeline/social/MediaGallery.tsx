interface MediaGalleryProps {
  mediaUrls: string[];
  mediaType: string | null;
}

export const MediaGallery = ({ mediaUrls, mediaType }: MediaGalleryProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {mediaUrls.map((url, index) => (
        <div key={index} className="relative aspect-square">
          {mediaType?.toLowerCase() === 'video' ? (
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