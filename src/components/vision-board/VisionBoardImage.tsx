import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VisionBoardImageProps {
  id: string;
  theme: string;
  imageUrl: string;
  orderIndex: number;
  totalImages: number;
  rotation?: number;
  onDelete: (id: string) => Promise<void>;
  onMove: (id: string, direction: 'up' | 'down') => Promise<void>;
}

export const VisionBoardImage = ({
  id,
  theme,
  imageUrl,
  orderIndex,
  totalImages,
  rotation = 0,
  onDelete,
  onMove,
}: VisionBoardImageProps) => {
  // Determine if the URL is a direct URL or needs to be fetched from Supabase
  const isDirectUrl = imageUrl.startsWith('http');
  const imageSource = isDirectUrl ? imageUrl : 
    supabase.storage.from('vision-board-images').getPublicUrl(imageUrl).data.publicUrl;

  return (
    <Card className="relative w-full h-full overflow-hidden group" 
          style={{ transform: `rotate(${rotation}deg)` }}>
      <img
        src={imageSource}
        alt={theme}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-4 left-4 text-white">
          <p className="font-semibold">{theme}</p>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onMove(id, 'up')}
            disabled={orderIndex === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onMove(id, 'down')}
            disabled={orderIndex === (totalImages - 1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};