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
    <Card className="group overflow-hidden bg-[#222]">
      <div className="relative h-[240px]">
        <PlatformCardImage platform={platform} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#222]/95 to-transparent" />
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <h3 className="text-xl font-orbitron text-white/90">{platform.name}</h3>
        </div>
        <PlatformCardActions platformId={platform.id} onDelete={() => onDelete(platform.id)} />
      </div>
      <div className="p-6 bg-gradient-to-t from-[#333] to-[#222]">
        <PlatformCardContent platform={platform} />
      </div>
    </Card>
  );
};