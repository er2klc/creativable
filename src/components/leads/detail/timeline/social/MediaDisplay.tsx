import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface MediaDisplayProps {
  mediaUrls: string[];
  hasVideo: boolean;
  isSidecar: boolean;
}

export const MediaDisplay = ({ mediaUrls, hasVideo, isSidecar }: MediaDisplayProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [publicUrls, setPublicUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadPublicUrls = async () => {
      try {
        console.log("Loading media URLs:", mediaUrls);
        
        const urls = await Promise.all(
          mediaUrls.map(async (path) => {
            // Skip video URLs - return them as is
            if (path.includes('.mp4')) {
              return path;
            }
            
            // Extract the correct file path from the storage URL if it exists
            const storagePathMatch = path.match(/social-media-files\/([^?]+)/);
            if (storagePathMatch) {
              const storagePath = storagePathMatch[1];
              console.log("Found storage path:", storagePath);
              return path;
            }
            
            // Get public URL from Supabase storage
            const { data } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(path);
              
            console.log("Generated public URL:", data.publicUrl);
            return data.publicUrl;
          })
        );
        setPublicUrls(urls);
      } catch (error) {
        console.error("Error loading media URLs:", error);
      }
    };

    if (mediaUrls.length > 0) {
      loadPublicUrls();
    }
  }, [mediaUrls]);

  if (mediaUrls.length === 0) return null;

  if (isSidecar) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {publicUrls.map((url, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
            ))}
          </div>
          {publicUrls.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden">
      {hasVideo ? (
        <video
          controls
          className="w-full h-auto object-contain max-h-[400px]"
          src={publicUrls[0]}
        />
      ) : (
        <img
          src={publicUrls[0]}
          alt="Post media"
          className="w-full h-auto object-contain max-h-[400px]"
        />
      )}
    </div>
  );
};