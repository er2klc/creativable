
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";
import { BaseCategoryScroll } from "./BaseCategoryScroll";

interface PostCategoriesScrollProps {
  activeTab: string;
  onCategoryClick: (categorySlug?: string) => void;
  isAdmin?: boolean;
  teamSlug: string;
}

export const PostCategoriesScroll = ({ 
  activeTab, 
  onCategoryClick, 
  isAdmin, 
  teamSlug 
}: PostCategoriesScrollProps) => {
  const { data: categories, isLoading } = useTeamCategories(teamSlug);

  // Filter categories to only show ones with posts for non-admins
  const filteredCategories = categories?.filter(category => {
    if (isAdmin) return true;
    return category.is_public && (!category.post_count || category.post_count > 0);
  });

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <BaseCategoryScroll className="border-b">
      <Badge
        variant="outline"
        className={cn(
          "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 shrink-0",
          "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]",
          activeTab === 'all' ? "border-primary" : "border-transparent"
        )}
        onClick={() => onCategoryClick()}
      >
        <MessageCircle className="h-4 w-4 mr-2 inline-block" />
        Alle Beiträge
      </Badge>
      
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
            {category.post_count > 0 && (
              <span className="ml-1 text-xs">({category.post_count})</span>
            )}
          </Badge>
        )}
      )}
    </BaseCategoryScroll>
  );
};
