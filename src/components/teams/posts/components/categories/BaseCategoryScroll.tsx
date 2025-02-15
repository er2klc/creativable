
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTabScroll } from "../../hooks/useTabScroll";
import { cn } from "@/lib/utils";
import { TeamCategory } from "@/hooks/useTeamCategories";
import { ReactNode } from "react";

interface BaseCategoryScrollProps {
  children: ReactNode;
  showScrollControls?: boolean;
  className?: string;
}

export const BaseCategoryScroll = ({ 
  children,
  showScrollControls = true,
  className 
}: BaseCategoryScrollProps) => {
  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    handleScroll,
    scrollTabs
  } = useTabScroll();

  return (
    <div className={cn("relative w-full", className)}>
      {showScrollControls && showLeftArrow && (
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
          {children}
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>

      {showScrollControls && showRightArrow && (
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

export interface CategoryItemProps {
  category: TeamCategory;
  isActive?: boolean;
  onClick: (category: TeamCategory) => void;
  showPostCount?: boolean;
  isPrivate?: boolean;
}
