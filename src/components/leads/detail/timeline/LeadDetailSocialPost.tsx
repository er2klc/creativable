
import { FC } from 'react';
import { format } from 'date-fns';
import { ExternalLink, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadDetailSocialPostProps {
  post: any;
}

export const LeadDetailSocialPost: FC<LeadDetailSocialPostProps> = ({ post }) => {
  const formattedDate = post.posted_at 
    ? format(new Date(post.posted_at), 'PPpp')
    : 'Datum unbekannt';
  
  // Function to determine if there are media URLs and they are usable
  const hasUsableMediaUrls = post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0;
  
  // Format engagement metrics
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '?';
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{post.post_type || 'Post'}</h3>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>
      
      {/* Post content */}
      {post.content && (
        <div className="my-2">
          <p className="text-sm">{post.content}</p>
        </div>
      )}
      
      {/* Media */}
      {hasUsableMediaUrls && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {post.media_urls.slice(0, 4).map((mediaUrl: string, index: number) => (
            <div key={index} className="relative pb-[100%] bg-gray-100 rounded overflow-hidden">
              <img 
                src={mediaUrl} 
                alt={`Media ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
          {post.media_urls.length > 4 && (
            <div className="relative pb-[100%] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
                +{post.media_urls.length - 4} mehr
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Engagement metrics */}
      <div className="mt-3 flex space-x-4 text-sm text-gray-500">
        {post.likes_count !== undefined && (
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{formatNumber(post.likes_count)}</span>
          </div>
        )}
        
        {post.comments_count !== undefined && (
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{formatNumber(post.comments_count)}</span>
          </div>
        )}
      </div>
      
      {/* Link to original post */}
      {post.url && (
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => window.open(post.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Zum Original-Post
          </Button>
        </div>
      )}
    </div>
  );
};
