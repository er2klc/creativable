interface PlatformCardImageProps {
  imageUrl?: string | null;
  logoUrl?: string | null;
  name?: string;
}

export const PlatformCardImage = ({ imageUrl, logoUrl, name = "" }: PlatformCardImageProps) => {
  const displayUrl = imageUrl || logoUrl;
  
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden">
      {displayUrl ? (
        <img 
          src={displayUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
          <span className="text-6xl font-bold text-white/20">
            {name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};