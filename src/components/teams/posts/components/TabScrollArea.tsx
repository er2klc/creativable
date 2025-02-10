
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabScroll } from "../hooks/useTabScroll";
import { TeamCategory } from "../types/team";

interface TabScrollAreaProps {
  activeTab: string;
  allCategories: TeamCategory[] | null;
  onCategoryClick: (categorySlug?: string) => void;
}

export const TabScrollArea = ({ activeTab, allCategories, onCategoryClick }: TabScrollAreaProps) => {
  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    handleScroll,
    scrollTabs
  } = useTabScroll();

  // Pastellfarben für die Tabs
  const tabColors = {
    all: 'bg-[#F2FCE2] hover:bg-[#E2ECD2]', // Soft Green
    1: 'bg-[#FEF7CD] hover:bg-[#EEE7BD]', // Soft Yellow
    2: 'bg-[#FEC6A1] hover:bg-[#EEB691]', // Soft Orange
    3: 'bg-[#E5DEFF] hover:bg-[#D5CEEF]', // Soft Purple
    4: 'bg-[#FFDEE2] hover:bg-[#EFCED2]', // Soft Pink
    5: 'bg-[#FDE1D3] hover:bg-[#EDD1C3]', // Soft Peach
    6: 'bg-[#D3E4FD] hover:bg-[#C3D4ED]', // Soft Blue
    7: 'bg-[#F1F0FB] hover:bg-[#E1E0EB]', // Soft Gray
  };

  return (
    <div className="relative flex items-center">
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
      
      <ScrollArea className="w-full border-b border-border mx-8">
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 pb-2 overflow-x-auto scroll-smooth"
          onScroll={handleScroll}
        >
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2",
              tabColors.all,
              activeTab === 'all' ? "border-primary" : "border-transparent"
            )}
            onClick={() => onCategoryClick()}
          >
            Alle Beiträge
          </Badge>
          {allCategories?.map((category, index) => (
            <Badge
              key={category.id}
              variant="outline"
              className={cn(
                "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2",
                tabColors[(index % 7 + 1) as keyof typeof tabColors],
                activeTab === category.slug ? "border-primary" : "border-transparent"
              )}
              onClick={() => onCategoryClick(category.slug)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
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
