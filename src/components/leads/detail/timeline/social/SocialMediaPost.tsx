import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Image, MessageCircle, Heart, MapPin, User, Link as LinkIcon, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaGallery } from "./MediaGallery";
import { PostMetadata } from "./PostMetadata";

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
}

interface SocialMediaPostProps {
  post: SocialMediaPost;
}

export const SocialMediaPost = ({ post }: SocialMediaPostProps) => {
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
            {post.post_type}
          </span>
        </div>

        {post.content && (
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        )}

        {post.media_urls && post.media_urls.length > 0 && (
          <MediaGallery 
            mediaUrls={post.media_urls} 
            mediaType={post.media_type} 
          />
        )}

        {post.metadata?.hashtags && post.metadata.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.metadata.hashtags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <PostMetadata post={post} />

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