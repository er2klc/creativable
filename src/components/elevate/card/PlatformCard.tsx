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
    <Card className="group relative overflow-hidden min-h-[280px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 w-full h-full">
        <PlatformCardImage platform={platform} />
      </div>
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent" />
        <PlatformCardContent platform={platform} />
        <PlatformCardActions platformId={platform.id} onDelete={() => onDelete(platform.id)} />
      </div>
    </Card>
  );
};