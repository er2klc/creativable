
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
import { Pin, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaGallery } from "../components/media-gallery/MediaGallery";
import { useState } from "react";
import { LinkPreview } from "@/components/links/components/LinkPreview";

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

const extractColorFromClass = (colorClass: string) => {
  if (!colorClass) return '#e5e7eb'; // Default color
  const match = colorClass.match(/#[0-9A-Fa-f]{6}/);
  return match ? match[0] : colorClass.startsWith('bg-[') ? colorClass.slice(4, -1) : '#e5e7eb';
};

const getYouTubeVideoId = (content: string) => {
  // Erst nach href-Attributen suchen
  const hrefRegex = /href="(https?:\/\/[^\s"]+)"/g;
  const hrefs = [...content.matchAll(hrefRegex)].map(match => match[1]);
  
  // Dann nach normalen URLs im Text suchen
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const plainUrls = content.match(urlRegex) || [];
  
  // Alle gefundenen URLs kombinieren
  const allUrls = [...hrefs, ...plainUrls];

  for (const url of allUrls) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  }
  return null;
};

export const PostCard = ({ 
  post, 
  teamSlug,
  size = 'medium',
  isAdmin = false
}: PostCardProps) => {
  const navigate = useNavigate();
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  if (!post?.team_categories || !post?.author) {
    return null;
  }

  const categoryColor = extractColorFromClass(post.team_categories.color);
  const displayName = post.author.display_name || 'Unbekannt';
  const avatarUrl = getAvatarUrl(post.author.avatar_url, post.author.email);
  const videoId = post.content ? getYouTubeVideoId(post.content) : null;

  const handleCardClick = () => {
    navigate(`/unity/team/${teamSlug}/posts/${post.slug}`);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideoPreview(true);
  };

  // Effektive Größe basierend auf Pin-Status und Kategorie-Einstellungen
  const effectiveSize = post.pinned ? 'large' : 
                       post.team_categories?.settings?.size || size;

  const hasMedia = post.file_urls && post.file_urls.length > 0;
  const contentLength = post.pinned ? 400 : 200;
  const imageHeight = post.pinned ? "h-[200px]" : "h-[120px]";
  const lineClamp = post.pinned ? "line-clamp-4" : "line-clamp-2";

  // Erstelle einen deutlicheren Hintergrund basierend auf der Kategoriefarbe
  const backgroundColor = `${categoryColor}4D`; // 4D = 30% Opacity in Hex

  return (
    <>
      <Card 
        className={cn(
          "hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col",
          sizeToGridClass[effectiveSize],
          post.pinned && "shadow-md"
        )}
        style={{
          borderColor: categoryColor,
          borderWidth: '2px',
          backgroundColor: backgroundColor
        }}
      >
        {post.pinned && (
          <div className="bg-[#FFF8E7] px-4 py-2 flex items-center gap-2 text-yellow-800 border-b border-yellow-200">
            <Pin className="h-3 w-3" />
            <span className="text-xs font-medium">Angepinnt</span>
          </div>
        )}

        <div className="p-4 flex-1">
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
                  style={{
                    backgroundColor: categoryColor,
                    color: 'white'
                  }}
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
              (hasMedia || videoId) && "max-w-[70%]"
            )}>
              <h3 className="text-lg font-semibold">
                {post.title}
              </h3>
              
              {post.content && (
                <div 
                  className={cn(
                    "text-muted-foreground text-sm",
                    lineClamp
                  )}
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.substring(0, contentLength) + (post.content.length > contentLength ? '...' : '') 
                  }}
                />
              )}
            </div>

            {videoId ? (
              <div className="w-[30%]">
                <div 
                  className={cn(
                    "relative rounded-lg overflow-hidden cursor-pointer group",
                    imageHeight
                  )}
                  onClick={handleVideoClick}
                >
                  <img 
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              </div>
            ) : hasMedia && (
              <div className="w-[30%]">
                <div className={cn("rounded-lg overflow-hidden", imageHeight)}>
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

        <div 
          className="px-4 py-2 border-t" 
          style={{ borderColor: categoryColor }}
        >
          <div className="flex items-center justify-between">
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

      {videoId && (
        <LinkPreview
          isOpen={showVideoPreview}
          onOpenChange={setShowVideoPreview}
          title={post.title}
          videoId={videoId}
        />
      )}
    </>
  );
};
