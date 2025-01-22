import { MessageSquare, Heart, Link2, MapPin, Image, Video, Slideshow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

interface InstagramPostCardProps {
  post: Tables<"social_media_posts">;
}

export function InstagramPostCard({ post }: InstagramPostCardProps) {
  const getMediaIcon = () => {
    switch (post.media_type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'carousel':
        return <Slideshow className="h-4 w-4 text-purple-500" />;
      default:
        return <Image className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getMediaIcon()}
            <span className="text-sm font-medium">
              {format(new Date(post.posted_at || ''), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(post.url, '_blank')}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {post.media_urls.map((url, index) => (
              <img 
                key={index}
                src={url}
                alt={`Post media ${index + 1}`}
                className="rounded-md w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        {post.content && (
          <p className="text-sm mb-3">{post.content}</p>
        )}

        {post.first_comment && (
          <p className="text-sm text-muted-foreground mb-3">{post.first_comment}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments_count || 0}</span>
          </div>
          {post.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}