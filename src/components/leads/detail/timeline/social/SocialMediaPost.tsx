import React, { useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Image, MessageCircle, Heart, MapPin, User, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaGallery } from "./MediaGallery";
import { PostMetadata } from "./PostMetadata";
import { supabase } from "@/integrations/supabase/client";

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
  metadata: {
    hashtags?: string[];
    media_urls?: string[];
    videoUrl?: string;
    musicInfo?: any;
    alt?: string;
  };
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
  useEffect(() => {
    const processMedia = async () => {
      // Process video if exists and not already processed
      if (post.media_type === 'video' && !post.local_video_path) {
        const videoUrl = post.media_urls?.[0] || post.metadata?.videoUrl;
        if (videoUrl) {
          await fetch('/functions/process-social-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaUrl: videoUrl,
              postId: post.id,
              mediaType: 'video'
            })
          });
        }
      }

      // Process images if exist and not already processed
      const imageUrls = post.media_urls?.filter(url => !url.includes('.mp4'));
      if (imageUrls?.length && (!post.local_media_paths || post.local_media_paths.length < imageUrls.length)) {
        for (const imageUrl of imageUrls) {
          await fetch('/functions/process-social-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaUrl: imageUrl,
              postId: post.id,
              mediaType: 'image'
            })
          });
        }
      }
    };

    processMedia();
  }, [post.id, post.media_urls, post.local_video_path, post.local_media_paths]);

  const getMediaUrls = () => {
    if (!post.local_media_paths?.length && !post.local_video_path) {
      return post.media_urls || [];
    }

    const urls = [];
    
    if (post.local_video_path) {
      const { data: { publicUrl } } = supabase.storage
        .from('social-media-files')
        .getPublicUrl(post.local_video_path);
      urls.push(publicUrl);
    }

    if (post.local_media_paths?.length) {
      post.local_media_paths.forEach(path => {
        const { data: { publicUrl } } = supabase.storage
          .from('social-media-files')
          .getPublicUrl(path);
        urls.push(publicUrl);
      });
    }

    return urls;
  };

  return (
    <div className="flex gap-4 items-start ml-4">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border-2 border-white">
          <Image className="h-4 w-4" />
        </div>
      </div>
      
      <Card className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {post.posted_at && format(new Date(post.posted_at), 'PPp', { locale: de })}
          </span>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {post.media_type || post.post_type}
          </span>
        </div>

        {post.content && (
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        )}

        {getMediaUrls().length > 0 && (
          <MediaGallery 
            mediaUrls={getMediaUrls()} 
            mediaType={post.media_type} 
          />
        )}

        <PostMetadata post={post} />

        {/* Tagged Profiles Section */}
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
            onClick={() => window.open(post.url, '_blank')}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Zum Beitrag
          </Button>
        )}
      </Card>
    </div>
  );
};