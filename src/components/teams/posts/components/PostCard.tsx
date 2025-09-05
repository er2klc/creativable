
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Post } from "../types/post";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LinkPreview } from "@/components/links/components/LinkPreview";
import { PostHeader } from "./card/PostHeader";
import { PostContent } from "./card/PostContent";
import { PostFooter } from "./card/PostFooter";

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
  if (!colorClass) return '#e5e7eb';
  const match = colorClass.match(/#[0-9A-Fa-f]{6}/);
  return match ? match[0] : colorClass.startsWith('bg-[') ? colorClass.slice(4, -1) : '#e5e7eb';
};

const getYouTubeVideoId = (content: string) => {
  // Erst nach YouTube-spezifischen href-Attributen suchen
  const hrefRegex = /href="((?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s"]+)"/g;
  const hrefs = [...content.matchAll(hrefRegex)].map(match => match[1]);
  
  // Dann nach YouTube-URLs im Text suchen
  const urlRegex = /((?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s<]+)/g;
  const plainUrls = content.match(urlRegex) || [];
  
  // Alle gefundenen URLs kombinieren
  const allUrls = [...hrefs, ...plainUrls];

  for (const url of allUrls) {
    // Prüfen ob es überhaupt eine YouTube-URL ist
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      continue;
    }
    
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
  const videoId = post.content ? getYouTubeVideoId(post.content) : null;
  const effectiveSize = post.pinned ? 'large' : post.team_categories?.settings?.size || size;
  const hasMedia = post.file_urls && post.file_urls.length > 0;
  const contentLength = post.pinned ? 400 : 200;
  const imageHeight = post.pinned ? "h-[200px]" : "h-[120px]";
  const lineClamp = post.pinned ? "line-clamp-4" : "line-clamp-2";
  const backgroundColor = `${categoryColor}`;
  const borderColor = `${categoryColor}CC`;

  const handleCardClick = () => {
    navigate(`/unity/team/${teamSlug}/posts/${post.slug}`);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideoPreview(true);
  };

  return (
    <>
      <Card 
        className={cn(
          "hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col",
          sizeToGridClass[effectiveSize],
          post.pinned && "shadow-md"
        )}
        style={{
          borderColor: borderColor,
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

        <div className="p-4 flex-1" onClick={handleCardClick}>
          <PostHeader 
            post={post} 
            teamSlug={teamSlug}
            categoryColor={categoryColor}
          />
          
          <PostContent 
            title={post.title}
            content={post.content}
            contentLength={contentLength}
            lineClamp={lineClamp}
            videoId={videoId}
            fileUrls={post.file_urls}
            imageHeight={imageHeight}
            onVideoClick={handleVideoClick}
            hasMedia={hasMedia}
          />
        </div>

        <PostFooter 
          postId={post.id}
          teamId={teamSlug}
          postTitle={post.title}
          isAdmin={isAdmin}
          isPinned={post.pinned}
          borderColor={borderColor}
          commentCount={post.team_post_comments}
        />
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
