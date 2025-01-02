import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformCardImage } from "./PlatformCardImage";
import { PlatformCardContent } from "./PlatformCardContent";
import { PlatformCardActions } from "./PlatformCardActions";

interface PlatformCardProps {
  platform: any;
  onDelete?: (id: string) => void;
}

export const PlatformCard = ({ platform, onDelete }: PlatformCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/elevate/modul/${platform.slug}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      <PlatformCardImage imageUrl={platform.image_url} />
      <CardContent className="p-0">
        <PlatformCardContent platform={platform} />
        <PlatformCardActions platform={platform} onDelete={onDelete} />
      </CardContent>
    </Card>
  );
};