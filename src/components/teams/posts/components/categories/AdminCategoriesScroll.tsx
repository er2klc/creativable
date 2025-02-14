
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";
import { useTabScroll } from "../../hooks/useTabScroll";
import { cn } from "@/lib/utils";

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
  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    handleScroll,
    scrollTabs
  } = useTabScroll();

  const { categories, isLoading } = useTeamCategories(teamSlug);

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <div className="relative w-full">
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 bg-white/80 hover:bg-white"
          onClick={() => scrollTabs('left')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      
      <ScrollArea className="w-full">
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 py-2 px-4"
          onScroll={handleScroll}
        >
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
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2 shrink-0",
                  category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]",
                  activeTab === category.id ? "border-primary" : "border-transparent"
                )}
                onClick={() => onCategoryClick(category.id)}
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </Badge>
            )}
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>

      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 bg-white/80 hover:bg-white"
          onClick={() => scrollTabs('right')}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
