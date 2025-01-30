import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface MediaDisplayProps {
  localMediaPaths: string[];  // Pfade aus local_media_paths (Supabase Storage)
  mediaUrls: string[];        // URLs aus media_urls (externe Videos)
  isSidecar: boolean;
}

export const MediaDisplay = ({ 
  localMediaPaths = [],
  mediaUrls = [],
  isSidecar 
}: MediaDisplayProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const hasVideo = mediaUrls.some(url => url.includes('.mp4'));

  useEffect(() => {
    const loadMedia = async () => {
      try {
        // Kombiniere und verarbeite beide Medienquellen
        const supabasePaths = localMediaPaths.map(path => ({
          type: 'image',
          path
        }));

        const externalMedia = mediaUrls.map(url => ({
          type: url.includes('.mp4') ? 'video' : 'image',
          path: url
        }));

        const allMedia = [...supabasePaths, ...externalMedia];

        const urls = await Promise.all(
          allMedia.map(async (media) => {
            // Direkte Rückgabe für Videos
            if (media.type === 'video') return media.path;
            
            // Generiere Supabase-URL für Bilder
            const { data } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(media.path);

            // Cache-Busting für Bilder
            return `${data.publicUrl}?ts=${Date.now()}`;
          })
        );

        setProcessedUrls(urls.filter(url => url));
      } catch (error) {
        console.error("Medien konnten nicht geladen werden:", error);
      }
    };

    if (localMediaPaths?.length > 0 || mediaUrls?.length > 0) {
      loadMedia();
    }
  }, [localMediaPaths, mediaUrls]);

  // Debugging
  useEffect(() => {
    console.log('Verarbeitete URLs:', {
      sources: [...localMediaPaths, ...mediaUrls],
      processed: processedUrls
    });
  }, [processedUrls]);

  if (processedUrls.length === 0) return null;

  return (
    <div className="relative rounded-lg overflow-hidden">
      {isSidecar ? (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {processedUrls.map((url, index) => (
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
                    alt={`Medieninhalt ${index + 1}`}
                    className="w-full h-auto object-contain max-h-[400px]"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
          
          {processedUrls.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full hover:bg-black/70"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full hover:bg-black/70"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      ) : (
        hasVideo ? (
          <video
            controls
            className="w-full h-auto object-contain max-h-[400px]"
            src={processedUrls[0]}
          />
        ) : (
          <img
            src={processedUrls[0]}
            alt="Post-Medieninhalt"
            className="w-full h-auto object-contain max-h-[400px]"
            loading="lazy"
          />
        )
      )}
    </div>
  );
};
