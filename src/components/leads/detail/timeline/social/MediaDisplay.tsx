import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";

interface MediaDisplayProps {
  localMediaPaths: string[];
  mediaUrls: string[];
  isSidecar: boolean;
}

export const MediaDisplay = ({
  localMediaPaths = [],
  mediaUrls = [],
  isSidecar,
}: MediaDisplayProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);

  // Medienquellen intelligent kombinieren
  const mediaSources = useMemo(() => {
    return [
      ...localMediaPaths.map(path => ({
        type: 'image',
        source: 'local',
        path
      })),
      ...mediaUrls.filter(url => url.includes('.mp4')).map(url => ({
        type: 'video',
        source: 'external',
        path: url
      }))
    ];
  }, [localMediaPaths, mediaUrls]);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const urls = await Promise.all(
          mediaSources.map(async (media) => {
            if (media.type === 'video') return media.path;
            
            // Generiere nur für lokale Bilder Supabase-URLs
            const { data } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(media.path);

            console.log('Generierte Bild-URL:', data.publicUrl);
            return data.publicUrl;
          })
        );

        setProcessedUrls(urls.filter(Boolean));
      } catch (error) {
        console.error("Fehler beim Laden der Medien:", error);
      }
    };

    if (mediaSources.length > 0) loadMedia();
  }, [mediaSources]);

  // Debugging-Ausgabe
  console.log('Aktive Medienquellen:', {
    localMediaPaths,
    mediaUrls,
    processedUrls
  });

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
                    alt={`Beitragsbild ${index + 1}`}
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
        processedUrls[0]?.includes('.mp4') ? (
          <video
            controls
            className="w-full h-auto object-contain max-h-[400px]"
            src={processedUrls[0]}
          />
        ) : (
          <img
            src={processedUrls[0]}
            alt="Beitragsbild"
            className="w-full h-auto object-contain max-h-[400px]"
            loading="lazy"
          />
        )
      )}
    </div>
  );
};
