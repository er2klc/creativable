import { Badge } from "@/components/ui/badge";

interface PostContentProps {
  content: string | null;
  caption: string | null;
  hashtags?: string[] | null;
}

export const PostContent = ({ content, caption, hashtags }: PostContentProps) => {
  if (!content && !caption && (!hashtags || hashtags.length === 0)) return null;

  return (
    <div className="space-y-2 mb-3">
      {(caption || content) && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {caption || content}
        </p>
      )}

      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hashtags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};