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

interface SocialMediaPost {
  id: string;
  platform?: string;
  type?: string;
  post_type: string;
  content: string | null;
  caption?: string | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  likes_count?: number | null;
  comments_count?: number | null;
  url: string | null;
  location?: string | null;
  locationName?: string | null;
  mentioned_profiles?: string[] | null;
  tagged_profiles?: string[] | null;
  posted_at: string | null;
  timestamp?: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  video_url?: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  lead_id?: string;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
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
      return <Heart className="h-5 w-5 text-gray-500" />;
  }
};

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
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

  // Use the correct like and comment counts from either source
  const likesCount = post.likesCount || post.likes_count || 0;
  const commentsCount = post.commentsCount || post.comments_count || 0;

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
                likesCount={likesCount}
                commentsCount={commentsCount}
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
        
        <span>{user.full_name || user.username}</span>
        {user.is_verified && (
  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white ml-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="white"
      className="w-3 h-3"
    >
      <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd" />
    </svg>
  </span>
)}
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
