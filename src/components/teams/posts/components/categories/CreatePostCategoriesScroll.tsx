
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";
import { BaseCategoryScroll } from "./BaseCategoryScroll";

interface CreatePostCategoriesScrollProps {
  activeTab: string;
  onCategoryClick: (categorySlug?: string) => void;
  isAdmin?: boolean;
  teamSlug: string;
}

export const CreatePostCategoriesScroll = ({ 
  activeTab, 
  onCategoryClick, 
  isAdmin, 
  teamSlug 
}: CreatePostCategoriesScrollProps) => {
  const { data: categories, isLoading } = useTeamCategories(teamSlug);

  // Show all categories for posting - we don't filter by post_count here
  const filteredCategories = categories?.filter(category => 
    isAdmin || category.is_public
  );

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <BaseCategoryScroll className="border-b">
      {filteredCategories?.map((category) => {
        const IconComponent = category.icon ? iconMap[category.icon] : MessageCircle;
        return (
          <Badge
            key={category.id}
            variant="outline"
            className={cn(
              "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2 shrink-0",
              category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]",
              activeTab === category.slug ? "border-primary" : "border-transparent"
            )}
            onClick={() => onCategoryClick(category.slug)}
          >
            <IconComponent className="h-4 w-4" />
            {category.name}
            {!category.is_public && <Lock className="h-3 w-3 ml-2" />}
          </Badge>
        )}
      )}
    </BaseCategoryScroll>
  );
};
