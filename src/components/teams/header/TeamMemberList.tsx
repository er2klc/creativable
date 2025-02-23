
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Crown, Shield, User } from "lucide-react";

interface TeamMemberListProps {
  members: any[];
  isAdmin: boolean;
}

export function TeamMemberList({ members, isAdmin }: TeamMemberListProps) {
  // Gruppiere Mitglieder nach Rolle
  const groupedMembers = members.reduce((acc, member) => {
    const roleGroup = member.role === 'owner' ? 'owners' : 
                     member.role === 'admin' ? 'admins' : 'members';
    if (!acc[roleGroup]) acc[roleGroup] = [];
    acc[roleGroup].push(member);
    return acc;
  }, {} as { owners: any[], admins: any[], members: any[] });

  // Sortiere jede Gruppe nach Punkten
  const sortByPoints = (a: any, b: any) => {
    const aPoints = a.points?.points || 0;
    const bPoints = b.points?.points || 0;
    return bPoints - aPoints;
  };

  const owners = (groupedMembers.owners || []).sort(sortByPoints);
  const admins = (groupedMembers.admins || []).sort(sortByPoints);
  const regularMembers = (groupedMembers.members || []).sort(sortByPoints);

  const MemberGroup = ({ title, members, icon }: { title: string, members: any[], icon: JSX.Element }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground mb-3">
        {icon}
        <span>{title}</span>
        <span className="text-xs">({members.length})</span>
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 border rounded hover:bg-accent/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profile?.avatar_url} alt={member.profile?.display_name || 'Avatar'} />
                <AvatarFallback>
                  {member.profile?.display_name?.substring(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {member.profile?.display_name || 'Kein Name angegeben'}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  <span>Level {member.points?.level || 0}</span>
                  <span>•</span>
                  <span>{member.points?.points || 0} Punkte</span>
                </div>
              </div>
            </div>
            <Badge 
              variant={member.role === 'owner' ? 'default' : 'secondary'} 
              className="ml-2"
            >
              {member.role === 'owner' ? 'Owner' : 
               member.role === 'admin' ? 'Admin' : 
               'Mitglied'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-6 space-y-6">
      {owners.length > 0 && (
        <MemberGroup 
          title="Team Owner" 
          members={owners} 
          icon={<Crown className="h-4 w-4 text-orange-500" />} 
        />
      )}
      
      {admins.length > 0 && (
        <MemberGroup 
          title="Team Administratoren" 
          members={admins} 
          icon={<Shield className="h-4 w-4 text-purple-500" />} 
        />
      )}
      
      {regularMembers.length > 0 && (
        <MemberGroup 
          title="Team Mitglieder" 
          members={regularMembers} 
          icon={<User className="h-4 w-4 text-gray-500" />} 
        />
      )}
    </div>
  );
}
