
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabScroll } from "../hooks/useTabScroll";
import { TeamCategory } from "../types/team";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TabScrollAreaProps {
  activeTab: string;
  onCategoryClick: (categorySlug?: string) => void;
  isAdmin?: boolean;
  teamSlug: string;
}

export const TabScrollArea = ({ activeTab, onCategoryClick, isAdmin, teamSlug }: TabScrollAreaProps) => {
  const {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    handleScroll,
    scrollTabs
  } = useTabScroll();

  // First fetch team by slug to get the correct UUID
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;
      
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team:', error);
        throw error;
      }
      return data;
    },
    enabled: !!teamSlug,
  });

  // Then fetch categories using the team's UUID
  const { data: allCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return null;
      
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data);
      return data;
    },
    enabled: !!team?.id,
  });

  // Default Pastellfarben für die Tabs wenn keine custom Farbe definiert ist
  const defaultTabColors = {
    all: 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]',
    1: 'bg-[#FEF7CD] hover:bg-[#EEB691] text-[#8B4513]',
    2: 'bg-[#FEC6A1] hover:bg-[#EEB691] text-[#8B4513]',
    3: 'bg-[#E5DEFF] hover:bg-[#D5CEEF] text-[#483D8B]',
    4: 'bg-[#FFDEE2] hover:bg-[#EFCED2] text-[#8B3D3D]',
    5: 'bg-[#FDE1D3] hover:bg-[#EDD1C3] text-[#8B5742]',
    6: 'bg-[#D3E4FD] hover:bg-[#C3D4ED] text-[#4A708B]',
    7: 'bg-[#F1F0FB] hover:bg-[#E1E0EB] text-[#4A4A4A]',
  };

  if (isTeamLoading || isCategoriesLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  if (!team || !allCategories) {
    console.log('No team or categories found:', { team, allCategories });
    return null;
  }

  return (
    <div className="relative flex-1 max-w-full">
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
      
      <ScrollArea className="w-full whitespace-nowrap">
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
        <ScrollBar orientation="horizontal" className="h-2.5 select-none touch-none flex-1" />
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
