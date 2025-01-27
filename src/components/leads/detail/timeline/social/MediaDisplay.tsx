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

  const getPublicUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://agqaitxlmxztqyhpcjau.supabase.co/storage/v1/object/public/${path}`;
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
                  src={getPublicUrl(url)}
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

  return (
    <div className="relative rounded-lg overflow-hidden">
      {hasVideo ? (
        <video
          controls
          className="w-full h-auto object-contain max-h-[400px]"
          src={getPublicUrl(mediaUrls[0])}
        />
      ) : (
        <img
          src={getPublicUrl(mediaUrls[0])}
          alt="Post media"
          className="w-full h-auto object-contain max-h-[400px]"
        />
      )}
    </div>
  );
};