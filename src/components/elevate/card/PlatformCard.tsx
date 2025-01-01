import { Card } from "@/components/ui/card";
import { PlatformCardContent } from "./PlatformCardContent";
import { PlatformCardImage } from "./PlatformCardImage";
import { PlatformCardActions } from "./PlatformCardActions";

interface PlatformCardProps {
  platform: any;
  onDelete: (id: string) => void;
}

export const PlatformCard = ({ platform, onDelete }: PlatformCardProps) => {
  return (
    <Card className="group relative overflow-hidden min-h-[280px]">
      <PlatformCardImage imageUrl={platform.image_url} />
      <PlatformCardContent platform={platform} />
      <PlatformCardActions platform={platform} onDelete={onDelete} />
    </Card>
  );
};