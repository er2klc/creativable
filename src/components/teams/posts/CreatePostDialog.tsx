
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePostForm } from "./dialog/CreatePostForm";
import { useTeamMembers } from "./dialog/useTeamMembers";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { CreatePostCategoriesScroll } from "./components/categories/CreatePostCategoriesScroll";

interface CreatePostDialogProps {
  teamId: string;
  categoryId?: string;
}

export const CreatePostDialog = ({ teamId, categoryId }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(categoryId);
  const user = useUser();
  const { teamSlug } = useParams();

  const { data: teamMembers } = useTeamMembers(teamId);
  
  const { data: categories } = useQuery({
    queryKey: ["team-categories", teamSlug],
    queryFn: async () => {
      if (!teamSlug) return [];
      
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (!team) return [];

      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug,
  });

  const { data: teamMember } = useQuery({
    queryKey: ["team-member-role", teamId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: memberData, error } = await supabase
        .from("team_members")
        .select(`
          role,
          points:team_member_points(level)
        `)
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return {
        role: memberData.role,
        level: memberData.points?.[0]?.level || 0
      };
    },
    enabled: !!teamId && !!user?.id,
  });

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";

  const handleCategoryChange = (categorySlug?: string) => {
    if (!categories) return;
    const category = categories.find(cat => cat.slug === categorySlug);
    setSelectedCategoryId(category?.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Beitrag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
          <DialogDescription>
            Erstelle einen neuen Beitrag in einer der verfügbaren Kategorien.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-auto">
          <CreatePostCategoriesScroll 
            activeTab={categories?.find(cat => cat.id === selectedCategoryId)?.slug || ""}
            onCategoryClick={handleCategoryChange}
            isAdmin={isAdmin}
            teamSlug={teamSlug || ""}
          />
        </div>

        <CreatePostForm
          teamId={teamId}
          categoryId={selectedCategoryId}
          onSuccess={() => setOpen(false)}
          teamMembers={teamMembers}
          isAdmin={isAdmin}
          teamSlug={teamSlug || ""}
        />
      </DialogContent>
    </Dialog>
  );
};
