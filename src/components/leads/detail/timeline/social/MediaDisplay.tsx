import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface MediaDisplayProps {
  mediaUrls: string[];
  hasVideo: boolean;
  isSidecar: boolean;
  localMediaPaths?: string[];
}

export const MediaDisplay = ({ mediaUrls, hasVideo, isSidecar, localMediaPaths = [] }: MediaDisplayProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [publicUrls, setPublicUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadPublicUrls = async () => {
      try {
        console.log("Loading media URLs:", mediaUrls);
        console.log("Loading local media paths:", localMediaPaths);
        
        const urls = await Promise.all(
          mediaUrls.map(async (path) => {
            // If it's a video URL or external URL, return it as is
            if (path.includes('.mp4') || path.startsWith('http')) {
              console.log("Using direct URL for video/external:", path);
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

        // Handle local media paths from social_media_posts table
        const localUrls = await Promise.all(
          localMediaPaths.map(async (path) => {
            if (!path) return null;
            
            const { data } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(path);
            
            console.log("Generated local media URL:", data.publicUrl);
            return data.publicUrl;
          })
        );

        // Combine and filter out any null values
        const allUrls = [...urls, ...localUrls].filter(url => url !== null);
        console.log("Final combined URLs:", allUrls);
        
        setPublicUrls(allUrls);
      } catch (error) {
        console.error("Error loading media URLs:", error);
      }
    };

    if (mediaUrls.length > 0 || localMediaPaths.length > 0) {
      loadPublicUrls();
    }
  }, [mediaUrls, localMediaPaths]);

  if (!publicUrls.length) return null;

  if (isSidecar) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {publicUrls.map((url, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                {url.includes('.mp4') ? (
                  <video
                    controls
                    className="w-full h-auto object-contain max-h-[400px]"
                    src={url}
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                )}
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