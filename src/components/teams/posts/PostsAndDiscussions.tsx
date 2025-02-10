import { Card } from "@/components/ui/card";
import { PostList } from "./PostList";
import { CategoryOverview } from "./CategoryOverview";
import { CreatePostDialog } from "./CreatePostDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ArrowLeft, ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export function PostsAndDiscussions() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { teamSlug, categorySlug } = useParams();
  const user = useUser();
  const [activeTab, setActiveTab] = useState(categorySlug || 'all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get team data based on slug
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) {
        console.error('No team slug provided');
        return null;
      }

      const { data, error } = await supabase
        .from('teams')
        .select('*')
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

  const { data: allCategories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return null;
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

  const handleCategoryClick = (categorySlug?: string) => {
    if (!teamSlug) {
      console.error('No team slug available for navigation');
      return;
    }

    setActiveTab(categorySlug || 'all');

    if (categorySlug) {
      navigate(`/unity/team/${teamSlug}/posts/category/${categorySlug}`);
    } else {
      navigate(`/unity/team/${teamSlug}/posts`);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const targetScroll = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

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

  if (!teamSlug) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Invalid team URL. Please check the URL and try again.
        </div>
      </Card>
    );
  }

  if (isTeamLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!team) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Team not found
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="w-full">
          <div className="h-16 px-4 flex items-center">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span 
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => navigate(`/unity/team/${team.slug}`)}
                  >
                    {team.name}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-foreground">Community</span>
                  </div>
                </div>
              </div>
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16">
        <div className="space-y-6 max-w-[1200px] mx-auto px-4 pt-4">
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 bg-white/80 hover:bg-white"
              onClick={() => scrollTabs('left')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <ScrollArea className="w-full border-b border-border mx-8">
              <div 
                ref={scrollContainerRef}
                className="flex gap-2 pb-2 overflow-x-auto scroll-smooth"
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2",
                    tabColors.all,
                    activeTab === 'all' ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => handleCategoryClick()}
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
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 bg-white/80 hover:bg-white"
              onClick={() => scrollTabs('right')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full overflow-hidden">
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-4 -mr-4">
              <CategoryOverview teamId={team.id} teamSlug={teamSlug} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
