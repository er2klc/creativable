import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MediaDisplay } from "./MediaDisplay";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { motion } from "framer-motion";
import { formatDate } from "../TimelineUtils";
import { Image, Video, MessageCircle, Heart } from "lucide-react";

interface LinkedInPost {
  id: string;
  content: string | null;
  post_type: string | null;
  likes_count: number | null;
  comments_count: number | null;
  shares_count: number | null;
  url: string | null;
  posted_at: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  local_media_paths: string[] | null;
  reactions: Record<string, any> | null;
  metadata: Record<string, any> | null;
}

interface LinkedInTimelineProps {
  posts: LinkedInPost[];
}

const getPostTypeColor = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "video":
      return "bg-cyan-50 border-cyan-200";
    case "image":
      return "bg-purple-50 border-purple-200";
    case "article":
      return "bg-amber-50 border-amber-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getPostTypeIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "video":
      return <Video className="h-5 w-5 text-cyan-500" />;
    case "image":
      return <Image className="h-5 w-5 text-purple-500" />;
    case "article":
      return <MessageCircle className="h-5 w-5 text-amber-500" />;
    default:
      return <Heart className="h-5 w-5 text-gray-500" />;
  }
};

export const LinkedInTimeline = ({ posts }: LinkedInTimelineProps) => {
  const getMediaUrls = (post: LinkedInPost) => {
    if (post.local_media_paths && post.local_media_paths.length > 0) {
      return post.local_media_paths;
    }

    if (post.media_urls && post.media_urls.length > 0) {
      return post.media_urls;
    }

    return [];
  };

  return (
    <div className="relative space-y-6">
      {posts.length > 0 ? (
        posts.map((post) => {
          const mediaUrls = getMediaUrls(post);
          const postType = post.post_type?.toLowerCase();
          const isSidecar = mediaUrls.length > 1;
          const hasVideo = post.media_type === 'video';
          const postTypeColor = getPostTypeColor(post.post_type);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1"
            >
              {/* Date above the card */}
              <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
                {formatDate(post.posted_at || '')}
              </div>
              
              <div className="flex gap-4 items-start group relative">
                {/* Circle with Icon */}
                <div className="relative">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    postTypeColor
                  )}>
                    {getPostTypeIcon(post.post_type)}
                  </div>
                </div>
                
                {/* Vertical Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" style={{ height: '100%' }} />
                
                {/* Connecting Line to Card */}
                <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-200" />
                
                <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
                  <div className="flex gap-4">
                    {mediaUrls.length > 0 && (
                      <div className="w-1/3 min-w-[200px]">
                        <MediaDisplay 
                          mediaUrls={mediaUrls} 
                          hasVideo={hasVideo} 
                          isSidecar={isSidecar} 
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <PostHeader 
                        timestamp={post.posted_at || ''} 
                        type={post.post_type || ''} 
                        postTypeColor={postTypeColor}
                      />

                      <PostContent 
                        content={post.content} 
                        caption={null}
                        hashtags={[]}
                      />

                      <PostMetadata 
                        likesCount={post.likes_count} 
                        commentsCount={post.comments_count}
                        location={null}
                        locationName={null}
                      />

                      <PostActions url={post.url} />
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          );
        })
      ) : (
        <div className="text-center text-muted-foreground py-4 ml-4">
          Keine LinkedIn Aktivitäten vorhanden
        </div>
      )}
    </div>
  );
};