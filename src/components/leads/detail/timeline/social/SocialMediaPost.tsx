import React, { useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Image, MessageCircle, Heart, MapPin, User, Link as LinkIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SocialMediaPost {
  id: string;
  platform: string;
  post_type: string;
  content: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  media_urls: string[] | null; // Original URLs (falls vorhanden)
  media_type: string | null;
  local_video_path: string | null; // Lokaler Pfad für Videos in Supabase
  local_media_paths: string[] | null; // Lokale Pfade für Bilder in Supabase
  video_url: string | null; // Original Video-URL (falls vorhanden)
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  // Funktion, um die URLs der Medien zurückzugeben
  const getMediaUrls = () => {
    const urls: string[] = [];

    // Falls lokaler Video-Pfad vorhanden ist, füge ihn hinzu
    if (post.local_video_path) {
      urls.push(
        `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/social-media-files/${post.local_video_path}`
      );
    }

    // Falls lokale Medienpfade für Bilder vorhanden sind, füge sie hinzu
    if (post.local_media_paths && post.local_media_paths.length > 0) {
      post.local_media_paths.forEach((path) => {
        urls.push(
          `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/social-media-files/${path}`
        );
      });
    }

    return urls;
  };

  // Debugging: Gib die gefundenen Medien-URLs in der Konsole aus
  useEffect(() => {
    console.log("Post-Daten:", post);
    console.log("Media URLs:", getMediaUrls());
  }, [post]);

  return (
    <div className="flex gap-4 items-start ml-4">
      {/* Medien-Symbol */}
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border-2 border-white">
          {post.media_type === "video" ? (
            <Video className="h-4 w-4" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Haupt-Post-Karte */}
      <Card className="flex-1 p-4 space-y-4">
        {/* Header: Datum und Typ */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {post.posted_at &&
              format(new Date(post.posted_at), "PPp", { locale: de })}
          </span>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {post.media_type === "video" ? "Video" : post.post_type || "Post"}
          </span>
        </div>

        {/* Inhalt des Posts */}
        {post.content && (
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Medienanzeige */}
        {getMediaUrls().length > 0 && (
          <div className="flex gap-4">
            {getMediaUrls().map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Media ${index + 1}`}
                className="w-32 h-32 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        {/* Metadaten: Likes, Kommentare, Location */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {typeof post.likes_count === "number" && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes_count.toLocaleString()}</span>
            </div>
          )}
          {typeof post.comments_count === "number" && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count.toLocaleString()}</span>
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>

        {/* Getaggte Profile */}
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

        {/* Link zum Beitrag */}
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
