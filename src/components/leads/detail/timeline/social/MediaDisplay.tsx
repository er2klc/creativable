import { Card, CardContent } from "@/components/ui/card";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { MediaDisplayProps } from "./MediaDisplayProps"; // Assuming you have a separate file for props
import { SocialMediaPostRaw } from "../../types/lead";

export const MediaDisplay = ({
  mediaUrls,
  videoUrl,
  localMediaPaths,
  localVideoPath,
  mediaType,
  postType,
  kontaktIdFallback
}: MediaDisplayProps) => {
  const hasMedia = (mediaUrls && mediaUrls.length > 0) || videoUrl;
  const showMediaDisplay = hasMedia || localMediaPaths?.length || localVideoPath;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {showMediaDisplay && (
          <div>
            {videoUrl && (
              <video controls className="w-full">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {mediaUrls && mediaUrls.map((url, index) => (
              <img key={index} src={url} alt={`Media ${index}`} className="w-full" />
            ))}
            {localMediaPaths && localMediaPaths.map((path, index) => (
              <img key={index} src={path} alt={`Local Media ${index}`} className="w-full" />
            ))}
            {localVideoPath && (
              <video controls className="w-full">
                <source src={localVideoPath} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
