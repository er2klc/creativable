import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TeamMemberListProps {
  members: any[];
  isAdmin: boolean;
}

export function TeamMemberList({ members, isAdmin }: TeamMemberListProps) {
  const queryClient = useQueryClient();

  const handleRoleChange = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
      await queryClient.invalidateQueries({ queryKey: ['team-admins'] });

      toast.success(`Rolle erfolgreich zu ${newRole === 'admin' ? 'Administrator' : 'Mitglied'} geändert`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Fehler beim Ändern der Rolle');
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {member.display_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {member.display_name}
              </span>
              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="mt-1">
                {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Mitglied'}
              </Badge>
            </div>
          </div>
          {member.role !== 'owner' && isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleChange(member.id, member.role)}
            >
              {member.role === 'admin' ? 'Zum Mitglied machen' : 'Zum Admin machen'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}