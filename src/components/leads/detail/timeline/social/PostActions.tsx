import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostActionsProps {
  url: string | null;
}

export const PostActions = ({ url }: PostActionsProps) => {
  if (!url) return null;

  return (
    <div className="px-4 py-2 flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-500 hover:text-blue-600"
        onClick={() => window.open(url, '_blank')}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        View Original
      </Button>
    </div>
  );
};