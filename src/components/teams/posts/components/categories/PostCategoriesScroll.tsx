
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Lock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabScroll } from "../../hooks/useTabScroll";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";

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
  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    handleScroll,
    scrollTabs
  } = useTabScroll();

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
      
      <ScrollArea className="w-full border-b">
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 py-2 px-4"
          onScroll={handleScroll}
        >
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
