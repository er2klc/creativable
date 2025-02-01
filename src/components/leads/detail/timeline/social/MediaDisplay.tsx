interface MediaDisplayProps {
  mediaUrls: string[];
  videoUrl?: string | null;
  isVideo?: boolean;
  localMediaPaths?: string[] | null;
  localVideoPath?: string | null;
}

export const MediaDisplay = ({ 
  mediaUrls, 
  videoUrl, 
  isVideo,
  localMediaPaths,
  localVideoPath
}: MediaDisplayProps) => {
  // Use local paths if available, otherwise use remote URLs
  const displayMediaUrls = localMediaPaths?.length ? localMediaPaths : mediaUrls;
  const displayVideoUrl = localVideoPath || videoUrl;

  if (isVideo && displayVideoUrl) {
    return (
      <div className="relative pt-[56.25%] bg-black">
        <video
          className="absolute top-0 left-0 w-full h-full object-contain"
          controls
          src={displayVideoUrl}
        />
      </div>
    );
  }

  if (displayMediaUrls.length === 1) {
    return (
      <div className="relative pt-[56.25%] bg-black">
        <img
          src={displayMediaUrls[0]}
          alt="Social media post"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
      </div>
    );
  }

  if (displayMediaUrls.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-1 p-1">
        {displayMediaUrls.map((url, index) => (
          <div key={index} className="relative pt-[100%]">
            <img
              src={url}
              alt={`Social media post ${index + 1}`}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return null;
};