import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDate } from "../TimelineUtils";
import { Image, Video, MessageCircle, Heart } from "lucide-react";
import { MediaDisplay } from "./MediaDisplay";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMetadata } from "./PostMetadata";
import { PostActions } from "./PostActions";
import { SocialMediaPostRaw } from "../../types/lead";

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
      return <Heart className="h-5 w-5 text-gray-500" />;
  }
};

interface SocialMediaPostProps {
  post: SocialMediaPostRaw;
  kontaktIdFallback?: string;
}

export const SocialMediaPost = ({ post, kontaktIdFallback }: SocialMediaPostProps) => {
  const getMediaUrls = () => {
    const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();

    console.log("DEBUG: Post Type:", postType);
    console.log("DEBUG: Post ID:", post.id);
    console.log("DEBUG: media_urls vorhanden?", post.media_urls ? "Ja" : "Nein", post.media_urls);
    console.log("DEBUG: video_url vorhanden?", post.video_url ? "Ja" : "Nein", post.video_url);

    // For video posts, use the video_url directly
    if (postType === "video" && post.video_url) {
      console.log("🎥 Video-Post gefunden! Verwende Instagram Video-URL für Post ID:", post.id);
      return [post.video_url || post.videoUrl];
    }

    // For image and sidecar posts, use media_urls from social_media_posts table
    if ((postType === "image" || postType === "sidecar") && post.media_urls) {
      console.log(`🖼️ Bild-Post gefunden! Verwende media_urls für Post ID: ${post.id}`, post.media_urls);
      return post.media_urls;
    }

    console.warn(`⚠️ Keine gültigen media_urls gefunden für Post ID: ${post.id}`);
    return [];
  };

  // Skip temp posts and posts with type "post"
  if (post.id.startsWith('temp-') || post.post_type?.toLowerCase() === 'post') {
    return null;
  }

  const mediaUrls = getMediaUrls();
  const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();
  const isSidecar = postType === "sidecar" && mediaUrls.length > 1;
  const hasVideo = postType === "video" && post.video_url !== null;
  const postTypeColor = getPostTypeColor(post.media_type || post.type || post.post_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {formatDate(post.timestamp || post.posted_at || "")}
      </div>

      <div className="flex gap-4 items-start group relative">
        <div className="relative">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              postTypeColor
            )}
          >
            {getPostTypeIcon(post.media_type || post.type || post.post_type)}
          </div>
        </div>

        <div
          className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200"
          style={{ height: "100%" }}
        />
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-200" />

        <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
          <div className="flex gap-6">
            {mediaUrls.length > 0 ? (
              <div className="w-1/3 min-w-[200px]">
                <MediaDisplay
                  mediaUrls={mediaUrls}
                  hasVideo={hasVideo}
                  isSidecar={isSidecar}
                />
              </div>
            ) : (
              <p className="text-red-500">⚠️ Keine Medien gefunden!</p>
            )}

            <div className="flex-1 min-w-0">
              <PostHeader
                timestamp={post.timestamp || post.posted_at || ""}
                type={post.type || post.post_type || ""}
                postTypeColor={postTypeColor}
                id={post.id}
              />

              <PostContent content={post.content} caption={post.caption} hashtags={post.hashtags} />

              <PostMetadata
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                location={post.location}
                locationName={post.locationName}
              />

              {post.taggedUsers && post.taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.taggedUsers.map((user) => (
                    <a 
                      key={user.id} 
                      href={`https://www.instagram.com/${user.username}/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
                    >
                      <img 
                        src={user.profile_pic_url} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <span>{user.full_name || user.username}</span>
                      {user.is_verified && <span className="text-blue-500">✔️</span>}
                    </a>
                  ))}
                </div>
              )}

              <PostActions url={post.url} />
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
