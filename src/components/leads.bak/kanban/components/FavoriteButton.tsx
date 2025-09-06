
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const FavoriteButton = ({ isFavorite, onClick }: FavoriteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute bottom-2 right-2 h-6 w-6"
      onClick={onClick}
    >
      <StarIcon className={cn("h-4 w-4", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
    </Button>
  );
};
