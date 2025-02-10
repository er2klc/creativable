
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePostForm } from "./dialog/CreatePostForm";
import { useTeamMembers } from "./dialog/useTeamMembers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

interface CreatePostDialogProps {
  teamId: string;
  categoryId?: string;
}

export const CreatePostDialog = ({ teamId, categoryId }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: teamMembers } = useTeamMembers(teamId);
  const user = useUser();
  
  // Fetch categories for the team
  const { data: categories } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  // Fetch member role
  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', teamId],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId && !!user?.id,
  });

  const isAdmin = teamMember?.role === 'admin' || teamMember?.role === 'owner';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Beitrag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
        </DialogHeader>
        <CreatePostForm
          teamId={teamId}
          categoryId={categoryId}
          categories={categories}
          onSuccess={() => setOpen(false)}
          teamMembers={teamMembers}
          isAdmin={isAdmin}
        />
      </DialogContent>
    </Dialog>
  );
};
