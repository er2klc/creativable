interface PlatformCardImageProps {
  platform: {
    name: string;
    logo_url: string | null;
    image_url: string | null;
  };
}

export const PlatformCardImage = ({ platform }: PlatformCardImageProps) => {
  const imageUrl = platform.image_url || platform.logo_url;
  
  return (
    <div className="w-full h-full">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={platform.name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <span className="text-4xl font-semibold text-gray-400">
            {platform.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};