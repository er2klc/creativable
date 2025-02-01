import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

interface PostActionsProps {
  url: string | null;
}

export const PostActions = ({ url }: PostActionsProps) => {
  if (!url) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => window.open(url, "_blank")}
    >
      <LinkIcon className="h-4 w-4 mr-2" />
      Zum Beitrag
    </Button>
  );
};