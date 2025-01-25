import { Badge } from "@/components/ui/badge";

interface PostContentProps {
  content: string | null;
  caption: string | null;
  hashtags?: string[] | null;
}

export const PostContent = ({ content, caption, hashtags }: PostContentProps) => {
  if (!content && !caption && (!hashtags || hashtags.length === 0)) return null;

  return (
    <>
      {(caption || content) && (
        <p className="text-sm whitespace-pre-wrap">
          {caption || content}
        </p>
      )}

      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};