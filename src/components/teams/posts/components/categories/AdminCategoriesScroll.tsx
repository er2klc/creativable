
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Lock } from "lucide-react";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";
import { cn } from "@/lib/utils";
import { BaseCategoryScroll } from "./BaseCategoryScroll";

interface AdminCategoriesScrollProps {
  activeTab: string;
  onCategoryClick: (categoryId: string) => void;
  teamSlug: string;
}

export const AdminCategoriesScroll = ({ 
  activeTab, 
  onCategoryClick,
  teamSlug
}: AdminCategoriesScrollProps) => {
  const { data: categories, isLoading } = useTeamCategories(teamSlug);

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <BaseCategoryScroll>
      <Button
        variant="outline"
        className="gap-2 shrink-0"
        onClick={() => onCategoryClick("new")}
      >
        <Plus className="h-4 w-4" />
        Neue Kategorie
      </Button>
      
      {categories?.map((category) => {
        const IconComponent = category.icon ? iconMap[category.icon] : MessageCircle;
        
        return (
          <Badge
            key={category.id}
            variant="outline"
            className={cn(
              "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2 shrink-0",
              category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]",
              activeTab === category.id ? "border-primary" : "border-transparent"
            )}
            onClick={() => onCategoryClick(category.id)}
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
