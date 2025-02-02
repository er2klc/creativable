import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SocialMediaPost as SocialMediaPostType } from "@/types/leads";
import { PostHeader } from "./components/PostHeader";
import { PostContent } from "./components/PostContent";
import { PostMetadata } from "./components/PostMetadata";
import { MediaDisplay } from "./MediaDisplay";
import { PostActions } from "./components/PostActions";
import { Video, Image, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect } from "react";

interface SocialMediaPostProps {
  post: SocialMediaPostType;
  kontaktIdFallback?: string;
}

const getPostTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return "bg-cyan-50 border-cyan-200";
    case "image":
      return "bg-purple-50 border-purple-200";
    case "sidecar":
      return "bg-amber-50 border-amber-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getPostTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return <Video className="h-5 w-5 text-cyan-500" />;
    case "image":
      return <Image className="h-5 w-5 text-purple-500" />;
    case "sidecar":
      return <MessageCircle className="h-5 w-5 text-amber-500" />;
    default:
      return <MessageCircle className="h-5 w-5 text-gray-500" />;
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [publicUrls, setPublicUrls] = useState<string[]>([]);

  useEffect(() => {
    if (post.media_urls?.length > 0) {
      setPublicUrls(post.media_urls);
    }
  }, [post.media_urls]);

  if (post.id.startsWith('temp-') || post.post_type?.toLowerCase() === 'post') {
    return null;
  }

  const mediaUrls = post.post_type?.toLowerCase() === "video" && post.video_url 
    ? [post.video_url]
    : post.media_urls || [];

  const postType = post.post_type?.toLowerCase();
  const isSidecar = postType === "sidecar" && mediaUrls.length > 1;
  const hasVideo = postType === "video" && post.video_url !== null;
  const postTypeColor = getPostTypeColor(post.media_type || post.post_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {post.timestamp || post.posted_at || ""}
      </div>

      <div className="flex gap-4 items-start group relative">
        <div className="relative z-10">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", postTypeColor)}>
            {getPostTypeIcon(post.post_type)}
          </div>
        </div>

        <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400 z-0" />
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-400" />

        <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
          <div className="flex gap-6">
            <div className="w-1/3 min-w-[200px] relative">
              {isSidecar ? (
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
              ) : (
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
              )}
            </div>

            <div className="flex-1 min-w-0">
              <PostHeader
                timestamp={post.timestamp || post.posted_at || ""}
                type={post.post_type}
                postTypeColor={postTypeColor}
                id={post.id}
              />

              <PostContent 
                content={post.content} 
                caption={post.caption} 
                hashtags={post.hashtags} 
              />

              <PostMetadata
                likesCount={post.likes_count}
                commentsCount={post.comments_count}
                location={post.location}
              />

              <div className="mt-4">
                <PostActions url={post.url} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};