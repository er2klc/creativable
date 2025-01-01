interface PlatformCardImageProps {
  platform: {
    name: string;
    logo_url: string | null;
  };
}

export const PlatformCardImage = ({ platform }: PlatformCardImageProps) => {
  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden">
      {platform.logo_url ? (
        <img 
          src={platform.logo_url} 
          alt={platform.name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-4xl font-semibold text-muted-foreground">
            {platform.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};