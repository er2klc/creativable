import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

interface MediaDisplayProps {
  mediaUrls: string[];
  hasVideo: boolean;
  isSidecar: boolean;
  videoUrl?: string | null;
}

export const MediaDisplay = ({ mediaUrls, hasVideo, isSidecar, videoUrl }: MediaDisplayProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [publicUrls, setPublicUrls] = useState<string[]>([]);

  useEffect(() => {
    if (mediaUrls?.length > 0) {
      console.log("Using media URLs directly:", mediaUrls);
      setPublicUrls(mediaUrls);
    }
  }, [mediaUrls]);

  if (!publicUrls.length && !videoUrl) return null;

  if (hasVideo && videoUrl) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-auto object-contain max-h-[400px]"
          src={videoUrl}
        />
      </div>
    );
  }

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
      <img
        src={publicUrls[0]}
        alt="Post media"
        className="w-full h-auto object-contain max-h-[400px]"
      />
    </div>
  );
};