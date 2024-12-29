import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMemberListProps {
  members: any[];
  isAdmin: boolean;
}

export function TeamMemberList({ members, isAdmin }: TeamMemberListProps) {
  return (
    <div className="mt-4 space-y-4">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {member.profiles?.email?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {member.profiles?.email?.split('@')[0] || 'Unbekannt'}
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
              onClick={async () => {
                const newRole = member.role === 'admin' ? 'member' : 'admin';
                await supabase
                  .from('team_members')
                  .update({ role: newRole })
                  .eq('id', member.id);
              }}
            >
              {member.role === 'admin' ? 'Zum Mitglied machen' : 'Zum Admin machen'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}