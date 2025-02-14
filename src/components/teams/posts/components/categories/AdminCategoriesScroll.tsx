
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle } from "lucide-react";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";

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
  const { categories, isLoading } = useTeamCategories(teamSlug);

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 py-2 px-4">
        <Button
          variant="outline"
          className="gap-2 shrink-0"
          onClick={() => onCategoryClick("new")}
        >
          <Plus className="h-4 w-4" />
          Neue Kategorie
        </Button>
        
        {categories?.map((category) => {
          // Get the icon component, with guaranteed fallback to MessageCircle
          let IconComponent = MessageCircle;
          if (category.icon && typeof category.icon === 'string' && iconMap[category.icon]) {
            IconComponent = iconMap[category.icon];
          }

          return (
            <Badge
              key={category.id}
              variant="outline"
              className={`
                cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2 shrink-0
                ${category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]"}
                ${activeTab === category.id ? "border-primary" : "border-transparent"}
              `}
              onClick={() => onCategoryClick(category.id)}
            >
              <IconComponent className="h-4 w-4" />
              {category.name}
            </Badge>
          )}
        )}
      </div>
    </ScrollArea>
  );
};
