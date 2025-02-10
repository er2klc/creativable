
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Lock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabScroll } from "../../hooks/useTabScroll";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug,
  });

  const { data: categories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return [];

      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id,
  });

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

  const filteredCategories = categories?.filter(category => isAdmin || category.is_public);

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
              defaultTabColors.all,
              activeTab === 'all' ? "border-primary" : "border-transparent"
            )}
            onClick={() => onCategoryClick()}
          >
            <MessageCircle className="h-4 w-4 mr-2 inline-block" />
            Alle Beiträge
          </Badge>
          
          {filteredCategories?.map((category, index) => {
            const IconComponent = category.icon ? iconMap[category.icon] : MessageCircle;
            return (
              <Badge
                key={category.id}
                variant="outline"
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2 shrink-0",
                  category.color || defaultTabColors[(index % 7 + 1) as keyof typeof defaultTabColors],
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
