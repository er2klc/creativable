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
    <Card className="group overflow-hidden bg-white">
      <div className="relative h-[200px]">
        <PlatformCardImage platform={platform} />
        <PlatformCardActions platformId={platform.id} onDelete={() => onDelete(platform.id)} />
      </div>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <PlatformCardContent platform={platform} />
      </div>
    </Card>
  );
};