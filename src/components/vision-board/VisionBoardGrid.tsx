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

interface VisionBoardImage {
  id: string;
  theme: string;
  image_url: string;
  order_index: number;
}

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

  const handleDownload = async () => {
    const board = document.getElementById('vision-board');
    if (!board) return;

    try {
      const canvas = await html2canvas(board, {
        backgroundColor: '#0A0A0A',
        scale: 2,
        width: 1200,
        height: 848,
      });
      
      const link = document.createElement('a');
      link.download = 'vision-board.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Vision Board wurde erfolgreich heruntergeladen");
    } catch (error) {
      console.error("Error downloading vision board:", error);
      toast.error("Fehler beim Herunterladen des Vision Boards");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddImage = async () => {
    if (!theme.trim()) {
      toast.error("Bitte geben Sie ein Thema ein");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-vision-image', {
        body: { theme },
      });

      if (error) throw error;

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
          image_url: data.imageUrl,
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

  const handleRandomizeLayout = () => {
    setLayoutKey(prev => prev + 1);
    toast.success("Layout wurde neu angeordnet");
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
      <AddImageDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        theme={theme}
        onThemeChange={setTheme}
        onAddImage={handleAddImage}
      />

      <VisionBoardHeader
        onDownload={handleDownload}
        onPrint={handlePrint}
      />

      <div id="vision-board" className="relative w-[1200px] h-[848px] mx-auto bg-black p-4 shadow-xl print:shadow-none">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="w-3/4 h-3/4 object-contain opacity-30 filter blur-sm"
          />
        </div>
        <div key={layoutKey} className="grid grid-cols-6 grid-rows-3 gap-2 absolute inset-0 p-4">
          {images?.map((image: VisionBoardImage) => (
            <div key={image.id} 
                 className={`relative transform hover:z-10 transition-all duration-200 ${getRandomSize(images.length)}`}
                 style={{
                   transform: `rotate(${Math.random() * 6 - 3}deg)`,
                   margin: `${Math.random() * 4}px`,
                 }}>
              <VisionBoardImage
                id={image.id}
                theme={image.theme}
                imageUrl={image.image_url}
                orderIndex={image.order_index}
                totalImages={images.length}
                onDelete={handleDeleteImage}
                onMove={handleMoveImage}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neues Bild hinzufügen
        </Button>
        
        <Button
          onClick={handleRandomizeLayout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Layout neu anordnen
        </Button>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 0;
            }
            body * {
              visibility: hidden;
            }
            #vision-board, #vision-board * {
              visibility: visible;
            }
            #vision-board {
              position: absolute;
              left: 0;
              top: 0;
              width: 297mm;
              height: 210mm;
              padding: 0;
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
};
