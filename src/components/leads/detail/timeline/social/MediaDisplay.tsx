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

  // Memoize media sources to prevent unnecessary recalculations
  const mediaSources = useMemo(() => {
    const supabaseMedia = localMediaPaths.map(path => ({
      type: 'image',
      path,
      isLocal: true
    }));

    const externalMedia = mediaUrls.map(url => ({
      type: url.includes('.mp4') ? 'video' : 'image',
      path: url,
      isLocal: false
    }));

    return [...supabaseMedia, ...externalMedia];
  }, [localMediaPaths, mediaUrls]);

  // Main media loading effect
  useEffect(() => {
    let isMounted = true;

    const loadMedia = async () => {
      try {
        const urls = await Promise.all(
          mediaSources.map(async (media) => {
            if (media.type === 'video') return media.path;

            // Only generate URLs for local media
            if (media.isLocal) {
              const { data } = supabase.storage
                .from('social-media-files')
                .getPublicUrl(media.path);
              return data.publicUrl;
            }

            return media.path;
          })
        );

        // Filter valid URLs and update state only if necessary
        const filteredUrls = urls.filter(url => url && url.length > 0);
        if (isMounted && JSON.stringify(filteredUrls) !== JSON.stringify(processedUrls)) {
          setProcessedUrls(filteredUrls);
          console.log('Processed URLs updated:', filteredUrls);
        }
      } catch (error) {
        console.error("Error loading media:", error);
      }
    };

    if (mediaSources.length > 0) {
      loadMedia();
    }

    return () => {
      isMounted = false;
    };
  }, [mediaSources]); // Only run when sources change

  // Determine if video exists
  const hasVideo = useMemo(
    () => processedUrls.some(url => url.includes('.mp4')),
    [processedUrls]
  );

  // Reset carousel when URLs change
  useEffect(() => {
    if (emblaApi && processedUrls.length > 0) {
      emblaApi.reInit();
    }
  }, [emblaApi, processedUrls]);

  if (processedUrls.length === 0) return null;

  return (
    <div className="relative rounded-lg overflow-hidden">
      {isSidecar ? (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {processedUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="flex-[0_0_100%] min-w-0">
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
                    loading="lazy"
                    decoding="async"
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
            alt="Post media"
            className="w-full h-auto object-contain max-h-[400px]"
            loading="lazy"
            decoding="async"
          />
        )
      )}
    </div>
  );
};
