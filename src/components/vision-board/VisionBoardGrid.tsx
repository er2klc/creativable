import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const getRandomSize = () => {
  const sizes = [
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
    'col-span-1 row-span-2',
  ];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

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

  const handleDownload = async () => {
    const board = document.getElementById('vision-board');
    if (!board) return;

    try {
      const canvas = await html2canvas(board, {
        backgroundColor: '#0A0A0A',
        scale: 2,
        width: 1200, // A4 landscape width at 150 DPI
        height: 848,  // A4 landscape height at 150 DPI
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

  if (isLoadingImages) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const getRandomRotation = () => {
    return Math.random() * 20 - 10; // Random rotation between -10 and 10 degrees
  };

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

      <div id="vision-board" className="relative w-[1200px] h-[848px] mx-auto bg-black p-8 shadow-xl print:shadow-none">
        <div className="absolute inset-0 w-full h-32 overflow-hidden opacity-30">
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="w-full h-full object-cover filter blur-md"
          />
        </div>
        <div className="grid grid-cols-6 grid-rows-3 gap-4 absolute inset-0 p-8">
          {images?.map((image: VisionBoardImage, index: number) => (
            <div key={image.id} 
                 className={`relative transform hover:z-10 transition-all duration-200 ${getRandomSize()}`}
                 style={{
                   transform: `rotate(${Math.random() * 20 - 10}deg)`,
                   margin: `${Math.random() * 20}px`,
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

      <Button
        onClick={() => setIsDialogOpen(true)}
        disabled={isLoading}
        className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent text-gray-600 hover:text-gray-700 p-8"
      >
        <Plus className="h-8 w-8" />
        <span>Neues Bild hinzufügen</span>
      </Button>

      <style>
        {`
          @media print {
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
            }
          }
        `}
      </style>
    </div>
  );
};