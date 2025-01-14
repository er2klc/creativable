import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VisionBoardImage {
  id: string;
  theme: string;
  image_url: string;
  order_index: number;
}

export const VisionBoardGrid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [theme, setTheme] = useState("");

  const { data: images, isLoading: isLoadingImages, refetch } = useQuery({
    queryKey: ["vision-board-images"],
    queryFn: async () => {
      const { data: board, error: boardError } = await supabase
        .from("vision_boards")
        .select("id")
        .maybeSingle();

      if (boardError) {
        console.error("Error fetching board:", boardError);
        throw boardError;
      }

      if (!board) {
        const { data: newBoard, error: createError } = await supabase
          .from("vision_boards")
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating board:", createError);
          throw createError;
        }

        return [];
      }

      const { data: images, error: imagesError } = await supabase
        .from("vision_board_images")
        .select("*")
        .order("order_index");

      if (imagesError) {
        console.error("Error fetching images:", imagesError);
        throw imagesError;
      }

      return images || [];
    },
  });

  const handleAddImage = async () => {
    if (!theme.trim()) {
      toast.error("Bitte geben Sie ein Thema ein");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/functions/v1/generate-vision-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const { imageUrl } = await response.json();

      const { data: board } = await supabase
        .from("vision_boards")
        .select("id")
        .maybeSingle();

      if (!board) {
        throw new Error("No vision board found");
      }

      const { error: insertError } = await supabase
        .from("vision_board_images")
        .insert({
          board_id: board.id,
          theme,
          image_url: imageUrl,
          order_index: (images?.length || 0),
        });

      if (insertError) {
        throw insertError;
      }

      await refetch();
      setIsDialogOpen(false);
      setTheme("");
      toast.success("Bild wurde erfolgreich hinzugefügt");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Fehler beim Hinzufügen des Bildes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from("vision_board_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await refetch();
      toast.success("Bild wurde erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Fehler beim Löschen des Bildes");
    }
  };

  const handleMoveImage = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentImage = images?.find(img => img.id === id);
      if (!currentImage) return;

      const otherImage = images?.find(img => 
        direction === 'up' 
          ? img.order_index === currentImage.order_index - 1
          : img.order_index === currentImage.order_index + 1
      );

      if (!otherImage) return;

      const { error: error1 } = await supabase
        .from("vision_board_images")
        .update({ order_index: otherImage.order_index })
        .eq("id", currentImage.id);

      const { error: error2 } = await supabase
        .from("vision_board_images")
        .update({ order_index: currentImage.order_index })
        .eq("id", otherImage.id);

      if (error1 || error2) throw error1 || error2;

      await refetch();
    } catch (error) {
      console.error("Error moving image:", error);
      toast.error("Fehler beim Verschieben des Bildes");
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Visionsbild erstellen</DialogTitle>
            <DialogDescription>
              Geben Sie ein Thema ein, und wir generieren ein passendes Bild für Ihr Vision Board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Thema</Label>
              <Input
                id="theme"
                placeholder="z.B. Ein traumhaftes Strandhaus bei Sonnenuntergang"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddImage}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                "Bild generieren"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleMoveImage(image.id, 'up')}
                  disabled={image.order_index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleMoveImage(image.id, 'down')}
                  disabled={image.order_index === (images.length - 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        <Button
          onClick={() => setIsDialogOpen(true)}
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