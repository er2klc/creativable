import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VisionBoardImage {
  id: string;
  theme: string;
  image_url: string;
  order_index: number;
}

export const VisionBoardGrid = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: images, isLoading: isLoadingImages } = useQuery({
    queryKey: ["vision-board-images"],
    queryFn: async () => {
      const { data: board } = await supabase
        .from("vision_boards")
        .select("id")
        .single();

      if (!board) {
        const { data: newBoard } = await supabase
          .from("vision_boards")
          .insert({})
          .select()
          .single();

        if (!newBoard) {
          throw new Error("Failed to create vision board");
        }
        return [];
      }

      const { data: images } = await supabase
        .from("vision_board_images")
        .select("*")
        .order("order_index");

      return images || [];
    },
  });

  const handleAddImage = async () => {
    setIsLoading(true);
    try {
      // Implementation for adding images will come in the next step
      toast.info("Diese Funktion wird bald verfügbar sein");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Fehler beim Hinzufügen des Bildes");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingImages) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images?.map((image: VisionBoardImage) => (
          <Card key={image.id} className="relative aspect-square overflow-hidden group">
            <img
              src={image.image_url}
              alt={image.theme}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold">{image.theme}</p>
              </div>
            </div>
          </Card>
        ))}
        <Button
          onClick={handleAddImage}
          disabled={isLoading}
          className="aspect-square h-full w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent text-gray-600 hover:text-gray-700"
        >
          <Plus className="h-8 w-8" />
          <span>Neues Bild hinzufügen</span>
        </Button>
      </div>
    </div>
  );
};