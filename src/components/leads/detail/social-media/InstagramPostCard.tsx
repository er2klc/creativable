import { MessageSquare, Heart, Link2, MapPin, Image, Video, Images } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface InstagramPostCardProps {
  post: {
    id: string;
    content: string;
    likes_count: number;
    comments_count: number;
    url: string;
    location?: string;
    posted_at: string;
    post_type: string;
    media_urls?: string[];
    media_type?: string;
    first_comment?: string;
    engagement_count?: number;
  };
}

export const InstagramPostCard = ({ post }: InstagramPostCardProps) => {
  const getPostTypeIcon = () => {
    switch (post.post_type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'slideshow':
        return <Images className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPostTypeIcon()}
            <span className="text-sm text-muted-foreground">
              {format(new Date(post.posted_at), 'PPp', { locale: de })}
            </span>
          </div>
          {post.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{post.location}</span>
            </div>
          )}
        </div>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative aspect-video rounded-md overflow-hidden">
            {post.media_type === 'video' ? (
              <video 
                src={post.media_urls[0]} 
                controls 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={post.media_urls[0]} 
                alt="Post content" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        <p className="text-sm">{post.content}</p>
        {post.first_comment && (
          <p className="text-sm text-muted-foreground">{post.first_comment}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.likes_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{post.comments_count}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => window.open(post.url, '_blank')}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Zum Beitrag
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};