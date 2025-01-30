import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface MediaDisplayProps {
  mediaUrls: string[];
  hasVideo: boolean;
  isSidecar: boolean;
}

export const MediaDisplay = ({ mediaUrls, hasVideo, isSidecar }: MediaDisplayProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const getProxiedUrl = (url: string) => {
    if (!url) return '';
    
    // Return original URL for non-Instagram images or videos
    if (url.startsWith('http')) {
      return url;
    }
    
    // Handle storage URLs
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${url}`;
  };

  if (mediaUrls.length === 0) return null;

  if (isSidecar) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {mediaUrls.map((url, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <img
                  src={getProxiedUrl(url)}
                  alt={`Media ${index + 1}`}
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
            ))}
          </div>
          {mediaUrls.length > 1 && (
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

  // For single image or video
  return (
    <div className="relative rounded-lg overflow-hidden">
      {hasVideo ? (
        <video
          controls
          className="w-full h-auto object-contain max-h-[400px]"
          src={getProxiedUrl(mediaUrls[0])}
        />
      ) : (
        <img
          src={getProxiedUrl(mediaUrls[0])}
          alt="Post media"
          className="w-full h-auto object-contain max-h-[400px]"
        />
      )}
    </div>
  );
};