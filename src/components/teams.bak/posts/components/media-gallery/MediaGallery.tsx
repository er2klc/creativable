
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  files: string[];
}

export const MediaGallery = ({ files }: MediaGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isImage = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const getPublicUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage/')) {
      return `${import.meta.env.VITE_SUPABASE_URL}${url}`;
    }
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const mediaFiles = files.filter(isImage);

  if (mediaFiles.length === 0) return null;

  return (
    <>
      <div className={cn(
        "grid gap-2",
        mediaFiles.length === 1 ? "grid-cols-1" : 
        mediaFiles.length === 2 ? "grid-cols-2" :
        "grid-cols-2 sm:grid-cols-3"
      )}>
        {mediaFiles.map((url, index) => (
          <div 
            key={index}
            className="relative aspect-[4/3] cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => setSelectedImage(url)}
          >
            <img
              src={getPublicUrl(url)}
              alt={`Media ${index + 1}`}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-2 bg-transparent border-none">
          <div className="relative w-full h-full overflow-auto">
            {selectedImage && (
              <img
                src={getPublicUrl(selectedImage)}
                alt="Preview"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

