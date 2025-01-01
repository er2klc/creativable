interface PlatformCardImageProps {
  platform: {
    name: string;
    logo_url: string | null;
  };
}

export const PlatformCardImage = ({ platform }: PlatformCardImageProps) => {
  return (
    <div className="relative min-w-[120px] h-20 rounded-lg overflow-hidden">
      {platform.logo_url ? (
        <>
          <img 
            src={platform.logo_url} 
            alt={platform.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-xl font-semibold">
            {platform.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};