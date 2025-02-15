
import { useModules } from "@/hooks/use-modules";
import { PlatformCardContent } from "./PlatformCardContent";
import { PlatformCardImage } from "./PlatformCardImage";
import { PlatformCardActions } from "./PlatformCardActions";
import { Card } from "@/components/ui/card";

interface PlatformCardProps {
  platform: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    logo_url: string | null;
    created_by: string;
  };
  onDelete: (id: string) => void;
}

export const PlatformCard = ({ platform, onDelete }: PlatformCardProps) => {
  const { data: modules = [] } = useModules(platform.id);
  
  return (
    <Card className="overflow-hidden group bg-white">
      <PlatformCardImage 
        imageUrl={platform.image_url}
        logoUrl={platform.logo_url}
        name={platform.name}
      />
      <PlatformCardContent 
        platform={platform} 
        moduleCount={modules.length}
      />
      <PlatformCardActions 
        platform={platform}
        onDelete={onDelete}
      />
    </Card>
  );
};
