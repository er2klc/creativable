import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import { AddImageDialog } from "./AddImageDialog";
import { VisionBoardHeader } from "./VisionBoardHeader";
import { VisionBoardImage } from "./VisionBoardImage";
import { Tables } from "@/integrations/supabase/types";

type VisionBoardImageType = Tables<"vision_board_images">;

const getRandomSize = (totalImages: number) => {
  if (totalImages <= 2) {
    // Für wenige Bilder größere Formate bevorzugen
    const sizes = [
      'col-span-3 row-span-2', // Extra Large
      'col-span-2 row-span-2', // Large
    ];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }
  
  // Für mehr Bilder verschiedene Größen mischen
  const sizes = [
    'col-span-2 row-span-2', // Large
    'col-span-2 row-span-1', // Wide
    'col-span-1 row-span-2', // Tall
    'col-span-1 row-span-1', // Small
  ];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

export const VisionBoardGrid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [layoutKey, setLayoutKey] = useState(0); // Für Layout-Neuberechnung

  const { data: images, isLoading: isLoadingImages, refetch } = useQuery({
    queryKey: ["vision-board-images"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("vision_board_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching images:", error);
        throw error;
      }

      return data || [];
    },
  });

  const shuffleLayout = () => {
    setLayoutKey(prev => prev + 1);
    toast.success("Layout wurde neu gemischt!");
  };

  const exportToPNG = async () => {
    const gridElement = document.getElementById('vision-board-grid');
    if (!gridElement) {
      toast.error("Grid nicht gefunden");
      return;
    }

    try {
      setIsLoading(true);
      const canvas = await html2canvas(gridElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.classList.contains('vision-board-controls');
        }
      });
      
      // Konvertiere Canvas zu Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `vision-board-${new Date().toISOString().slice(0, 10)}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Vision Board wurde als PNG exportiert!");
        }
      }, 'image/png');
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Fehler beim Export");
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = async (imageUrl: string, title: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("vision_board_images")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        title: title || undefined,
        description: description || undefined,
        position_x: 0,
        position_y: 0,
      });

    if (error) throw error;
    await refetch();
  };

  const deleteImage = async (imageId: string) => {
    const { error } = await supabase
      .from("vision_board_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      console.error("Error deleting image:", error);
      toast.error("Fehler beim Löschen des Bildes");
      return;
    }

    await refetch();
    toast.success("Bild wurde gelöscht!");
  };

  const updateImagePosition = async (imageId: string, x: number, y: number) => {
    const { error } = await supabase
      .from("vision_board_images")
      .update({ position_x: x, position_y: y })
      .eq("id", imageId);

    if (error) {
      console.error("Error updating position:", error);
      return;
    }
  };

  if (isLoadingImages) {
    return <div>Lädt Vision Board...</div>;
  }

  return (
    <div className="space-y-6">
      <VisionBoardHeader 
        onDownload={exportToPNG}
        onPrint={() => window.print()}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Bild hinzufügen
          </Button>
          <Button
            variant="outline"
            onClick={shuffleLayout}
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Layout mischen
          </Button>
        </div>
      </div>

      <div 
        id="vision-board-grid"
        key={layoutKey}
        className="grid grid-cols-4 grid-rows-4 gap-4 h-[800px] bg-gradient-to-br from-background to-muted/20 p-6 rounded-lg"
      >
        {images?.length === 0 ? (
          <div className="col-span-4 row-span-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">✨</div>
              <h3 className="text-xl font-semibold">Dein Vision Board wartet auf dich!</h3>
              <p className="text-muted-foreground max-w-md">
                Füge Bilder hinzu, die deine Träume und Ziele repräsentieren.
                Erstelle dein persönliches Vision Board für Motivation und Inspiration.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Erstes Bild hinzufügen
              </Button>
            </div>
          </div>
        ) : (
          images?.map((image: VisionBoardImageType, index: number) => (
            <VisionBoardImage
              key={`${image.id}-${layoutKey}`}
              id={image.id}
              theme={image.title || 'Vision Board Bild'}
              imageUrl={image.image_url}
              orderIndex={index}
              totalImages={images.length}
              onDelete={() => deleteImage(image.id)}
              onMove={async (id, direction) => {
                // Simple implementation - just shuffle for now
                shuffleLayout();
              }}
            />
          ))
        )}
      </div>

      <AddImageDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        theme={theme}
        onThemeChange={setTheme}
        onAddImage={async () => {
          if (!theme.trim()) return;
          setIsLoading(true);
          try {
            // For now, use a placeholder image URL
            const placeholderUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
            await addImage(placeholderUrl, theme, `Generated image for: ${theme}`);
            setTheme("");
            setIsDialogOpen(false);
          } catch (error) {
            console.error('Error adding image:', error);
            toast.error("Fehler beim Hinzufügen des Bildes");
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
};