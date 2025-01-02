import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformCardImage } from "./PlatformCardImage";
import { PlatformCardContent } from "./PlatformCardContent";
import { PlatformCardActions } from "./PlatformCardActions";

interface PlatformCardProps {
  platform: {
    id: string;
    name: string;
    description?: string;
    image_url?: string | null;
    logo_url?: string | null;
    slug: string;
  };
  onDelete?: (id: string) => void;
}

export const PlatformCard = ({ platform, onDelete }: PlatformCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (platform.slug) {
      navigate(`/elevate/modul/${platform.slug}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      <PlatformCardImage 
        imageUrl={platform.image_url}
        logoUrl={platform.logo_url}
        name={platform.name}
      />
      <CardContent className="p-0">
        <PlatformCardContent platform={platform} />
        <PlatformCardActions 
          platform={platform} 
          onDelete={(e) => {
            e.stopPropagation();
            onDelete?.(platform.id);
          }} 
        />
      </CardContent>
    </Card>
  );
};