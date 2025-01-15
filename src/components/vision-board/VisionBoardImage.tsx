import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VisionBoardImageProps {
  id: string;
  theme: string;
  imageUrl: string;
  orderIndex: number;
  totalImages: number;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export const VisionBoardImage = ({
  id,
  theme,
  imageUrl,
  orderIndex,
  totalImages,
  onDelete,
  onMove,
}: VisionBoardImageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      // First try to delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('vision-board-images')
        .remove([imageUrl]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
      }

      onDelete(id);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Fehler beim Löschen des Bildes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${imageUrl}`);
    setImageError(true);
  };

  const publicUrl = supabase.storage
    .from('vision-board-images')
    .getPublicUrl(imageUrl)
    .data.publicUrl;

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
      {!imageError ? (
        <img
          src={publicUrl}
          alt={theme}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 p-4 text-center text-sm text-gray-500">
          Bild konnte nicht geladen werden
        </div>
      )}
      
      <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-200 group-hover:bg-opacity-50">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex gap-2">
            {orderIndex > 0 && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onMove(id, 'up')}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
            
            {orderIndex < totalImages - 1 && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onMove(id, 'down')}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};