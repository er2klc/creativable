import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Image, MessageCircle, Heart, MapPin, User, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SocialMediaPost {
  comments_count: number | null;
  content: string | null;
  created_at: string | null;
  engagement_count: number | null;
  first_comment: string | null;
  id: string;
  lead_id: string | null;
  likes_count: number | null;
  location: string | null;
  media_type: string | null;
  media_urls: string[] | null;
  mentioned_profiles: string[] | null;
  metadata: any;
  platform: string;
  post_type: string;
  posted_at: string | null;
  tagged_profiles: string[] | null;
  tagged_users: any | null;
  url: string | null;
}

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
}

export const SocialMediaTimeline = ({ posts }: SocialMediaTimelineProps) => {
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.posted_at || '').getTime() - new Date(a.posted_at || '').getTime();
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'video';
      case 'slideshow':
        return 'slideshow';
      default:
        return 'post';
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400" />
      
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <div key={post.id} className="flex gap-4 items-start ml-4">
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
                  {getPostTypeIcon(post.post_type)}
                </span>
              </div>

              {post.content && (
                <p className="text-sm">{post.content}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {post.likes_count !== null && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes_count}</span>
                  </div>
                )}
                
                {post.comments_count !== null && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                  </div>
                )}

                {post.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{post.location}</span>
                  </div>
                )}

                {post.mentioned_profiles && post.mentioned_profiles.length > 0 && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.mentioned_profiles.length} Erwähnungen</span>
                  </div>
                )}
              </div>

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
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4 ml-4">
          Keine Social Media Aktivitäten vorhanden
        </div>
      )}
    </div>
  );
};