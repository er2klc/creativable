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
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <span className="text-6xl font-bold text-white/20">
            {platform.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};