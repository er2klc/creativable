import { Crown, Image, Users, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamMemberList } from "./TeamMemberList";
import { TeamAdminList } from "./TeamAdminList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/lib/supabase-utils";
import { useQuery } from "@tanstack/react-query";

interface TeamStats {
  totalMembers: number;
  admins: number;
}

interface TeamHeaderTitleProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  isAdmin: boolean;
}

interface OnlineMember {
  user_id: string;
  online_at: string;
}

export function TeamHeaderTitle({ team, isAdmin }: TeamHeaderTitleProps) {
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);

  // Fetch all team members with profiles and points
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          profile:profiles (
            id,
            display_name,
            avatar_url
          ),
          points:team_member_points (
            level,
            points
          )
        `)
        .eq('team_id', team.id);

      if (error) {
        console.error('Fehler beim Laden der Teammitglieder:', error);
        return [];
      }

      return data.map(member => ({
        ...member,
        profile: member.profile || { display_name: 'Unbekannt', avatar_url: null },
        points: {
          level: member.points?.level || 0,
          points: member.points?.points || 0
        }
      }));
    },
    enabled: !!team.id,
  });

  // Berechnung der Statistiken (Mitglieder & Admins)
  const totalMembers = teamMembers.length;
  const adminMembers = teamMembers.filter(m => m.role === 'admin' || m.role === 'owner');
  const adminCount = adminMembers.length;

  useEffect(() => {
    const channel = supabase.channel(`team_${team.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online: OnlineMember[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            online.push({
              user_id: presence.user_id,
              online_at: presence.online_at
            });
          });
        });
        
        setOnlineMembers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await channel.track({
              user_id: session.user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

  const onlineMembersList = teamMembers.filter(member => 
    onlineMembers.some(online => online.user_id === member.user_id)
  );

  return (
    <div className="flex items-center gap-6 justify-center w-full">
      <Sheet>
        <SheetTrigger asChild>
          <button className="relative group">
            <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
              <AvatarImage 
                src={team.logo_url ? getAvatarUrl(team.logo_url) : undefined} 
                alt={team.name} 
                className="object-cover" 
              />
              <AvatarFallback className="text-2xl bg-primary/5">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isAdmin && (
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Image className="h-8 w-8 text-white" />
              </div>
            )}
          </button>
        </SheetTrigger>
      </Sheet>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-semibold">{team.name}</h1>
        </div>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalMembers} Mitglieder</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Team Mitglieder</SheetTitle>
                <SheetDescription>Übersicht aller Mitglieder in diesem Team</SheetDescription>
              </SheetHeader>
              <TeamMemberList members={teamMembers} isAdmin={isAdmin} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                <span>{adminCount} Admins</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Team Administratoren</SheetTitle>
                <SheetDescription>Übersicht aller Administratoren in diesem Team</SheetDescription>
              </SheetHeader>
              <TeamAdminList admins={adminMembers} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                <span>{onlineMembers.length} LIVE</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Online Mitglieder</SheetTitle>
                <SheetDescription>Aktuell aktive Mitglieder in diesem Team</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {onlineMembersList.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={member.profile?.avatar_url ? getAvatarUrl(member.profile.avatar_url) : '/default-avatar.png'} 
                          alt={member.profile?.display_name || 'Avatar'} 
                        />
                        <AvatarFallback>
                          {member.profile?.display_name?.substring(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{member.profile?.display_name || 'Unbekannt'}</span>
                        <Badge variant="default" className="bg-green-500 mt-1">Level {member.points.level}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
