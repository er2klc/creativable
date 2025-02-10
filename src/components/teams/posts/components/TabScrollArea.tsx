
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabScroll } from "../hooks/useTabScroll";
import { TeamCategory } from "../types/team";

interface TabScrollAreaProps {
  activeTab: string;
  allCategories: TeamCategory[] | null;
  onCategoryClick: (categorySlug?: string) => void;
  isAdmin?: boolean;
}

export const TabScrollArea = ({ activeTab, allCategories, onCategoryClick, isAdmin }: TabScrollAreaProps) => {
  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    handleScroll,
    scrollTabs
  } = useTabScroll();

  // Default Pastellfarben für die Tabs wenn keine custom Farbe definiert ist
  const defaultTabColors = {
    all: 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]',
    1: 'bg-[#FEF7CD] hover:bg-[#EEE7BD] text-[#8B7355]',
    2: 'bg-[#FEC6A1] hover:bg-[#EEB691] text-[#8B4513]',
    3: 'bg-[#E5DEFF] hover:bg-[#D5CEEF] text-[#483D8B]',
    4: 'bg-[#FFDEE2] hover:bg-[#EFCED2] text-[#8B3D3D]',
    5: 'bg-[#FDE1D3] hover:bg-[#EDD1C3] text-[#8B5742]',
    6: 'bg-[#D3E4FD] hover:bg-[#C3D4ED] text-[#4A708B]',
    7: 'bg-[#F1F0FB] hover:bg-[#E1E0EB] text-[#4A4A4A]',
  };

  return (
    <div className="relative flex-1">
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
          className="flex gap-2 pb-4 overflow-x-auto scroll-smooth"
          onScroll={handleScroll}
        >
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2",
              defaultTabColors.all,
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
                "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2",
                category.color || defaultTabColors[(index % 7 + 1) as keyof typeof defaultTabColors],
                activeTab === category.slug ? "border-primary" : "border-transparent"
              )}
              onClick={() => onCategoryClick(category.slug)}
            >
              {!category.is_public && <Lock className="h-3 w-3" />}
              {category.name}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
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
