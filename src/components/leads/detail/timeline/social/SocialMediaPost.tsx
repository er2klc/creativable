import React, { useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Image, MessageCircle, Heart, MapPin, User, Link as LinkIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface SocialMediaPost {
  id: string;
  platform: string;
  type: string;
  post_type: string;
  content: string | null;
  caption: string | null;
  likesCount: number | null;
  commentsCount: number | null;
  url: string | null;
  location: string | null;
  locationName?: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  timestamp: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  const getMediaUrls = () => {
    const urls: string[] = [];

    // Prüfe zuerst auf lokale Pfade
    if (post.local_video_path) {
      urls.push(
        `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/social-media-files/${post.local_video_path}`
      );
    }

    if (post.local_media_paths && post.local_media_paths.length > 0) {
      post.local_media_paths.forEach((path) => {
        urls.push(
          `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/social-media-files/${path}`
        );
      });
    }

    // Wenn keine lokalen Pfade vorhanden sind, verwende die Original-URLs
    if (urls.length === 0) {
      if (post.images && post.images.length > 0) {
        urls.push(...post.images);
      }
      if (post.videoUrl) {
        urls.push(post.videoUrl);
      }
    }

    return urls;
  };

  useEffect(() => {
    console.log("Post-Daten:", post);
    console.log("Media URLs:", getMediaUrls());
  }, [post]);

  return (
    <div className="flex gap-4 items-start ml-4">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border-2 border-white">
          {post.type === "Video" || post.media_type === "video" ? (
            <Video className="h-4 w-4" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </div>
      </div>

      <Card className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {post.timestamp &&
              format(new Date(post.timestamp), "PPp", { locale: de })}
          </span>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {post.type || post.post_type || "Post"}
          </span>
        </div>

        {(post.caption || post.content) && (
          <p className="text-sm whitespace-pre-wrap">{post.caption || post.content}</p>
        )}

        {getMediaUrls().length > 0 && (
          <div className="flex gap-4 flex-wrap">
            {getMediaUrls().map((url, index) => {
              const isVideo = post.type === "Video" || 
                            post.media_type === "video" || 
                            post.local_video_path || 
                            url.includes(".mp4");
              
              return isVideo ? (
                <video
                  key={index}
                  controls
                  className="w-32 h-32 object-cover rounded-md"
                  src={url}
                />
              ) : (
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-md"
                />
              );
            })}
          </div>
        )}

        <div className="flex gap-4 text-sm text-muted-foreground">
          {typeof post.likesCount === "number" && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{post.likesCount.toLocaleString()}</span>
            </div>
          )}
          {typeof post.commentsCount === "number" && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount.toLocaleString()}</span>
            </div>
          )}
          {(post.location || post.locationName) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{post.locationName || post.location}</span>
            </div>
          )}
        </div>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {post.tagged_profiles && post.tagged_profiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Getaggte Profile:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tagged_profiles.map((profile, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  {profile}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {post.url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => window.open(post.url, "_blank")}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Zum Beitrag
          </Button>
        )}
      </Card>
    </div>
  );
};