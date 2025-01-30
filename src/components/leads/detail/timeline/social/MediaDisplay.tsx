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

  // 1. Medienquellen kombinieren
  const mediaSources = useMemo(() => {
    const videos = mediaUrls.filter(url => url.includes('.mp4'));
    const images = localMediaPaths.map(path => 
      supabase.storage
        .from('social-media-files')
        .getPublicUrl(path).data.publicUrl
    );
    return [...images, ...videos];
  }, [localMediaPaths, mediaUrls]);

  // 2. URLs einmalig setzen
  useEffect(() => {
    if (mediaSources.length > 0) {
      setProcessedUrls(mediaSources);
      console.log('Generierte URLs:', mediaSources);
    }
  }, [mediaSources]);

  // 3. Carousel-Reset
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, processedUrls]);

  if (processedUrls.length === 0) {
    return (
      <div className="bg-gray-100 w-full h-96 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Lade Medien...</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden">
      {isSidecar ? (
        <div className="overflow-hidden" ref={emblaRef} key={processedUrls.join('')}>
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
                    onError={(e) => {
                      console.error('Bild nicht gefunden:', url);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
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
            alt="Hauptbild"
            className="w-full h-auto object-contain max-h-[400px]"
            loading="lazy"
          />
        )
      )}
    </div>
  );
};
