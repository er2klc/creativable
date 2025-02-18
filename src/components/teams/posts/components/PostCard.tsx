
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getCategoryStyle } from "@/lib/supabase-utils";
import { PostReactions } from "./reactions/PostReactions";
import { PostActions } from "./actions/PostActions";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaGallery } from "../components/media-gallery/MediaGallery";

interface PostCardProps {
  post: Post;
  teamSlug: string;
  size?: 'small' | 'medium' | 'large';
  isAdmin?: boolean;
}

const sizeToGridClass = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-3'
};

export const PostCard = ({ 
  post, 
  teamSlug,
  size = 'medium',
  isAdmin = false
}: PostCardProps) => {
  const navigate = useNavigate();

  if (!post?.team_categories || !post?.author) {
    return null;
  }

  const categoryStyle = getCategoryStyle(post.team_categories.color);
  const displayName = post.author.display_name || 'Unbekannt';
  const avatarUrl = getAvatarUrl(post.author.avatar_url, post.author.email);

  const handleCardClick = () => {
    navigate(`/unity/team/${teamSlug}/posts/${post.slug}`);
  };

  // Effektive Größe basierend auf Pin-Status und Kategorie-Einstellungen
  const effectiveSize = post.pinned ? 'large' : 
                       post.team_categories?.settings?.size || size;

  const hasMedia = post.file_urls && post.file_urls.length > 0;

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 overflow-hidden",
        sizeToGridClass[effectiveSize],
        post.pinned && "shadow-md"
      )}
    >
      {post.pinned && (
        <div className="bg-[#FFF8E7] px-4 py-2 flex items-center gap-2 text-yellow-800 border-b border-yellow-200">
          <Pin className="h-3 w-3" />
          <span className="text-xs font-medium">Angepinnt</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={handleCardClick}>
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage 
              src={avatarUrl}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary/5">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {displayName}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: de,
              })}</span>
              <span>•</span>
              <Badge 
                style={categoryStyle}
                className="hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/unity/team/${teamSlug}/posts/category/${post.team_categories.slug}`);
                }}
              >
                {post.team_categories.name}
              </Badge>
            </div>
          </div>
        </div>
          
        <div className="flex gap-4 cursor-pointer" onClick={handleCardClick}>
          <div className={cn(
            "flex-1 space-y-2",
            hasMedia && "max-w-[70%]"
          )}>
            <h3 className="text-lg font-semibold">
              {post.title}
            </h3>
            
            {post.content && (
              <div 
                className="text-muted-foreground line-clamp-2 text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') 
                }}
              />
            )}
          </div>

          {hasMedia && (
            <div className="w-[30%]">
              <div className="h-[120px] rounded-lg overflow-hidden">
                <MediaGallery 
                  files={[post.file_urls[0]]}
                />
              </div>
              {post.file_urls.length > 1 && (
                <div className="mt-1 text-xs text-center text-muted-foreground">
                  +{post.file_urls.length - 1} weitere
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 border-t">
        <div className="flex items-center justify-between pt-3">
          <PostReactions postId={post.id} teamId={teamSlug} />
          <PostActions 
            postId={post.id} 
            teamId={teamSlug}
            isSubscribed={false}
            postTitle={post.title}
            isAdmin={isAdmin}
            isPinned={post.pinned}
          />
        </div>
      </div>
    </Card>
  );
};
