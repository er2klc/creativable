
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Star, Crown, Shield, User } from "lucide-react";

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

      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
      await queryClient.invalidateQueries({ queryKey: ['team-admins'] });

      toast.success(`Rolle erfolgreich zu ${newRole === 'admin' ? 'Administrator' : 'Mitglied'} geändert`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Fehler beim Ändern der Rolle');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-orange-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      default:
        return 'Mitglied';
    }
  };

  const getButtonContent = (role: string) => {
    if (role === 'admin') {
      return (
        <>
          <User className="h-4 w-4 mr-2" />
          Administrator-Rechte entziehen
        </>
      );
    }
    return (
      <>
        <Shield className="h-4 w-4 mr-2" />
        Zum Administrator befördern
      </>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {members?.map((member) => (
        <div key={member.id} className="flex flex-col p-2 border rounded hover:bg-accent/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.profiles?.avatar_url} alt={member.profiles?.display_name || 'Avatar'} />
              <AvatarFallback>
                {member.profiles?.display_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                {member.profiles?.display_name || 'Kein Name angegeben'}
              </span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getRoleBadgeVariant(member.role)} 
                  className="px-3 py-1 flex items-center gap-2"
                  style={{
                    backgroundColor: member.role === 'owner' ? '#FDE1D3' : 
                                  member.role === 'admin' ? '#E5DEFF' : 
                                  '#F1F0FB',
                    color: '#1F2937',
                    border: 'none'
                  }}
                >
                  {getRoleIcon(member.role)}
                  <span className="font-medium">{getRoleLabel(member.role)}</span>
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  <span>Level {member.points?.level || 1}</span>
                  <span>•</span>
                  <span>{member.points?.points || 0} Punkte</span>
                </div>
              </div>
            </div>
          </div>
          {member.role !== 'owner' && isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleChange(member.id, member.role)}
              className="mt-3 w-full flex items-center justify-center"
            >
              {getButtonContent(member.role)}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
