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
  // Wir nutzen hier nicht mehr die alte Spalte media_urls aus der DB,
  // sondern bauen die URL direkt zusammen.
  media_type: string | null;
  video_url?: string | null;
  videoUrl?: string | null;
  hashtags?: string[] | null;
  lead_id?: string; // Das ist eure Kontakt:ID (muss vorhanden sein – ansonsten nutzen wir den Fallback)
  imageCount?: number; // Optional: Anzahl der Bilder bei Sidecar-Posts
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
  /** Falls im Post keine lead_id vorhanden ist, kannst du hier die aktuelle Lead-ID übergeben */
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

/**
 * Baut die Bild-URLs direkt zusammen, basierend auf dem Bucket-Schema:
 *   baseUrl / {Kontakt:ID} / {PostID}_{Index}.jpg
 *
 * Bei "image" gibt es nur _0.jpg,
 * bei "sidecar" wird anhand von imageCount (oder einem Default) eine Reihe erzeugt.
 * Bei "video" wird die vorhandene Video-URL genutzt.
 */
// Helferfunktion zum direkten Zusammenbauen der Bild-URLs
const getDirectMediaUrls = (
  post: SocialMediaPost,
  kontaktIdFallback?: string
): string[] => {
  const baseUrl =
    "https://agqaitxlmxztqyhpcjau.supabase.co/storage/v1/object/public/social-media-files";
  // Nutze post.lead_id als Kontakt-ID oder den Fallback
  const kontaktId = post.lead_id || kontaktIdFallback || "default_kontakt";
  // Hier wird die Post-ID verwendet – diese entspricht auch der im PostHeader angezeigten ID.
  const postId = post.id;
  const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();

  if (postType === "video") {
    const videoUrl = post.video_url || post.videoUrl;
    return videoUrl ? [videoUrl] : [];
  } else if (postType === "image") {
    return [`${baseUrl}/${kontaktId}/${postId}_0.jpg`];
  } else if (postType === "sidecar") {
    const count = post.imageCount || 2;
    return Array.from({ length: count }, (_, index) => `${baseUrl}/${kontaktId}/${postId}_${index}.jpg`);
  }
  return [];
};

export const SocialMediaPost = ({ post, kontaktIdFallback }: SocialMediaPostProps) => {
  // Wir bauen die Medien-URLs direkt aus dem Bucket zusammen
  const mediaUrls = getDirectMediaUrls(post, kontaktIdFallback);
  const postType = post.post_type?.toLowerCase() || post.type?.toLowerCase();
  const isSidecar = postType === "sidecar" && mediaUrls.length > 1;
  const hasVideo = postType === "video" && mediaUrls.length > 0;
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
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", postTypeColor)}>
            {getPostTypeIcon(post.media_type || post.type || post.post_type)}
          </div>
        </div>

        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" style={{ height: "100%" }} />
        <div className="absolute left-8 top-4 w-4 h-[2px] bg-gray-200" />

        <Card className={cn("flex-1 p-4 text-sm overflow-hidden", postTypeColor)}>
          <div className="flex gap-6">
            {mediaUrls.length > 0 ? (
              <div className="w-1/3 min-w-[200px]">
                <MediaDisplay mediaUrls={mediaUrls} hasVideo={hasVideo} isSidecar={isSidecar} />
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
                likesCount={post.likesCount || post.likes_count}
                commentsCount={post.commentsCount || post.comments_count}
                location={post.location}
                locationName={post.locationName}
              />

              <PostActions url={post.url} />
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
