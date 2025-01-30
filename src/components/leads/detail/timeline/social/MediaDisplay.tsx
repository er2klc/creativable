import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo, useCallback } from "react";

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

  // 1. Medienquellen mit strenger Typisierung
  type MediaSource = {
    type: 'image' | 'video';
    path: string;
    source: 'local' | 'external';
  };

  const mediaSources = useMemo((): MediaSource[] => {
    const sources: MediaSource[] = [];
    
    // Lokale Pfade immer als Bilder behandeln
    if (localMediaPaths?.length > 0) {
      sources.push(...localMediaPaths.map(path => ({
        type: 'image',
        source: 'local',
        path
      })));
    }

    // Externe URLs nur als Videos wenn mp4
    if (mediaUrls?.length > 0) {
      sources.push(...mediaUrls.filter(url => url.includes('.mp4')).map(url => ({
        type: 'video',
        source: 'external',
        path: url
      })));
    }

    console.log('Medienquellen analysiert:', sources);
    return sources;
  }, [localMediaPaths, mediaUrls]);

  // 2. Medienladung mit Fehlerbehandlung
  const loadMedia = useCallback(async () => {
    try {
      console.log('Starte Medienladung für:', mediaSources);
      
      const urls = await Promise.all(
        mediaSources.map(async (media) => {
          if (media.type === 'video') return media.path;

          // Supabase URL-Generierung mit Validierung
          if (media.source === 'local') {
            const { data, error } = supabase.storage
              .from('social-media-files')
              .getPublicUrl(media.path);

            if (error) throw error;
            
            console.log('Generierte URL für', media.path, ':', data.publicUrl);
            return data.publicUrl;
          }

          return media.path;
        })
      );

      const validUrls = urls.filter(url => {
        const isValid = url && url.length > 0;
        if (!isValid) console.warn('Ungültige URL gefiltert:', url);
        return isValid;
      });

      console.log('Gültige URLs:', validUrls);
      setProcessedUrls(validUrls);
      
    } catch (error) {
      console.error("Kritischer Medienladefehler:", error);
      setProcessedUrls([]); // Fallback um leere Anzeige zu vermeiden
    }
  }, [mediaSources]);

  // 3. Effekt mit klaren Bedingungen
  useEffect(() => {
    if (mediaSources.length > 0) {
      console.log('Aktiviere Medienladung');
      loadMedia();
    } else {
      console.warn('Keine Medienquellen gefunden');
      setProcessedUrls([]);
    }
  }, [loadMedia, mediaSources]);

  // 4. Debugging mit Performance-Optimierung
  useEffect(() => {
    if (processedUrls.length > 0) {
      console.log('Verarbeitete URLs:', processedUrls);
    }
  }, [processedUrls]);

  // 5. Garantiertes Rendering mit Fallback
  if (processedUrls.length === 0) {
    console.warn('Keine verarbeiteten URLs - Rendere Fallback');
    return (
      <div className="bg-gray-100 w-full h-96 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Keine Medien verfügbar</p>
      </div>
    );
  }

  // 6. UI-Rendering mit Schlüssel-Reset
  return (
    <div className="relative rounded-lg overflow-hidden">
      {isSidecar ? (
        <div className="overflow-hidden" ref={emblaRef} key={processedUrls.join(',')}>
          <div className="flex">
            {processedUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="flex-[0_0_100%] min-w-0">
                {url.includes('.mp4') ? (
                  <video
                    controls
                    className="w-full h-auto object-contain max-h-[400px]"
                    src={url}
                    aria-label={`Video ${index + 1}`}
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Beitragsbild ${index + 1}`}
                    className="w-full h-auto object-contain max-h-[400px]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      console.error('Bildladefehler:', e.currentTarget.src);
                      e.currentTarget.style.display = 'none';
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
            aria-label="Hauptvideo"
          />
        ) : (
          <img
            src={processedUrls[0]}
            alt="Hauptbild"
            className="w-full h-auto object-contain max-h-[400px]"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              console.error('Bildladefehler:', e.currentTarget.src);
              e.currentTarget.style.display = 'none';
            }}
          />
        )
      )}
    </div>
  );
};
